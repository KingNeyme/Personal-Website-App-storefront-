import { getPayload } from 'payload'

import config from '../payload.config'

process.env.NODE_ENV ||= 'production'

const required = ['ADMIN_EMAIL', 'ADMIN_PASSWORD'] as const

for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`)
    process.exit(1)
  }
}

const email = process.env.ADMIN_EMAIL as string
const password = process.env.ADMIN_PASSWORD as string
const displayName = process.env.ADMIN_DISPLAY_NAME || 'CaribAI Admin'
const role = process.env.ADMIN_ROLE === 'editor' ? 'editor' : 'admin'

const main = async () => {
  const payload = await getPayload({ config })

  const existing = await payload.find({
    collection: 'users',
    where: {
      email: {
        equals: email,
      },
    },
    limit: 1,
    pagination: false,
  })

  if (existing.docs?.[0]) {
    await payload.update({
      collection: 'users',
      id: existing.docs[0].id,
      data: {
        email,
        password,
        displayName,
        role,
        loginAttempts: 0,
        lockUntil: null,
      },
    })

    console.log(`Updated admin user: ${email}`)
    return
  }

  await payload.create({
    collection: 'users',
    data: {
      email,
      password,
      displayName,
      role,
      loginAttempts: 0,
      lockUntil: null,
    },
  })

  console.log(`Created admin user: ${email}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
