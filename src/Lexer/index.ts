import { isAlphabetic, isNumeric } from '../utils';
import { Token, TokenType } from '../utils/types/token.type';
import { KEYWORDS } from './data/keywords.data';

export const tokenize = (input: string): Token[] => {
  let i = 0;
  let line = 1;
  let column = 1;
  const tokens: Token[] = [];

  const peek = (n = 0) => input[i + n] || '\0';

  const advance = () => {
    const char = input[i++] ?? '\0';
    if (char === '\n') {
      // Se for nova linha, incrementa a linha e reseta a coluna
      line++;
      column = 1;
    } else {
      // Caso contrário, apenas incrementa a coluna
      column++;
    }

    return char; // Retorna o caractere atual antes de avançar
  };

  const push = (
    type: TokenType,
    lexeme: string,
    line: number,
    column: number,
  ) => {
    tokens.push({ type, lexeme, position: { line, column } });
  };

  const skipWhitespacesAndComments = () => {
    while (true) {
      const character = peek();
      if (/[ \t\r\n]/.test(character)) {
        advance();
        continue;
      }
      if (character === '/' && peek(1) === '/') {
        while (peek() !== '\n' && peek() !== '\0') advance();
        continue;
      }
      break;
    }
  };

  while (true) {
    skipWhitespacesAndComments();
    const startLine = line;
    const startColumn = column;

    const char = peek();
    if (char === '\0') {
      push(TokenType.EOF, '', startLine, startColumn);
      break;
    }

    // Início e fim de String: '...';
    if (char === "'") {
      advance();
      let str = '';
      while (peek() !== "'" && peek() !== '\0') {
        const currentChar = advance();
        str += currentChar;
      }

      if (peek() === "'") {
        advance();
      }
      push(TokenType.STRING, str, startLine, startColumn);
      continue;
    }

    // Números: 123, 1.23
    if (isNumeric(char)) {
      let num = '';

      while (isNumeric(peek())) {
        num += advance();
      }
      if (peek() === '.' && isNumeric(peek(1))) {
        num += advance(); // consome o '.'
        while (isNumeric(peek())) {
          num += advance();
        }
      }
      push(TokenType.NUMBER, num, startLine, startColumn);
      continue;
    }

    // Identificadores e palavras-chave
    if (isAlphabetic(char)) {
      let ident = '';
      while (isAlphabetic(peek())) {
        ident += advance();
      }
      const keyWord = KEYWORDS[ident];
      if (keyWord) {
        push(keyWord, ident, startLine, startColumn);
      } else {
        push(TokenType.IDENT, ident, startLine, startColumn);
      }
      continue;
    }

    // Pontuação e operadores
    const punct = advance();
    switch (punct) {
      case '(':
        push(TokenType.LPAR, '(', startLine, startColumn);
        break;
      case ')':
        push(TokenType.RPAR, ')', startLine, startColumn);
        break;
      case '{':
        push(TokenType.LBRACE, '{', startLine, startColumn);
        break;
      case '}':
        push(TokenType.RBRACE, '}', startLine, startColumn);
        break;
      case '[':
        push(TokenType.LBRACKET, '[', startLine, startColumn);
        break;
      case ']':
        push(TokenType.RBRACKET, ']', startLine, startColumn);
        break;
      case ',':
        push(TokenType.COMMA, ',', startLine, startColumn);
        break;
      case ':':
        push(TokenType.COLON, ':', startLine, startColumn);
        break;
      case ';':
        push(TokenType.SEMICOLON, ';', startLine, startColumn);
        break;
      case '.':
        push(TokenType.DOT, '.', startLine, startColumn);
        break;
      case '+':
        push(TokenType.PLUS, '+', startLine, startColumn);
        break;
      case '-':
        push(TokenType.MINUS, '-', startLine, startColumn);
        break;
      case '*':
        push(TokenType.STAR, '*', startLine, startColumn);
        break;
      case '/':
        push(TokenType.SLASH, '/', startLine, startColumn);
        break;
      case '=':
        if (peek() === '=') {
          advance();
          push(TokenType.EQ, '==', startLine, startColumn);
        } else push(TokenType.ASSIGN, '=', startLine, startColumn);
        break;
      case '!':
        if (peek() === '=') {
          advance();
          push(TokenType.NEQ, '!=', startLine, startColumn);
        } else throw lexErr('Caractere inesperado: !', startLine, startColumn);
        break;
      case '<':
        if (peek() === '=') {
          advance();
          push(TokenType.LTE, '<=', startLine, startColumn);
        } else push(TokenType.LT, '<', startLine, startColumn);
        break;
      case '>':
        if (peek() === '=') {
          advance();
          push(TokenType.GTE, '>=', startLine, startColumn);
        } else push(TokenType.GT, '>', startLine, startColumn);
        break;
      default:
        throw lexErr(
          `Caractere inesperado: ${JSON.stringify(punct)}`,
          startLine,
          startColumn,
        );
    }
  }

  return tokens;
};

function lexErr(msg: string, line: number, col: number) {
  const e = new Error(`${msg} em ${line}:${col}`);
  (e as any).line = line;
  (e as any).col = col;
  return e;
}
