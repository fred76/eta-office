"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/**
 * Usage: npm run seed:ship -- --id mv-example-001 --name "MV Example" --imo 1234567
 */
const crypto_1 = tslib_1.__importDefault(require("crypto"));
const client_1 = require("../db/client");
const schema_1 = require("../db/schema");
async function main() {
    const args = process.argv.slice(2);
    const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : undefined; };
    const id = get('--id');
    const name = get('--name');
    const imo = get('--imo');
    const flag = get('--flag');
    const type = get('--type');
    if (!id || !name) {
        console.error('Usage: --id <id> --name <name> [--imo <imo>] [--flag <flag>] [--type <type>]');
        process.exit(1);
    }
    const syncToken = crypto_1.default.randomBytes(32).toString('hex');
    await client_1.db.insert(schema_1.ships)
        .values({ id, name, imoNumber: imo, flag, vesselType: type, syncToken })
        .onConflictDoUpdate({ target: schema_1.ships.id, set: { name, imoNumber: imo, flag, vesselType: type } });
    console.log(`Ship registered: ${name} (${id})`);
    console.log(`Sync token: ${syncToken}`);
    console.log(`\nSet on ship PC:\n  OFFICE_SYNC_TOKEN=${syncToken}`);
}
main().catch(e => { console.error(e); process.exit(1); });
