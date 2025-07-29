import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Create new user
export const Register = async (req, res) => {
    try {
        const {name, email, password, role} = req.body;

        //Validate fields
        if (!name || !email || !password || !role) {
            return res.status(400).json({message: 'All fields are required'});
        }

        //Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            return res.status(400).json({message: 'User already exists'});
        }

        //Check if role is valid
        const validRoles = ['CUSTOMER', 'RIDER', 'ADMIN'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({message: 'Invalid role selected'});
        }

        //Hash password
        const hashedPassword = await bcrypt.hash(password, 8);

         const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role
            }
        });
        // return success
        const { password: _, ...userData } = user; // Exclude password from response
        res.status(201).json({user: userData});

    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).json({error: 'Failed to register user'});
    }
};