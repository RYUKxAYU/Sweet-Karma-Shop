import { Navigate } from 'react-router-dom';
import { useStore } from '../stores/useStore';

export function AdminRoute({ children }) {
	const { user } = useStore();

	if (!user) {
		return <Navigate to="/login" replace />;
	}

	if (!user.isAdmin) {
		return <Navigate to="/" replace />;
	}

	return <>{children}</>;
}
