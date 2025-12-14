import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../stores/useStore';
import { authApi } from '../services/api';
import './Auth.css';

export function Register() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const { login } = useStore();
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');

		if (password !== confirmPassword) {
			setError('Passwords do not match');
			return;
		}

		if (password.length < 8) {
			setError('Password must be at least 8 characters');
			return;
		}

		setIsLoading(true);

		try {
			const response = await authApi.register(email, password);

			const user = {
				id: response.user.id,
				email: response.user.email,
				isAdmin: response.user.is_admin,
				has2fa: response.user.has_2fa,
			};

			login(user, response.access_token);
			navigate('/');
		} catch (err) {
			setError(err.response?.data?.detail || 'Registration failed. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="auth-page">
			<div className="auth-container">
				<div className="auth-header">
					<span className="auth-icon">✨</span>
					<h1>Create Account</h1>
					<p>Join our sweet community</p>
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
						/>
					</div>

					<div className="form-group">
						<label htmlFor="password">Password</label>
						<input
							type="password"
							id="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="At least 8 characters"
							required
							minLength={8}
						/>
					</div>

					<div className="form-group">
						<label htmlFor="confirmPassword">Confirm Password</label>
						<input
							type="password"
							id="confirmPassword"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							placeholder="Confirm your password"
							required
						/>
					</div>

					<button type="submit" className="auth-btn" disabled={isLoading}>
						{isLoading ? <span className="spinner">⟳</span> : 'Create Account'}
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
