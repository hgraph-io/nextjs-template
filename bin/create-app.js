#!/usr/bin/env node

const {execSync} = require('child_process')
const path = require('path')
const fs = require('fs')

const args = process.argv.slice(2)
const projectName = args[0] || 'my-hedera-app'
const currentPath = process.cwd()
const projectPath = path.join(currentPath, projectName)

console.log(`\nCreating new project: ${projectName}\n`)

if (fs.existsSync(projectPath)) {
  console.error(`Error: Directory "${projectName}" already exists.`)
  process.exit(1)
}

try {
  fs.mkdirSync(projectPath, {recursive: true})

  console.log('Copying template files...')

  const templatePath = path.join(__dirname, '..')

  // Essential template files
  const requiredItems = [
    'src',
    'public',
    'package.json',
    'tsconfig.json',
    'next.config.js',
    'postcss.config.js',
    'next-env.d.ts',
  ]

  // Optional configuration files
  const optionalItems = ['.eslintrc.json', '.prettierrc']

  // Copy required files
  requiredItems.forEach((item) => {
    const src = path.join(templatePath, item)
    const dest = path.join(projectPath, item)
    if (fs.existsSync(src)) {
      copyRecursive(src, dest)
    }
  })

  // Copy optional files if they exist
  optionalItems.forEach((item) => {
    const src = path.join(templatePath, item)
    const dest = path.join(projectPath, item)
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest)
    }
  })

  // Configure package.json for the new project
  const pkgPath = path.join(projectPath, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))

  pkg.name = projectName
  pkg.version = '0.1.0'
  delete pkg.bin
  delete pkg.files

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')

  // Create environment file template
  const envContent = [
    '# Hgraph API Key',
    '# Get your API key at https://hgraph.io',
    'NEXT_PUBLIC_HGRAPH_API_KEY=your_api_key_here',
    '',
  ].join('\n')

  fs.writeFileSync(path.join(projectPath, '.env.local'), envContent)

  // Create .gitignore
  const gitignoreContent = [
    '# dependencies',
    '/node_modules',
    '/.pnp',
    '.pnp.js',
    '',
    '# testing',
    '/coverage',
    '',
    '# next.js',
    '/.next/',
    '/out/',
    '',
    '# production',
    '/build',
    '',
    '# misc',
    '.DS_Store',
    '*.pem',
    '',
    '# debug',
    'npm-debug.log*',
    'yarn-debug.log*',
    'yarn-error.log*',
    '',
    '# local env files',
    '.env*.local',
    '',
    '# vercel',
    '.vercel',
    '',
    '# typescript',
    '*.tsbuildinfo',
    'next-env.d.ts',
    '',
  ].join('\n')

  fs.writeFileSync(path.join(projectPath, '.gitignore'), gitignoreContent)

  // Create project README
  const readmeContent = [
    `# ${projectName}`,
    '',
    'A Hedera Next.js application built with [@hgraph.io/nextjs-template](https://www.npmjs.com/package/@hgraph.io/nextjs-template).',
    '',
    '## Getting Started',
    '',
    '1. Configure your environment variables in `.env.local`:',
    '',
    '   ```env',
    '   NEXT_PUBLIC_HGRAPH_API_KEY=your_api_key_here',
    '   ```',
    '',
    '   Get your API key at [https://hgraph.io](https://hgraph.io)',
    '',
    '2. Start the development server:',
    '',
    '   ```bash',
    '   npm run dev',
    '   ```',
    '',
    '3. Open [http://localhost:3000](http://localhost:3000) in your browser',
    '',
    '4. Explore Hedera integration examples at [http://localhost:3000/test-suite](http://localhost:3000/test-suite)',
    '',
    '## Available Scripts',
    '',
    '- `npm run dev` - Start development server',
    '- `npm run build` - Build for production',
    '- `npm start` - Start production server',
    '- `npm run lint` - Run ESLint',
    '',
    '## Documentation',
    '',
    '- [Hgraph Documentation](https://docs.hgraph.io)',
    '- [Next.js Documentation](https://nextjs.org/docs)',
    '- [Hedera Documentation](https://docs.hedera.com)',
    '',
    '## Resources',
    '',
    '- [@hgraph.io/sdk](https://www.npmjs.com/package/@hgraph.io/sdk) - Hedera blockchain SDK',
    '- [Template Repository](https://github.com/hgraph-io/nextjs-template)',
    '',
  ].join('\n')

  fs.writeFileSync(path.join(projectPath, 'README.md'), readmeContent)

  console.log('Installing dependencies...\n')

  execSync('npm install', {cwd: projectPath, stdio: 'inherit'})

  console.log(`\nSuccess! Created ${projectName}\n`)
  console.log('To get started:\n')
  console.log(`  cd ${projectName}`)
  console.log('  npm run dev\n')
  console.log('Documentation: https://docs.hgraph.io')
  console.log('API Key: https://hgraph.io\n')
} catch (error) {
  console.error('\nError:', error.message)

  // Cleanup on failure
  if (fs.existsSync(projectPath)) {
    try {
      fs.rmSync(projectPath, {recursive: true, force: true})
    } catch (cleanupError) {
      console.error('Failed to cleanup:', cleanupError.message)
    }
  }

  process.exit(1)
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src)

  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, {recursive: true})
    }

    const entries = fs.readdirSync(src)

    for (const entry of entries) {
      const srcPath = path.join(src, entry)
      const destPath = path.join(dest, entry)
      copyRecursive(srcPath, destPath)
    }
  } else {
    fs.copyFileSync(src, dest)
  }
}
