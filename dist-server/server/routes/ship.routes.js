"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shipRouter = void 0;
const tslib_1 = require("tslib");
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const shipService = tslib_1.__importStar(require("../services/ship.service"));
exports.shipRouter = (0, express_1.Router)();
exports.shipRouter.get('/:shipId/rotation', auth_1.requireAuth, async (req, res) => {
    try {
        res.json(await shipService.getRotation(req.params['shipId']));
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.shipRouter.get('/:shipId/machinery', auth_1.requireAuth, async (req, res) => {
    try {
        res.json(await shipService.getMachinery(req.params['shipId']));
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.shipRouter.get('/:shipId/noon', auth_1.requireAuth, async (req, res) => {
    try {
        res.json(await shipService.getNoonPositions(req.params['shipId']));
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.shipRouter.get('/:shipId/mooring', auth_1.requireAuth, async (req, res) => {
    try {
        res.json(await shipService.getMooring(req.params['shipId']));
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.shipRouter.get('/:shipId/sync-log', auth_1.requireAuth, async (req, res) => {
    try {
        const limit = Number(req.query['limit'] ?? 100);
        res.json(await shipService.getSyncLog(req.params['shipId'], limit));
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.shipRouter.get('/:shipId/sailing-direction', auth_1.requireAuth, async (req, res) => {
    try {
        res.json(await shipService.getSailingDirection(req.params['shipId']));
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
