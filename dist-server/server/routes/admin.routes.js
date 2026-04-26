"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = require("express");
const child_process_1 = require("child_process");
const drizzle_orm_1 = require("drizzle-orm");
const auth_1 = require("../middleware/auth");
const client_1 = require("../db/client");
const schema_1 = require("../db/schema");
exports.adminRouter = (0, express_1.Router)();
exports.adminRouter.use(auth_1.requireAuth);
exports.adminRouter.get('/info', auth_1.requireAdmin, (_req, res) => {
    (0, child_process_1.exec)('pm2 jlist', (err, stdout) => {
        let pm2Info = null;
        if (!err) {
            try {
                const list = JSON.parse(stdout);
                const proc = list.find(p => p.name === 'eta-office');
                if (proc) {
                    pm2Info = {
                        mode: proc.pm2_env?.exec_mode ?? '—',
                        restarts: proc.pm2_env?.restart_time ?? 0,
                        status: proc.pm2_env?.status ?? '—',
                        cpu: `${proc.monit?.cpu ?? 0}%`,
                        memory: `${Math.round((proc.monit?.memory ?? 0) / 1024 / 1024 * 10) / 10} MB`,
                    };
                }
            }
            catch { /* pm2 not available */ }
        }
        res.json({
            uptime: process.uptime(),
            nodeVersion: process.version,
            env: process.env['NODE_ENV'] ?? 'development',
            port: Number(process.env['PORT']) ?? 4000,
            pm2: pm2Info,
        });
    });
});
exports.adminRouter.get('/sync-log', auth_1.requireAdmin, async (_req, res) => {
    try {
        const limit = Math.min(parseInt(_req.query['limit']) || 50, 100);
        const rows = await client_1.db
            .select({
            id: schema_1.syncReceipts.id,
            shipId: schema_1.syncReceipts.shipId,
            shipName: schema_1.ships.name,
            receivedAt: schema_1.syncReceipts.receivedAt,
            success: schema_1.syncReceipts.success,
            payloadSizeKb: schema_1.syncReceipts.payloadSizeKb,
            errorMsg: schema_1.syncReceipts.errorMsg,
        })
            .from(schema_1.syncReceipts)
            .leftJoin(schema_1.ships, (0, drizzle_orm_1.eq)(schema_1.ships.id, schema_1.syncReceipts.shipId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.syncReceipts.receivedAt))
            .limit(limit);
        res.json(rows);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.adminRouter.get('/ships', auth_1.requireAdmin, async (_req, res) => {
    try {
        const rows = await client_1.db.select({
            id: schema_1.ships.id,
            name: schema_1.ships.name,
            imoNumber: schema_1.ships.imoNumber,
            flag: schema_1.ships.flag,
            vesselType: schema_1.ships.vesselType,
            lastSyncAt: schema_1.ships.lastSyncAt,
            active: schema_1.ships.active,
            forceFullSync: schema_1.ships.forceFullSync,
        }).from(schema_1.ships).orderBy(schema_1.ships.name);
        res.json(rows);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.adminRouter.post('/ships/:shipId/request-sync', auth_1.requireAdmin, async (req, res) => {
    try {
        const id = req.params['shipId'];
        const ship = await client_1.db.query.ships.findFirst({ where: (s, { eq }) => eq(s.id, id) });
        if (!ship)
            return void res.status(404).json({ error: 'Ship not found' });
        const next = ship.forceFullSync ? 0 : 1;
        await client_1.db.update(schema_1.ships).set({ forceFullSync: next }).where((0, drizzle_orm_1.eq)(schema_1.ships.id, id));
        res.json({ ok: true, forceFullSync: next });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.adminRouter.post('/restart', auth_1.requireAdmin, (_req, res) => {
    res.json({ ok: true });
    setTimeout(() => process.exit(0), 200);
});
exports.adminRouter.patch('/ships/:shipId/status', auth_1.requireAdmin, async (req, res) => {
    try {
        const { active } = req.body;
        await client_1.db.update(schema_1.ships)
            .set({ active: active ? 1 : 0 })
            .where((0, drizzle_orm_1.eq)(schema_1.ships.id, req.params['shipId']));
        res.json({ ok: true });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.adminRouter.delete('/ships/:shipId', auth_1.requireAdmin, async (req, res) => {
    try {
        const id = req.params['shipId'];
        await client_1.db.delete(schema_1.syncReceipts).where((0, drizzle_orm_1.eq)(schema_1.syncReceipts.shipId, id));
        await client_1.db.delete(schema_1.rotationLatest).where((0, drizzle_orm_1.eq)(schema_1.rotationLatest.shipId, id));
        await client_1.db.run((0, drizzle_orm_1.sql) `DELETE FROM rotation_snapshots WHERE ship_id = ${id}`);
        await client_1.db.delete(schema_1.machineryLatest).where((0, drizzle_orm_1.eq)(schema_1.machineryLatest.shipId, id));
        await client_1.db.delete(schema_1.noonPositions).where((0, drizzle_orm_1.eq)(schema_1.noonPositions.shipId, id));
        await client_1.db.delete(schema_1.noonTemplates).where((0, drizzle_orm_1.eq)(schema_1.noonTemplates.shipId, id));
        await client_1.db.delete(schema_1.mooringLatest).where((0, drizzle_orm_1.eq)(schema_1.mooringLatest.shipId, id));
        await client_1.db.run((0, drizzle_orm_1.sql) `DELETE FROM mooring_snapshots WHERE ship_id = ${id}`);
        await client_1.db.delete(schema_1.sailingDirectionLatest).where((0, drizzle_orm_1.eq)(schema_1.sailingDirectionLatest.shipId, id));
        await client_1.db.delete(schema_1.ships).where((0, drizzle_orm_1.eq)(schema_1.ships.id, id));
        res.json({ ok: true });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
