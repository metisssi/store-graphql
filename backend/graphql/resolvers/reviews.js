// backend/graphql/resolvers/reviews.js
import Review from '../../models/Review.js';
import Product from '../../models/Product.js';
import Order from '../../models/Order.js';
import checkAuth from '../../util/check-auth.js';
import checkAdmin from '../../util/check-admin.js';
import pkg from 'apollo-server';
const { UserInputError, ForbiddenError } = pkg;

// Функция пересчёта рейтинга товара
async function recalculateProductRating(productId) {
    const reviews = await Review.find({ product: productId });
    
    if (reviews.length === 0) {
        await Product.findByIdAndUpdate(productId, {
            averageRating: 0,
            reviewCount: 0
        });
        return;
    }
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = Math.round((totalRating / reviews.length) * 10) / 10;
    
    await Product.findByIdAndUpdate(productId, {
        averageRating,
        reviewCount: reviews.length
    });
}

export default {
    Query: {
        // Получить отзывы на товар
        async getProductReviews(_, { productId, limit, offset }) {
            try {
                const reviews = await Review.find({ product: productId })
                    .populate('user')
                    .sort({ createdAt: -1 })
                    .skip(offset || 0)
                    .limit(limit || 10);
                
                const total = await Review.countDocuments({ product: productId });
                
                return {
                    reviews,
                    total,
                    hasMore: (offset || 0) + reviews.length < total
                };
            } catch (err) {
                throw new Error(err.message);
            }
        },
        
        // Получить мои отзывы
        async getMyReviews(_, __, context) {
            const user = checkAuth(context);
            
            try {
                const reviews = await Review.find({ user: user.id })
                    .populate('product')
                    .sort({ createdAt: -1 });
                
                return reviews;
            } catch (err) {
                throw new Error(err.message);
            }
        },
        
        // Проверить, может ли пользователь оставить отзыв
        async canReviewProduct(_, { productId }, context) {
            const user = checkAuth(context);
            
            try {
                // Проверяем, не оставлял ли уже отзыв
                const existingReview = await Review.findOne({
                    user: user.id,
                    product: productId
                });
                
                if (existingReview) {
                    return {
                        canReview: false,
                        reason: 'You have already reviewed this product',
                        existingReview
                    };
                }
                
                // Проверяем, покупал ли пользователь этот товар
                const hasPurchased = await Order.findOne({
                    user: user.id,
                    'items.product': productId,
                    status: { $in: ['delivered', 'shipped', 'processing'] }
                });
                
                if (!hasPurchased) {
                    return {
                        canReview: false,
                        reason: 'You must purchase this product before reviewing',
                        existingReview: null
                    };
                }
                
                return {
                    canReview: true,
                    reason: null,
                    existingReview: null
                };
            } catch (err) {
                throw new Error(err.message);
            }
        }
    },
    
    Mutation: {
        // Создать отзыв
        async createReview(_, { productId, reviewInput }, context) {
            const user = checkAuth(context);
            const { rating, title, comment } = reviewInput;
            
            try {
                // Валидация
                if (rating < 1 || rating > 5) {
                    throw new UserInputError('Rating must be between 1 and 5');
                }
                
                if (title.trim() === '' || comment.trim() === '') {
                    throw new UserInputError('Title and comment are required');
                }
                
                // Проверяем существование товара
                const product = await Product.findById(productId);
                if (!product) {
                    throw new UserInputError('Product not found');
                }
                
                // Проверяем, не оставлял ли уже отзыв
                const existingReview = await Review.findOne({
                    user: user.id,
                    product: productId
                });
                
                if (existingReview) {
                    throw new UserInputError('You have already reviewed this product');
                }
                
                // Проверяем, покупал ли товар (опционально - можно убрать)
                const hasPurchased = await Order.findOne({
                    user: user.id,
                    'items.product': productId,
                    status: { $in: ['delivered', 'shipped', 'processing'] }
                });
                
                if (!hasPurchased) {
                    throw new ForbiddenError('You must purchase this product before reviewing');
                }
                
                // Создаём отзыв
                const newReview = new Review({
                    user: user.id,
                    product: productId,
                    rating,
                    title: title.trim(),
                    comment: comment.trim()
                });
                
                const review = await newReview.save();
                await review.populate('user');
                await review.populate('product');
                
                // Пересчитываем рейтинг товара
                await recalculateProductRating(productId);
                
                return review;
            } catch (err) {
                if (err instanceof UserInputError || err instanceof ForbiddenError) {
                    throw err;
                }
                throw new Error(err.message);
            }
        },
        
        // Обновить отзыв
        async updateReview(_, { reviewId, reviewInput }, context) {
            const user = checkAuth(context);
            const { rating, title, comment } = reviewInput;
            
            try {
                const review = await Review.findById(reviewId);
                
                if (!review) {
                    throw new UserInputError('Review not found');
                }
                
                // Проверяем владельца
                if (review.user.toString() !== user.id) {
                    throw new ForbiddenError('You can only edit your own reviews');
                }
                
                // Валидация
                if (rating && (rating < 1 || rating > 5)) {
                    throw new UserInputError('Rating must be between 1 and 5');
                }
                
                // Обновляем
                if (rating) review.rating = rating;
                if (title) review.title = title.trim();
                if (comment) review.comment = comment.trim();
                review.updatedAt = new Date().toISOString();
                
                await review.save();
                await review.populate('user');
                await review.populate('product');
                
                // Пересчитываем рейтинг
                await recalculateProductRating(review.product._id);
                
                return review;
            } catch (err) {
                if (err instanceof UserInputError || err instanceof ForbiddenError) {
                    throw err;
                }
                throw new Error(err.message);
            }
        },
        
        // Удалить отзыв
        async deleteReview(_, { reviewId }, context) {
            const user = checkAuth(context);
            
            try {
                const review = await Review.findById(reviewId);
                
                if (!review) {
                    throw new UserInputError('Review not found');
                }
                
                // Владелец или админ может удалить
                if (review.user.toString() !== user.id && user.role !== 'admin') {
                    throw new ForbiddenError('Not authorized to delete this review');
                }
                
                const productId = review.product;
                await review.deleteOne();
                
                // Пересчитываем рейтинг
                await recalculateProductRating(productId);
                
                return 'Review deleted successfully';
            } catch (err) {
                if (err instanceof UserInputError || err instanceof ForbiddenError) {
                    throw err;
                }
                throw new Error(err.message);
            }
        }
    }
};