const fs = require('fs')
const path = require('path')

const envPath = path.join(__dirname, '..', '.env')
const envExamplePath = path.join(__dirname, '..', '.env.example')

if (!fs.existsSync(envPath)) {
  console.log('📝 Criando arquivo .env...')
  
  const envContent = `# Database
DATABASE_URL="postgresql://user:password@localhost:5432/cardapio_digital?schema=public"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=change-this-to-a-random-secret-key-in-production
`

  fs.writeFileSync(envPath, envContent)
  console.log('✅ Arquivo .env criado!')
  console.log('⚠️  IMPORTANTE: Edite o arquivo .env e configure:')
  console.log('   1. DATABASE_URL com suas credenciais do PostgreSQL')
  console.log('   2. NEXTAUTH_SECRET com uma chave aleatória')
} else {
  console.log('✅ Arquivo .env já existe!')
}


