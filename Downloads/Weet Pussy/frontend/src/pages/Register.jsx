import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../stores/useStore';
import { authApi } from '../services/api';
import './Auth.css';

export function Register({ onToast }) {
	const [formData, setFormData] = useState({
		email: '',
		password: '',
		confirmPassword: ''
	});
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const { login, user } = useStore();
	const navigate = useNavigate();

	// Redirect if already logged in
	useEffect(() => {
		if (user) {
			navigate('/');
		}
	}, [user, navigate]);

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value
		});
	};

	const validateForm = () => {
		if (formData.password !== formData.confirmPassword) {
			setError('Passwords do not match');
			return false;
		}
		if (formData.password.length < 6) {
			setError('Password must be at least 6 characters long');
			return false;
		}
		return true;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');

		if (!validateForm()) {
			return;
		}

		setIsLoading(true);

		try {
			const response = await authApi.register(formData.email, formData.password);
			
			const userData = {
				id: response.user.id,
				email: response.user.email,
				isAdmin: response.user.is_admin,
				has2fa: response.user.has_2fa,
			};

			login(userData, response.access_token);
			onToast(`Welcome to Sweet Shop, ${userData.email}!`, 'success');
			navigate('/');
		} catch (err) {
			console.error('Registration error:', err);
			
			// Import error handler dynamically to avoid circular imports
			const { getErrorMessage } = await import('../utils/errorHandler');
			setError(getErrorMessage(err));
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="auth-page">
			<div className="auth-container">
				<div className="auth-header">
					<span className="auth-icon">🍬</span>
					<h1>Join Sweet Shop</h1>
					<p>Create your account to start shopping</p>
				</div>

				<form onSubmit={handleSubmit} className="auth-form">
					{error && <div className="auth-error">{error}</div>}

					<div className="form-group">
						<label htmlFor="email">Email</label>
						<input
							type="email"
							id="email"
							name="email"
							value={formData.email}
							onChange={handleChange}
							placeholder="Enter your email"
							required
							disabled={isLoading}
						/>
					</div>

					<div className="form-group">
						<label htmlFor="password">Password</label>
						<input
							type="password"
							id="password"
							name="password"
							value={formData.password}
							onChange={handleChange}
							placeholder="Create a password"
							required
							disabled={isLoading}
							minLength={6}
						/>
					</div>

					<div className="form-group">
						<label htmlFor="confirmPassword">Confirm Password</label>
						<input
							type="password"
							id="confirmPassword"
							name="confirmPassword"
							value={formData.confirmPassword}
							onChange={handleChange}
							placeholder="Confirm your password"
							required
							disabled={isLoading}
							minLength={6}
						/>
					</div>

					<button type="submit" className="auth-btn" disabled={isLoading}>
						{isLoading ? (
							<>
								<span className="spinner">⟳</span>
								<span style={{ marginLeft: '8px' }}>Creating account...</span>
							</>
						) : (
							'Create Account'
						)}
					</button>
				</form>

				<div className="auth-footer">
					<p>
						Already have an account?{' '}
						<Link to="/login">Sign in</Link>
					</p>
				</div>
			</div>
		</div>
	);
}