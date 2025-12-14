import { useState, useEffect } from 'react';
import { useStore } from '../stores/useStore';
import { userApi } from '../services/api';
import './UserProfile.css';

export function UserProfile({ onToast }) {
	const { user, setUser } = useStore();
	const [isEditing, setIsEditing] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [orderHistory, setOrderHistory] = useState([]);
	const [profileData, setProfileData] = useState({
		email: user?.email || '',
		firstName: user?.firstName || '',
		lastName: user?.lastName || '',
		phone: user?.phone || '',
		address: user?.address || ''
	});

	useEffect(() => {
		if (user) {
			fetchOrderHistory();
		}
	}, [user]);

	const fetchOrderHistory = async () => {
		try {
			const orders = await userApi.getOrderHistory();
			setOrderHistory(orders);
		} catch (err) {
			console.error('Error fetching order history:', err);
		}
	};

	const handleUpdateProfile = async (e) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const updatedUser = await userApi.updateProfile(profileData);
			setUser(updatedUser);
			setIsEditing(false);
			onToast('Profile updated successfully!', 'success');
		} catch (err) {
			onToast(err.response?.data?.detail || 'Failed to update profile', 'error');
		} finally {
			setIsLoading(false);
		}
	};

	const handleChangePassword = async () => {
		// TODO: Implement password change modal
		onToast('Password change feature coming soon!', 'info');
	};

	if (!user) {
		return (
			<div className="user-profile">
				<div className="profile-header">
					<h1>Please log in to view your profile</h1>
				</div>
			</div>
		);
	}

	return (
		<div className="user-profile">
			<div className="profile-header">
				<h1>👤 My Profile</h1>
				<p>Manage your account settings and view your order history</p>
			</div>

			<div className="profile-content">
				{/* Profile Information */}
				<div className="profile-section">
					<div className="section-header">
						<h2>Profile Information</h2>
						<button 
							className="edit-btn"
							onClick={() => setIsEditing(!isEditing)}
						>
							{isEditing ? 'Cancel' : 'Edit'}
						</button>
					</div>

					{isEditing ? (
						<form onSubmit={handleUpdateProfile} className="profile-form">
							<div className="form-row">
								<div className="form-group">
									<label>First Name</label>
									<input
										type="text"
										value={profileData.firstName}
										onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
										placeholder="Enter first name"
									/>
								</div>
								<div className="form-group">
									<label>Last Name</label>
									<input
										type="text"
										value={profileData.lastName}
										onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
										placeholder="Enter last name"
									/>
								</div>
							</div>

							<div className="form-group">
								<label>Email</label>
								<input
									type="email"
									value={profileData.email}
									onChange={(e) => setProfileData({...profileData, email: e.target.value})}
									required
								/>
							</div>

							<div className="form-group">
								<label>Phone</label>
								<input
									type="tel"
									value={profileData.phone}
									onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
									placeholder="Enter phone number"
								/>
							</div>

							<div className="form-group">
								<label>Address</label>
								<textarea
									value={profileData.address}
									onChange={(e) => setProfileData({...profileData, address: e.target.value})}
									placeholder="Enter your address"
									rows="3"
								/>
							</div>

							<div className="form-actions">
								<button type="submit" className="save-btn" disabled={isLoading}>
									{isLoading ? 'Saving...' : 'Save Changes'}
								</button>
							</div>
						</form>
					) : (
						<div className="profile-info">
							<div className="info-item">
								<label>Name:</label>
								<span>{profileData.firstName} {profileData.lastName || 'Not set'}</span>
							</div>
							<div className="info-item">
								<label>Email:</label>
								<span>{user.email}</span>
							</div>
							<div className="info-item">
								<label>Phone:</label>
								<span>{profileData.phone || 'Not set'}</span>
							</div>
							<div className="info-item">
								<label>Address:</label>
								<span>{profileData.address || 'Not set'}</span>
							</div>
							<div className="info-item">
								<label>Account Type:</label>
								<span className={`role-badge ${user.isAdmin ? 'admin' : 'user'}`}>
									{user.isAdmin ? '🛡️ Admin' : '👤 Customer'}
								</span>
							</div>
						</div>
					)}
				</div>

				{/* Order History */}
				<div className="profile-section">
					<h2>📦 Order History</h2>
					{orderHistory.length === 0 ? (
						<div className="empty-orders">
							<span className="empty-icon">📦</span>
							<p>No orders yet</p>
							<p className="empty-hint">Start shopping to see your order history!</p>
						</div>
					) : (
						<div className="orders-list">
							{orderHistory.map((order) => (
								<div key={order.id} className="order-item">
									<div className="order-header">
										<span className="order-id">Order #{order.id}</span>
										<span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
									</div>
									<div className="order-details">
										<span className="order-total">₹{order.total.toFixed(2)}</span>
										<span className={`order-status ${order.status}`}>{order.status}</span>
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Account Actions */}
				<div className="profile-section">
					<h2>⚙️ Account Settings</h2>
					<div className="account-actions">
						<button className="action-btn" onClick={handleChangePassword}>
							🔒 Change Password
						</button>
						<button className="action-btn danger">
							🗑️ Delete Account
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}