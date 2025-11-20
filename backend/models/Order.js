import { model, Schema } from 'mongoose';

const orderItemSchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: String,          // Сохраняем название на момент заказа
    price: Number,         // Сохраняем цену на момент заказа
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    image: String          // Сохраняем картинку на момент заказа
});

const orderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [orderItemSchema],
    
    totalAmount: {
        type: Number,
        required: true
    },
    
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    
    shippingAddress: {
        fullName: String,
        address: String,
        city: String,
        postalCode: String,
        country: String,
        phone: String
    },
    
    paymentMethod: {
        type: String,
        enum: ['card', 'cash', 'paypal'],
        default: 'card'
    },
    
    isPaid: {
        type: Boolean,
        default: false
    },
    
    paidAt: String,
    
    isDelivered: {
        type: Boolean,
        default: false
    },
    
    deliveredAt: String,
    
    createdAt: {
        type: String,
        default: () => new Date().toISOString()
    }
});

export default model('Order', orderSchema);