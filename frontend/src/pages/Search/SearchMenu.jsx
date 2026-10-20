import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

export default function SearchMenu() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const query = searchParams.get("q") || "";

  const [restaurants, setRestaurants] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!query.trim()) {
        setRestaurants([]);
        setMenuItems([]);
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const response = await axios.get(
          "http://localhost:8000/searchbox/search",
          { params: { q: query } },
        );

        console.log("Search API response:", response.data);

        setRestaurants(response.data.restaurants || []);
        setMenuItems(response.data.menuItems || []);
      } catch (err) {
        console.error("Search error:", err.response?.data || err.message);

        setError("Failed to load search results.");
        setRestaurants([]);
        setMenuItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [query]);

  if (isLoading) {
    return <div className="container py-4">Searching...</div>;
  }

  if (error) {
    return <div className="container py-4">{error}</div>;
  }

  return (
    <div className="container py-4">
      <h2>Search results for "{query}"</h2>

      {!restaurants.length && !menuItems.length ? (
        <p>No matching restaurants or food items found.</p>
      ) : (
        <>
          {/* Restaurants */}
          {restaurants.length > 0 && (
            <section className="mb-5">
              <h3 className="mb-3">Restaurants</h3>

              <div className="row g-3">
                {restaurants.map((restaurant) => (
                  <div className="col-6 col-md-4 col-lg-3" key={restaurant._id}>
                    <article
                      className="card h-100"
                      style={{ cursor: "pointer" }}
                      onClick={() => navigate(`/restaurants/${restaurant._id}`)}
                    >
                      <img
                        src={
                          restaurant.image ||
                          "https://placehold.co/600x400?text=Restaurant"
                        }
                        alt={restaurant.name}
                        className="card-img-top"
                        style={{ height: 160, objectFit: "cover" }}
                      />

                      <div className="card-body">
                        <h5>{restaurant.name}</h5>
                        <p>
                          {Array.isArray(restaurant.cuisineTypes)
                            ? restaurant.cuisineTypes.join(", ")
                            : restaurant.cuisineTypes || "Restaurant"}
                        </p>
                      </div>
                    </article>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/*  items */}
          {menuItems.length > 0 && (
            <section>
              <h3 className="mb-3">Food Items</h3>

              <div className="row g-3">
                {menuItems.map((item) => (
                  <div className="col-6 col-md-4 col-lg-3" key={item._id}>
                    <article
                      className="card h-100"
                      style={{ cursor: "pointer" }}
                      onClick={() => navigate(`/items/${item._id}`)}
                    >
                      <img
                        src={
                          item.image ||
                          "https://placehold.co/600x400?text=ZIPBITE+Food"
                        }
                        alt={item.name}
                        className="card-img-top"
                        style={{ height: 160, objectFit: "cover" }}
                      />

                      <div className="card-body">
                        <h5>{item.name}</h5>
                        <p>₹{item.price}</p>

                        {item.restaurant?.name && (
                          <small className="text-secondary">
                            {item.restaurant.name}
                          </small>
                        )}
                      </div>
                    </article>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
