import { useState, useEffect } from 'react';
import { useStore } from '../stores/useStore';
import { sweetsApi } from '../services/api';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import './AdminDashboard.css';

export function AdminDashboard({ onToast }) {
	const { user, sweets, setSweets, addSweet, updateSweet, removeSweet } = useStore();
	const [isLoading, setIsLoading] = useState(false);
	const [isTableLoading, setIsTableLoading] = useState(true);
	const [message, setMessage] = useState(null);

	// Form state
	const [isEditing, setIsEditing] = useState(false);
	const [editId, setEditId] = useState(null);
	const [formData, setFormData] = useState({
		name: '',
		category: 'Chocolate',
		price: '',
		quantity: '',
	});

	useEffect(() => {
		fetchSweets();
		
		// Debug: Check user authentication
		console.log('Admin Dashboard - User:', user);
		console.log('Admin Dashboard - Token:', localStorage.getItem('token'));
	}, [user]);

	const fetchSweets = async () => {
		setIsTableLoading(true);
		try {
			const data = await sweetsApi.getAll();
			setSweets(data);
		} catch (err) {
			console.error('Error fetching sweets:', err);
			onToast('Failed to load sweets', 'error');
		} finally {
			setIsTableLoading(false);
		}
	};

	const resetForm = () => {
		setFormData({ name: '', category: 'Chocolate', price: '', quantity: '' });
		setIsEditing(false);
		setEditId(null);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		setMessage(null);

		// Check if we have a token
		const token = localStorage.getItem('token');
		if (!token) {
			setMessage({ type: 'error', text: 'Session expired. Please log in again.' });
			onToast('Session expired. Please log in again.', 'error');
			setIsLoading(false);
			return;
		}

		const sweetData = {
			name: formData.name,
			category: formData.category,
			price: parseFloat(formData.price),
			quantity: parseInt(formData.quantity),
		};

		console.log('Submitting sweet data:', sweetData);
		console.log('Token exists:', !!token);

		try {
			if (isEditing && editId) {
				const updated = await sweetsApi.update(editId, sweetData);
				updateSweet(editId, updated);
				setMessage({ type: 'success', text: 'Sweet updated successfully!' });
				onToast('Sweet updated successfully!', 'success');
			} else {
				const created = await sweetsApi.create(sweetData);
				addSweet(created);
				setMessage({ type: 'success', text: 'Sweet created successfully!' });
				onToast('Sweet created successfully!', 'success');
			}
			resetForm();
		} catch (err) {
			console.error('Submit error:', err);
			const status = err.response?.status;
			if (status === 401 || status === 403) {
				setMessage({
					type: 'error',
					text: status === 403 ? 'Admin privileges required.' : 'Session expired. Please log in again.'
				});
			} else {
				const errorMsg = err.response?.data?.detail || 'Operation failed';
				setMessage({ type: 'error', text: errorMsg });
			}
			onToast(err.response?.data?.detail || 'Operation failed', 'error');
		} finally {
			setIsLoading(false);
		}
	};

	const handleEdit = (sweet) => {
		setFormData({
			name: sweet.name,
			category: sweet.category,
			price: sweet.price.toString(),
			quantity: sweet.quantity.toString(),
		});
		setIsEditing(true);
		setEditId(sweet.id);
	};

	const handleDelete = async (id) => {
		if (!window.confirm('Are you sure you want to delete this sweet?')) return;

		try {
			await sweetsApi.delete(id);
			removeSweet(id);
			setMessage({ type: 'success', text: 'Sweet deleted successfully!' });
			onToast('Sweet deleted successfully!', 'success');
		} catch (err) {
			const errorMsg = 'Failed to delete sweet';
			setMessage({ type: 'error', text: errorMsg });
			onToast(errorMsg, 'error');
		}
	};

	// Debug: Show authentication status
	if (!user) {
		return (
			<div className="admin-dashboard">
				<div className="admin-header">
					<h1>⚠️ Authentication Required</h1>
					<p>Please log in to access the admin dashboard</p>
				</div>
			</div>
		);
	}

	if (!user.isAdmin) {
		return (
			<div className="admin-dashboard">
				<div className="admin-header">
					<h1>🚫 Access Denied</h1>
					<p>Admin privileges required</p>
				</div>
			</div>
		);
	}

	return (
		<div className="admin-dashboard">
			<div className="admin-header">
				<h1>🛠️ Admin Dashboard</h1>
				<p>Manage your sweet shop inventory</p>
				{/* Debug info */}
				<div style={{ fontSize: '0.8rem', color: '#666', marginTop: '10px' }}>
					Logged in as: {user.email} | Admin: {user.isAdmin ? 'Yes' : 'No'} | Token: {localStorage.getItem('token') ? 'Present' : 'Missing'}
				</div>
			</div>

			<div className="admin-content">
				{/* Form Section */}
				<div className="admin-form-section">
					<h2>{isEditing ? 'Edit Sweet' : 'Add New Sweet'}</h2>

					{message && (
						<div className={`admin-message ${message.type}`}>
							{message.text}
						</div>
					)}

					<form onSubmit={handleSubmit} className="admin-form">
						<div className="form-group">
							<label>Name</label>
							<input
								type="text"
								value={formData.name}
								onChange={(e) => setFormData({ ...formData, name: e.target.value })}
								placeholder="Sweet name"
								required
							/>
						</div>

						<div className="form-group">
							<label>Category</label>
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
							<div className="form-group">
								<label>Price (₹)</label>
								<input
									type="number"
									step="0.01"
									min="0"
									value={formData.price}
									onChange={(e) => setFormData({ ...formData, price: e.target.value })}
									placeholder="0.00"
									required
								/>
							</div>

							<div className="form-group">
								<label>Quantity</label>
								<input
									type="number"
									min="0"
									value={formData.quantity}
									onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
									placeholder="0"
									required
								/>
							</div>
						</div>

						<div className="form-actions">
							<button type="submit" className="btn-primary" disabled={isLoading}>
								{isLoading ? '⟳' : isEditing ? 'Update Sweet' : 'Add Sweet'}
							</button>
							{isEditing && (
								<button type="button" className="btn-secondary" onClick={resetForm}>
									Cancel
								</button>
							)}
						</div>
					</form>
				</div>

				{/* Table Section */}
				<div className="admin-table-section">
					<h2>Inventory</h2>

					<div className="table-container">
						{isTableLoading ? (
							<LoadingSkeleton type="table" count={5} />
						) : (
							<table className="admin-table">
								<thead>
									<tr>
										<th>Name</th>
										<th>Category</th>
										<th>Price</th>
										<th>Quantity</th>
										<th>Actions</th>
									</tr>
								</thead>
								<tbody>
									{sweets.map((sweet) => (
										<tr key={sweet.id}>
											<td>{sweet.name}</td>
											<td>
												<span className="category-badge">{sweet.category}</span>
											</td>
											<td>₹{sweet.price.toFixed(2)}</td>
											<td>
												<span className={sweet.quantity === 0 ? 'out-of-stock' : ''}>
													{sweet.quantity}
												</span>
											</td>
											<td>
												<div className="table-actions">
													<button
														className="btn-edit"
														onClick={() => handleEdit(sweet)}
													>
														✏️
													</button>
													<button
														className="btn-delete"
														onClick={() => handleDelete(sweet.id)}
													>
														🗑️
													</button>
												</div>
											</td>
										</tr>
									))}
									{sweets.length === 0 && (
										<tr>
											<td colSpan="5" className="empty-row">
												No sweets in inventory
											</td>
										</tr>
									)}
								</tbody>
							</table>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
