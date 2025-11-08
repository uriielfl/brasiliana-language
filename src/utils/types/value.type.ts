export type BValue =
  | { kind: 'Numero'; value: number }
  | { kind: 'Texto'; value: string }
  | { kind: 'Booleano'; value: boolean }
  | { kind: 'Nulo'; value: null }
  | { kind: 'Indefinido'; value: undefined }
  | { kind: 'Objeto'; value: Record<string, BValue> }
  | { kind: 'Lista'; value: BValue[] }
  | {
      kind: 'Funcao';
      arity: number | undefined;
      call: (args: BValue[]) => BValue;
    }
  | { kind: 'Nativo'; name: string; call: (args: BValue[]) => BValue };

export const V = {
  num: (n: number): BValue => ({ kind: 'Numero', value: n }),
  txt: (s: string): BValue => ({ kind: 'Texto', value: s }),
  bool: (b: boolean): BValue => ({ kind: 'Booleano', value: b }),
  nulo: (): BValue => ({ kind: 'Nulo', value: null }),
  indef: (): BValue => ({ kind: 'Indefinido', value: undefined }),
  obj: (o: Record<string, BValue>): BValue => ({ kind: 'Objeto', value: o }),
  fn: (arity: number | undefined, call: (a: BValue[]) => BValue): BValue => ({
    kind: 'Funcao',
    arity,
    call,
  }),
  nat: (name: string, call: (a: BValue[]) => BValue): BValue => ({
    kind: 'Nativo',
    name,
    call,
  }),
  lista: (xs: BValue[]): BValue => ({ kind: 'Lista', value: xs }),
};
