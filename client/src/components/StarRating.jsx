// client/src/components/StarRating.jsx
export default function StarRating({ rating, size = 'md', showNumber = true, interactive = false, onRate }) {
  const sizes = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-3xl'
  };

  const handleClick = (star) => {
    if (interactive && onRate) {
      onRate(star);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`${sizes[size]} ${interactive ? 'cursor-pointer hover:scale-110 transition' : ''}`}
            onClick={() => handleClick(star)}
          >
            {star <= rating ? '⭐' : '☆'}
          </span>
        ))}
      </div>
      {showNumber && (
        <span className="text-base-content/60 ml-1">
          ({rating.toFixed(1)})
        </span>
      )}
    </div>
  );
}