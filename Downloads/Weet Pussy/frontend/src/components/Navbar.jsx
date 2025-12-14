import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../stores/useStore';
import './Navbar.css';

export function Navbar() {
	const { user, logout } = useStore();
	const navigate = useNavigate();

	const handleLogout = () => {
		logout();
		navigate('/');
	};

	return (
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
	);
}
