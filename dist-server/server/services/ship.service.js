"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRotation = getRotation;
exports.getMachinery = getMachinery;
exports.getNoonPositions = getNoonPositions;
exports.getMooring = getMooring;
exports.getSyncLog = getSyncLog;
exports.getSailingDirection = getSailingDirection;
const drizzle_orm_1 = require("drizzle-orm");
const client_1 = require("../db/client");
const schema_1 = require("../db/schema");
async function getRotation(shipId) {
    const row = await client_1.db.query.rotationLatest.findFirst({
        where: (r, { eq }) => eq(r.shipId, shipId),
    });
    return row?.data ?? null;
}
async function getMachinery(shipId) {
    const row = await client_1.db.query.machineryLatest.findFirst({
        where: (m, { eq }) => eq(m.shipId, shipId),
    });
    return row?.data ?? null;
}
async function getNoonPositions(shipId) {
    const rows = await client_1.db.select()
        .from(schema_1.noonPositions)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.noonPositions.shipId, shipId), (0, drizzle_orm_1.eq)(schema_1.noonPositions.deleted, 0)))
        .orderBy((0, drizzle_orm_1.desc)(schema_1.noonPositions.receivedAt));
    return rows.map(r => r.data);
}
async function getMooring(shipId) {
    const row = await client_1.db.query.mooringLatest.findFirst({
        where: (m, { eq }) => eq(m.shipId, shipId),
    });
    return row ?? { items: [], lines: [] };
}
async function getSyncLog(shipId, limit = 100) {
    return client_1.db.select()
        .from(schema_1.syncReceipts)
        .where((0, drizzle_orm_1.eq)(schema_1.syncReceipts.shipId, shipId))
        .orderBy((0, drizzle_orm_1.desc)(schema_1.syncReceipts.receivedAt))
        .limit(limit);
}
async function getSailingDirection(shipId) {
    const row = await client_1.db.query.sailingDirectionLatest.findFirst({
        where: (s, { eq }) => eq(s.shipId, shipId),
    });
    return row?.data ?? [];
}
