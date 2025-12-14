import { useState } from 'react';
import { useStore } from '../stores/useStore';
import { sweetsApi } from '../services/api';
import './ShoppingCart.css';

export function ShoppingCart({ isOpen, onClose, onToast }) {
  const { user, cart, updateCart, clearCart, updateSweet } = useStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const updateQuantity = (sweetId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(sweetId);
      return;
    }
    
    updateCart(sweetId, newQuantity);
  };

  const removeFromCart = (sweetId) => {
    updateCart(sweetId, 0);
  };

  const handleCheckout = async () => {
    if (!user) {
      onToast('Please login to complete purchase', 'error');
      return;
    }

    if (cart.length === 0) {
      onToast('Your cart is empty', 'warning');
      return;
    }

    setIsProcessing(true);

    try {
      // Process each item in the cart
      const results = [];
      for (const item of cart) {
        try {
          const result = await sweetsApi.purchase(item.id, item.quantity);
          results.push({ success: true, item, result });
          updateSweet(item.id, { quantity: result.sweet.quantity });
        } catch (error) {
          results.push({ success: false, item, error: error.response?.data?.detail || 'Purchase failed' });
        }
      }

      // Check results
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      if (successful.length > 0) {
        clearCart();
        onToast(`Successfully purchased ${successful.length} item(s)!`, 'success');
      }

      if (failed.length > 0) {
        onToast(`${failed.length} item(s) could not be purchased`, 'error');
      }

      if (successful.length > 0) {
        onClose();
      }
    } catch (error) {
      onToast('Checkout failed. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="cart-overlay" onClick={onClose}>
      <div className="cart-panel" onClick={e => e.stopPropagation()}>
        <div className="cart-header">
          <h2>🛒 Shopping Cart</h2>
          <button className="cart-close" onClick={onClose}>×</button>
        </div>

        <div className="cart-content">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <span className="empty-icon">🛒</span>
              <p>Your cart is empty</p>
              <p className="empty-hint">Add some delicious sweets to get started!</p>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="item-info">
                      <h4>{item.name}</h4>
                      <p className="item-category">{item.category}</p>
                      <p className="item-price">₹{item.price.toFixed(2)} each</p>
                    </div>
                    
                    <div className="item-controls">
                      <div className="quantity-controls">
                        <button 
                          className="qty-btn"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          −
                        </button>
                        <span className="quantity">{item.quantity}</span>
                        <button 
                          className="qty-btn"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      
                      <div className="item-total">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </div>
                      
                      <button 
                        className="remove-btn"
                        onClick={() => removeFromCart(item.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-summary">
                <div className="summary-row">
                  <span>Total Items:</span>
                  <span>{getTotalItems()}</span>
                </div>
                <div className="summary-row total">
                  <span>Total Price:</span>
                  <span>₹{getTotalPrice().toFixed(2)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <button 
              className="clear-cart-btn"
              onClick={clearCart}
              disabled={isProcessing}
            >
              Clear Cart
            </button>
            <button 
              className="checkout-btn"
              onClick={handleCheckout}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <span className="spinner">⟳</span>
                  Processing...
                </>
              ) : (
                `Checkout (₹${getTotalPrice().toFixed(2)})`
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}