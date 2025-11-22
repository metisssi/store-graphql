import { model, Schema } from 'mongoose';

const orderItemSchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: String,          
    price: Number,         
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    image: String          
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
    
    // 💰 ПЛАТЁЖНАЯ ИНФОРМАЦИЯ
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
    
    // 🆕 STRIPE PAYMENT INFO
    paymentIntentId: {          // ID платежа из Stripe
        type: String
    },
    
    paymentStatus: {            // Статус оплаты
        type: String,
        enum: ['pending', 'succeeded', 'failed', 'refunded'],
        default: 'pending'
    },
    
    // 📦 СТАТУС ЗАКАЗА
    status: {
        type: String,
        enum: ['pending', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    
    // 🚚 ДОСТАВКА
    shippingAddress: {
        fullName: String,
        address: String,
        city: String,
        postalCode: String,
        country: String,
        phone: String
    },
    
    isDelivered: {
        type: Boolean,
        default: false
    },
    
    deliveredAt: String,
    
    // 📝 ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ
    trackingNumber: {           // 🆕 Трекинг номер для отслеживания
        type: String
    },
    
    notes: {                    // 🆕 Заметки/комментарии
        type: String
    },
    
    // 📅 ВРЕМЕННЫЕ МЕТКИ
    createdAt: {
        type: String,
        default: () => new Date().toISOString()
    },
    
    updatedAt: {                // 🆕 Последнее обновление
        type: String,
        default: () => new Date().toISOString()
    }
});

// 🆕 Middleware для обновления updatedAt
orderSchema.pre('save', function(next) {
    this.updatedAt = new Date().toISOString();
    next();
});

export default model('Order', orderSchema);