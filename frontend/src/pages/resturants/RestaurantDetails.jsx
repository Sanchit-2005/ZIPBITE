import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./RestaurantDetails.css";
import InfoIcon from "@mui/icons-material/Info";

export default function RestaurantDetails() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    const getInfo = async () => {
      try {
        setLoading(true);
        setError("");

        const [restaurantRes, menuRes] = await Promise.all([
          axios.get(`http://localhost:8000/restaurants/${restaurantId}`),
          axios.get(`http://localhost:8000/api/restaurants/${restaurantId}`),
        ]);

        setRestaurant(restaurantRes.data.restaurant ?? restaurantRes.data);

        const items =
          menuRes.data.menuItems ?? menuRes.data.items ?? menuRes.data;

        setMenuItems(Array.isArray(items) ? items : []);
      } catch (err) {
        console.error("Restaurant details error:", err);
        setError("Unable to load this restaurant. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (restaurantId) getInfo();
    else {
      setError("Restaurant ID is missing.");
      setLoading(false);
    }
  }, [restaurantId]);

  const categories = useMemo(
    () => [
      "All",
      ...new Set(menuItems.map((item) => item.category).filter(Boolean)),
    ],
    [menuItems],
  );

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesSearch = `${item.name} ${item.description || ""}`
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory = category === "All" || item.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [menuItems, search, category]);

  if (loading) {
    return (
      <div className="zb-loading">
        <div className="spinner-border text-warning" />
        <p>Preparing something delicious...</p>
      </div>
    );
  }

  if (error) {
    return <div className="container py-5 text-center">{error}</div>;
  }

  if (!restaurant) {
    return <div className="container py-5">Restaurant not found.</div>;
  }

  return (
    <main className="zb-page">
      <div className="container zb-container">
        <button className="zb-back" onClick={() => navigate(-1)}>
          <span>←</span> Back to restaurants
        </button>

        {/* Restaurant hero */}
        <section className="zb-hero">
          <div className="zb-hero-content">
            <span className="zb-eyebrow">
              <span className="zb-live-dot" />
              YOUR NEXT FAVOURITE MEAL
            </span>

            <h1>{restaurant.name}</h1>

            <p className="zb-hero-description">
              {restaurant.description ||
                "Fresh flavours, delicious meals, delivered with love."}
            </p>

            <div className="zb-hero-meta">
              <span>🍽️ {restaurant.cuisine || "Made with care"}</span>
              <span>⚡ Freshly prepared</span>
            </div>

            {restaurant.address && (
              <p className="zb-address">
                📍{" "}
                {typeof restaurant.address === "object"
                  ? Object.values(restaurant.address).filter(Boolean).join(", ")
                  : restaurant.address}
              </p>
            )}

            <a href="#zb-menu" className="zb-hero-button">
              Explore menu <span>↘</span>
            </a>
          </div>

          <div className="zb-hero-image-wrap">
            {restaurant.image ? (
              <img
                src={restaurant.image}
                alt={restaurant.name}
                className="zb-hero-image"
              />
            ) : (
              <div className="zb-hero-placeholder">🍕</div>
            )}
            <div className="zb-image-sticker">
              <span>MADE</span>
              <strong>FRESH</strong>
              <span>♥ DAILY</span>
            </div>
          </div>
        </section>

        {/* Menu heading */}
        <section id="zb-menu" className="zb-menu-section">
          <div className="zb-menu-heading">
            <div>
              <span className="zb-section-label">GOOD FOOD STARTS HERE</span>
              <h2>
                Explore the <span>menu.</span>
              </h2>
              <p>Find your cravings. We've got you covered.</p>
            </div>

            <div className="zb-menu-count">
              <strong>{filteredItems.length}</strong>
              <span>items to explore</span>
            </div>
          </div>

          {/* Search */}
          <div className="zb-search-wrap">
            <span>⌕</span>
            <input
              type="text"
              placeholder="Search dishes, flavours..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && <button onClick={() => setSearch("")}>✕</button>}
          </div>

          {/* Categories */}
          <div className="zb-categories">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`zb-category ${category === cat ? "active" : ""}`}
                onClick={() => setCategory(cat)}
              >
                {cat === "All" ? "✦ " : ""}
                {cat}
              </button>
            ))}
          </div>

          {/* Menu cards */}
          {filteredItems.length === 0 ? (
            <div className="zb-empty">
              <span>🍽️</span>
              <h3>No dishes found</h3>
              <p>Try another search or category.</p>
              <button
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="zb-food-grid">
              {filteredItems.map((item) => (
                <article className="zb-food-card" key={item._id}>
                  <div className="zb-food-image-wrap">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="zb-food-image"
                        loading="lazy"
                      />
                    ) : (
                      <div className="zb-food-placeholder">🍴</div>
                    )}

                    <span
                      className={`zb-food-badge ${
                        /non.?veg|chicken|meat|fish|egg/i.test(
                          item.category || "",
                        )
                          ? "nonveg"
                          : "veg"
                      }`}
                    >
                      <span />
                      {item.category || "Chef's special"}
                    </span>
                  </div>

                  <div className="zb-food-content">
                    <div className="zb-food-title-row">
                      <h3>{item.name}</h3>
                      <strong className="zb-price">₹{item.price}</strong>
                    </div>

                    <p className="zb-food-description">
                      {item.description ||
                        "A delicious choice, prepared fresh for you."}
                    </p>

                    <div className="zb-food-footer">
                      <span>◷ {item.preparationTime || 15} min</span>
                      <button
                        className="zb-add-button"
                        onClick={() => navigate(`/items/${item._id}`)}
                      >
                        View item <InfoIcon />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="zb-bottom-banner">
          <div>
            <span>THE ZIPBITE PROMISE</span>
            <h3>Good food. Great mood.</h3>
            <p>Your next delicious moment is just a few clicks away.</p>
          </div>
          <span className="zb-banner-icon">🍔</span>
        </section>
      </div>
    </main>
  );
}
