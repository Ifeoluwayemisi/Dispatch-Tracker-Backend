// Authenticate token
import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if(!token) {
        return res.status(401).json({ error: 'Unauthorized, No token provided' });

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded; // {id, email, role}
            next();
        } catch (err) {
            return 
            res.status(401).json({ error: 'Unauthorized, Invalid token' });
        }
    }
}