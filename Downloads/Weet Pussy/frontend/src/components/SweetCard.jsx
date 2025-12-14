import { useState } from 'react';
import { useStore } from '../stores/useStore';
import { sweetsApi } from '../services/api';
import './SweetCard.css';

export function SweetCard({ sweet }) {
	const { user, updateSweet } = useStore();
	const [isLoading, setIsLoading] = useState(false);
	const [message, setMessage] = useState(null);

	const isOutOfStock = sweet.quantity === 0;

	const getCategoryEmoji = (category) => {
		switch (category) {
			case 'Chocolate': return '🍫';
			case 'Candy': return '🍬';
			case 'Pastry': return '🥐';
			default: return '🍭';
		}
	};

	const getDefaultImage = (category) => {
		switch (category) {
			case 'Chocolate':
				return 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&h=300&fit=crop';
			case 'Candy':
				return 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=400&h=300&fit=crop';
			case 'Pastry':
				return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop';
			default:
				return 'https://images.unsplash.com/photo-1563262924-641a8b3d397f?w=400&h=300&fit=crop';
		}
	};

	const handlePurchase = async () => {
		if (!user) {
			setMessage({ type: 'error', text: 'Please login to purchase' });
			setTimeout(() => setMessage(null), 3000);
			return;
		}

		if (isOutOfStock || isLoading) return;

		setIsLoading(true);
		setMessage(null);

		try {
			const result = await sweetsApi.purchase(sweet.id, 1);
			updateSweet(sweet.id, { quantity: result.sweet.quantity });
			setMessage({ type: 'success', text: '✓ Purchased!' });
		} catch (err) {
			const errorMsg = err.response?.data?.detail || 'Purchase failed';
			setMessage({ type: 'error', text: errorMsg });
		} finally {
			setIsLoading(false);
			setTimeout(() => setMessage(null), 3000);
		}
	};

	return (
		<div className={`sweet-card ${isOutOfStock ? 'out-of-stock' : ''}`}>
			{/* Image Section */}
			<div className="sweet-image-container">
				<img
					src={sweet.image_url || getDefaultImage(sweet.category)}
					alt={sweet.name}
					className="sweet-image"
					onError={(e) => {
						e.target.src = getDefaultImage(sweet.category);
					}}
				/>
				<div className="sweet-category-badge">
					<span>{getCategoryEmoji(sweet.category)}</span>
					<span>{sweet.category}</span>
				</div>
				{isOutOfStock && (
					<div className="sold-out-overlay">
						<span>SOLD OUT</span>
					</div>
				)}
			</div>

			{/* Content Section */}
			<div className="sweet-content">
				<h3 className="sweet-name">{sweet.name}</h3>

				<div className="sweet-details">
					<span className="sweet-price">₹{sweet.price.toFixed(2)}</span>
					<span className={`sweet-quantity ${isOutOfStock ? 'zero' : ''}`}>
						{isOutOfStock ? 'Out of Stock' : `${sweet.quantity} left`}
					</span>
				</div>

				{message && (
					<div className={`message ${message.type}`}>
						{message.text}
					</div>
				)}

				<button
					className={`purchase-btn ${isOutOfStock ? 'disabled' : ''}`}
					onClick={handlePurchase}
					disabled={isOutOfStock || isLoading || !user}
				>
					{isLoading ? (
						<span className="btn-spinner">⟳</span>
					) : isOutOfStock ? (
						'Sold Out'
					) : !user ? (
						'Login to Buy'
					) : (
						<>
							<span className="btn-icon">🛒</span>
							Buy Now
						</>
					)}
				</button>
			</div>
		</div>
	);
}
