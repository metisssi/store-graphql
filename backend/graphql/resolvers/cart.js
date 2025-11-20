import { Query } from 'mongoose';
import Cart from '../../models/Cart.js';
import Product from '../../models/Product.js';
import checkAuth from '../../util/check-auth.js';
import pkg from 'apollo-server';
const { UserInputError } = pkg;



export default {
    Query: {
        // Get my cart 


    },


    Mutation: {
        // add item to cart 

        async addToCart(_, { productId, quantity }, context) {
            const user = checkAuth(context)

            try {
                const product = await Product.findById(productId);

                if (!product) {
                    throw new UserInputError('Product not found');
                }

                // Проверяем что товар в наличии
                if (product.stock < quantity) {
                    throw new UserInputError(
                        `Not enough stock. Available: ${product.stock}`
                    );
                }

                let cart = await Cart.findOne({ user: user.id });


                // Если корзины нет - создаем
                if (!cart) {
                    cart = new Cart({
                        user: user.id,
                        items: []
                    });
                }

                // Проверяем есть ли товар уже в корзине
                const existingItem = cart.items.find(
                    item => item.product.toString() === productId
                );


                if (existingItem) {
                    // Увеличиваем количество
                    const newQuantity = existingItem.quantity + quantity;

                    // Проверяем что не превышаем stock
                    if (newQuantity > product.stock) {
                        throw new UserInputError(
                            `Cannot add more. Stock limit: ${product.stock}`
                        );
                    }

                    existingItem.quantity = newQuantity;
                } else {
                    // Добавляем новый товар
                    cart.items.push({
                        product: productId,
                        quantity
                    });

                    cart.updatedAt = new Date().toISOString();
                    await cart.save();

                    await cart.populate('user');
                    await cart.populate('items.product');

                    return cart;
                }

            } catch (err) {
                console.error('❌ Error in addToCart:', err);
                if (err instanceof UserInputError) {
                    throw err;
                }
                throw new Error(err.message);
            }

        }
    }
}