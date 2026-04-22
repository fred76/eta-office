/**
 * Usage: npm run seed:ship -- --id mv-example-001 --name "MV Example" --imo 1234567
 */
import crypto from 'crypto'
import { db } from '../db/client'
import { ships } from '../db/schema'

async function main() {
  const args = process.argv.slice(2)
  const get = (flag: string) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : undefined }

  const id   = get('--id')
  const name = get('--name')
  const imo  = get('--imo')
  const flag = get('--flag')
  const type = get('--type')

  if (!id || !name) {
    console.error('Usage: --id <id> --name <name> [--imo <imo>] [--flag <flag>] [--type <type>]')
    process.exit(1)
  }

  const syncToken = crypto.randomBytes(32).toString('hex')
  await db.insert(ships)
    .values({ id, name, imoNumber: imo, flag, vesselType: type, syncToken })
    .onConflictDoUpdate({ target: ships.id, set: { name, imoNumber: imo, flag, vesselType: type } })

  console.log(`Ship registered: ${name} (${id})`)
  console.log(`Sync token: ${syncToken}`)
  console.log(`\nSet on ship PC:\n  OFFICE_SYNC_TOKEN=${syncToken}`)
}

main().catch(e => { console.error(e); process.exit(1) })
