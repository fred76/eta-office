"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportsRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const report_service_1 = require("../services/report.service");
exports.reportsRouter = (0, express_1.Router)();
exports.reportsRouter.get('/', auth_1.requireAuth, async (_req, res) => {
    try {
        res.json(await (0, report_service_1.getFleetReport)());
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
