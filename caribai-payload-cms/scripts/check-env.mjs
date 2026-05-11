const required = ['PAYLOAD_SECRET', 'NEXT_PUBLIC_SITE_URL']
const postgresOptions = ['DATABASE_URL', 'POSTGRES_URL']

const missing = required.filter((key) => !process.env[key])
const postgresKey = postgresOptions.find((key) => process.env[key])

if (!postgresKey) {
  missing.push('DATABASE_URL or POSTGRES_URL')
}

if (missing.length > 0) {
  console.error('Missing required environment values:')
  for (const key of missing) {
    console.error(`- ${key}`)
  }
  process.exit(1)
}

console.log('Environment looks ready for Vercel + Payload + Postgres.')
console.log(`Using Postgres connection from ${postgresKey}.`)
