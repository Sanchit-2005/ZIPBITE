import React, { useEffect, useState  } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../MainBox.css";

export default function MainBox() {
    const navigate=useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/menu-items",
        );

        const items = Array.isArray(response.data)
          ? response.data
          : response.data.menuItems || [];

        setMenuItems(items);
      } catch (error) {
        console.error(
          "Failed to fetch menu items:",
          error.response?.data || error.message,
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  return (
    <div className="zipbite-main container-fluid px-3 px-md-4 py-3">
      {/* Category navigation */}
      {/* <div className="category-strip d-flex gap-2 mb-4">
        {["All Foods", "Burgers", "Pizza", "Indian", "Snacks", "Desserts"].map(
          (category, index) => (
            <button
              key={category}
              className={`category-pill ${index === 0 ? "active" : ""}`}
              type="button"
            >
              {category}
            </button>
          ),
        )}
      </div> */}

      {/* Promotional banner */}
      <div className="row g-3 mb-4">
        <div className="col-lg-9">
          <div className="food-banner d-flex align-items-center justify-content-between">
            <div className="banner-content">
              <span className="banner-tag">HOT & FRESH 🔥</span>
              <h1>Hungry? Let's Fix That!</h1>
              <p>
                Delicious food, amazing deals, delivered straight to your door.
              </p>
              <a href="#recommended" className="btn banner-button">
                Explore Menu →
              </a>
            </div>

            <div className="banner-emoji" aria-hidden="true">
              🍔
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div className="col-lg-3">
          <div className="order-summary h-100">
            <p className="summary-label">🛍️ Your Food Journey</p>
            <h2>Good food, good mood!</h2>
            <p className="text-secondary small mb-0">
              Discover your next favourite meal.
            </p>
            <a href="#recommended" className="summary-link">
              View menu →
            </a>
          </div>
        </div>
      </div>

      {/* Recommended food */}
      <section id="recommended" className="mb-4">
        <div className="section-heading d-flex align-items-center justify-content-between mb-3">
          <h2>♧ Recommended for You</h2>
          <span>Fresh picks for you</span>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" />
            <p className="mt-2">Finding delicious food...</p>
          </div>
        ) : menuItems.length === 0 ? (
          <div className="empty-menu">
            <span>🍽️</span>
            <h3>No menu items available</h3>
            <p>Check back soon for delicious options.</p>
          </div>
        ) : (
          <div className="food-scroll">
            {menuItems.map((item) => (
              <article
                className="food-card"
                key={item._id}
                onClick={() => navigate(`/items/${item._id}`)}
                style={{ cursor: "pointer" }}
              >
                <div className="food-image-wrap">
                  <img
                    src={
                      item.image ||
                      "https://placehold.co/600x400?text=ZIPBITE+Food"
                    }
                    alt={item.name}
                    className="food-image"
                    loading="lazy"
                  />
                  <span className="food-badge">Fresh</span>
                </div>

                <div className="food-card-body">
                  <h3 title={item.name}>{item.name}</h3>

                  <p className="food-description">
                    Delicious food made to satisfy your cravings.
                  </p>

                  <div className="food-meta">
                    <span
                      className={`food-category ${
                        item.category?.toLowerCase() === "non-veg"
                          ? "non-veg"
                          : "veg"
                      }`}
                    >
                      {item.category || "Food"}
                    </span>
                    <span className="food-price">₹{item.price}</span>
                  </div>

                  <button
                    className="add-food-button"
                    type="button"
                    onClick={() => console.log("Selected menu item:", item._id)}
                  >
                    + Add to Cart
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Popular section */}
      <section className="popular-section">
        <div className="section-heading mb-3">
          <h2>✦ Popular Right Now</h2>
          <p>Explore more delicious choices from ZIPBITE.</p>
        </div>

        <div className="popular-banner">
          <div>
            <span>YOUR NEXT FAVOURITE MEAL</span>
            <h3>Good food. Great moments.</h3>
            <p>Explore our menu and find something you love.</p>
          </div>
          <div className="popular-emoji">🍕</div>
        </div>
      </section>
    </div>
  );
}
