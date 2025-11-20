import { Query } from 'mongoose';
import Cart from '../../models/Cart.js';
import Product from '../../models/Product.js';
import checkAuth from '../../util/check-auth.js';
import pkg from 'apollo-server';
const { UserInputError } = pkg;



export default {
  Query: {
    async getMyCart(_, __, context) {
        const user = checkAuth(context);
        
        try {
            let cart = await Cart.findOne({ user: user.id })
                .populate('user');
            
            if (!cart) {
                return null;
            }

            // Вручную populate каждый товар и фильтруем удаленные
            const validItems = [];
            
            for (const item of cart.items) {
                try {
                    const product = await Product.findById(item.product)
                        .populate('category');
                    
                    // Если товар существует - добавляем
                    if (product) {
                        validItems.push({
                            product: product,
                            quantity: item.quantity
                        });
                    } else {
                        console.warn(`⚠️ Product ${item.product} not found in cart, removing...`);
                    }
                } catch (err) {
                    console.warn(`⚠️ Error loading product ${item.product}:`, err.message);
                }
            }

            // Обновляем корзину только валидными товарами
            cart.items = validItems;
            
            // Если были удалены товары - сохраняем
            if (validItems.length !== cart.items.length) {
                await cart.save();
            }
            
            return cart;
            
        } catch (err) {
            console.error('❌ Error in getMyCart:', err);
            throw new Error(err.message);
        }
    }
},


    Mutation: {
        // add item to cart 

        async addToCart(_, { productId, quantity}, context) {
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
                }

                cart.updatedAt = new Date().toISOString();
                await cart.save();

                await cart.populate('user');
                await cart.populate('items.product');

                return cart;

            } catch (err) {
                console.error('❌ Error in addToCart:', err);
                if (err instanceof UserInputError) {
                    throw err;
                }
                throw new Error(err.message);
            }
        },

        async removeFromCart(_, { productId }, context) {
            const user = checkAuth(context);

            try {
                const cart = await Cart.findOne({ user: user.id });

                if (!cart) {
                    throw new UserInputError('Cart not found');
                }

                // Удаляем товар из корзины
                cart.items = cart.items.filter(
                    item => item.product.toString() !== productId
                );

                cart.updatedAt = new Date().toISOString();
                await cart.save();

                await cart.populate('user');
                await cart.populate('items.product');

                return cart;

            } catch (err) {
                console.error('❌ Error in removeFromCart:', err);
                if (err instanceof UserInputError) {
                    throw err;
                }
                throw new Error(err.message);
            }
        },


        // Update cart item quantity - НОВОЕ!
        async updateCartItemQuantity(_, { productId, quantity }, context) {
            const user = checkAuth(context);

            try {
                if (quantity < 1) {
                    throw new UserInputError('Quantity must be at least 1');
                }

                const product = await Product.findById(productId);
                if (!product) {
                    throw new UserInputError('Product not found');
                }

                if (quantity > product.stock) {
                    throw new UserInputError(
                        `Not enough stock. Available: ${product.stock}`
                    );
                }

                const cart = await Cart.findOne({ user: user.id });

                if (!cart) {
                    throw new UserInputError('Cart not found');
                }

                // Находим товар в корзине
                const cartItem = cart.items.find(
                    item => item.product.toString() === productId
                );

                if (!cartItem) {
                    throw new UserInputError('Product not in cart');
                }

                // Обновляем количество
                cartItem.quantity = quantity;

                cart.updatedAt = new Date().toISOString();
                await cart.save();

                await cart.populate('user');
                await cart.populate('items.product');

                return cart;

            } catch (err) {
                console.error('❌ Error in updateCartItemQuantity:', err);
                if (err instanceof UserInputError) {
                    throw err;
                }
                throw new Error(err.message);
            }
        },

        // Clear cart - НОВОЕ!
        async clearCart(_, __, context) {
            const user = checkAuth(context);

            try {
                const cart = await Cart.findOne({ user: user.id });

                if (!cart) {
                    throw new UserInputError('Cart not found');
                }

                // Очищаем все товары
                cart.items = [];
                cart.updatedAt = new Date().toISOString();
                await cart.save();

                await cart.populate('user');

                return cart;

            } catch (err) {
                console.error('❌ Error in clearCart:', err);
                if (err instanceof UserInputError) {
                    throw err;
                }
                throw new Error(err.message);
            }
        }
    }
}