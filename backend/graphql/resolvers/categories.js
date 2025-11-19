import Category from '../../models/Category.js';
import Product from '../../models/Product.js';
import checkAuth from '../../util/check-auth.js';
import pkg from 'apollo-server';
const { UserInputError } = pkg;


export default {
    Query: {
        async getCategories(_, props, context) {
            const user = checkAuth(context)
            try {
                const categories = await Category.find().sort({ createdAt: -1 })
                return categories
            } catch (err) {
                throw new Error(err)
            }
        },


        async getCategory(_, { categoryId }, context) {

            const user = checkAuth(context)
            try {
                const category = await Category.findById(categoryId)
                if (category) {
                    return category
                } else {
                    throw new UserInputError('Category not found')
                }
            } catch (err) {
                if (err.name === 'CastError') {
                    throw new UserInputError('Invalid category ID format');
                }
                throw new Error(err);

            }
        }
    },

    Mutation: {
        async createCategory(_, { name }, context) {
            const user = checkAuth(context)

            if (name.trim() === '') {
                throw new UserInputError('Category name must not be empty');
            }

            const existingCategory = await Category.findOne({ name });

            if (existingCategory) {
                throw new UserInputError('Category already exists', {
                    errors: {
                        name: 'This category name already exists'
                    }
                });
            }

            const newCategory = new Category({
                name,
                createdAt: new Date().toISOString()
            })

            const category = await newCategory.save();
            return category;
        },

        async deleteCategory(_, { categoryId }, context) {
            const user = checkAuth(context)

            try {

                const category = await Category.findById(categoryId);

                if (!category) {
                    throw new UserInputError('Category not found');
                }


                // Проверяем есть ли товары в этой категории
                const productsInCategory = await Product.countDocuments({ category: categoryId });
                if (productsInCategory > 0) {
                    throw new UserInputError('Cannot delete category with existing products', {
                        errors: {
                            category: `This category has ${productsInCategory} products. Delete them first.`
                        }
                    });
                }

                 await category.deleteOne();
                return 'Category deleted successfully';



            } catch (err) {
                 if (err.name === 'CastError') {
                    throw new UserInputError('Invalid category ID format');
                }
                throw new Error(err);
            }
        },

        
    }
}