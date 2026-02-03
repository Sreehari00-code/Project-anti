import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { parse } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_production';

export interface DecodedToken {
    id: string;
    role: string;
    iat: number;
    exp: number;
}

export const generateToken = (id: string, role: string) => {
    return jwt.sign({ id, role }, JWT_SECRET, {
        expiresIn: '7d',
    });
};

export const verifyToken = (token: string): DecodedToken | null => {
    try {
        return jwt.verify(token, JWT_SECRET) as DecodedToken;
    } catch (error) {
        return null;
    }
};

export const authenticated = (fn: any) => async (req: NextApiRequest, res: NextApiResponse) => {
    const cookies = parse(req.headers.cookie || '');
    const token = cookies.auth_token;

    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(401).json({ message: 'Invalid token' });
    }

    // Attach user to request (optional, requires extending type)
    // @ts-ignore
    req.user = decoded;

    return await fn(req, res);
};

export const adminOnly = (fn: any) => async (req: NextApiRequest, res: NextApiResponse) => {
    return authenticated(async (req: NextApiRequest, res: NextApiResponse) => {
        // @ts-ignore
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        return await fn(req, res);
    })(req, res);
};
