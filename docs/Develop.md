# 🖥️ Develop

## IDE Setup

- Editor: [VS Code](https://code.visualstudio.com)
- Linter: [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- Formatter: [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
pnpm install
```

### Development

### Setup Node.js

Download and install [Node.js v22.x.x](https://nodejs.org/en/download)

### Setup pnpm

```bash
corepack enable
corepack prepare pnpm@10.27.0 --activate
```

### Install Dependencies

```bash
pnpm install
```

### ENV

```bash
cp .env.example .env
```

### Start

```bash
pnpm dev
```

### Debug

```bash
pnpm debug
```

Then input chrome://inspect in browser

### Test

```bash
pnpm test
```

### Build

```bash
# For windows
$ pnpm build:win

# For macOS
$ pnpm build:mac

# For Linux
$ pnpm build:linux
```
