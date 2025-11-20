import { model, Schema } from 'mongoose';

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {  // 👈 НОВОЕ ПОЛЕ
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    createdAt: {
        type: String,
        default: () => new Date().toISOString()
    }
});

export default model('User', userSchema);