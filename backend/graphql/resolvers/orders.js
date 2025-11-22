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
            const user = checkAuth(context);
            
            try {
                const orders = await Order.find({ user: user.id })
                    .populate('user')
                    .sort({ createdAt: -1 });
                
                return orders;
            } catch (err) {
                throw new Error(err.message);
            }
        },



         // Получить все заказы (только для админа) - НОВОЕ!
        async getAllOrders(_, __, context) {
            const user = checkAdmin(context); // Проверяем что пользователь - админ
            
            try {
                const orders = await Order.find()
                    .populate('user')
                    .sort({ createdAt: -1 });
                
                return orders || [];
            } catch (err) {
                throw new Error(err.message);
            }
        },

        // Получить один заказ
        async getOrder(_, { orderId }, context) {
            const user = checkAuth(context);
            
            try {
                const order = await Order.findById(orderId).populate('user');
                
                if (!order) {
                    throw new UserInputError('Order not found');
                }
                
                // Обычный пользователь может видеть только свои заказы
                if (user.role !== 'admin' && order.user.id !== user.id) {
                    throw new UserInputError('Not authorized to view this order');
                }
                
                return order;
            } catch (err) {
                throw new Error(err.message);
            }
        }
    
    },


    Mutation: {
        // Создать заказ

        // async createOrder(_, { orderInput }, context) {
        //     const user = checkAuth(context);

        //     const { items, shippingAddress, paymentMethod } = orderInput;

        //     try {
        //         // Проверяем что товары существуют и есть на складе
        //         const orderItems = [];
        //         let totalAmount = 0;


        //         for (const item of items) {
        //             const product = await Product.findById(item.productId).populate('category');

        //             if (!product) {
        //                 throw new UserInputError(`Product with ID ${item.productId} not found`);
        //             }

        //             if (product.stock < item.quantity) {
        //                 throw new UserInputError(
        //                     `Not enough stock for ${product.name}. Available: ${product.stock}`
        //                 );
        //             }

        //             // Уменьшаем количество на складе
        //             product.stock -= item.quantity;
        //             await product.save();

        //             // Добавляем в заказ (сохраняем данные на момент покупки)
        //             orderItems.push({
        //                 product: product.id,
        //                 name: product.name,
        //                 price: product.price,
        //                 quantity: item.quantity,
        //                 image: product.image
        //             });

        //             totalAmount += product.price * item.quantity;
        //         }

        //         // Создаём заказ
        //         const newOrder = new Order({
        //             user: user.id,
        //             items: orderItems,
        //             totalAmount,
        //             shippingAddress,
        //             paymentMethod,
        //             createdAt: new Date().toISOString()
        //         });

        //         const order = await newOrder.save();
        //         await order.populate('user');

        //         return order;
        //     } catch (err) {
        //         console.error('❌ ERROR in createOrder:', err);
        //         console.error('❌ Error message:', err.message);
        //         console.error('❌ Error stack:', err.stack);

        //         // Если это UserInputError - пробрасываем как есть
        //         if (err instanceof UserInputError) {
        //             throw err;
        //         }

        //         // Иначе выбрасываем с сообщением
        //         throw new Error(`Failed to create order: ${err.message}`);
        //     }
        // },


 // Обновить статус заказа (только для админа) - НОВОЕ!
        async updateOrderStatus(_, { orderId, status }, context) {
            const user = checkAdmin(context); // Проверяем что пользователь - админ
            
            try {
                const order = await Order.findById(orderId);
                
                if (!order) {
                    throw new UserInputError('Order not found');
                }

                // Валидация статуса
                const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
                if (!validStatuses.includes(status)) {
                    throw new UserInputError('Invalid status');
                }

                // Обновляем статус
                order.status = status;
                
                // Если статус "delivered" - отмечаем как доставлено
                if (status === 'delivered') {
                    order.isDelivered = true;
                    order.deliveredAt = new Date().toISOString();
                }

                await order.save();
                await order.populate('user');

                return order;
            } catch (err) {
                console.error('❌ Error in updateOrderStatus:', err);
                
                if (err instanceof UserInputError) {
                    throw err;
                }
                
                throw new Error(err.message);
            }
        },


          // Отменить заказ
        async cancelOrder(_, { orderId }, context) {
            const user = checkAuth(context);
            
            try {
                const order = await Order.findById(orderId);
                
                if (!order) {
                    throw new UserInputError('Order not found');
                }

                // Обычный пользователь может отменить только свой заказ
                if (user.role !== 'admin' && order.user.toString() !== user.id) {
                    throw new UserInputError('Not authorized to cancel this order');
                }

                // Нельзя отменить доставленный заказ
                if (order.status === 'delivered') {
                    throw new UserInputError('Cannot cancel delivered order');
                }

                order.status = 'cancelled';
                await order.save();
                await order.populate('user');

                return order;
            } catch (err) {
                console.error('❌ Error in cancelOrder:', err);
                
                if (err instanceof UserInputError) {
                    throw err;
                }
                
                throw new Error(err.message);
            }
        }
    }
}