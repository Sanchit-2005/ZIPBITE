import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../../src/ItemDetails.css";

export default function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [favorite, setFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState("Description");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      setError("");

      try {
        // Change this URL if your backend uses a different route.
        const response = await axios.get(
          `http://localhost:8000/api/menu-item/${id}`,
        );

        // Supports either a direct document or { menuItem: document }.
        const data = response.data.menuItem || response.data;
        setItem(data);
      } catch (err) {
        console.error(
          "Failed to fetch menu item:",
          err.response?.data || err.message,
        );
        setError(
          err.response?.data?.message || "Unable to load this food item.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  if (loading) {
    return (
      <div className="item-loading">
        <div className="spinner-border text-danger" role="status" />
        <p>Preparing something delicious...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="container text-center py-5">
        <h4>{error || "Food item not found."}</h4>
        <button className="btn btn-dark mt-3" onClick={() => navigate(-1)}>
          ← Back to menu
        </button>
      </div>
    );
  }

  const category = item.category || "Food";
  const isNonVeg = category.toLowerCase().includes("non-veg");
  const available = item.isAvailable && item.isActive !== false;
  const price = Number(item.price || 0);
  const totalPrice = price * quantity;

  const handleAddToCart = () => {
    // Connect this handler to your existing ZIPBITE cart API.
    console.log("Selected item:", {
      menuItem: item._id,
      quantity,
      price,
      totalPrice,
    });
  };

  const handleOrderNow = () => {
    // Checkout integration can be added here.
    handleAddToCart();
  };

  return (
    <div className="zip-item-page">
      <div className="zip-item-container">
        {/* Breadcrumb */}
        <nav className="zip-breadcrumb" aria-label="breadcrumb">
          <button onClick={() => navigate("/home")}>Home</button>
          <span>/</span>
          <button onClick={() => navigate("/menu")}>Menu</button>
          <span>/</span>
          <span className="breadcrumb-current">{item.name}</span>
        </nav>

        {/* Product details */}
        <div className="row g-4 zip-item-main">
          {/* Food image */}
          <div className="col-lg-6">
            <div className="zip-image-panel">
              <img
                src={item.image || "https://placehold.co/800x700?text=ZIPBITE"}
                alt={item.name}
                className="zip-item-image"
              />

              <span
                className={`zip-image-category ${isNonVeg ? "nonveg" : "veg"}`}
              >
                ● {category}
              </span>

              <button
                type="button"
                className={`zip-favorite ${favorite ? "favorited" : ""}`}
                onClick={() => setFavorite(!favorite)}
                aria-label="Toggle favorite"
              >
                {favorite ? "♥" : "♡"}
              </button>
            </div>
          </div>

          {/* Food information */}
          <div className="col-lg-6">
            <div className="zip-item-info">
              <div className="zip-item-eyebrow">
                ZIPBITE <span>·</span> FRESHLY PREPARED
              </div>

              <h1 className="zip-item-title">{item.name}</h1>

              <div className="zip-rating-row">
                <span className="zip-stars">
                  {item.totalRatings > 0 ? "★" : "☆"}
                </span>

                <strong>
                  {item.totalRatings > 0
                    ? Number(item.ratings).toFixed(1)
                    : "Not rated"}
                </strong>

                <span className="zip-muted">
                  ({item.totalRatings || 0} reviews)
                </span>

                <span className="zip-prep-time">
                  ◷ {item.preparationTime ?? "—"} min prep
                </span>
              </div>

              <div className="zip-price-row">
                <span className="zip-price">₹{price.toFixed(2)}</span>

                <span
                  className={`zip-availability ${
                    available ? "available" : "unavailable"
                  }`}
                >
                  {available ? "Available" : "Currently unavailable"}
                </span>
              </div>

              <p className="zip-item-description">
                {item.description ||
                  `Enjoy our freshly prepared ${item.name} from ZIPBITE.`}
              </p>

              {/* Dietary information */}
              <div className="zip-dietary-row">
                <span className={`zip-dietary ${isNonVeg ? "nonveg" : "veg"}`}>
                  <span className="dietary-dot" />
                  {item.isVegetarian
                    ? "Vegetarian"
                    : isNonVeg
                      ? "Non-Vegetarian"
                      : "Food"}
                </span>

                {item.isVegan && (
                  <span className="zip-dietary vegan">Vegan</span>
                )}
              </div>

              {/* Quantity */}
              <div className="zip-option-group">
                <h6>Quantity</h6>

                <div className="zip-purchase-row">
                  <div className="zip-quantity">
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((current) => Math.max(1, current - 1))
                      }
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>

                    <span>{quantity}</span>

                    <button
                      type="button"
                      onClick={() => setQuantity((current) => current + 1)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    className="zip-add-cart"
                    onClick={handleAddToCart}
                    disabled={!available}
                  >
                    Add to Cart · ₹{totalPrice.toFixed(2)}
                  </button>

                  <button
                    type="button"
                    className={`zip-mobile-favorite ${
                      favorite ? "favorited" : ""
                    }`}
                    onClick={() => setFavorite(!favorite)}
                    aria-label="Toggle favorite"
                  >
                    {favorite ? "♥" : "♡"}
                  </button>
                </div>
              </div>

              <div className="zip-delivery-info">
                <p>
                  <span>ⓘ</span> Freshly prepared to order
                </p>
                <p className="zip-delivery-note">
                  Preparation time: {item.preparationTime ?? "—"} minutes.
                  Delivery time may vary by location.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Information tabs */}
        <section className="zip-extra-section">
          <div className="zip-tabs">
            {["Description", "Nutrition", "Delivery", "Reviews"].map((tab) => (
              <button
                type="button"
                key={tab}
                className={`zip-tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "Nutrition"
                  ? "Nutritional Info"
                  : tab === "Delivery"
                    ? "Delivery Info"
                    : tab}
                {tab === "Reviews" && ` (${item.totalRatings || 0})`}
              </button>
            ))}
          </div>

          <div className="zip-tab-content">
            {activeTab === "Description" && (
              <>
                <h3>About this dish</h3>
                <p>
                  {item.description ||
                    `${item.name} is prepared fresh for your meal.`}
                </p>
              </>
            )}

            {activeTab === "Nutrition" && (
              <>
                <h3>Nutritional Information</h3>
                <p>
                  Nutritional details are not currently available for this menu
                  item.
                </p>
              </>
            )}

            {activeTab === "Delivery" && (
              <>
                <h3>Delivery Information</h3>
                <p>
                  This item takes approximately{" "}
                  {item.preparationTime ?? "an estimated"} minutes to prepare.
                  Actual delivery time depends on your location.
                </p>
              </>
            )}

            {activeTab === "Reviews" && (
              <>
                <h3>Customer Reviews</h3>
                <p>
                  {item.totalRatings > 0
                    ? `Average rating: ${item.ratings} from ${item.totalRatings} ratings.`
                    : "No customer reviews have been submitted yet."}
                </p>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
