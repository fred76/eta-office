"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.noonPositionsRelations = exports.syncReceiptsRelations = exports.mooringLatestRelations = exports.machineryLatestRelations = exports.rotationLatestRelations = exports.shipsRelations = exports.mooringLatest = exports.noonTemplates = exports.noonPositions = exports.machineryLatest = exports.rotationLatest = exports.syncReceipts = exports.officeUsers = exports.ships = void 0;
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
const drizzle_orm_1 = require("drizzle-orm");
exports.ships = (0, sqlite_core_1.sqliteTable)('ships', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    name: (0, sqlite_core_1.text)('name').notNull(),
    imoNumber: (0, sqlite_core_1.text)('imo_number'),
    flag: (0, sqlite_core_1.text)('flag'),
    vesselType: (0, sqlite_core_1.text)('vessel_type'),
    syncToken: (0, sqlite_core_1.text)('sync_token').notNull().unique(),
    lastSyncAt: (0, sqlite_core_1.text)('last_sync_at'),
    lastReceivedVersion: (0, sqlite_core_1.integer)('last_received_version').notNull().default(0),
    createdAt: (0, sqlite_core_1.text)('created_at').$defaultFn(() => new Date().toISOString()),
});
exports.officeUsers = (0, sqlite_core_1.sqliteTable)('office_users', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    email: (0, sqlite_core_1.text)('email').unique().notNull(),
    passwordHash: (0, sqlite_core_1.text)('password_hash').notNull(),
    role: (0, sqlite_core_1.text)('role').notNull().default('viewer'),
    createdAt: (0, sqlite_core_1.text)('created_at').$defaultFn(() => new Date().toISOString()),
});
exports.syncReceipts = (0, sqlite_core_1.sqliteTable)('sync_receipts', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    shipId: (0, sqlite_core_1.text)('ship_id').references(() => exports.ships.id),
    receivedAt: (0, sqlite_core_1.text)('received_at').$defaultFn(() => new Date().toISOString()),
    payloadSizeKb: (0, sqlite_core_1.integer)('payload_size_kb'),
    fromVersion: (0, sqlite_core_1.integer)('from_version'),
    toVersion: (0, sqlite_core_1.integer)('to_version'),
    success: (0, sqlite_core_1.integer)('success', { mode: 'boolean' }).notNull(),
    errorMsg: (0, sqlite_core_1.text)('error_msg'),
});
exports.rotationLatest = (0, sqlite_core_1.sqliteTable)('rotation_latest', {
    shipId: (0, sqlite_core_1.text)('ship_id').primaryKey().references(() => exports.ships.id),
    snapshotAt: (0, sqlite_core_1.text)('snapshot_at'),
    data: (0, sqlite_core_1.text)('data', { mode: 'json' }).notNull(),
});
exports.machineryLatest = (0, sqlite_core_1.sqliteTable)('machinery_latest', {
    shipId: (0, sqlite_core_1.text)('ship_id').primaryKey().references(() => exports.ships.id),
    snapshotAt: (0, sqlite_core_1.text)('snapshot_at'),
    data: (0, sqlite_core_1.text)('data', { mode: 'json' }).notNull(),
});
exports.noonPositions = (0, sqlite_core_1.sqliteTable)('noon_positions', {
    id: (0, sqlite_core_1.text)('id').notNull(),
    shipId: (0, sqlite_core_1.text)('ship_id').notNull().references(() => exports.ships.id),
    receivedAt: (0, sqlite_core_1.text)('received_at').$defaultFn(() => new Date().toISOString()),
    date: (0, sqlite_core_1.text)('date'),
    deleted: (0, sqlite_core_1.integer)('deleted').notNull().default(0),
    data: (0, sqlite_core_1.text)('data', { mode: 'json' }).notNull(),
}, (t) => ({
    pk: (0, sqlite_core_1.primaryKey)({ columns: [t.shipId, t.id] }),
}));
exports.noonTemplates = (0, sqlite_core_1.sqliteTable)('noon_templates', {
    shipId: (0, sqlite_core_1.text)('ship_id').primaryKey().references(() => exports.ships.id),
    fields: (0, sqlite_core_1.text)('fields', { mode: 'json' }).notNull(),
});
exports.mooringLatest = (0, sqlite_core_1.sqliteTable)('mooring_latest', {
    shipId: (0, sqlite_core_1.text)('ship_id').primaryKey().references(() => exports.ships.id),
    snapshotAt: (0, sqlite_core_1.text)('snapshot_at'),
    items: (0, sqlite_core_1.text)('items', { mode: 'json' }).notNull(),
    lines: (0, sqlite_core_1.text)('lines', { mode: 'json' }).notNull(),
});
// Relations
exports.shipsRelations = (0, drizzle_orm_1.relations)(exports.ships, ({ one, many }) => ({
    rotationLatest: one(exports.rotationLatest, { fields: [exports.ships.id], references: [exports.rotationLatest.shipId] }),
    machineryLatest: one(exports.machineryLatest, { fields: [exports.ships.id], references: [exports.machineryLatest.shipId] }),
    mooringLatest: one(exports.mooringLatest, { fields: [exports.ships.id], references: [exports.mooringLatest.shipId] }),
    syncReceipts: many(exports.syncReceipts),
    noonPositions: many(exports.noonPositions),
}));
exports.rotationLatestRelations = (0, drizzle_orm_1.relations)(exports.rotationLatest, ({ one }) => ({
    ship: one(exports.ships, { fields: [exports.rotationLatest.shipId], references: [exports.ships.id] }),
}));
exports.machineryLatestRelations = (0, drizzle_orm_1.relations)(exports.machineryLatest, ({ one }) => ({
    ship: one(exports.ships, { fields: [exports.machineryLatest.shipId], references: [exports.ships.id] }),
}));
exports.mooringLatestRelations = (0, drizzle_orm_1.relations)(exports.mooringLatest, ({ one }) => ({
    ship: one(exports.ships, { fields: [exports.mooringLatest.shipId], references: [exports.ships.id] }),
}));
exports.syncReceiptsRelations = (0, drizzle_orm_1.relations)(exports.syncReceipts, ({ one }) => ({
    ship: one(exports.ships, { fields: [exports.syncReceipts.shipId], references: [exports.ships.id] }),
}));
exports.noonPositionsRelations = (0, drizzle_orm_1.relations)(exports.noonPositions, ({ one }) => ({
    ship: one(exports.ships, { fields: [exports.noonPositions.shipId], references: [exports.ships.id] }),
}));
