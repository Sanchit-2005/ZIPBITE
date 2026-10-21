import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import "./SearchMenu.css";

const RESTAURANT_FALLBACK = "https://placehold.co/600x400?text=Restaurant";
const FOOD_FALLBACK = "https://placehold.co/600x400?text=ZIPBITE+Food";

function SkeletonGrid({ count = 8 }) {
  return (
    <div className="sm-grid" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div className="sm-skel" key={i}>
          <div className="sm-skel-img" />
          <div className="sm-skel-body">
            <div className="sm-skel-line w-70" />
            <div className="sm-skel-line w-40" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SectionHeader({ title, count }) {
  return (
    <div className="sm-section-head">
      <h2 className="sm-section-title">{title}</h2>
      <span className="sm-section-count">{count}</span>
    </div>
  );
}

export default function SearchMenu() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [restaurants, setRestaurants] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!query.trim()) {
      setRestaurants([]);
      setMenuItems([]);
      setError("");
      return;
    }

    // Cancels the request if the query changes or the page unmounts,
    // so a slow old response can't overwrite newer results.
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await axios.get(
          "http://localhost:8000/searchbox/search",
          { params: { q: query }, signal: controller.signal },
        );

        setRestaurants(response.data.restaurants || []);
        setMenuItems(response.data.menuItems || []);
      } catch (err) {
        if (axios.isCancel(err)) return;

        console.error("Search error:", err.response?.data || err.message);
        setError(
          "We couldn't load your results. Check your connection and try again.",
        );
        setRestaurants([]);
        setMenuItems([]);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [query, reloadKey]);

  const total = restaurants.length + menuItems.length;

  const useFallback = (fallback) => (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = fallback;
  };

  return (
    <div className="sm">
      <div className="container">
        {/* Header */}
        <header className="sm-header">
          <h1 className="sm-title">
            {query.trim() ? (
              <>
                Results for <span className="sm-query">"{query}"</span>
              </>
            ) : (
              "Search"
            )}
          </h1>
          {!isLoading && !error && query.trim() && (
            <p className="sm-count" aria-live="polite">
              {total} {total === 1 ? "result" : "results"} found
            </p>
          )}
        </header>

        {/* Loading */}
        {isLoading && (
          <div role="status" aria-label="Searching">
            <SkeletonGrid />
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <div className="sm-state" role="alert">
            <div className="sm-state-icon" aria-hidden="true">
              ⚠️
            </div>
            <h2>Something went wrong</h2>
            <p>{error}</p>
            <button
              type="button"
              className="sm-btn"
              onClick={() => setReloadKey((k) => k + 1)}
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty query */}
        {!isLoading && !error && !query.trim() && (
          <div className="sm-state">
            <div className="sm-state-icon" aria-hidden="true">
              🔍
            </div>
            <h2>What are you craving?</h2>
            <p>Type a dish or restaurant name in the search bar.</p>
          </div>
        )}

        {/* No results */}
        {!isLoading && !error && query.trim() && total === 0 && (
          <div className="sm-state">
            <div className="sm-state-icon" aria-hidden="true">
              🍽️
            </div>
            <h2>No matches for "{query}"</h2>
            <p>
              Check the spelling or try a broader term like "pizza" or
              "biryani".
            </p>
          </div>
        )}

        {/* Results */}
        {!isLoading && !error && total > 0 && (
          <>
            {restaurants.length > 0 && (
              <section className="sm-section">
                <SectionHeader title="Restaurants" count={restaurants.length} />

                <div className="sm-grid">
                  {restaurants.map((restaurant) => (
                    <Link
                      key={restaurant._id}
                      to={`/restaurants/${restaurant._id}`}
                      className="sm-card"
                    >
                      <div className="sm-media">
                        <img
                          src={restaurant.image || RESTAURANT_FALLBACK}
                          alt={restaurant.name}
                          loading="lazy"
                          onError={useFallback(RESTAURANT_FALLBACK)}
                        />
                      </div>
                      <div className="sm-body">
                        <h3 className="sm-name">{restaurant.name}</h3>
                        <p className="sm-meta">
                          {Array.isArray(restaurant.cuisineTypes)
                            ? restaurant.cuisineTypes.join(", ")
                            : restaurant.cuisineTypes || "Restaurant"}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {menuItems.length > 0 && (
              <section className="sm-section">
                <SectionHeader title="Food items" count={menuItems.length} />

                <div className="sm-grid">
                  {menuItems.map((item) => (
                    <Link
                      key={item._id}
                      to={`/items/${item._id}`}
                      className="sm-card"
                    >
                      <div className="sm-media">
                        <img
                          src={item.image || FOOD_FALLBACK}
                          alt={item.name}
                          loading="lazy"
                          onError={useFallback(FOOD_FALLBACK)}
                        />
                        {item.price != null && (
                          <span className="sm-price">₹{item.price}</span>
                        )}
                      </div>
                      <div className="sm-body">
                        <h3 className="sm-name">{item.name}</h3>
                        {item.restaurant?.name && (
                          <p className="sm-from">
                            from <strong>{item.restaurant.name}</strong>
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
