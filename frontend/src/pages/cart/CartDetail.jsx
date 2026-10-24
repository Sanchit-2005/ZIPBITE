import React, { useEffect, useState } from "react";
import axios from "axios";
import "./CartDetail.css";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import DeleteIcon from "@mui/icons-material/Delete";

const API_URL = "http://localhost:8000/apiV1/cart";

export default function CartDetail() {
  const [cartInfo, setCartInfo] = useState({
    items: [],
    restaurant: null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const token = () => localStorage.getItem("token");

  const getItemId = (item) =>
    typeof item.menuItem === "object" ? item.menuItem?._id : item.menuItem;

  const getPrice = (item) => Number(item.menuItem?.price) || 0;

  useEffect(() => {
    const fetchCart = async () => {
      const authToken = token();

      if (!authToken) {
        setError("Please log in to view your cart.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(API_URL, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        const cart = response.data.cart || response.data;

        setCartInfo({
          ...cart,
          items: Array.isArray(cart.items) ? cart.items : [],
          restaurant: cart.restaurant || null,
        });
      } catch (err) {
        console.error("Fetch cart error:", err.response?.data || err.message);
        setError(
          err.response?.data?.message ||
            "Unable to load your cart. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const subtotal = cartInfo.items.reduce((total, item) => {
    return total + getPrice(item) * (Number(item.quantity) || 1);
  }, 0);

  // Remove item from the backend and update the UI.
  const handleRemoveItem = async (menuItemId) => {
    if (!menuItemId || removingId) return;

    setRemovingId(menuItemId);
    setError("");

    try {
      await axios.delete(`${API_URL}/items/${menuItemId}`, {
        headers: {
          Authorization: `Bearer ${token()}`,
        },
      });

      setCartInfo((previous) => ({
        ...previous,
        items: previous.items.filter((item) => getItemId(item) !== menuItemId),
      }));
    } catch (err) {
      console.error("Remove item error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Unable to remove this item.");
    } finally {
      setRemovingId(null);
    }
  };

  const handleQuantityChange = async (menuItemId, quantity) => {
    if (!menuItemId || quantity < 1 || updatingId) return;

    const currentItem = cartInfo.items.find(
      (item) => getItemId(item) === menuItemId,
    );

    if (!currentItem || Number(currentItem.quantity) === quantity) return;

    setUpdatingId(menuItemId);
    setError("");

    try {
      const response = await axios.put(
        `${API_URL}/items/${menuItemId}`,
        { quantity },
        {
          headers: {
            Authorization: `Bearer ${token()}`,
          },
        },
      );

      const updatedCart = response.data.cart;

      if (updatedCart && Array.isArray(updatedCart.items)) {
        setCartInfo((previous) => ({
          ...previous,
          ...updatedCart,
        }));
      } else {
        setCartInfo((previous) => ({
          ...previous,
          items: previous.items.map((item) =>
            getItemId(item) === menuItemId ? { ...item, quantity } : item,
          ),
        }));
      }
    } catch (err) {
      console.error(
        "Quantity update error:",
        err.response?.data || err.message,
      );
      setError(
        err.response?.data?.message ||
          "Unable to update quantity. Check your backend API.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const restaurantName =
    typeof cartInfo.restaurant === "object" ? cartInfo.restaurant?.name : null;

  const formatPrice = (amount) =>
    `₹${Number(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  if (loading) {
    return (
      <div className="cart-page cart-message">
        <div className="cart-loader" />
        <p>Loading your cart...</p>
      </div>
    );
  }

  if (error && !cartInfo.items.length) {
    return (
      <div className="cart-page cart-message">
        <h2>My Cart</h2>
        <p className="cart-error">{error}</p>
        <button
          className="cart-secondary-btn"
          onClick={() => (window.location.href = "/")}
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  if (cartInfo.items.length === 0) {
    return (
      <div className="cart-page cart-message">
        <div className="empty-cart-icon">
          <ShoppingCartIcon />
        </div>
        <h2>Your cart is empty</h2>
        <p>Add some delicious food to get started!</p>
        <button
          className="cart-primary-btn"
          onClick={() => (window.location.href = "/menu")}
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <main className="cart-page">
      <div className="cart-header">
        <h2>My Cart</h2>
        <button
          className="continue-shopping-link"
          onClick={() => window.history.back()}
        >
          Continue Shopping
        </button>
      </div>

      {restaurantName && (
        <div className="cart-restaurant">
          Ordering from <strong>{restaurantName}</strong>
        </div>
      )}

      {error && <div className="cart-error-banner">{error}</div>}

      <div className="cart-layout">
        {/* Cart items */}
        <section className="cart-items-column">
          {cartInfo.items.map((item, index) => {
            const menuItem = item.menuItem;
            const itemId = getItemId(item);
            const price = getPrice(item);
            const quantity = Number(item.quantity) || 1;

            if (!menuItem || typeof menuItem !== "object") {
              return (
                <div className="cart-item-card" key={itemId || index}>
                  <p>
                    Menu item details are missing. Check that your backend
                    populates <code>items.menuItem</code>.
                  </p>
                </div>
              );
            }

            return (
              <article className="cart-item-card" key={itemId || index}>
                <div className="cart-product-image">
                  {menuItem.image ? (
                    <img
                      src={menuItem.image}
                      alt={menuItem.name || "Food item"}
                    />
                  ) : (
                    <div className="cart-image-placeholder">🍽️</div>
                  )}
                </div>

                <div className="cart-product-details">
                  <h3>{menuItem.name || "Unnamed item"}</h3>

                  {menuItem.description && (
                    <p className="cart-product-description">
                      {menuItem.description}
                    </p>
                  )}

                  <p className="cart-delivery">
                    <span>✓</span> Freshly prepared
                  </p>

                  <p className="cart-returns">
                    <span>↻</span> Quality assured
                  </p>

                  <div className="cart-product-bottom">
                    <div className="cart-price">{formatPrice(price)}</div>

                    <div className="cart-quantity-control">
                      <button
                        aria-label={`Decrease ${menuItem.name} quantity`}
                        disabled={quantity <= 1 || updatingId !== null}
                        onClick={() =>
                          handleQuantityChange(itemId, quantity - 1)
                        }
                      >
                        −
                      </button>

                      <span>{updatingId === itemId ? "…" : quantity}</span>

                      <button
                        aria-label={`Increase ${menuItem.name} quantity`}
                        disabled={updatingId !== null}
                        onClick={() =>
                          handleQuantityChange(itemId, quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  className="cart-remove-btn"
                  aria-label={`Remove ${menuItem.name}`}
                  title="Remove item"
                  disabled={removingId === itemId}
                  onClick={() => handleRemoveItem(itemId)}
                >
                  {removingId === itemId ? "…" : <DeleteIcon />}
                </button>
              </article>
            );
          })}
        </section>

        {/* Order summary */}
        <aside className="cart-summary">
          <div className="cart-summary-heading">
            <h3>Order Summary</h3>
          </div>

          <div className="cart-summary-body">
            <div className="cart-summary-row">
              <span>
                Subtotal (
                {cartInfo.items.reduce(
                  (sum, item) => sum + (Number(item.quantity) || 1),
                  0,
                )}{" "}
                items)
              </span>
              <span>{formatPrice(subtotal)}</span>
            </div>

            <div className="cart-summary-row">
              <span>Delivery fee</span>
              <span className="cart-free">Free</span>
            </div>

            <div className="cart-summary-row">
              <span>Estimated tax</span>
              <span>{formatPrice(0)}</span>
            </div>
          </div>

          <div className="cart-summary-total">
            <span>Total</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>

          <div className="cart-summary-actions">
            <button
              className="cart-primary-btn"
              onClick={() => (window.location.href = "/checkout")}
            >
              Continue to checkout
            </button>

            <button
              className="cart-secondary-btn"
              onClick={() => window.history.back()}
            >
              Continue Shopping
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}
