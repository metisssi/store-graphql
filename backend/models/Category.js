import { model, Schema } from 'mongoose';

const categorySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: String,
        default: () => new Date().toISOString()
    }
});

export default model('Category', categorySchema);   