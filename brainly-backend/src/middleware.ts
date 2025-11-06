import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_PASSWORD } from "./config";

export const userMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers["authorization"];
    
    if (!header) {
        return res.status(403).json({
            message: "You are not logged in"
        });
    }

    const token = header.startsWith("Bearer ") ? header.slice(7) : header;

    try {
        const decoded = jwt.verify(token, JWT_PASSWORD);
        
        if (typeof decoded === "string") {
            return res.status(403).json({
                message: "Invalid token format"
            });
        }

        req.userId = (decoded as JwtPayload).id;
        next();
    } catch (err) {
        return res.status(403).json({
            message: "Invalid or expired token"
        });
    }
};
