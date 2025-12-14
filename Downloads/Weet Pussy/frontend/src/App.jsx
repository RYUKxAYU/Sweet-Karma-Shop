import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { AdminRoute } from './components/AdminRoute';
import { ToastContainer, useToast } from './components/Toast';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AdminDashboard } from './pages/AdminDashboard';
import { UserProfile } from './pages/UserProfile';
import './App.css';

function App() {
	const { toasts, addToast, removeToast } = useToast();

	return (
		<BrowserRouter>
			<div className="app">
				<Navbar onToast={addToast} />
				<main className="main-content">
					<Routes>
						<Route path="/" element={<Home onToast={addToast} />} />
						<Route path="/login" element={<Login onToast={addToast} />} />
						<Route path="/register" element={<Register onToast={addToast} />} />
						<Route path="/profile" element={<UserProfile onToast={addToast} />} />
						<Route
							path="/admin"
							element={
								<AdminRoute>
									<AdminDashboard onToast={addToast} />
								</AdminRoute>
							}
						/>
					</Routes>
				</main>
				<ToastContainer toasts={toasts} onRemove={removeToast} />
			</div>
		</BrowserRouter>
	);
}

export default App;
