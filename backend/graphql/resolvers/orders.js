import Order from '../../models/Order.js';
import Product from '../../models/Product.js';
import checkAuth from '../../util/check-auth.js';
import checkAdmin from '../../util/check-admin.js';
import pkg from 'apollo-server';
const { UserInputError } = pkg;


export default {
    Query: {
        // Получить мои заказы (для пользователя)
        async getMyOrders(_, __, context) {
            const user = checkAuth(context)
        }
    },


    Mutation: {
        // Создать заказ

        async createOrder(_, { orderInput }, context) {
            const user = checkAuth(context);

            const { items, shippingAddress, paymentMethod } = orderInput;

            try {
                // Проверяем что товары существуют и есть на складе
                const orderItems = [];
                let totalAmount = 0;


                for (const item of items) {
                    const product = await Product.findById(item.productId).populate('category');

                    if (!product) {
                        throw new UserInputError(`Product with ID ${item.productId} not found`);
                    }

                    if (product.stock < item.quantity) {
                        throw new UserInputError(
                            `Not enough stock for ${product.name}. Available: ${product.stock}`
                        );
                    }

                    // Уменьшаем количество на складе
                    product.stock -= item.quantity;
                    await product.save();

                    // Добавляем в заказ (сохраняем данные на момент покупки)
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
                    totalAmount,
                    shippingAddress,
                    paymentMethod,
                    createdAt: new Date().toISOString()
                });

                const order = await newOrder.save();
                await order.populate('user');

                return order;
            } catch (err) {
                console.error('❌ ERROR in createOrder:', err);
                console.error('❌ Error message:', err.message);
                console.error('❌ Error stack:', err.stack);

                // Если это UserInputError - пробрасываем как есть
                if (err instanceof UserInputError) {
                    throw err;
                }

                // Иначе выбрасываем с сообщением
                throw new Error(`Failed to create order: ${err.message}`);
            }
        }
    }
}