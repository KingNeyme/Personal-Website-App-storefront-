import { spawnSync } from 'node:child_process'

const databaseURL = process.env.DATABASE_URL || process.env.POSTGRES_URL
const email = process.env.ADMIN_EMAIL

if (!databaseURL) {
  console.error('Missing required environment variable: DATABASE_URL or POSTGRES_URL')
  process.exit(1)
}

if (!email) {
  console.error('Missing required environment variable: ADMIN_EMAIL')
  process.exit(1)
}

const safeEmail = email.replace(/'/g, "''")
const sql = [
  'UPDATE users',
  'SET login_attempts = 0,',
  '    lock_until = NULL',
  `WHERE email = '${safeEmail}';`,
].join(' ')

const result = spawnSync('psql', [databaseURL, '-v', 'ON_ERROR_STOP=1', '-c', sql], {
  stdio: 'inherit',
})

if (result.error) {
  console.error(result.error)
  process.exit(1)
}

process.exit(result.status ?? 0)
