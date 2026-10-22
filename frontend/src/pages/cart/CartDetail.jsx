import React, { useEffect, useState } from "react";
import axios from "axios";

export default function CartDetail() {
  const [cartInfo, setCartInfo] = useState({
    items: [],
    restaurant: null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = "http://localhost:8000/apiV1/cart";

  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please log in to view your cart.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Cart API response:", response.data);

        // API may return the cart directly or inside a cart property.
        const cart = response.data.cart || response.data;

        setCartInfo({
          ...cart,
          items: Array.isArray(cart.items) ? cart.items : [],
          restaurant: cart.restaurant || null,
        });
      } catch (err) {
        console.error(
          "Failed to fetch cart:",
          err.response?.data || err.message,
        );

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

  // Calculate subtotal.
  const subtotal = cartInfo.items.reduce((total, item) => {
    const price = Number(item.menuItem?.price) || 0;
    const quantity = Number(item.quantity) || 0;

    return total + price * quantity;
  }, 0);

  // Remove an item from the UI only.
  const handleRemoveItem = async (menuItemId) => {
    const token = localStorage.getItem("token");

    // Remove the item from the cart state.
    await axios.delete(`http://localhost:8000/apiV1/cart/items/${menuItemId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("item deleted !");
    setCartInfo((previousCart) => ({
      ...previousCart,
      items: previousCart.items.filter((item) => {
        const id =
          typeof item.menuItem === "object"
            ? item.menuItem?._id
            : item.menuItem;

        return id !== menuItemId;
      }),
    }));
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <p>Loading your cart...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5 text-center">
        <h3>Cart</h3>
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  if (cartInfo.items.length === 0) {
    return (
      <div className="container py-5 text-center">
        <h2>Your Cart Is Empty</h2>
        <p>Add some delicious food to get started!</p>
      </div>
    );
  }

  const restaurantName =
    typeof cartInfo.restaurant === "object" ? cartInfo.restaurant?.name : null;

  return (
    <div className="container py-4">
      <h2 className="mb-4">Your Cart</h2>

      {restaurantName && <h5 className="mb-3">Restaurant: {restaurantName}</h5>}

      <div className="row">
        <div className="col-lg-8">
          {cartInfo.items.map((item, index) => {
            const menuItem = item.menuItem;

            // The backend should populate items.menuItem.
            if (!menuItem || typeof menuItem !== "object") {
              return (
                <div className="alert alert-warning" key={index}>
                  Menu item details are missing. Please check your backend
                  populate("items.menuItem") query.
                </div>
              );
            }

            const itemId = menuItem._id;
            const price = Number(menuItem.price) || 0;
            const quantity = Number(item.quantity) || 1;

            return (
              <div className="card mb-3" key={itemId || index}>
                <div className="card-body d-flex align-items-center gap-3 flex-wrap">
                  {menuItem.image && (
                    <img
                      src={menuItem.image}
                      alt={menuItem.name || "Menu item"}
                      style={{
                        width: "100px",
                        height: "100px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                  )}

                  <div className="flex-grow-1">
                    <h5>{menuItem.name || "Unnamed item"}</h5>

                    <p className="mb-1">Price: ₹{price}</p>

                    <p className="mb-1">Quantity: {quantity}</p>

                    <p className="mb-0 fw-bold">Total: ₹{price * quantity}</p>
                  </div>

                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleRemoveItem(itemId)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="col-lg-4">
          <div className="card">
            <div className="card-body">
              <h4>Order Summary</h4>

              <div className="d-flex justify-content-between my-3">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>

              <hr />

              <div className="d-flex justify-content-between fw-bold">
                <span>Total</span>
                <span>₹{subtotal}</span>
              </div>

              <button
                className="btn btn-success w-100 mt-3"
                onClick={() =>
                  alert("Connect this button to your checkout page.")
                }
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
