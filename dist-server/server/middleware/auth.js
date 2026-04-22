"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireAdmin = requireAdmin;
const tslib_1 = require("tslib");
const jsonwebtoken_1 = tslib_1.__importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
function requireAuth(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '').trim();
    if (!token)
        return void res.status(401).json({ error: 'Unauthorized' });
    try {
        req.user = jsonwebtoken_1.default.verify(token, config_1.CONFIG.JWT_SECRET);
        next();
    }
    catch {
        res.status(401).json({ error: 'Invalid token' });
    }
}
function requireAdmin(req, res, next) {
    if (req.user?.role !== 'admin')
        return void res.status(403).json({ error: 'Forbidden' });
    next();
}
