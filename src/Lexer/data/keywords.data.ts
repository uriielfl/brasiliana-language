import { TokenType } from '../../utils/types/token.type';

export const KEYWORDS: Record<string, TokenType> = {
  declarar: TokenType.DECLARAR,
  variavel: TokenType.VARIAVEL,
  funcao: TokenType.FUNCAO,
  se: TokenType.SE,
  senao: TokenType.SENAO,
  retorne: TokenType.RETORNE,
  Verdadeiro: TokenType.VERDADEIRO,
  Falso: TokenType.FALSO,
  repita: TokenType.REPITA,
  enquanto: TokenType.ENQUANTO,
  de: TokenType.DE,
  ate: TokenType.ATE,
};
