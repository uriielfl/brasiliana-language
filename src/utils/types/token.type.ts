export enum TokenType {
  EOF,

  // Literais e identificadores
  IDENT,
  NUMBER,
  STRING,

  // Palavras-chave
  DECLARAR,
  VARIAVEL,
  FUNCAO,
  IMPRIMIR,
  SE,
  SENAO,
  RETORNE,
  VERDADEIRO,
  FALSO,
  REPITA,
  ENQUANTO,
  DE,
  ATE,

  // Pontuação / operadores
  LPAR,
  RPAR,
  LBRACE,
  RBRACE,
  LBRACKET,
  RBRACKET,
  COMMA,
  COLON,
  SEMICOLON,
  DOT,
  PLUS,
  MINUS,
  STAR,
  SLASH,
  // =
  ASSIGN,

  // ==, !=
  EQ,
  NEQ,
  // < <= > >=
  LT,
  LTE,
  GT,
  GTE,
}

export type Position = {
  line: number;
  column: number;
};

export type Token = {
  type: TokenType;
  lexeme: string; // texto literal daquele token (útil para depuração)
  position: Position;
};
