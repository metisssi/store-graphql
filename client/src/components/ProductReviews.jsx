// client/src/components/ProductReviews.jsx
import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useAuth } from '../context/AuthContext';
import StarRating from './StarRating';

const GET_PRODUCT_REVIEWS = gql`
  query GetProductReviews($productId: ID!, $limit: Int, $offset: Int) {
    getProductReviews(productId: $productId, limit: $limit, offset: $offset) {
      reviews {
        id
        rating
        title
        comment
        createdAt
        user {
          id
          username
        }
      }
      total
      hasMore
    }
  }
`;

const CAN_REVIEW_PRODUCT = gql`
  query CanReviewProduct($productId: ID!) {
    canReviewProduct(productId: $productId) {
      canReview
      reason
      existingReview {
        id
        rating
        title
        comment
      }
    }
  }
`;

const CREATE_REVIEW = gql`
  mutation CreateReview($productId: ID!, $reviewInput: ReviewInput!) {
    createReview(productId: $productId, reviewInput: $reviewInput) {
      id
      rating
      title
      comment
    }
  }
`;

const DELETE_REVIEW = gql`
  mutation DeleteReview($reviewId: ID!) {
    deleteReview(reviewId: $reviewId)
  }
`;

export default function ProductReviews({ productId, onReviewAdded }) {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: ''
  });

  const { data: reviewsData, loading, fetchMore, refetch } = useQuery(GET_PRODUCT_REVIEWS, {
    variables: { productId, limit: 5, offset: 0 }
  });

  const { data: canReviewData } = useQuery(CAN_REVIEW_PRODUCT, {
    variables: { productId },
    skip: !user
  });

  const [createReview, { loading: creating }] = useMutation(CREATE_REVIEW, {
    onCompleted: () => {
      setShowForm(false);
      setFormData({ rating: 5, title: '', comment: '' });
      refetch();
      if (onReviewAdded) onReviewAdded();
      alert('✅ Review submitted!');
    },
    onError: (err) => {
      alert('❌ Error: ' + err.message);
    }
  });

  const [deleteReview] = useMutation(DELETE_REVIEW, {
    onCompleted: () => {
      refetch();
      if (onReviewAdded) onReviewAdded();
      alert('✅ Review deleted!');
    },
    onError: (err) => {
      alert('❌ Error: ' + err.message);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createReview({
      variables: {
        productId,
        reviewInput: formData
      }
    });
  };

  const handleDelete = (reviewId) => {
    if (window.confirm('Delete this review?')) {
      deleteReview({ variables: { reviewId } });
    }
  };

  const loadMore = () => {
    fetchMore({
      variables: {
        offset: reviewsData.getProductReviews.reviews.length
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          getProductReviews: {
            ...fetchMoreResult.getProductReviews,
            reviews: [
              ...prev.getProductReviews.reviews,
              ...fetchMoreResult.getProductReviews.reviews
            ]
          }
        };
      }
    });
  };

  const reviews = reviewsData?.getProductReviews?.reviews || [];
  const total = reviewsData?.getProductReviews?.total || 0;
  const hasMore = reviewsData?.getProductReviews?.hasMore;
  const canReview = canReviewData?.canReviewProduct?.canReview;

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          Customer Reviews ({total})
        </h2>
        
        {user && canReview && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary"
          >
            ✍️ Write a Review
          </button>
        )}
      </div>

      {/* Review Form */}
      {showForm && (
        <div className="card bg-base-200 mb-6">
          <div className="card-body">
            <h3 className="card-title">Write Your Review</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Rating</span>
                </label>
                <StarRating
                  rating={formData.rating}
                  size="lg"
                  showNumber={false}
                  interactive
                  onRate={(rating) => setFormData({ ...formData, rating })}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Title</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input input-bordered"
                  placeholder="Summarize your review"
                  maxLength={100}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Your Review</span>
                </label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  className="textarea textarea-bordered h-32"
                  placeholder="What did you like or dislike?"
                  maxLength={1000}
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={creating}
                >
                  {creating ? 'Submitting...' : 'Submit Review'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cannot Review Message */}
      {user && !canReview && canReviewData?.canReviewProduct?.reason && (
        <div className="alert alert-info mb-6">
          <span>{canReviewData.canReviewProduct.reason}</span>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 bg-base-200 rounded-lg">
          <div className="text-4xl mb-2">📝</div>
          <p className="text-base-content/60">No reviews yet. Be the first to review!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="card bg-base-100 shadow">
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <div>
                    <StarRating rating={review.rating} size="sm" showNumber={false} />
                    <h4 className="font-bold mt-1">{review.title}</h4>
                  </div>
                  
                  {user && (user.id === review.user.id || user.role === 'admin') && (
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="btn btn-ghost btn-sm btn-circle"
                    >
                      🗑️
                    </button>
                  )}
                </div>
                
                <p className="text-base-content/80">{review.comment}</p>
                
                <div className="flex justify-between items-center text-sm text-base-content/60 mt-2">
                  <span>By {review.user.username}</span>
                  <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}

          {hasMore && (
            <button
              onClick={loadMore}
              className="btn btn-outline btn-block"
            >
              Load More Reviews
            </button>
          )}
        </div>
      )}
    </div>
  );
}