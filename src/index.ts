// import { tokenize } from './Lexer';
// import { parse } from './Parser';
// import { Interpreter } from './Interpreter';
// import * as fs from 'fs';
// import * as path from 'path';

// const filePath = path.resolve(
//   process.cwd(),
//   process.argv[2] || 'main.brasiliana',
// );

// try {
//   const code = fs.readFileSync(filePath, 'utf-8');
//   const tokens = tokenize(code);
//   const ast = parse(tokens);
//   const interpreter = new Interpreter();
//   interpreter.run(ast);
// } catch (err) {
//   console.error(`Erro ao ler ou executar o arquivo ${filePath}:`, err);
// }

import { tokenize } from './Lexer';
import { parse } from './Parser';
import { Interpreter } from './Interpreter';
import * as fs from 'fs';
import * as path from 'path';

function usage() {
  console.log(
`brasiliana <arquivo.brasiliana>

Opções:
  -h, --help       Mostra esta ajuda
  -v, --version    Mostra a versão
Sem arquivo, tenta "main.brasiliana" no diretório atual.`
  );
}

const args = process.argv.slice(2);
if (args.includes('-h') || args.includes('--help')) { usage(); process.exit(0); }
if (args.includes('-v') || args.includes('--version')) {
  try {
    // evite import; readFileSync funciona bem
    const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'package.json'), 'utf-8'));
    console.log(pkg.version || '0.0.0');
  } catch { console.log('0.0.0'); }
  process.exit(0);
}

// primeiro argumento que não é flag
const fileArg = args.find(a => !a.startsWith('-'));
const filePath = path.resolve(process.cwd(), fileArg || 'main.brasiliana');

try {
  const code = fs.readFileSync(filePath, 'utf-8');
  const tokens = tokenize(code);
  const ast = parse(tokens);
  const interpreter = new Interpreter();
  interpreter.run(ast);
} catch (err) {
  console.error(`Erro ao ler ou executar o arquivo ${filePath}:`, err);
  process.exit(1);
}
