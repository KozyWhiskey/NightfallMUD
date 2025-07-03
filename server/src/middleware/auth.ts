import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
    user?: { accountId: string; username: string; };
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token required.' });
    }
    
    const token = authHeader.split(' ')[1];
    try {
        const JWT_SECRET = process.env.JWT_SECRET as string;
        if (!JWT_SECRET) {
            throw new Error("JWT_SECRET not defined!");
        }
        (req as any).user = jwt.verify(token, JWT_SECRET) as { accountId: string; username: string };
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token.' });
    }
}; 