import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../stores/useStore';
import { ShoppingCart } from './ShoppingCart';
import './Navbar.css';

export function Navbar({ onToast }) {
	const { user, logout, cart } = useStore();
	const navigate = useNavigate();
	const [isCartOpen, setIsCartOpen] = useState(false);

	const handleLogout = () => {
		logout();
		navigate('/');
		onToast('Logged out successfully', 'success');
	};

	const getCartItemCount = () => {
		return cart.reduce((total, item) => total + item.quantity, 0);
	};

	return (
		<>
			<nav className="navbar">
				<div className="navbar-container">
					<Link to="/" className="navbar-brand">
						<span className="brand-icon">🍬</span>
						<span className="brand-text">Sweet Shop</span>
					</Link>

					<div className="navbar-links">
						<Link to="/" className="nav-link">Home</Link>

						{user ? (
							<>
								{user.isAdmin && (
									<Link to="/admin" className="nav-link admin-link">
										Admin Dashboard
									</Link>
								)}
								
								<Link to="/profile" className="nav-link">
									👤 Profile
								</Link>
								
								{!user.isAdmin && (
									<button 
										className="cart-btn" 
										onClick={() => setIsCartOpen(true)}
									>
										🛒
										{getCartItemCount() > 0 && (
											<span className="cart-badge">{getCartItemCount()}</span>
										)}
									</button>
								)}

								<div className="user-info">
									<span className="user-email">{user.email}</span>
									{user.isAdmin && <span className="admin-badge">Admin</span>}
								</div>
								<button className="logout-btn" onClick={handleLogout}>
									Logout
								</button>
							</>
						) : (
							<>
								<Link to="/login" className="nav-link">Login</Link>
								<Link to="/register" className="nav-link register-link">
									Register
								</Link>
							</>
						)}
					</div>
				</div>
			</nav>
			
			<ShoppingCart 
				isOpen={isCartOpen} 
				onClose={() => setIsCartOpen(false)}
				onToast={onToast}
			/>
		</>
	);
}
