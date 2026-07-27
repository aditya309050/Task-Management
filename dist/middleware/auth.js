"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const auth_1 = require("../utils/auth");
const db_1 = require("../utils/db");
async function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ message: "Authentication token missing or invalid" });
            return;
        }
        const token = authHeader.split(" ")[1];
        const decoded = (0, auth_1.verifyToken)(token);
        if (!decoded) {
            res.status(401).json({ message: "Authentication token is expired or invalid" });
            return;
        }
        const user = await db_1.prisma.user.findUnique({
            where: { id: decoded.userId },
        });
        if (!user) {
            res.status(401).json({ message: "Authenticated user no longer exists" });
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.error("Auth middleware error:", error);
        res.status(500).json({ message: "Internal server error during authentication" });
    }
}
