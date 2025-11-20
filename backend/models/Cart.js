import { model, Schema } from 'mongoose';

const cartItemSchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    }
});

const cartSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true  // 👈 У каждого пользователя одна корзина
    },
    items: [cartItemSchema],
    updatedAt: {
        type: String,
        default: () => new Date().toISOString()
    }
});

export default model('Cart', cartSchema);