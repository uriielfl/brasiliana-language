import { Expr, Program, Stmt } from '../utils/types/ast-node.type';
import { Token, TokenType } from '../utils/types/token.type';

export const parse = (tokens: Token[]): Program => {
  return new Parser(tokens).parseProgram();
};

class Parser {
  private i = 0;

  constructor(private tokens: Token[]) {}

  private get current() {
    return this.tokens[this.i];
  }

  private match(...types: TokenType[]): Token | null {
    const currentToken = this.current;
    if (types.includes(currentToken.type)) {
      this.i++;
      return currentToken;
    }

    return null;
  }

  private eat(type: TokenType, errorMessage?: string): Token {
    const currentToken = this.current;
    if (currentToken.type !== type) {
      const where = `${currentToken.position.line}:${currentToken.position.column}`;
      const defaultErrorMessage = `Expected token of type ${TokenType[type]}, but got ${TokenType[currentToken.type]}`;
      const customErrorMessage = `${errorMessage} at ${where}`;
      throw new Error(errorMessage ? customErrorMessage : defaultErrorMessage);
    }
    this.i++;
    return currentToken;
  }

  parseProgram(): Program {
    const body: Stmt[] = [];
    while (!this.isAtEnd()) {
      body.push(this.declaration());
    }
    return { kind: 'Program', body };
  }

  private isAtEnd() {
    return this.current.type === TokenType.EOF;
  }

  private functionDeclaration(): Stmt {
    const name = this.eat(TokenType.IDENT, 'Nome da função').lexeme;
    this.eat(TokenType.LPAR, 'Esperado "(" após nome da função');

    const params: string[] = [];

    // Se NÃO for fechamento, então há pelo menos 1 parâmetro
    if (this.current.type !== TokenType.RPAR) {
      // 1º parâmetro (obrigatório neste ramo)
      params.push(this.eat(TokenType.IDENT, 'Nome do parâmetro').lexeme);

      // Demais parâmetros, antecedidos por vírgula
      while (this.match(TokenType.COMMA)) {
        params.push(this.eat(TokenType.IDENT, 'Nome do parâmetro').lexeme);
      }
    }

    this.eat(TokenType.RPAR, 'Esperado ")" após parâmetros da função');
    const body = this.block();
    return { kind: 'FunctionDecl', name, params, body };
  }

  private declaration(): Stmt {
    // declarar [variavel]? <ident> (= expr)? ;
    if (this.match(TokenType.DECLARAR)) {
      if (this.match(TokenType.FUNCAO)) {
        return this.functionDeclaration();
      }

      this.match(TokenType.VARIAVEL); // opcional
      const name = this.eat(
        TokenType.IDENT,
        'Nome de variável após "declarar"',
      ).lexeme;
      let init: Expr | undefined;
      if (this.match(TokenType.ASSIGN)) {
        init = this.expression();
      }
      this.match(TokenType.SEMICOLON); // tolerante
      return { kind: 'VarDecl', name, init };
    }

    // ⬇️ trate 'retorne' ANTES de qualquer fallback
    if (this.match(TokenType.RETORNE)) {
      let value: Expr | undefined;
      // permite 'retorne;' sem valor, ou 'retorne expr;'
      if (
        this.current.type !== TokenType.SEMICOLON &&
        this.current.type !== TokenType.RBRACE
      ) {
        value = this.expression();
      }
      this.match(TokenType.SEMICOLON); // tolerante
      return { kind: 'Return', value };
    }
    // if
    if (this.match(TokenType.SE)) return this.ifStatement();

    if (this.match(TokenType.ENQUANTO)) {
      return this.whileStatement();
    }

    // repita de X ate N { ... }
    if (this.match(TokenType.REPITA)) return this.repeatToStatement();

    // bloco
    if (this.current.type === TokenType.LBRACE) {
      const body = this.block();
      return { kind: 'Block', body };
    }

    // expressão como statement
    const expr = this.expression();
    this.match(TokenType.SEMICOLON);
    return { kind: 'ExprStmt', expr };
  }

  private block(): Stmt[] {
    this.eat(TokenType.LBRACE, 'Esperado "{" para iniciar bloco');
    const body: Stmt[] = [];
    while (this.current.type !== TokenType.RBRACE) {
      body.push(this.declaration());
    }
    this.eat(TokenType.RBRACE, 'Esperado "}" para fechar bloco');
    return body;
  }

  private ifStatement(): Stmt {
    this.eat(TokenType.LPAR, 'Esperado "(" após "se"');
    const test = this.expression();
    this.eat(TokenType.RPAR, 'Esperado ")" após condição de "se"');
    const then = this.block();
    let els: Stmt[] | undefined;
    if (this.match(TokenType.SENAO)) {
      els = this.block();
    }
    return { kind: 'If', test, then, else: els };
  }

  private repeatToStatement(): Stmt {
    this.eat(TokenType.DE, 'Esperado "de" após "repita"');
    const counter = this.eat(
      TokenType.IDENT,
      'Esperado identificador do contador em "repita de <id> ate N"',
    ).lexeme;
    this.eat(TokenType.ATE, 'Esperado "ate" em "repita de <id> ate N"');
    const limit = this.expression();
    const body = this.block();
    return { kind: 'RepeatTo', counter, limit, body };
  }

  private whileStatement(): Stmt {
    this.eat(TokenType.LPAR, 'Esperado "(" após "enquanto"');
    const test = this.expression();
    this.eat(TokenType.RPAR, 'Esperado ")" após condição de "enquanto"');
    const body = this.block();
    return { kind: 'While', test, body };
  }

  // ============= expressões ============
  // precedências: assignment -> equality -> comparison -> term -> factor -> call/member -> primary

  private expression(): Expr {
    return this.assignment();
  }
  private assignment(): Expr {
    const left = this.equality();

    if (this.match(TokenType.ASSIGN)) {
      const value = this.assignment();

      if (left.kind === 'Identifier') {
        return { kind: 'Assign', name: left.name, value };
      }
      if (left.kind === 'Member') {
        return {
          kind: 'AssignMember',
          object: left.object,
          property: left.property,
          value,
        };
      }
      if (left.kind === 'Index') {
        return {
          kind: 'AssignIndex',
          array: left.array,
          index: left.index,
          value,
        };
      }

      const t = this.current;
      throw new Error(
        `Atribuição inválida em ${t.position.line}:${t.position.column}`,
      );
    }

    return left;
  }

  private equality(): Expr {
    let expr = this.comparison();
    while (true) {
      if (this.match(TokenType.EQ)) {
        const right = this.comparison();
        expr = { kind: 'Binary', op: '==', left: expr, right };
      } else if (this.match(TokenType.NEQ)) {
        const right = this.comparison();
        expr = { kind: 'Binary', op: '!=', left: expr, right };
      } else break;
    }
    return expr;
  }

  private comparison(): Expr {
    let expr = this.term();
    while (true) {
      if (this.match(TokenType.GT)) {
        const right = this.term();
        expr = { kind: 'Binary', op: '>', left: expr, right };
      } else if (this.match(TokenType.GTE)) {
        const right = this.term();
        expr = { kind: 'Binary', op: '>=', left: expr, right };
      } else if (this.match(TokenType.LT)) {
        const right = this.term();
        expr = { kind: 'Binary', op: '<', left: expr, right };
      } else if (this.match(TokenType.LTE)) {
        const right = this.term();
        expr = { kind: 'Binary', op: '<=', left: expr, right };
      } else break;
    }
    return expr;
  }

  private term(): Expr {
    let expr = this.factor();
    while (true) {
      if (this.match(TokenType.PLUS)) {
        const right = this.factor();
        expr = { kind: 'Binary', op: '+', left: expr, right };
      } else if (this.match(TokenType.MINUS)) {
        const right = this.factor();
        expr = { kind: 'Binary', op: '-', left: expr, right };
      } else break;
    }
    return expr;
  }

  private factor(): Expr {
    let expr = this.call();
    while (true) {
      if (this.match(TokenType.STAR)) {
        const right = this.call();
        expr = { kind: 'Binary', op: '*', left: expr, right };
      } else if (this.match(TokenType.SLASH)) {
        const right = this.call();
        expr = { kind: 'Binary', op: '/', left: expr, right };
      } else break;
    }
    return expr;
  }

  private call(): Expr {
    let expr = this.primary();

    while (true) {
      // chamada: expr(args)
      if (this.match(TokenType.LPAR)) {
        const args: Expr[] = [];
        if (this.current.type !== TokenType.RPAR) {
          // primeiro argumento
          args.push(this.expression());
          // argumentos seguintes, separados por vírgula
          while (this.match(TokenType.COMMA)) {
            args.push(this.expression());
          }
        }
        this.eat(TokenType.RPAR, 'Esperado ")" após argumentos');
        expr = { kind: 'Call', callee: expr, args };
        continue;
      }

      // acesso a membro: expr.ident
      if (this.match(TokenType.DOT)) {
        const prop = this.eat(
          TokenType.IDENT,
          'Esperado nome da propriedade após "."',
        ).lexeme;
        expr = { kind: 'Member', object: expr, property: prop };
        continue;
      }

      // índice: expr[expr]
      if (this.match(TokenType.LBRACKET)) {
        const index = this.expression();
        this.eat(TokenType.RBRACKET, 'Esperado "]" após índice');
        expr = { kind: 'Index', array: expr, index };
        continue;
      }

      break;
    }

    return expr;
  }

  private primary(): Expr {
    const t = this.current;

    if (this.match(TokenType.NUMBER)) {
      return { kind: 'Literal', value: Number(t.lexeme) };
    }

    if (this.match(TokenType.LBRACKET)) {
      const elements: Expr[] = [];
      if (this.current.type !== TokenType.RBRACKET) {
        do {
          elements.push(this.expression());
        } while (this.match(TokenType.COMMA));
      }
      this.eat(TokenType.RBRACKET, 'Esperado "]" para fechar array');
      return { kind: 'Array', elements };
    }

    if (this.match(TokenType.STRING)) {
      // Interpolação '@{...}' virá depois — por enquanto é literal puro
      return { kind: 'Literal', value: t.lexeme };
    }
    if (this.match(TokenType.VERDADEIRO))
      return { kind: 'Literal', value: true };
    if (this.match(TokenType.FALSO)) return { kind: 'Literal', value: false };

    if (this.match(TokenType.IDENT)) {
      return { kind: 'Identifier', name: t.lexeme };
    }

    // objeto literal: { nome: expr, ... }
    if (this.match(TokenType.LBRACE)) {
      const entries: { key: string; value: Expr }[] = [];
      if (this.current.type !== TokenType.RBRACE) {
        do {
          const keyTok = this.eat(TokenType.IDENT, 'Esperado chave do objeto');
          this.eat(TokenType.COLON, 'Esperado ":" após chave');
          const value = this.expression();
          entries.push({ key: keyTok.lexeme, value });
        } while (this.match(TokenType.COMMA));
      }
      this.eat(TokenType.RBRACE, 'Esperado "}" para fechar objeto');
      return { kind: 'Object', entries };
    }

    if (this.match(TokenType.LPAR)) {
      const e = this.expression();
      this.eat(TokenType.RPAR, 'Esperado ")"');
      return e;
    }

    const where = `${t.position.line}:${t.position.column}`;
    throw new Error(
      `Expressão inesperada em ${where}: ${TokenType[t.type]} '${t.lexeme}'`,
    );
  }
}
