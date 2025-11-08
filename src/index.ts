import { tokenize } from './Lexer';
import { parse } from './Parser';
import { Interpreter } from './Interpreter';
import * as fs from 'fs';
import * as path from 'path';

const filePath = path.resolve(
  process.cwd(),
  process.argv[2] || 'main.brasiliana',
);

try {
  const code = fs.readFileSync(filePath, 'utf-8');
  const tokens = tokenize(code);
  const ast = parse(tokens);
  const interpreter = new Interpreter();
  interpreter.run(ast);
} catch (err) {
  console.error(`Erro ao ler ou executar o arquivo ${filePath}:`, err);
}
