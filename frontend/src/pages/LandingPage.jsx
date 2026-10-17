import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Clock,
  Star,
  Plus,
  Minus,
} from "lucide-react";
import "../Home.css";

const categories = [
  {
    name: "Burger",
    price: "₹149",
    emoji: "🍔",
    color: "green",
    category: "burger",
  },
  {
    name: "Pizza",
    price: "₹199",
    emoji: "🍕",
    color: "pink",
    category: "pizza",
  },
  {
    name: "Salad",
    price: "₹129",
    emoji: "🥗",
    color: "yellow",
    category: "salad",
  },
];

const LandingPage = () => {
  const [quantity, setQuantity] = useState(1);
  const [activeCategory, setActiveCategory] = useState(0);

  const selectedFood = categories[activeCategory];

  const handleOrder = () => {
    window.location.href = `/restaurants?category=${selectedFood.category}`;
  };

  return (
    <main className="zb-home">
      <section className="zb-hero">
        {/* Left content */}
        <div className="zb-hero-content">
          <div className="zb-eyebrow">
            <span className="zb-eyebrow-dot" />
            FRESH FOOD, HAPPY MOOD
          </div>

          <h1>
            Order your
            <span> favourite Foods</span>
          </h1>

          <p className="zb-hero-description">
            Delicious food from your favorite restaurants, freshly prepared and
            delivered straight to your doorstep. Good food, great mood!
          </p>

          <div className="zb-price">
            <span>Starting from</span>
            <strong>{selectedFood.price}</strong>
          </div>

          <div className="zb-order-controls">
            <div className="zb-quantity">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Minus size={15} />
              </button>

              <span>{quantity}</span>

              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQuantity((q) => q + 1)}
              >
                <Plus size={15} />
              </button>
            </div>

            <button
              type="button"
              className="zb-order-button"
              onClick={handleOrder}
            >
              <span className="zb-order-icon">
                <ShoppingBag size={19} />
              </span>
              Order Now
              <ArrowRight size={18} />
            </button>
          </div>

          {/* Food category cards */}
          <div className="zb-category-area">
            <button
              type="button"
              className="zb-category-arrow"
              aria-label="Previous food category"
              onClick={() =>
                setActiveCategory(
                  (activeCategory - 1 + categories.length) % categories.length,
                )
              }
            >
              <ArrowLeft size={19} />
            </button>

            <div className="zb-category-list">
              {categories.map((food, index) => (
                <button
                  type="button"
                  key={food.name}
                  className={`zb-category-card ${food.color} ${
                    activeCategory === index ? "active" : ""
                  }`}
                  onClick={() => setActiveCategory(index)}
                >
                  <span className="zb-category-emoji">{food.emoji}</span>

                  <span className="zb-category-name">{food.name}</span>

                  <span className="zb-category-price">{food.price}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              className="zb-category-arrow"
              aria-label="Next food category"
              onClick={() =>
                setActiveCategory((activeCategory + 1) % categories.length)
              }
            >
              <ArrowRight size={19} />
            </button>
          </div>
        </div>

        {/* Right food visual */}
        <div className="zb-hero-visual">
          <div className="zb-visual-decoration zb-decoration-one">✳</div>
          <div className="zb-visual-decoration zb-decoration-two">🍅</div>
          <div className="zb-visual-decoration zb-decoration-three">🌿</div>
          <div className="zb-visual-decoration zb-decoration-four">🌶️</div>

          <div className="zb-food-image-wrap">
            <img
              className="zb-food-image"
              src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1100&q=85"
              alt="Fresh salad bowl with vegetables and greens"
            />
          </div>

          <div className="zb-food-info">
            <div className="zb-food-info-top">
              <div>
                <span className="zb-food-label">CHEF'S PICK</span>
                <h2>Fresh & Tasty</h2>
              </div>

              <div className="zb-rating">
                <Star size={16} fill="currentColor" />
                <span>4.8</span>
              </div>
            </div>

            <div className="zb-delivery-time">
              <Clock size={15} />
              <span>Fast doorstep delivery</span>
            </div>
          </div>

          <div className="zb-floating-badge">
            <span>🍽️</span>
            <div>
              <strong>Made with love</strong>
              <small>Freshness in every bite</small>
            </div>
          </div>
        </div>
      </section>

      {/* Small benefits row */}
      <section className="zb-benefits">
        <div>
          <span>🥬</span>
          <p>
            <strong>Fresh ingredients</strong>
            <small>Quality in every bite</small>
          </p>
        </div>

        <div>
          <span>🛵</span>
          <p>
            <strong>Quick delivery</strong>
            <small>Food at your doorstep</small>
          </p>
        </div>

        <div>
          <span>❤️</span>
          <p>
            <strong>Made for you</strong>
            <small>Your cravings, our mission</small>
          </p>
        </div>
      </section>
    </main>
  );
};

export default LandingPage;
