"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.runMigrations = runMigrations;
const tslib_1 = require("tslib");
const better_sqlite3_1 = tslib_1.__importDefault(require("better-sqlite3"));
const better_sqlite3_2 = require("drizzle-orm/better-sqlite3");
const migrator_1 = require("drizzle-orm/better-sqlite3/migrator");
const path_1 = tslib_1.__importDefault(require("path"));
const fs_1 = tslib_1.__importDefault(require("fs"));
const config_1 = require("../config");
const schema = tslib_1.__importStar(require("./schema"));
const dbDir = path_1.default.dirname(config_1.CONFIG.DB_PATH);
if (!fs_1.default.existsSync(dbDir))
    fs_1.default.mkdirSync(dbDir, { recursive: true });
const sqlite = new better_sqlite3_1.default(config_1.CONFIG.DB_PATH);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');
exports.db = (0, better_sqlite3_2.drizzle)(sqlite, { schema });
function runMigrations() {
    (0, migrator_1.migrate)(exports.db, { migrationsFolder: path_1.default.resolve('server/db/migrations') });
}
