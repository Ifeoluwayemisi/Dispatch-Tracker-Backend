import  { PrismaClient } from '@prisma/client';
import { generateToken } from '../utils/jwt.js';
import { hashPassword, comparePassword } from '../utils/password.js';

const prisma = new PrismaClient();

export const register = async (req, res) => {
    try {
        const { name, email, password, role} = req.body;

        const existingUser = await prisma.user.findUnique({
            where: {email} });
            if (existingUser) {
                return res.status(400).json({message: 'Email already in use'});
            }

            const hashed = await hashPassword(password);

            const newUser = await prisma.user.create({
                data: { name, email, password: hashed, role}
            });
            res.status(201).json({
                message: 'User registered successfully',
                token: generateToken({ id: newUser.id, role: newUser.role }),
                user: { id: newUser.id, name: newUser.name, role: newUser.role }
            });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error'});
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user)
            return res.status(400).json({message: 'Invalid credentials' });

        const isMatch = await comparePassword(password, user.password);
        if (!isMatch)
            return res.status(400).json({ message: 'Invalid credentials' });

            res.json({ message: 'Login Successful', token: generateToken({ id: user.id, role: user.role}),
            user: { id: user.id, name: user.name, role: user.role}
        });

    } catch (error) {
            console.error(error)
            res.status(500).json({ message: 'Server error' });
        } 
}