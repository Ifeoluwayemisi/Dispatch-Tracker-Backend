import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../utils/jwt.js';

const prisma = new PrismaClient();

export const protect = async (req, res, next) => {
    console.log('Auth middleware entered');

    // Get the authorization header
    const authHeader = req.headers.authorization;

    // Check header exists and starts with Bearer
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(400).json({ message: 'No token provided' });
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, token missing' });
    }

    try {
        // Verify token
        const decoded = verifyToken(token); // await if async

        // Find user
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (!user) {
            return res.status(401).json({ message: 'User does not exist' });
        }

        // attach user to request
        req.user = user;
        console.log('User authenticated:', req.user);
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied: insufficient permissions' });
        }
        next();
    };
};
