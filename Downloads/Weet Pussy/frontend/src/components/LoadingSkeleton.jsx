import './LoadingSkeleton.css';

export function LoadingSkeleton({ type = 'card', count = 6 }) {
  if (type === 'card') {
    return (
      <div className="skeleton-grid">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="skeleton-card">
            <div className="skeleton-image"></div>
            <div className="skeleton-content">
              <div className="skeleton-line skeleton-title"></div>
              <div className="skeleton-line skeleton-subtitle"></div>
              <div className="skeleton-details">
                <div className="skeleton-line skeleton-price"></div>
                <div className="skeleton-line skeleton-quantity"></div>
              </div>
              <div className="skeleton-button"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="skeleton-table">
        <div className="skeleton-table-header">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="skeleton-line skeleton-header-cell"></div>
          ))}
        </div>
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="skeleton-table-row">
            {Array.from({ length: 5 }).map((_, cellIndex) => (
              <div key={cellIndex} className="skeleton-line skeleton-cell"></div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="skeleton-list">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="skeleton-line"></div>
      ))}
    </div>
  );
}