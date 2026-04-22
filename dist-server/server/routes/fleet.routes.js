"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fleetRouter = void 0;
const tslib_1 = require("tslib");
const express_1 = require("express");
const drizzle_orm_1 = require("drizzle-orm");
const auth_1 = require("../middleware/auth");
const fleetService = tslib_1.__importStar(require("../services/fleet.service"));
const client_1 = require("../db/client");
const schema_1 = require("../db/schema");
const crypto_1 = tslib_1.__importDefault(require("crypto"));
exports.fleetRouter = (0, express_1.Router)();
exports.fleetRouter.get('/', auth_1.requireAuth, async (_req, res) => {
    try {
        res.json(await fleetService.getFleet());
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.fleetRouter.get('/:shipId', auth_1.requireAuth, async (req, res) => {
    try {
        const ship = await fleetService.getShipSummary(req.params['shipId']);
        if (!ship)
            return void res.status(404).json({ error: 'Ship not found' });
        res.json(ship);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Admin: register new ship
exports.fleetRouter.post('/', auth_1.requireAuth, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id, name, imoNumber, flag, vesselType } = req.body;
        if (!id || !name)
            return void res.status(400).json({ error: 'id and name required' });
        const syncToken = crypto_1.default.randomBytes(32).toString('hex');
        await client_1.db.insert(schema_1.ships).values({ id, name, imoNumber, flag, vesselType, syncToken });
        res.status(201).json({ id, syncToken });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Admin: regenerate sync token
exports.fleetRouter.post('/:shipId/regen-token', auth_1.requireAuth, auth_1.requireAdmin, async (req, res) => {
    try {
        const syncToken = crypto_1.default.randomBytes(32).toString('hex');
        await client_1.db.update(schema_1.ships)
            .set({ syncToken })
            .where((0, drizzle_orm_1.eq)(schema_1.ships.id, req.params['shipId']));
        res.json({ syncToken });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
