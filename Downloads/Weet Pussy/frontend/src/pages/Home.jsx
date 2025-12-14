import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../stores/useStore';
import { sweetsApi } from '../services/api';
import { SweetCard } from '../components/SweetCard';
import { ImageUpload } from '../components/ImageUpload';
import { SearchFilter } from '../components/SearchFilter';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import './Home.css';

export function Home({ onToast }) {
	const { user, sweets, setSweets, addSweet, isLoading, setLoading, error, setError } = useStore();
	const [showAddForm, setShowAddForm] = useState(false);
	const [formData, setFormData] = useState({
		name: '',
		category: 'Chocolate',
		price: '',
		quantity: '',
		image_url: '',
	});
	const [formMessage, setFormMessage] = useState(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [filters, setFilters] = useState({
		category: 'all',
		sortBy: 'name',
		sortOrder: 'asc'
	});

	useEffect(() => {
		const fetchSweets = async () => {
			setLoading(true);
			setError(null);

			try {
				const data = await sweetsApi.getAll();
				setSweets(data);
			} catch (err) {
				setError('Failed to load sweets. Please try again.');
				console.error('Error fetching sweets:', err);
			} finally {
				setLoading(false);
			}
		};

		fetchSweets();
	}, [setSweets, setLoading, setError]);

	// Filter and sort sweets
	const filteredSweets = useMemo(() => {
		let filtered = sweets.filter(sweet => 
			sweet.name.toLowerCase().includes(searchTerm.toLowerCase())
		);

		if (filters.category !== 'all') {
			filtered = filtered.filter(sweet => sweet.category === filters.category);
		}

		filtered.sort((a, b) => {
			let aValue = a[filters.sortBy];
			let bValue = b[filters.sortBy];

			if (filters.sortBy === 'name') {
				aValue = aValue.toLowerCase();
				bValue = bValue.toLowerCase();
			}

			if (filters.sortOrder === 'asc') {
				return aValue > bValue ? 1 : -1;
			} else {
				return aValue < bValue ? 1 : -1;
			}
		});

		return filtered;
	}, [sweets, searchTerm, filters]);

	const categories = [...new Set(sweets.map(sweet => sweet.category))];

	const handleAddSweet = async (e) => {
		e.preventDefault();
		setFormMessage(null);

		// Check if we have a token
		const token = localStorage.getItem('token');
		if (!token) {
			setFormMessage({ type: 'error', text: 'Session expired. Please log in again.' });
			return;
		}

		try {
			const sweet = await sweetsApi.create({
				name: formData.name,
				category: formData.category,
				price: parseFloat(formData.price),
				quantity: parseInt(formData.quantity),
				image_url: formData.image_url || null,
			});
			addSweet(sweet);
			// Reset form data completely
			setFormData({ name: '', category: 'Chocolate', price: '', quantity: '', image_url: '' });
			setFormMessage({ type: 'success', text: 'Sweet added successfully!' });
			onToast('Sweet added successfully!', 'success');
			setTimeout(() => {
				setShowAddForm(false);
				setFormMessage(null);
			}, 1500);
		} catch (err) {
			console.error('Add sweet error:', err);
			const status = err.response?.status;
			if (status === 401 || status === 403) {
				setFormMessage({
					type: 'error',
					text: status === 403 ? 'Admin privileges required.' : 'Session expired. Please log in again.'
				});
			} else {
				const errorMsg = err.response?.data?.detail || 'Failed to add sweet';
				setFormMessage({ type: 'error', text: errorMsg });
				onToast(errorMsg, 'error');
			}
		}
	};



	return (
		<div className="home">
			{/* Welcome Banner for Logged-in Users */}
			{user && (
				<div className="welcome-banner">
					<div className="welcome-content">
						<span className="welcome-icon">👋</span>
						<div className="welcome-text">
							<h3>Welcome back, <span className="user-name">{user.email.split('@')[0]}</span>!</h3>
							<p>
								{user.isAdmin
									? "You're logged in as an administrator. You can manage sweets below."
									: "Browse our delicious sweets and make a purchase!"}
							</p>
						</div>
						{user.isAdmin && (
							<span className="role-badge admin">🛡️ Admin</span>
						)}
						{!user.isAdmin && (
							<span className="role-badge user">🛒 Customer</span>
						)}
					</div>
				</div>
			)}

			<section className="hero">
				<div className="hero-content">
					<h1 className="hero-title">
						Welcome to the <span className="highlight">Sweet Shop</span>
					</h1>
					<p className="hero-subtitle">
						Discover our delicious collection of handcrafted chocolates, candies, and pastries
					</p>
				</div>
				<div className="hero-decoration">
					<span className="floating-emoji" style={{ animationDelay: '0s' }}>🍫</span>
					<span className="floating-emoji" style={{ animationDelay: '0.5s' }}>🍬</span>
					<span className="floating-emoji" style={{ animationDelay: '1s' }}>🥐</span>
					<span className="floating-emoji" style={{ animationDelay: '1.5s' }}>🍭</span>
				</div>
			</section>

			<section className="sweets-section">
				<div className="section-header">
					<h2 className="section-title">Our Sweets</h2>
					{user?.isAdmin && (
						<button
							className="add-sweet-btn"
							onClick={() => setShowAddForm(!showAddForm)}
						>
							{showAddForm ? '✕ Cancel' : '+ Add Sweet'}
						</button>
					)}
				</div>

				{/* Search and Filter */}
				{sweets.length > 0 && (
					<SearchFilter
						onSearch={setSearchTerm}
						onFilter={setFilters}
						categories={categories}
					/>
				)}

				{/* Quick Add Form for Admins */}
				{showAddForm && user?.isAdmin && (
					<div className="quick-add-form">
						<h3>🍬 Add New Sweet</h3>
						{formMessage && (
							<div className={`form-message ${formMessage.type}`}>
								{formMessage.text}
							</div>
						)}
						<form onSubmit={handleAddSweet}>
							<div className="form-row">
								<input
									type="text"
									placeholder="Sweet name"
									value={formData.name}
									onChange={(e) => setFormData({ ...formData, name: e.target.value })}
									required
								/>
								<select
									value={formData.category}
									onChange={(e) => setFormData({ ...formData, category: e.target.value })}
								>
									<option value="Chocolate">🍫 Chocolate</option>
									<option value="Candy">🍬 Candy</option>
									<option value="Pastry">🥐 Pastry</option>
								</select>
							</div>
							<div className="form-row">
								<input
									type="number"
									step="0.01"
									min="0"
									placeholder="Price (₹)"
									value={formData.price}
									onChange={(e) => setFormData({ ...formData, price: e.target.value })}
									required
								/>
								<input
									type="number"
									min="0"
									placeholder="Quantity"
									value={formData.quantity}
									onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
									required
								/>
							</div>
							<div className="form-section">
								<label className="form-label">Sweet Image</label>
								<ImageUpload
									key={`${formData.name}-${formData.category}`}
									onImageUploaded={(url) => setFormData({ ...formData, image_url: url })}
									currentImageUrl={formData.image_url}
								/>
							</div>
							<button type="submit" className="submit-btn">Add Sweet</button>
						</form>
					</div>
				)}

				{isLoading && <LoadingSkeleton type="card" count={6} />}

				{error && (
					<div className="error-message">
						<p>{error}</p>
						<button onClick={() => window.location.reload()}>Try Again</button>
					</div>
				)}

				{!isLoading && !error && filteredSweets.length === 0 && sweets.length > 0 && (
					<div className="empty-state">
						<span className="empty-icon">🔍</span>
						<p>No sweets match your search criteria</p>
						<p className="empty-hint">Try adjusting your filters or search term</p>
					</div>
				)}

				{!isLoading && !error && sweets.length === 0 && (
					<div className="empty-state">
						<span className="empty-icon">🍬</span>
						<p>No sweets available at the moment</p>
						{user?.isAdmin && (
							<p className="empty-hint">Click "Add Sweet" above to add your first sweet!</p>
						)}
						{!user && (
							<p className="empty-hint">
								<Link to="/login">Login</Link> to start shopping when sweets are available!
							</p>
						)}
					</div>
				)}

				<div className="sweets-grid">
					{filteredSweets.map((sweet) => (
						<SweetCard key={sweet.id} sweet={sweet} onToast={onToast} />
					))}
				</div>
			</section>

			{/* Info for non-logged-in users */}
			{!user && (
				<section className="cta-section">
					<div className="cta-content">
						<h2>Ready to satisfy your sweet tooth?</h2>
						<p>Create an account to start purchasing our delicious treats!</p>
						<div className="cta-buttons">
							<Link to="/register" className="cta-btn primary">Create Account</Link>
							<Link to="/login" className="cta-btn secondary">Sign In</Link>
						</div>
					</div>
				</section>
			)}
		</div>
	);
}
