
# Brasiliana Lang

> Uma linguagem de programação interpretada com **sintaxe em Português**, inspirada em JavaScript, pensada para quem não é nativo em inglês. Runtime feito em **TypeScript/JavaScript**.

---

## 📦 Download

- **Windows (x64)**: [Baixar `brasiliana-lang-win-x64.exe`](https://github.com/uriielfl/brasiliana-language/releases/download/v0.1.0/brasiliana-lang-linux-x64)
- (Opcional) **Outros builds**: [Página de Releases](https://github.com/uriielfl/brasiliana-language/releases/latest)

> **Dica:** Suba o binário da release com o mesmo nome (`brasiliana-lang-win-x64.exe`) e esses links já funcionarão. Se o nome/owner do repositório for diferente, ajuste as URLs acima.

---

## 🧭 Sumário

- [Visão geral](#-visão-geral)
- [Instalação](#-instalação)
- [Como executar](#-como-executar)
- [Sintaxe da linguagem](#-sintaxe-da-linguagem)
  - [Declarações](#declarações)
  - [Tipos e operadores](#tipos-e-operadores)
  - [Controle de fluxo](#controle-de-fluxo)
  - [Funções](#funções)
  - [Entrada e saída](#entrada-e-saída)
  - [Escopo e nomeação](#escopo-e-nomeação)
- [Biblioteca padrão](#-biblioteca-padrão)
- [Erros comuns e mensagens](#-erros-comuns-e-mensagens)
- [CLI e flags](#-cli-e-flags)
- [Extensão VS Code (WIP)](#-extensão-vs-code-wip)
- [Exemplos completos](#-exemplos-completos)
- [Roadmap](#-roadmap)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)

---

## 🧩 Visão geral

A **Brasiliana** é uma linguagem interpretada que:
- Usa **palavras-chave em Português**: `declarar variavel`, `declarar funcao`, `se`, `senao`, `enquanto`, `repita de ... ate`, `retorne`, `imprimir`.
- Tem **semântica familiar a JS**, mas com foco em **clareza** para iniciantes.
- É distribuída como binário (por exemplo, `brasiliana-lang-win-x64`) que executa arquivos `.brasiliana`.

---

## ⚙️ Instalação

### Windows
1. Baixe o executável em [Releases](https://github.com/uriielfl/brasiliana-language/releases).
2. (Opcional) Adicione a pasta do executável ao **PATH** do Windows.

### macOS / Linux (opcional)
- No momento, o suporte oficial é **Windows**. Se quiser rodar via **Node.js**:
  1. Clone o repositório.
  2. Instale dependências: `npm i` ou `pnpm i`.
  3. Rode com `ts-node`/`node` conforme instruções do projeto.

---

## ▶️ Como executar

### Pelo arquivo
```bash
brasiliana-lang-win-x64.exe caminho\para\arquivo.brasiliana
```

### Caso configurado nas variáveis de ambiente do sistema(win)
```bash
brasiliana caminho\para\arquivo.brasiliana
```

> Se `brasiliana` não for reconhecido no terminal do Windows PowerShell, verifique o **PATH** ou execute via caminho completo, por ex.: `C:\Ferramentas\brasiliana\brasiliana-lang-win-x64.exe`.

---

## 📝 Sintaxe da linguagem

### Declarações
- **Variável**
```brasiliana
declarar variavel notaDeCorte = 6
```
- **Função**
```brasiliana
declarar funcao checarNotaMinima(notaAtual) {
  se (notaAtual < notaDeCorte) {
    retorne 'reprovado'
  } senao {
    retorne 'passou para a próxima etapa'
  }
}
```

### Tipos e operadores
- **Tipos vistos**: número, string, booleano (implícito).
- **Aritméticos**: `+`, `-`, `*`, `/`  
- **Comparação**: `==`, `!=`, `<`, `>`, `<=`, `>=`  
- **Concatenação**: strings com `+`

### Controle de fluxo
- **Condicional**
```brasiliana
se (condicao) { ... } senao { ... }
```
- **Enquanto (loop condicional)**
```brasiliana
declarar funcao contagemEnquanto(i, max) {
  declarar variavel atual = i
  enquanto (atual != max) {
    atual = atual + 1
    imprimir(atual)
  }
}
```
- **Repita de … até (intervalo)**
```brasiliana
declarar funcao contagem(inicio, fim) {
  declarar variavel atual = inicio
  repita de atual ate fim {
    imprimir(atual)
    atual = atual + 1
  }
}
```

### Funções
- Declaração com `declarar funcao nome(args) { ... }`
- **Retorno** com `retorne valor`
- Suporta chamada com parênteses: `resultado = f(1, 2)`

### Entrada e saída
- **Saída**: `imprimir(valorOuExpressao)`
- **Entrada**: (seu runtime atual não expõe `ler()`; suporte pode ser adicionado futuramente)

### Escopo e nomeação
- `declarar variavel` cria variável no escopo atual da função/bloco (conforme implementado no interpretador).
- Identificadores aceitam *camelCase* (`notaDeCorte`, `minhaFuncao`).

---

## 🧰 Biblioteca padrão

> **Estado atual**: focada em `imprimir`. Módulos extras (ex.: `math`, `string`, `array`) podem ser adicionados no runtime JS/TS.

Sugestões de API futura:
- `tamanho(texto)`, `maiusculas(texto)`, `minusculas(texto)`
- `aleatorio(min, max)`
- `agora()`

---

## ❗ Erros comuns e mensagens

- **`O termo 'brasiliana' não é reconhecido...`**  
  O executável não está no **PATH**. Use o caminho completo ou adicione ao PATH.

- **`Erro: símbolo/identificador não declarado`**  
  Verifique se a variável foi criada com `declarar variavel` antes do uso.

- **`Erro de sintaxe`**  
  Cheque chaves `{ }`, parênteses `()`, e palavras‑chave em Português sem acentos nas palavras‑chave.

---

## 🧪 CLI e flags

> Dependem do build do executável. Recomenda-se implementar:

- `--version` · mostra a versão.
- `--help` · ajuda de uso.

Exemplo esperado:
```bash
brasiliana-lang-win-x64.exe --version
brasiliana-lang-win-x64.exe --help
```

---

## 🧩 Extensão VS Code (WIP)

- **Sintaxe/Highlight** básico (grammar `.tmLanguage.json`).
- **Snippets**: `declarar variavel`, `declarar funcao`, `se/senao`, `enquanto`, `repita de ... ate`, `imprimir`.
- (Futuro) **LSP**: validação, hover, auto-complete e go-to-definition.

---

## 📚 Exemplos completos

### Exemplo 1 — Aprovação por nota
```brasiliana
declarar variavel notaDeCorte = 6

declarar funcao checarNotaMinima(notaAtual) {
  se (notaAtual < notaDeCorte) {
    retorne 'reprovado'
  } senao {
    retorne 'passou para a próxima etapa'
  }
}

declarar variavel passei = checarNotaMinima(7)
imprimir('Meu status: ' + passei)
```

### Exemplo 2 — Contagens
```brasiliana
declarar funcao contagem(inicio, fim) {
  declarar variavel atual = inicio
  repita de atual ate fim {
    imprimir(atual)
    atual = atual + 1
  }
}

contagem(0, 10)

declarar funcao contagemEnquanto(i, max) {
  declarar variavel atual = i
  enquanto (atual != max) {
    atual = atual + 1
    imprimir(atual)
  }
}

contagemEnquanto(0, 43)
```


---

## 🤝 Contribuindo

1. Faça um **fork** do repositório.
2. Crie uma **branch**: `feat/minha-feature`.
3. Abra um **PR** descrevendo a mudança, exemplos e testes (se aplicável).
4. Use *commits* semânticos.

### Estrutura sugerida do projeto
```
/src
  /lexer
  /parser
  /interpreter
  /runtime     # funções nativas (imprimir, futuros módulos)
/examples
/scripts       # build, empacotamento
```

---

## 📄 Licença

MIT License © 2025 Uriel Francisco Libano

---

## 🔗 Links úteis

- **Releases**: https://github.com/uriielfl/brasiliana-language/releases/latest
- **Issues**: https://github.com/uriielfl/brasiliana-language/issues
- **Exemplos**: `./examples/`
- **Extensão VS Code (WIP)**: https://github.com/uriielfl/brasiliana-language/releases/download/v0.1.0/brasiliana-0.1.0.vsix
