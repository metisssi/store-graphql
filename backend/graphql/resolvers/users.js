import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pkg from 'apollo-server';
const { UserInputError } = pkg;

import dotenv from 'dotenv';


import User from '../../models/User.js';
import checkAuth from '../../util/check-auth.js';
import { validateRegisterInput, validateLoginInput } from '../../util/validators.js';


dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY;


function generateToken(user) {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            username: user.username
        },
        SECRET_KEY,
        { expiresIn: '1h' }
    );
}


export default {
    Mutation: {
        async register(_, { registerInput: { username, email, password, confirmPassword } }) {

            // Валидация данных
            const { valid, errors } = validateRegisterInput(username, email, password, confirmPassword)

            if (!valid) {
                throw new UserInputError('Errors', { errors });
            }

            const user = await User.findOne({ username })
            if (user) {
                throw new UserInputError('Username is taken', {
                    errors: {
                        username: 'This username is taken'
                    }
                })
            }

            // Хэшируем пароль
            password = await bcrypt.hash(password, 12);

            // Создаём нового пользователя
            const newUser = new User({
                email,
                username,
                password,
                createdAt: new Date().toISOString()
            });

            const res = await newUser.save();

            // Генерируем токен
            const token = generateToken(res);

            return {
                ...res._doc,
                id: res._id,
                token
            };
        },


        async login(_, { username, password }) {
            // Валидация
            const { errors, valid } = validateLoginInput(username, password);

            if (!valid) {
                throw new UserInputError('Errors', { errors })
            }

            // Ищем пользователя
            const user = await User.findOne({ username });
            if (!user) {
                errors.general = 'User not found';
                throw new UserInputError('User not found', { errors });
            }


            // Проверяем пароль
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                errors.general = 'Wrong credentials';
                throw new UserInputError('Wrong credentials', { errors });
            }

            // Генерируем токен
            const token = generateToken(user);

            return {
                ...user._doc,
                id: user._id,
                token
            };
        }
    },


    Query: {
        async getUser(_, { userId }, context) {
            const user = checkAuth(context);
            
            try {
                const foundUser = await User.findById(userId);
                if (foundUser) {
                    return foundUser;
                } else {
                    throw new Error('User not found');
                }
            } catch (err) {
                throw new Error(err);
            }
        }
    }
}