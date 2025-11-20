import pkg from 'apollo-server';
const { AuthenticationError, ForbiddenError } = pkg;
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export default (context) => {
    // 1. Проверяем что есть токен
    const authHeader = context.req.headers.authorization;

    if (!authHeader) {
        throw new AuthenticationError('Authorization header must be provided');
    }

    const token = authHeader.split('Bearer ')[1];
    
    if (!token) {
        throw new AuthenticationError("Authentication token must be 'Bearer [token]'");
    }

    try {
        // 2. Расшифровываем токен
        const user = jwt.verify(token, process.env.SECRET_KEY);
        
        // 3. Проверяем что пользователь - админ
        if (user.role !== 'admin') {
            throw new ForbiddenError('You must be an admin to perform this action');
        }

        return user;
    } catch (error) {
        if (error instanceof ForbiddenError) {
            throw error;
        }
        throw new AuthenticationError('Invalid/Expired token');
    }
};