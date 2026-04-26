import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'
import type { PortWithBerths } from '../../shared/sailing-direction.interface'

export const ships = sqliteTable('ships', {
  id:                   text('id').primaryKey(),
  name:                 text('name').notNull(),
  imoNumber:            text('imo_number'),
  flag:                 text('flag'),
  vesselType:           text('vessel_type'),
  syncToken:            text('sync_token').notNull().unique(),
  lastSyncAt:           text('last_sync_at'),
  lastReceivedVersion:  integer('last_received_version').notNull().default(0),
  active:               integer('active').notNull().default(1),
  forceFullSync:        integer('forceFullSync').notNull().default(0),
  createdAt:            text('created_at').$defaultFn(() => new Date().toISOString()),
})

export const officeUsers = sqliteTable('office_users', {
  id:           integer('id').primaryKey({ autoIncrement: true }),
  email:        text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  role:         text('role').notNull().default('viewer'),
  createdAt:    text('created_at').$defaultFn(() => new Date().toISOString()),
})

export const syncReceipts = sqliteTable('sync_receipts', {
  id:            integer('id').primaryKey({ autoIncrement: true }),
  shipId:        text('ship_id').references(() => ships.id),
  receivedAt:    text('received_at').$defaultFn(() => new Date().toISOString()),
  payloadSizeKb: integer('payload_size_kb'),
  fromVersion:   integer('from_version'),
  toVersion:     integer('to_version'),
  success:       integer('success', { mode: 'boolean' }).notNull(),
  errorMsg:      text('error_msg'),
})

export const rotationLatest = sqliteTable('rotation_latest', {
  shipId:     text('ship_id').primaryKey().references(() => ships.id),
  snapshotAt: text('snapshot_at'),
  data:       text('data', { mode: 'json' }).notNull(),
})

export const machineryLatest = sqliteTable('machinery_latest', {
  shipId:     text('ship_id').primaryKey().references(() => ships.id),
  snapshotAt: text('snapshot_at'),
  data:       text('data', { mode: 'json' }).notNull(),
})

export const noonPositions = sqliteTable('noon_positions', {
  id:         text('id').notNull(),
  shipId:     text('ship_id').notNull().references(() => ships.id),
  receivedAt: text('received_at').$defaultFn(() => new Date().toISOString()),
  date:       text('date'),
  deleted:    integer('deleted').notNull().default(0),
  data:       text('data', { mode: 'json' }).notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.shipId, t.id] }),
}))

export const noonTemplates = sqliteTable('noon_templates', {
  shipId: text('ship_id').primaryKey().references(() => ships.id),
  fields: text('fields', { mode: 'json' }).notNull(),
})

export const mooringLatest = sqliteTable('mooring_latest', {
  shipId:     text('ship_id').primaryKey().references(() => ships.id),
  snapshotAt: text('snapshot_at'),
  items:      text('items', { mode: 'json' }).notNull(),
  lines:      text('lines', { mode: 'json' }).notNull(),
})

export const sailingDirectionLatest = sqliteTable('sailing_direction_latest', {
  shipId:     text('ship_id').primaryKey().references(() => ships.id),
  snapshotAt: text('snapshot_at'),
  data:       text('data', { mode: 'json' }).$type<PortWithBerths[]>().notNull(),
})

// Relations
export const shipsRelations = relations(ships, ({ one, many }) => ({
  rotationLatest:  one(rotationLatest,  { fields: [ships.id], references: [rotationLatest.shipId] }),
  machineryLatest: one(machineryLatest, { fields: [ships.id], references: [machineryLatest.shipId] }),
  mooringLatest:   one(mooringLatest,   { fields: [ships.id], references: [mooringLatest.shipId] }),
  syncReceipts:    many(syncReceipts),
  noonPositions:   many(noonPositions),
}))

export const rotationLatestRelations = relations(rotationLatest, ({ one }) => ({
  ship: one(ships, { fields: [rotationLatest.shipId], references: [ships.id] }),
}))

export const machineryLatestRelations = relations(machineryLatest, ({ one }) => ({
  ship: one(ships, { fields: [machineryLatest.shipId], references: [ships.id] }),
}))

export const mooringLatestRelations = relations(mooringLatest, ({ one }) => ({
  ship: one(ships, { fields: [mooringLatest.shipId], references: [ships.id] }),
}))

export const sailingDirectionLatestRelations = relations(sailingDirectionLatest, ({ one }) => ({
  ship: one(ships, { fields: [sailingDirectionLatest.shipId], references: [ships.id] }),
}))

export const syncReceiptsRelations = relations(syncReceipts, ({ one }) => ({
  ship: one(ships, { fields: [syncReceipts.shipId], references: [ships.id] }),
}))

export const noonPositionsRelations = relations(noonPositions, ({ one }) => ({
  ship: one(ships, { fields: [noonPositions.shipId], references: [ships.id] }),
}))
