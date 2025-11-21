import Stripe from 'stripe';
import checkAuth from '../../util/check-auth.js';
import Cart from '../../models/Cart.js';
import pkg from 'apollo-server';
const { UserInputError } = pkg;
import Order from '../../models/Order.js'


const stripe = new Stripe(proccess.env.STRIPE_SECRET_KEY)


export default {
    Mutation: {
        async craetePaymentIntent(_, __, context) {
            const user = checkAuth(context);

            try {
                // Получаем корзину пользователя
                const cart = await Cart.findOne({ user: user.id })
                    .populate('items.product')

                if (!cart || cart.items.lenght === 0) {
                    throw new UserInputError('Cart is empty');
                }


                // Считаем общую сумму
                const amount = cart.items.reduce((total, item) => {
                    return total + (item.product.price * item.quantity);
                }, 0);


                // Создаём Payment Intent в Stripe
                const paymentIntent = await stripe.paymentIntents.create({
                    amount: Math.round(amount * 100), // Stripe использует центы
                    currency: 'usd',
                    metadata: {
                        userId: user.id,
                        cartId: cart.id
                    }
                })

                return {
                    clientSecret: paymentIntent.client_secret,
                    amount: amount
                }

            } catch (err) {
                console.error('❌ Error creating payment intent:', err);
                throw new Error(err.message);
            }
        },

        // Создать заказ после успешной оплаты

        async createOrderAfterPayment(_, { paymentIntentId, shippingAddress }, context) {
            const user = checkAuth(context)

            try {
                // Проверяем что оплата прошла успешно

                const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

                if (paymentIntent.status !== 'succeeded') {
                    throw new UserInputError('Payment not completed');
                }

                // Получаем корзину

                const cart = await Cart.findOne({ user: user.id })
                    .populate('items.product')

                if (!cart || cart.items.length === 0) {
                    throw new UserInputError('Cart is empty');
                }

                // Создаём заказ (используем существующую логику из orders.js)

                const orderItems = [];
                let totalAmount = 0;

                for (const item of cart.items) {
                    const product = item.product

                    // Проверяем наличие
                    if (product.stock < item.quantity) {
                        throw new UserInputError(
                            `Not enough stock for ${product.name}`
                        );
                    }

                    // Уменьшаем stock
                    product.stock -= item.quantity;
                    await product.save();

                    orderItems.push({
                        product: product.id,
                        name: product.name,
                        price: product.price,
                        quantity: item.quantity,
                        image: product.image
                    });

                    totalAmount += product.price * item.quantity;
                }

                // Создаём заказ
                const newOrder = new Order({
                    user: user.id,
                    items: orderItems,
                    totalAmount: totalAmount,

                    // Payment info
                    paymentMethod: 'card',
                    isPaid: true,
                    paidAt: new Date().toISOString(),
                    paymentIntentId: paymentIntent.id,      // 👈 ID из Stripe
                    paymentStatus: 'succeeded',             // 👈 Статус

                    // Shipping
                    shippingAddress: shippingAddress,

                    // Status
                    status: 'pending',

                    createdAt: new Date().toISOString()
                });


                const order = await newOrder.save()
                await order.populate('user')

            } catch (err) {
                console.error('❌ Error creating order:', err);
                throw new Error(err.message);
            }
        }
    }
}