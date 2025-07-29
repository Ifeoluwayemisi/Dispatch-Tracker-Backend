import jwt from 'jsonwebtoken';
const secret = Process.env.JWT_SECRET || 'fallback_secret';

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) 
        return 
    res.status(401).json({ error: 'Unauthorized' });

        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(token, secret);
            req.user = decoded;  //{id, email, role}
            next();
        } catch (err) {
            console.error('Token verification failed:', err);
            return res.status(401).json({ error: 'Invalid token' });
        }
    };

    export const authorizeRole = (...roles) => {
        return (req, res, next) => {
            if (!roles.includes(req.user.role)) {
                return
                res.status(403).json({ error: 'Forbidden' });
            }
            next();
        };
    };