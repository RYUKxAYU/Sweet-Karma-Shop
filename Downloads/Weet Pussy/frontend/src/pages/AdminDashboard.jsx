import { useState, useEffect } from 'react';
import { useStore } from '../stores/useStore';
import { sweetsApi } from '../services/api';
import './AdminDashboard.css';

export function AdminDashboard() {
	const { sweets, setSweets, addSweet, updateSweet, removeSweet } = useStore();
	const [isLoading, setIsLoading] = useState(false);
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
	}, []);

	const fetchSweets = async () => {
		try {
			const data = await sweetsApi.getAll();
			setSweets(data);
		} catch (err) {
			console.error('Error fetching sweets:', err);
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

		const sweetData = {
			name: formData.name,
			category: formData.category,
			price: parseFloat(formData.price),
			quantity: parseInt(formData.quantity),
		};

		try {
			if (isEditing && editId) {
				const updated = await sweetsApi.update(editId, sweetData);
				updateSweet(editId, updated);
				setMessage({ type: 'success', text: 'Sweet updated successfully!' });
			} else {
				const created = await sweetsApi.create(sweetData);
				addSweet(created);
				setMessage({ type: 'success', text: 'Sweet created successfully!' });
			}
			resetForm();
		} catch (err) {
			setMessage({
				type: 'error',
				text: err.response?.data?.detail || 'Operation failed'
			});
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
		} catch (err) {
			setMessage({ type: 'error', text: 'Failed to delete sweet' });
		}
	};

	return (
		<div className="admin-dashboard">
			<div className="admin-header">
				<h1>🛠️ Admin Dashboard</h1>
				<p>Manage your sweet shop inventory</p>
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
					</div>
				</div>
			</div>
		</div>
	);
}
