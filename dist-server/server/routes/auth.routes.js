"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const tslib_1 = require("tslib");
const express_1 = require("express");
const bcrypt_1 = tslib_1.__importDefault(require("bcrypt"));
const jsonwebtoken_1 = tslib_1.__importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const client_1 = require("../db/client");
exports.authRouter = (0, express_1.Router)();
exports.authRouter.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return void res.status(400).json({ error: 'email and password required' });
        const user = await client_1.db.query.officeUsers.findFirst({
            where: (u, { eq }) => eq(u.email, email),
        });
        if (!user || !(await bcrypt_1.default.compare(password, user.passwordHash))) {
            return void res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, config_1.CONFIG.JWT_SECRET, { expiresIn: config_1.CONFIG.JWT_EXPIRY });
        res.json({ token, role: user.role });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
