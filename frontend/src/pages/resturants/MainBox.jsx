import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./RestaurantBox.css";
import InfoIcon from '@mui/icons-material/Info';

export default function MainBox() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await axios.get("http://localhost:8000/restaurants");

        console.log("Restaurants:", response.data.restaurants);

        setRestaurants(response.data.restaurants || []);
      } catch (err) {
        console.error(
          "Failed to fetch restaurants:",
          err.response?.data || err.message,
        );
        setError("Unable to load restaurants. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-danger" role="status" />
        <p className="mt-3">Finding delicious food near you...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <main className="restaurant-page container-fluid">
      <div className="restaurant-heading">
        <div>
          <span className="restaurant-eyebrow">
            DISCOVER YOUR NEXT FAVOURITE
          </span>
          <h1>Restaurants near you</h1>
          <p>Discover delicious meals from your favourite places.</p>
        </div>

        <span className="restaurant-count">
          {restaurants.length} restaurants
        </span>
      </div>

      {restaurants.length === 0 ? (
        <div className="restaurant-empty">
          <span>🍽️</span>
          <h3>No restaurants available</h3>
          <p>Please check back later for delicious options.</p>
        </div>
      ) : (
        <div className="row restaurant-grid">
          {restaurants.map((restaurant) => {
            const cuisines = Array.isArray(restaurant.cuisineTypes)
              ? restaurant.cuisineTypes
              : [];

            return (
              <div
                className="col-12 col-sm-6 col-lg-4 restaurant-column"
                key={restaurant._id}
              >
                <article
                  className="restaurant-card"
                  onClick={() => navigate(`/restaurants/${restaurant._id}`)}
                  role="link"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      navigate(`/restaurants/${restaurant._id}`);
                    }
                  }}
                  aria-label={`View ${restaurant.name}`}
                >
                  <div className="restaurant-image-wrap">
                    <img
                      src={
                        restaurant.image ||
                        "https://placehold.co/700x450?text=ZIPBITE"
                      }
                      alt={restaurant.name}
                      className="restaurant-image"
                      loading="lazy"
                    />

                    {!restaurant.isOpen && (
                      <span className="restaurant-closed">
                        Currently closed
                      </span>
                    )}

                    <span className="restaurant-delivery-badge">
                      {restaurant.deliveryTime || 30} min
                    </span>
                  </div>

                  <div className="restaurant-card-content">
                    <div className="restaurant-title-row">
                      <h2 title={restaurant.name}>{restaurant.name}</h2>

                      <span className="restaurant-rating">
                        {Number(restaurant.rating || 0).toFixed(1)}
                        <span> ★</span>
                      </span>
                    </div>

                    <div className="restaurant-details-row">
                      <p
                        className="restaurant-cuisines"
                        title={cuisines.join(", ")}
                      >
                        {cuisines.length
                          ? cuisines.join(", ")
                          : "Delicious food"}
                      </p>

                      <span className="restaurant-price">
                        {restaurant.minimumOrderAmount > 0
                          ? `₹${restaurant.minimumOrderAmount} min order`
                          : "View menu"}
                      </span>
                    </div>

                    <div className="restaurant-bottom-row">
                      <span className="restaurant-location">
                        <span>⌖</span>{" "}
                        {restaurant.address?.city || "Local restaurant"}
                      </span>

                      <span className="restaurant-delivery-time">
                        ◷ {restaurant.deliveryTime || 30} min
                      </span>
                    </div>
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
