import type { Program, Stmt, Expr } from '../utils/types/ast-node.type';
import type { BValue } from '../utils/types/value.type';
import { V } from '../utils/types/value.type';
import promptSync from 'prompt-sync';
const prompt = promptSync({ sigint: true }); // Ctrl+C cancela

class ReturnSignal {
  constructor(public value: BValue) {}
}
class Env {
  constructor(
    public parent?: Env,
    private values = new Map<string, BValue>(),
  ) {}
  define(name: string, value: BValue) {
    this.values.set(name, value);
  }
  get(name: string): BValue {
    if (this.values.has(name)) return this.values.get(name)!;
    if (this.parent) return this.parent.get(name);
    throw new Error(`Variável não declarada: ${name}`);
  }
  assign(name: string, value: BValue) {
    if (this.values.has(name)) {
      this.values.set(name, value);
      return;
    }
    if (this.parent) {
      this.parent.assign(name, value);
      return;
    }
    throw new Error(`Variável não declarada: ${name}`);
  }
}
// em algum util local do Interpreter:
function parseInputToBValue(raw: string): BValue {
  const s = raw.trim();

  // vazio -> texto vazio (ou V.indef() se preferir)
  if (s.length === 0) return V.txt('');

  // Verdadeiro / Falso (case-insensitive)
  const lower = s.toLowerCase();
  if (lower === 'verdadeiro') return V.bool(true);
  if (lower === 'falso') return V.bool(false);

  // número (suporta vírgula como decimal)
  // aceita: +12, -3, 10.5, 1, 0, 3,14 (vírgula)
  const sNum = s.replace(',', '.');
  const numRegex = /^[+-]?\d+(?:\.\d+)?$/;
  if (numRegex.test(sNum)) return V.num(Number(sNum));

  // fallback: texto
  return V.txt(s);
}

export class Interpreter {
  private globals = new Env();

  constructor() {
    this.globals.define(
      'imprimir',
      V.nat('imprimir', (args) => {
        console.log(...args.map((a) => this.pretty(a)));
        return V.indef();
      }),
    );
    this.globals.define(
      'lerEntrada',
      V.nat('lerEntrada', (args) => {
        const msg = args[0] && args[0].kind === 'Texto' ? args[0].value : '';
        const ans = prompt(msg) ?? ''; // prompt-sync
        return parseInputToBValue(ans);
      }),
    );
  }

  run(program: Program) {
    this.execBlock(program.body, this.globals);
  }
  // Se preferir manter run(stmts: Stmt[]): use this.execBlock(stmts, this.globals);

  // ===== statements =====
  private exec(stmt: Stmt, env: Env): void {
    switch (stmt.kind) {
      case 'VarDecl': {
        const value = stmt.init ? this.eval(stmt.init, env) : V.indef();
        env.define(stmt.name, value);
        return;
      }
      case 'FunctionDecl': {
        const closure = env;
        const func = V.fn(stmt.params.length, (args: BValue[]): BValue => {
          // <- tipo de retorno explícito
          const local = new Env(closure);

          // bind parameters
          for (let i = 0; i < stmt.params.length; i++) {
            local.define(stmt.params[i], args[i] ?? V.indef());
          }

          try {
            this.execBlock(stmt.body, local);
          } catch (signal) {
            if (signal instanceof ReturnSignal) {
              return signal.value; // <- retorna quando 'retorne' foi usado
            }
            throw signal; // <- propaga outros erros
          }

          return V.indef(); // <- SEM 'retorne' explícito: retorna indefinido
        });

        env.define(stmt.name, func);
        return; // <- nada a retornar do exec
      }

      case 'Return': {
        const value = stmt.value ? this.eval(stmt.value, env) : V.indef();
        throw new ReturnSignal(value);
      }
      case 'ExprStmt': {
        this.eval(stmt.expr, env);
        return;
      }
      case 'Block': {
        this.execBlock(stmt.body, new Env(env));
        return;
      }
      case 'If': {
        const t = this.eval(stmt.test, env);
        if (this.truthy(t)) this.execBlock(stmt.then, new Env(env));
        else if (stmt.else) this.execBlock(stmt.else, new Env(env));
        return;
      }
      case 'RepeatTo': {
        const limit = this.expectNumero(
          this.eval(stmt.limit, env),
          'limite do repita',
        ).value;
        while (
          this.expectNumero(env.get(stmt.counter), `contador '${stmt.counter}'`)
            .value < limit
        ) {
          this.execBlock(stmt.body, new Env(env));
        }
        return;
      }

      case 'While': {
        while (this.truthy(this.eval(stmt.test, env))) {
          this.execBlock(stmt.body, new Env(env));
          this;
        }
        return;
      }
    }
  }

  private execBlock(stmts: Stmt[], env: Env) {
    for (const s of stmts) this.exec(s, env);
  }

  // ===== expressions =====
  private eval(expr: Expr, env: Env): BValue {
    switch (expr.kind) {
      case 'Literal': {
        const raw = expr.value;
        if (typeof raw === 'number') return V.num(raw);
        if (typeof raw === 'string') return V.txt(raw);
        if (typeof raw === 'boolean') return V.bool(raw);
        if (raw === null) return V.nulo();
        return V.indef();
      }
      case 'Identifier':
        return env.get(expr.name);

      case 'Assign': {
        const v = this.eval(expr.value, env);
        env.assign(expr.name, v);
        return v;
      }

      case 'Binary': {
        const L = this.eval(expr.left, env);
        const R = this.eval(expr.right, env);
        switch (expr.op) {
          case '+': {
            if (L.kind === 'Texto' || R.kind === 'Texto') {
              return V.txt(this.pretty(L) + this.pretty(R));
            }
            return V.num(
              this.expectNumero(L, 'soma').value +
                this.expectNumero(R, 'soma').value,
            );
          }
          case '-':
            return V.num(
              this.expectNumero(L, 'subtração').value -
                this.expectNumero(R, 'subtração').value,
            );
          case '*':
            return V.num(
              this.expectNumero(L, 'multiplicação').value *
                this.expectNumero(R, 'multiplicação').value,
            );
          case '/':
            return V.num(
              this.expectNumero(L, 'divisão').value /
                this.expectNumero(R, 'divisão').value,
            );

          case '==':
            return V.bool(this.equals(L, R));
          case '!=':
            return V.bool(!this.equals(L, R));

          case '>':
            return V.bool(
              this.expectNumero(L, '>').value > this.expectNumero(R, '>').value,
            );
          case '>=':
            return V.bool(
              this.expectNumero(L, '>=').value >=
                this.expectNumero(R, '>=').value,
            );
          case '<':
            return V.bool(
              this.expectNumero(L, '<').value < this.expectNumero(R, '<').value,
            );
          case '<=':
            return V.bool(
              this.expectNumero(L, '<=').value <=
                this.expectNumero(R, '<=').value,
            );
        }
        throw new Error(`Operador binário desconhecido: ${expr.op}`);
      }

      case 'Call': {
        const callee = this.eval(expr.callee, env);
        const args = expr.args.map((a) => this.eval(a, env));
        if (callee.kind === 'Funcao' || callee.kind === 'Nativo') {
          return callee.call(args);
        }
        throw new Error('Objeto não é chamável');
      }

      // dentro de eval(expr, env)
      case 'Member': {
        const obj = this.eval(expr.object, env);

        // tamanho de texto
        if (obj.kind === 'Texto' && expr.property === 'tamanho') {
          return V.num(obj.value.length);
        }

        // tamanho de lista ✅ (faltava isso)
        if (obj.kind === 'Lista' && expr.property === 'tamanho') {
          return V.num(obj.value.length);
        }

        // propriedades de objeto
        if (obj.kind === 'Objeto') {
          return obj.value[expr.property] ?? V.indef();
        }

        throw new Error('Acesso a membro só é válido para "texto" e "objeto"');
      }

      case 'Object': {
        const out: Record<string, BValue> = {};
        for (const { key, value } of expr.entries)
          out[key] = this.eval(value, env);
        return V.obj(out);
      }

      case 'Array': {
        const elements = expr.elements.map((e) => this.eval(e, env));
        return V.lista(elements);
      }
      case 'Index': {
        const array = this.eval(expr.array, env);
        const index = this.expectNumero(
          this.eval(expr.index, env),
          'índice',
        ).value;
        if (array.kind !== 'Lista') {
          throw new Error('Indexação só é válida para listas');
        }
        return array.value[index] ?? V.indef();
      }
      case 'AssignMember': {
        const obj = this.eval(expr.object, env);
        const value = this.eval(expr.value, env);
        if (obj.kind === 'Objeto') {
          obj.value[expr.property] = value;
          return value;
        }
        throw new Error('Atribuição de membro só é válida para objetos');
      }
      case 'AssignIndex': {
        const array = this.eval(expr.array, env);
        const index = this.expectNumero(
          this.eval(expr.index, env),
          'índice',
        ).value;
        const value = this.eval(expr.value, env);
        if (array.kind !== 'Lista') {
          throw new Error('Atribuição por índice só é válida para listas');
        }
        array.value[index] = value;
        return value;
      }
      default:
        throw new Error(`Expressão desconhecida: ${(expr as any).kind}`);
    }
  }

  // ===== helpers =====
  private pretty(v: BValue): string {
    switch (v.kind) {
      case 'Nulo':
        return 'nulo';
      case 'Indefinido':
        return 'indefinido';
      case 'Booleano':
        return v.value ? 'Verdadeiro' : 'Falso';
      case 'Numero':
        return String(v.value);
      case 'Texto':
        return v.value;
      case 'Objeto':
        return `{ ${Object.entries(v.value)
          .map(([k, val]) => `${k}: ${this.pretty(val)}`)
          .join(', ')} }`;
      case 'Lista':
        return `[ ${v.value.map((x) => this.pretty(x)).join(', ')} ]`;
      case 'Funcao':
        return '<função>';
      case 'Nativo':
        return `<nativo:${v.name}>`;
    }
  }

  private expectNumero(
    v: BValue,
    onde: string,
  ): { kind: 'Numero'; value: number } {
    if (v.kind !== 'Numero')
      throw new Error(`Operação '${onde}' requer números`);
    return v;
  }

  private equals(a: BValue, b: BValue): boolean {
    if (a.kind !== b.kind) return false;
    switch (a.kind) {
      case 'Numero':
      case 'Texto':
      case 'Booleano':
        return a.value === (b as any).value;
      case 'Nulo':
      case 'Indefinido':
        return true;
      case 'Objeto': {
        const ao = a.value,
          bo = (b as any).value;
        const ak = Object.keys(ao),
          bk = Object.keys(bo);
        if (ak.length !== bk.length) return false;
        for (const k of ak) if (!this.equals(ao[k], bo[k])) return false;
        return true;
      }
      case 'Funcao':
      case 'Nativo':
        return a === b; // identidade
      default:
        throw new Error('Tipo de valor não suportado');
    }
  }

  private truthy(v: BValue): boolean {
    switch (v.kind) {
      case 'Booleano':
        return v.value;
      case 'Nulo':
      case 'Indefinido':
        return false;
      case 'Numero':
        return v.value !== 0;
      case 'Texto':
        return v.value.length > 0;
      case 'Objeto':
        return true;
      case 'Lista':
        return v.value.length > 0;
      case 'Funcao':
      case 'Nativo':
        return true;
      default:
        throw new Error('Tipo de valor não suportado');
    }
  }
}
