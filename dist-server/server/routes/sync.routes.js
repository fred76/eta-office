"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncRouter = void 0;
const tslib_1 = require("tslib");
const express_1 = require("express");
const express_rate_limit_1 = tslib_1.__importDefault(require("express-rate-limit"));
const zod_1 = require("zod");
const client_1 = require("../db/client");
const sync_receiver_1 = require("../services/sync.receiver");
exports.syncRouter = (0, express_1.Router)();
// Authenticate by ship sync_token (Bearer)
exports.syncRouter.use(async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '').trim();
        if (!token)
            return void res.status(401).json({ error: 'Missing sync token' });
        const ship = await client_1.db.query.ships.findFirst({
            where: (s, { eq }) => eq(s.syncToken, token),
        });
        if (!ship)
            return void res.status(401).json({ error: 'Invalid sync token' });
        req.ship = ship;
        next();
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Rate limit: max 2 syncs / 2 min per ship
const syncLimiter = (0, express_rate_limit_1.default)({
    windowMs: 2 * 60 * 1000,
    max: 2,
    keyGenerator: (req) => req.ship?.id ?? 'unknown',
    handler: (_req, res) => {
        res.status(429).json({ ok: false, error: 'Rate limit exceeded — max 1 sync/min per ship' });
    },
    standardHeaders: true,
    legacyHeaders: false,
    validate: { ip: false },
});
// Zod validation — matches new SyncPayload
const SyncPayloadSchema = zod_1.z.object({
    shipId: zod_1.z.string().min(1),
    fromVersion: zod_1.z.number().int().min(0),
    toVersion: zod_1.z.number().int().min(0),
    syncedAt: zod_1.z.string().min(1),
    rotation: zod_1.z.any().nullable(),
    machinery: zod_1.z.any().nullable(),
    noon: zod_1.z.object({
        upserts: zod_1.z.array(zod_1.z.any()),
        deletedIds: zod_1.z.array(zod_1.z.string()),
    }).nullable(),
    mooring: zod_1.z.object({
        items: zod_1.z.array(zod_1.z.any()),
        lines: zod_1.z.array(zod_1.z.any()),
    }).nullable(),
});
exports.syncRouter.post('/', syncLimiter, async (req, res, next) => {
    const ship = req.ship;
    const parsed = SyncPayloadSchema.safeParse(req.body);
    if (!parsed.success) {
        return void res.status(400).json({ ok: false, error: parsed.error.flatten() });
    }
    try {
        await (0, sync_receiver_1.processSyncPayload)(ship.id, parsed.data);
        res.json({ ok: true, receivedAt: new Date().toISOString() });
    }
    catch (err) {
        if (err instanceof sync_receiver_1.SyncVersionMismatchError) {
            return void res.status(409).json({
                ok: false,
                needsFullSync: true,
                lastKnownVersion: err.lastKnown,
            });
        }
        next(err);
    }
});
