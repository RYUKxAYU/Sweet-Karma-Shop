import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../stores/useStore';
import { authApi } from '../services/api';
import './Auth.css';

export function Login({ onToast }) {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
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

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setIsLoading(true);

		console.log('Attempting login for:', email);

		try {
			const response = await authApi.login(email, password);
			console.log('Login response:', response);

			const userData = {
				id: response.user.id,
				email: response.user.email,
				isAdmin: response.user.is_admin,
				has2fa: response.user.has_2fa,
			};

			console.log('User data:', userData);
			login(userData, response.access_token);
			onToast(`Welcome back, ${userData.email}!`, 'success');
			navigate('/');
		} catch (err) {
			console.error('Login error:', err);
			if (err.code === 'ECONNABORTED') {
				setError('Request timed out. Please check if the server is running.');
			} else if (err.code === 'ERR_NETWORK') {
				setError('Cannot connect to server. Make sure the backend is running on port 8000.');
			} else {
				setError(err.response?.data?.detail || 'Login failed. Please try again.');
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="auth-page">
			<div className="auth-container">
				<div className="auth-header">
					<span className="auth-icon">🔐</span>
					<h1>Welcome Back</h1>
					<p>Sign in to your account</p>
				</div>

				<form onSubmit={handleSubmit} className="auth-form">
					{error && <div className="auth-error">{error}</div>}

					<div className="form-group">
						<label htmlFor="email">Email</label>
						<input
							type="email"
							id="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
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
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Enter your password"
							required
							disabled={isLoading}
						/>
					</div>

					<button type="submit" className="auth-btn" disabled={isLoading}>
						{isLoading ? (
							<>
								<span className="spinner">⟳</span>
								<span style={{ marginLeft: '8px' }}>Signing in...</span>
							</>
						) : (
							'Sign In'
						)}
					</button>
				</form>

				<div className="auth-footer">
					<p>
						Don't have an account?{' '}
						<Link to="/register">Create one</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
