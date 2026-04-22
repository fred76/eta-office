/**
 * Usage: npm run seed:admin -- --email admin@company.com --password SecurePass123
 */
import bcrypt from 'bcrypt'
import { db } from '../db/client'
import { officeUsers } from '../db/schema'

async function main() {
  const args = process.argv.slice(2)
  const get = (flag: string) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : undefined }

  const email    = get('--email')
  const password = get('--password')

  if (!email || !password) {
    console.error('Usage: --email <email> --password <pass>')
    process.exit(1)
  }

  const passwordHash = await bcrypt.hash(password, 12)
  await db.insert(officeUsers)
    .values({ email, passwordHash, role: 'admin' })
    .onConflictDoUpdate({ target: officeUsers.email, set: { passwordHash, role: 'admin' } })

  console.log(`Admin created: ${email}`)
}

main().catch(e => { console.error(e); process.exit(1) })
