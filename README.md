# Cartão de Pontuação ParkGolf

Aplicativo web para registrar pontuações de partidas de Park Golf, com histórico, estatísticas por jogador e campo, e salvamento automático entre sessões.

**Acesse:** https://tathianamb.github.io/parkgolf/

---

## Ponto de partida: apenas um arquivo `.tsx`

O projeto começou com um único arquivo: `parkgolf.tsx`. Esse arquivo contém toda a lógica e a interface do aplicativo — cadastro de jogadores, placar, histórico e estatísticas.

Mas um arquivo `.tsx` não pode ser aberto diretamente no navegador. Para entender por quê, é preciso entender o que ele é.

---

## O que é um arquivo `.tsx`?

`.tsx` é uma combinação de duas coisas:

- **TypeScript (`.ts`)** — uma versão de JavaScript que permite declarar os tipos de variáveis (ex: "essa variável é um número", "essa é texto"). O navegador não entende TypeScript — ele precisa ser *compilado* para JavaScript puro antes de rodar.

- **JSX** — uma sintaxe que permite escrever estruturas de interface (HTML) dentro do código JavaScript. O trecho abaixo é JSX:

  ```jsx
  <button onClick={salvar}>Salvar</button>
  ```

  O navegador também não entende JSX. Ele precisa ser transformado em chamadas JavaScript como:

  ```js
  React.createElement("button", { onClick: salvar }, "Salvar")
  ```

Além disso, o arquivo usa **React** — uma biblioteca JavaScript que gerencia a interface. O React precisa estar disponível no navegador para o código funcionar.

**Resumo:** o `.tsx` é código de alto nível que humanos escrevem com mais facilidade, mas que precisa ser *traduzido* para algo que o navegador entenda.

---

## O que é o processo de build?

"Buildar" significa executar essa tradução. O resultado é uma pasta `dist/` contendo:

- `index.html` — a página principal
- um arquivo `.js` — todo o código da aplicação já traduzido e compactado, incluindo o React embutido

Esses arquivos sim o navegador consegue abrir.

```
parkgolf.tsx  →  [build]  →  dist/index.html + dist/assets/index.js
```

---

## Por que o GitHub Pages precisa do build?

O GitHub Pages é um serviço de hospedagem de arquivos estáticos. Ele serve o que você colocar lá, sem executar nenhum processamento. Então se você colocar o `parkgolf.tsx` diretamente, o navegador vai tentar abrir um arquivo TypeScript — e vai falhar.

O que precisa estar no GitHub Pages é o conteúdo da pasta `dist/`, gerada pelo build.

---

## O que foi criado para tornar o build possível

### `package.json`

É o arquivo que descreve o projeto para o Node.js: quais bibliotecas ele usa e quais comandos estão disponíveis.

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build"
}
```

- `npm run dev` — inicia um servidor local para visualizar o app durante o desenvolvimento
- `npm run build` — gera a pasta `dist/` pronta para publicação

As dependências declaradas aqui (React, Vite, TypeScript) são instaladas com `npm install`, que cria a pasta `node_modules/`.

### `vite.config.ts` — o bundler

O **Vite** é a ferramenta que executa o build. Ela pega o `src/App.tsx`, resolve todas as dependências (incluindo o React), compila o TypeScript, transforma o JSX, e gera os arquivos finais em `dist/`.

Uma configuração importante:

```ts
base: '/parkgolf/'
```

Isso diz ao Vite que o app vai ser servido dentro do caminho `/parkgolf/` — que é o nome do repositório no GitHub Pages. Sem isso, os links internos do app quebrariam.

### `tsconfig.json` — configuração do TypeScript

Define as regras de como o TypeScript deve checar o código. Como o arquivo original foi escrito sem anotações de tipo, o modo estrito foi desativado para que o build não exigisse tipagem completa.

### `index.html`

Todo site precisa de um HTML de entrada. Este é simples — tem apenas um `<div id="root">` onde o React injeta a interface, e um `<script>` que carrega o código compilado.

### `src/main.tsx`

É o ponto de entrada do React. Ele conecta o componente `App` (o `parkgolf.tsx`) ao `<div id="root">` do HTML:

```tsx
createRoot(document.getElementById('root')).render(<App />)
```

### `src/App.tsx`

É o `parkgolf.tsx` original. Nenhuma lógica foi alterada — apenas 6 anotações de tipo foram adicionadas para satisfazer o compilador TypeScript em pontos onde o tipo não era inferível:

- Tipos de estados que iniciam como `null`: `useState<number | null>(null)`
- Tipo do temporizador: `useRef<ReturnType<typeof setInterval> | null>(null)`
- Tipo do estado `histLimit`, que pode ser número ou a string `"todas"`
- Tipo do evento `handleBefore(e: BeforeUnloadEvent)`

---

## Como o deploy automático funciona

Em vez de buildar na própria máquina e subir os arquivos manualmente a cada atualização, foi configurado um **GitHub Actions** — um serviço do GitHub que executa tarefas automaticamente quando algo acontece no repositório.

O arquivo `.github/workflows/deploy.yml` define o seguinte fluxo, que roda a cada push na branch `main`:

```
1. Clona o repositório
2. Instala o Node.js
3. Instala as dependências (npm ci)
4. Executa o build (npm run build)
5. Publica o conteúdo de dist/ no GitHub Pages
```

Isso significa que para atualizar o site basta alterar o código e fazer push — o resto acontece automaticamente.

---

## Estrutura final do projeto

```
parkgolf/
├── .github/
│   └── workflows/
│       └── deploy.yml      # pipeline de build e deploy automático
├── src/
│   ├── App.tsx             # o aplicativo (baseado no parkgolf.tsx original)
│   └── main.tsx            # ponto de entrada do React
├── .gitignore              # arquivos ignorados pelo git
├── index.html              # página HTML raiz
├── package.json            # dependências e scripts
├── parkgolf.tsx            # arquivo original (mantido como referência)
├── tsconfig.json           # configuração do TypeScript
└── vite.config.ts          # configuração do Vite (bundler)
```

O que o git **não** versiona (listado no `.gitignore`):

- `node_modules/` — bibliotecas instaladas localmente; pesadas e regeneráveis com `npm install`
- `dist/` — resultado do build; gerado automaticamente pelo GitHub Actions
- `*.tsbuildinfo` — cache interno do compilador TypeScript

---

## Créditos

Aplicativo desenvolvido por **@SergioStevan Jr** · 2026
