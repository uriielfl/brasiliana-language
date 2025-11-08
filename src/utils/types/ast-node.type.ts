export type Program = { kind: 'Program'; body: Stmt[] };

export type Stmt =
  | { kind: 'VarDecl'; name: string; init?: Expr }
  | { kind: 'ExprStmt'; expr: Expr }
  | { kind: 'Block'; body: Stmt[] }
  | { kind: 'If'; test: Expr; then: Stmt[]; else?: Stmt[] }
  | { kind: 'RepeatTo'; counter: string; limit: Expr; body: Stmt[] }
  | { kind: 'While'; test: Expr; body: Stmt[] }
  | { kind: 'FunctionDecl'; name: string; params: string[]; body: Stmt[] }
  | { kind: 'Return'; value?: Expr };

export type Expr =
  | { kind: 'Literal'; value: number | string | boolean | null }
  | { kind: 'Identifier'; name: string }
  | { kind: 'Binary'; op: string; left: Expr; right: Expr }
  | { kind: 'Assign'; name: string; value: Expr }
  | { kind: 'AssignMember'; object: Expr; property: string; value: Expr } // 👈 ADICIONE
  | { kind: 'Call'; callee: Expr; args: Expr[] }
  | { kind: 'Member'; object: Expr; property: string }
  | { kind: 'Object'; entries: { key: string; value: Expr }[] }
  | { kind: 'Array'; elements: Expr[] }
  | { kind: 'Index'; array: Expr; index: Expr }
  | { kind: 'AssignIndex'; array: Expr; index: Expr; value: Expr };
