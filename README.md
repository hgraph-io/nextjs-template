# @hgraph.io/nextjs-template

[![npm version](https://badge.fury.io/js/@hgraph.io%2Fnextjs-template.svg)](https://www.npmjs.com/package/@hgraph.io/nextjs-template)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)](https://www.typescriptlang.org/)

A production-ready Next.js 16 template with built-in Hedera blockchain
integration, TypeScript support, and modern web development best practices.

## Features

- **Next.js 16** - Latest version with App Router, Server Components, and React
  19
- **Hedera Integration** - Pre-configured
  [@hgraph.io/sdk](https://www.npmjs.com/package/@hgraph.io/sdk) for blockchain
  interactions
- **Modern Stack** - React 19, Ethers.js 5, and optimized build configuration

## 📦 Installation

### Using npx (Recommended)

Create a new project with a single command:

```bash
npx @hgraph.io/nextjs-template my-app
```

This will create a new directory with all the necessary files and install
dependencies automatically.

### Using git clone

```bash
git clone https://github.com/hgraph-io/nextjs-template.git my-app
cd my-app
npm install
```

### Using degit

Clone without git history:

```bash
npx degit hgraph-io/nextjs-template my-app
cd my-app
npm install
```

## Quick Start

1. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_HGRAPH_API_KEY=your_api_key_here
   ```

2. **Run the development server**

   ```bash
   npm run dev
   ```

3. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000) to see your
   application.

4. **Explore the test suite**

   Visit [http://localhost:3000/test-suite](http://localhost:3000/test-suite) to
   see Hedera integration examples.

## Usage

### Basic Hedera Client Setup

```typescript
import Client, {Network, Environment} from '@hgraph.io/sdk'

const client = new Client({
  network: Network.HederaMainnet,
  environment: Environment.Production,
  headers: {
    'x-api-key': process.env.NEXT_PUBLIC_HGRAPH_API_KEY || '',
  },
})
```

### Querying Transactions

```typescript
const result = await client.query(`
  query LatestTransaction {
    transaction(limit: 1, order_by: {consensus_timestamp: desc}) {
      consensus_timestamp
      transaction_hash
      charged_tx_fee
    }
  }
`)
```

### Querying Account Information

```typescript
const result = await client.query(`
  query GetAccount {
    entity(where: {id: {_eq: 98}}, limit: 1) {
      id
      balance
      created_timestamp
      memo
    }
  }
`)
```

### Working with Tokens and NFTs

```typescript
const tokens = await client.query(`
  query GetTokens {
    token(limit: 5, order_by: {created_timestamp: desc}) {
      token_id
      name
      symbol
      decimals
      initial_supply
    }
  }
`)
```

## Project Structure

```
nextjs-template/
├── src/
│   └── app/
│       ├── globals.css        # Global styles
│       ├── layout.tsx         # Root layout
│       ├── page.tsx           # Home page
│       └── test-suite/        # Hedera API test examples
│           └── page.tsx
├── public/                    # Static assets
├── .eslintrc.json            # ESLint configuration
├── next.config.js            # Next.js configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Project dependencies
```

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## Configuration

### Next.js Config

The template includes optimized Next.js configuration in `next.config.js`.
Customize as needed for your project.

### TypeScript Config

TypeScript is pre-configured with strict mode and path aliases. Modify
`tsconfig.json` to adjust settings.

### Environment Variables

Required environment variables:

- `NEXT_PUBLIC_HGRAPH_API_KEY` - Your Hgraph API key for Hedera integration

## API Reference

### Hedera SDK

This template uses
[@hgraph.io/sdk](https://www.npmjs.com/package/@hgraph.io/sdk) for Hedera
blockchain integration. The SDK provides:

- Transaction queries
- Account information
- Token and NFT data
- Smart contract interactions
- Network state queries

For complete API documentation, visit the
[Hgraph SDK documentation](https://docs.hgraph.io).

## Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/hgraph-io/nextjs-template)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add your environment variables
4. Deploy!

## Links

- **Documentation**: [https://docs.hgraph.io](https://docs.hgraph.io)
- **GitHub**:
  [https://github.com/hgraph-io/nextjs-template](https://github.com/hgraph-io/nextjs-template)
- **npm**:
  [https://www.npmjs.com/package/@hgraph.io/nextjs-template](https://www.npmjs.com/package/@hgraph.io/nextjs-template)
- **Hedera**: [https://hedera.com](https://hedera.com)

## Support

- **Email**: [support@hgraph.com](mailto:support@hgraph.com)
- **Issues**:
  [GitHub Issues](https://github.com/hgraph-io/nextjs-template/issues)

---
