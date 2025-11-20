import Product from '../../models/Product.js';
import Category from '../../models/Category.js';
import checkAuth from '../../util/check-auth.js';
import checkAdmin from '../../util/check-admin.js';
import pkg from 'apollo-server';
const { UserInputError } = pkg;

export default {
    Query: {
        async getProducts() {
            try {
                const products = await Product.find()
                    .populate('category').
                    sort({ createdAt: -1 });

                return products;

            } catch (err) {
                throw new Error(err);
            }
        },

        async getProduct(_, { productId }) {
            try {
                const product = await Product.findById(productId).populate('category');

                if (product) {
                    return product;
                } else {
                    throw new UserInputError('Product not found');
                }
            } catch (err) {
                if (err.name === 'CastError') {
                    throw new UserInputError('Invalid product ID format');
                }
                throw new Error(err);
            }
        },

        async getProductsByCategory(_, { categoryId }) {
            try {
                const products = await Product.find({ category: categoryId })
                    .populate('category')
                    .sort({ createdAt: -1 });
                return products;
            } catch (err) {
                if (err.name === 'CastError') {
                    throw new UserInputError('Invalid category ID format');
                }
                throw new Error(err);
            }
        }
    },


    Mutation: {
        // Создать товар (требует авторизации)
        async createProduct(_, { productId, productInput }, context) {
            const user = checkAdmin(context);

            const { name, description, price, categoryId, stock, image } = productInput;

            // Валидация
            if (name.trim() === '' || description.trim() === '') {
                throw new UserInputError('Name and description must not be empty');
            }


            if (price <= 0) {
                throw new UserInputError('Price must be greater than 0');
            }

            if (stock < 0) {
                throw new UserInputError('Stock cannot be negative');
            }

            // Проверяем существует ли категория
            const category = await Category.findById(categoryId);
            if (!category) {
                throw new UserInputError('Category not found');
            }

            const newProduct = new Product({
                name,
                description,
                price,
                category: categoryId,
                stock,
                image: image || 'https://via.placeholder.com/300',
                createdAt: new Date().toISOString()
            });

            const product = await newProduct.save();

            // Populate category перед возвратом
            await product.populate('category');

            // Отправляем уведомление через subscription
            context.pubsub.publish('NEW_PRODUCT', {
                newProduct: product
            });

            return product;
        },

        async updateProduct(_, { productId, productInput }, context) {
            // Проверяем авторизацию
            const user = checkAdmin(context);

            const { name, description, price, categoryId, stock, image } = productInput;

            try {
                const product = await Product.findById(productId);

                if (!product) {
                    throw new UserInputError('Product not found');
                }

                // Валидация обновляемых полей
                if (price !== undefined && price <= 0) {
                    throw new UserInputError('Price must be greater than 0');
                }

                if (stock !== undefined && stock < 0) {
                    throw new UserInputError('Stock cannot be negative');
                }

                if (name !== undefined && name.trim() === '') {
                    throw new UserInputError('Name cannot be empty');
                }

                if (description !== undefined && description.trim() === '') {
                    throw new UserInputError('Description cannot be empty');
                }

                // Если меняется категория - проверяем что она существует
                if (categoryId !== undefined) {
                    const category = await Category.findById(categoryId);
                    if (!category) {
                        throw new UserInputError('Category not found');
                    }
                    product.category = categoryId;
                }

                // Обновляем только переданные поля
                if (name !== undefined) product.name = name;
                if (description !== undefined) product.description = description;
                if (price !== undefined) product.price = price;
                if (stock !== undefined) product.stock = stock;
                if (image !== undefined) product.image = image;

                // Сохраняем изменения
                await product.save();

                // Загружаем полную информацию о категории
                await product.populate('category');

                return product;
            } catch (err) {
                if (err.name === 'CastError') {
                    throw new UserInputError('Invalid product ID format');
                }
                throw new Error(err)
            }
        },

        async deleteProduct(_, { productId }, context) {
            const user = checkAdmin(context)

            try {
                const product = await Product.findById(productId)

                if (!product) {
                    throw new UserInputError('Product not found');
                }

                await product.deleteOne()

                await product.deleteOne();

                return 'Product deleted successfully';
            } catch (err) {
                // Обработка ошибок MongoDB
                if (err.name === 'CastError') {
                    throw new UserInputError('Invalid product ID format');
                }
                throw new Error(err);
            }
        },

     
    },


    Subscription: {
        newProduct: {
            subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('NEW_PRODUCT')
        }
    }
}