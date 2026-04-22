"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/**
 * Usage: npm run seed:admin -- --email admin@company.com --password SecurePass123
 */
const bcrypt_1 = tslib_1.__importDefault(require("bcrypt"));
const client_1 = require("../db/client");
const schema_1 = require("../db/schema");
async function main() {
    const args = process.argv.slice(2);
    const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : undefined; };
    const email = get('--email');
    const password = get('--password');
    if (!email || !password) {
        console.error('Usage: --email <email> --password <pass>');
        process.exit(1);
    }
    const passwordHash = await bcrypt_1.default.hash(password, 12);
    await client_1.db.insert(schema_1.officeUsers)
        .values({ email, passwordHash, role: 'admin' })
        .onConflictDoUpdate({ target: schema_1.officeUsers.email, set: { passwordHash, role: 'admin' } });
    console.log(`Admin created: ${email}`);
}
main().catch(e => { console.error(e); process.exit(1); });
