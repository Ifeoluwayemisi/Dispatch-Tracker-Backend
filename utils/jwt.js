import jwt from 'jsonwebtoken';

export const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '3d'});
};

export const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};
