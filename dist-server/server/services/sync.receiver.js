"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncVersionMismatchError = void 0;
exports.processSyncPayload = processSyncPayload;
const drizzle_orm_1 = require("drizzle-orm");
const client_1 = require("../db/client");
const schema_1 = require("../db/schema");
class SyncVersionMismatchError extends Error {
    lastKnown;
    constructor(lastKnown, received) {
        super(`Version mismatch: server has ${lastKnown}, payload fromVersion=${received}`);
        this.lastKnown = lastKnown;
    }
}
exports.SyncVersionMismatchError = SyncVersionMismatchError;
async function processSyncPayload(shipId, payload) {
    const now = new Date().toISOString();
    let success = false;
    let errorMsg;
    try {
        // Check if admin requested a full sync for this ship
        if (payload.fromVersion !== 0) {
            const ship = await client_1.db.query.ships.findFirst({ where: (s, { eq }) => eq(s.id, shipId) });
            if (!ship)
                throw new Error('Ship not found');
            if (ship.forceFullSync) {
                await client_1.db.update(schema_1.ships).set({ forceFullSync: 0 }).where((0, drizzle_orm_1.eq)(schema_1.ships.id, shipId));
                throw new SyncVersionMismatchError(0, payload.fromVersion);
            }
            if (payload.fromVersion !== ship.lastReceivedVersion) {
                throw new SyncVersionMismatchError(ship.lastReceivedVersion, payload.fromVersion);
            }
        }
        // Rotation — only latest (preplanning, no history)
        if (payload.rotation) {
            await client_1.db.insert(schema_1.rotationLatest)
                .values({ shipId, data: payload.rotation, snapshotAt: now })
                .onConflictDoUpdate({
                target: schema_1.rotationLatest.shipId,
                set: { data: payload.rotation, snapshotAt: now },
            });
        }
        // Machinery — only latest
        if (payload.machinery) {
            await client_1.db.insert(schema_1.machineryLatest)
                .values({ shipId, data: payload.machinery, snapshotAt: now })
                .onConflictDoUpdate({
                target: schema_1.machineryLatest.shipId,
                set: { data: payload.machinery, snapshotAt: now },
            });
        }
        // Noon — incremental: upsert new/changed + soft-delete removed
        if (payload.noon) {
            for (const entry of payload.noon.upserts) {
                await client_1.db.insert(schema_1.noonPositions)
                    .values({ id: entry.id, shipId, date: entry.date ?? null, data: entry, deleted: 0 })
                    .onConflictDoUpdate({
                    target: [schema_1.noonPositions.shipId, schema_1.noonPositions.id],
                    set: { data: entry, date: entry.date ?? null, deleted: 0 },
                });
            }
            for (const id of payload.noon.deletedIds) {
                await client_1.db.update(schema_1.noonPositions)
                    .set({ deleted: 1 })
                    .where((0, drizzle_orm_1.eq)(schema_1.noonPositions.id, id));
            }
        }
        // Mooring — full replace when present (dataset small)
        if (payload.mooring) {
            await client_1.db.insert(schema_1.mooringLatest)
                .values({ shipId, items: payload.mooring.items, lines: payload.mooring.lines, snapshotAt: now })
                .onConflictDoUpdate({
                target: schema_1.mooringLatest.shipId,
                set: { items: payload.mooring.items, lines: payload.mooring.lines, snapshotAt: now },
            });
        }
        // Sailing Direction
        if (payload.sailingDirection) {
            await client_1.db.insert(schema_1.sailingDirectionLatest)
                .values({
                shipId: shipId,
                snapshotAt: now,
                data: payload.sailingDirection.ports,
            })
                .onConflictDoUpdate({
                target: schema_1.sailingDirectionLatest.shipId,
                set: {
                    snapshotAt: now,
                    data: payload.sailingDirection.ports,
                },
            });
        }
        // Update version + last_sync_at, always clear forceFullSync on success
        await client_1.db.update(schema_1.ships)
            .set({ lastSyncAt: now, lastReceivedVersion: payload.toVersion, forceFullSync: 0 })
            .where((0, drizzle_orm_1.eq)(schema_1.ships.id, shipId));
        success = true;
    }
    catch (err) {
        errorMsg = err.message;
        throw err;
    }
    finally {
        await client_1.db.insert(schema_1.syncReceipts).values({
            shipId,
            receivedAt: now,
            fromVersion: payload.fromVersion,
            toVersion: payload.toVersion,
            success,
            errorMsg,
            payloadSizeKb: Math.round(JSON.stringify(payload).length / 1024),
        });
    }
}
