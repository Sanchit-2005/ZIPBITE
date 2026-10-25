import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Checkout.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/apiV1";

const initialAddress = {
  fullName: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  postalCode: "",
  landmark: "",
};

export default function Checkout() {
  const navigate = useNavigate();

  const [cart, setCart] = useState({ items: [], restaurant: null });
  const [address, setAddress] = useState(initialAddress);
  const [instructions, setInstructions] = useState("");
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  
  const token = localStorage.getItem("token");

  const api = useMemo(
    () =>
      axios.create({
        baseURL: API_URL,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }),
    [token],
  );

  useEffect(() => {
    let active = true;

    const fetchCart = async () => {
      try {
        setLoading(true);
        setError("");

       
        const response = await api.get("/cart");

        if (active) {
          const data = response.data.cart ?? response.data;

          setCart({
            items: data.items ?? [],
            restaurant: data.restaurant ?? null,
          });
        }
      } catch (err) {
        if (active) {
          setError(err.response?.data?.message || "Unable to load your cart.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchCart();

    return () => {
      active = false;
    };
  }, [api]);

  const getMenuItem = (item) =>
    typeof item.menuItem === "object" && item.menuItem !== null
      ? item.menuItem
      : item;

  const subtotal = cart.items.reduce((sum, item) => {
    const menuItem = getMenuItem(item);
    return sum + Number(menuItem.price || 0) * item.quantity;
  }, 0);

  const handleAddressChange = (event) => {
    const { name, value } = event.target;

    setAddress((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const loadRazorpay = () =>
    new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });

  const handleCheckout = async (event) => {
    event.preventDefault();
    setError("");

    if (!token) {
      setError("Please log in before proceeding to payment.");
      return;
    }

    if (cart.items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    const missingAddress = Object.entries(address).some(
      ([key, value]) => key !== "landmark" && !value.trim(),
    );

    if (missingAddress) {
      setError("Please complete all required address fields.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(address.phone)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (!/^\d{6}$/.test(address.postalCode)) {
      setError("Enter a valid 6-digit postal code.");
      return;
    }

    setPaying(true);

    let orderId = null;

    try {
      const loaded = await loadRazorpay();

      if (!loaded) {
        throw new Error("Unable to load Razorpay Checkout.");
      }

      // Backend calculates the final payable amount.
      const response = await axios.post(
        "http://localhost:8000/apiV3/createOrder",
        {
          deliveryAddress: address,
          instructions,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 15000,
        },
      );

      console.log("Create order response:", response.data);

      const data = response.data;
      orderId = data.orderId;

      if (!data.success || !data.razorpayOrderId || !data.key) {
        throw new Error("Invalid payment order response.");
      }

      const razorpay = new window.Razorpay({
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        order_id: data.razorpayOrderId,
        name: "ZipBite",
        description: "Food Order Payment",

        prefill: {
          name: address.fullName,
          contact: address.phone,
        },

        theme: {
          color: "#f45b0b",
        },

        handler: async (paymentResponse) => {
          try {
            // Verify payment on your backend.
            const verification = await axios.post(
              "http://localhost:8000/apiV3/verifyPayment",
              {
                orderId,
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
                timeout: 15000,
              },
            );

            if (!verification.data.success) {
              throw new Error("Payment verification was unsuccessful.");
            }

            // Navigate only after backend verification.
            navigate("/orders");
          } catch (err) {
            setError(
              err.response?.data?.message ||
                "Payment verification failed. Your payment may still have succeeded. Check your orders before trying again.",
            );
          } finally {
            setPaying(false);
          }
        },

        modal: {
          ondismiss: () => setPaying(false),
        },
      });

      razorpay.on("payment.failed", (paymentResponse) => {
        setError(
          paymentResponse.error?.description ||
            "Payment failed. Please try again.",
        );
        setPaying(false);
      });

      razorpay.open();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to start checkout.",
      );
      setPaying(false);
    }
  };

  if (loading) {
    return <div className="checkout-message">Loading checkout...</div>;
  }

  if (cart.items.length === 0) {
    return (
      <div className="checkout-message">
        <h2>Your cart is empty</h2>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="checkout-button"
        >
          Explore restaurants
        </button>
      </div>
    );
  }

  return (
    <main className="checkout-page">
      <div className="checkout-heading">
        <button
          type="button"
          className="back-button"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <h1>Checkout</h1>
        <p>Review your delivery details and place your order.</p>
      </div>

      {error && (
        <div className="checkout-error" role="alert">
          {error}
        </div>
      )}

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleCheckout}>
          <section className="checkout-card">
            <h2>📍 Delivery Address</h2>

            <div className="checkout-fields">
              <label>
                Full Name *
                <input
                  name="fullName"
                  value={address.fullName}
                  onChange={handleAddressChange}
                  required
                  autoComplete="name"
                />
              </label>

              <label>
                Phone Number *
                <input
                  name="phone"
                  type="tel"
                  value={address.phone}
                  onChange={handleAddressChange}
                  required
                  maxLength={10}
                  inputMode="numeric"
                  autoComplete="tel"
                />
              </label>

              <label className="full-width">
                Street / House No. *
                <input
                  name="street"
                  value={address.street}
                  onChange={handleAddressChange}
                  required
                  autoComplete="street-address"
                />
              </label>

              <label>
                City *
                <input
                  name="city"
                  value={address.city}
                  onChange={handleAddressChange}
                  required
                />
              </label>

              <label>
                State *
                <input
                  name="state"
                  value={address.state}
                  onChange={handleAddressChange}
                  required
                />
              </label>

              <label>
                Postal Code *
                <input
                  name="postalCode"
                  value={address.postalCode}
                  onChange={handleAddressChange}
                  required
                  maxLength={6}
                  inputMode="numeric"
                  autoComplete="postal-code"
                />
              </label>

              <label>
                Landmark (Optional)
                <input
                  name="landmark"
                  value={address.landmark}
                  onChange={handleAddressChange}
                />
              </label>
            </div>
          </section>

          <section className="checkout-card">
            <h2>📝 Delivery Instructions</h2>
            <textarea
              value={instructions}
              onChange={(event) => setInstructions(event.target.value)}
              placeholder="E.g. Call before delivery"
              rows={3}
              maxLength={500}
            />
          </section>

          <section className="checkout-card payment-card">
            <h2>💳 Payment Method</h2>

            <div className="razorpay-option">
              <strong>Razorpay</strong>
              <span>UPI, Cards, Net Banking and Wallets</span>
            </div>

            <button type="submit" className="checkout-button" disabled={paying}>
              {paying ? "Processing..." : "🔒 Proceed to Payment"}
            </button>

            <p className="secure-text">Secure payment powered by Razorpay</p>
          </section>
        </form>

        <aside className="checkout-card order-summary">
          <h2>Order Summary</h2>

          {cart.restaurant && (
            <p className="restaurant-name">
              {typeof cart.restaurant === "object"
                ? cart.restaurant.name
                : "Your restaurant"}
            </p>
          )}

          <div className="summary-items">
            {cart.items.map((item, index) => {
              const menuItem = getMenuItem(item);

              return (
                <div
                  className="summary-item"
                  key={menuItem._id || item._id || index}
                >
                  <div>
                    <strong>{menuItem.name || "Menu item"}</strong>
                    <p>
                      ₹{menuItem.price} × {item.quantity}
                    </p>
                  </div>

                  <strong>
                    ₹{(Number(menuItem.price || 0) * item.quantity).toFixed(2)}
                  </strong>
                </div>
              );
            })}
          </div>

          <div className="summary-total">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>

          <p className="summary-note">
            Delivery fee, taxes and discounts are calculated according to your
            backend pricing rules.
          </p>

          <div className="summary-total final-total">
            <strong>Subtotal (before fees)</strong>
            <strong>₹{subtotal.toFixed(2)}</strong>
          </div>
        </aside>
      </div>
    </main>
  );
}
