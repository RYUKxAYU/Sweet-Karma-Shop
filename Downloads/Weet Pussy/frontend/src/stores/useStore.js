import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useStore = create(
	persist(
		(set, get) => ({
			// Initial state
			user: null,
			token: null,
			sweets: [],
			isLoading: false,
			error: null,

			// Auth actions
			setUser: (user) => set({ user }),
			setToken: (token) => {
				// Also update localStorage for API interceptor
				if (token) {
					localStorage.setItem('token', token);
				} else {
					localStorage.removeItem('token');
				}
				set({ token });
			},
			login: (user, token) => {
				console.log('Store login called:', { user, token: token?.substring(0, 20) + '...' });
				localStorage.setItem('token', token);
				set({ user, token });
			},
			logout: () => {
				console.log('Store logout called');
				localStorage.removeItem('token');
				set({ user: null, token: null });
			},

			// Get token (helper)
			getToken: () => {
				const state = get();
				return state.token || localStorage.getItem('token');
			},

			// Sweets actions
			setSweets: (sweets) => set({ sweets }),
			updateSweet: (id, updates) =>
				set((state) => ({
					sweets: state.sweets.map((s) =>
						s.id === id ? { ...s, ...updates } : s
					),
				})),
			addSweet: (sweet) =>
				set((state) => ({ sweets: [...state.sweets, sweet] })),
			removeSweet: (id) =>
				set((state) => ({
					sweets: state.sweets.filter((s) => s.id !== id),
				})),
			setLoading: (isLoading) => set({ isLoading }),
			setError: (error) => set({ error }),
		}),
		{
			name: 'sweet-shop-storage',
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({ user: state.user, token: state.token }),
			onRehydrateStorage: () => (state) => {
				// Sync token to localStorage on rehydration
				if (state?.token) {
					console.log('Rehydrating token from store');
					localStorage.setItem('token', state.token);
				}
			},
		}
	)
);
