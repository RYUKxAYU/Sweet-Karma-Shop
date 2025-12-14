import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { AdminRoute } from './components/AdminRoute';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AdminDashboard } from './pages/AdminDashboard';
import './App.css';

function App() {
	return (
		<BrowserRouter>
			<div className="app">
				<Navbar />
				<main className="main-content">
					<Routes>
						<Route path="/" element={<Home />} />
						<Route path="/login" element={<Login />} />
						<Route path="/register" element={<Register />} />
						<Route
							path="/admin"
							element={
								<AdminRoute>
									<AdminDashboard />
								</AdminRoute>
							}
						/>
					</Routes>
				</main>
			</div>
		</BrowserRouter>
	);
}

export default App;
