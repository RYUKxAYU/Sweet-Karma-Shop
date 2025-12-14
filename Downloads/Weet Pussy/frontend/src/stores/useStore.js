import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useStore = create(
	persist(
		(set, get) => ({
			// Initial state
			user: null,
			token: null,
			sweets: [],
			cart: [],
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

			// Cart actions
			addToCart: (sweet, quantity = 1) =>
				set((state) => {
					const existingItem = state.cart.find(item => item.id === sweet.id);
					if (existingItem) {
						return {
							cart: state.cart.map(item =>
								item.id === sweet.id
									? { ...item, quantity: item.quantity + quantity }
									: item
							)
						};
					}
					return {
						cart: [...state.cart, { ...sweet, quantity }]
					};
				}),
			updateCart: (sweetId, quantity) =>
				set((state) => {
					if (quantity <= 0) {
						return {
							cart: state.cart.filter(item => item.id !== sweetId)
						};
					}
					return {
						cart: state.cart.map(item =>
							item.id === sweetId ? { ...item, quantity } : item
						)
					};
				}),
			removeFromCart: (sweetId) =>
				set((state) => ({
					cart: state.cart.filter(item => item.id !== sweetId)
				})),
			clearCart: () => set({ cart: [] }),
			getCartItemCount: () => {
				const state = get();
				return state.cart.reduce((total, item) => total + item.quantity, 0);
			},
		}),
		{
			name: 'sweet-shop-storage',
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({ user: state.user, token: state.token, cart: state.cart }),
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
