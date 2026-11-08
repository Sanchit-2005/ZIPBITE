import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Clock,
  Pencil,
  Plus,
  Store,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import Switch from "@mui/material/Switch";

import { useRestaurantOwner } from "../../../context/RestaurantOwnerContext";
import OwnerSidebar from "../mainBox/OwnerSidebar";
import "../RestaurantOwner.css";
import "./RestaurantOwnerMenu.css";

const FILTERS = ["All", "Veg", "Non-veg", "Vegan"];

const priceFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const formatPrice = (value) => priceFormatter.format(Number(value) || 0);

const hideBrokenImage = (event) => {
  event.currentTarget.style.display = "none";
  event.currentTarget.parentElement?.classList.add("is-fallback");
};

export default function RestaurantOwnerMenu() {
  const navigate = useNavigate();
  const { ownerDetail, fetchOwnerInfo } = useRestaurantOwner();

  const [menuItems, setMenuItems] = useState([]);
  const [filter, setFilter] = useState("All");
  const [originalMenuItems, setOriginalMenuItems] = useState([]);

  // Presentation-only state (no effect on the data flow below).
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [activeCollection, setActiveCollection] = useState("available");

  // A toggled dish is re-mounted in the other collection, so restore focus to it.
  const focusAfterMove = useRef(null);

  useEffect(() => {
    fetchOwnerInfo();
  }, [fetchOwnerInfo]);

  useEffect(() => {
    const fetchMenuItems = async () => {
      if (!ownerDetail?._id) return;

      setIsLoading(true);
      setLoadFailed(false);

      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          `http://localhost:8000/api/restaurants/${ownerDetail._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const items = Array.isArray(response.data)
          ? response.data
          : response.data?.items || response.data?.menuItems || [];

        setOriginalMenuItems(items);
        setMenuItems(items);
      } catch (error) {
        console.error("Error fetching menu:", error);
        setLoadFailed(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuItems();
  }, [ownerDetail?._id, reloadKey]);

  useEffect(() => {
    const moved = focusAfterMove.current;
    if (!moved) return;

    focusAfterMove.current = null;

    const movedSwitch = document.querySelector(
      `[data-rmn-item="${moved.id}"] .MuiSwitch-input`,
    );

    // On phones the new collection can be on the other tab; focus that tab instead.
    const target =
      movedSwitch && movedSwitch.offsetParent !== null
        ? movedSwitch
        : document.querySelector(
            `.rmn-tab[data-collection="${moved.collection}"]`,
          );

    target?.focus({ preventScroll: true });
  }, [menuItems]);

  const safeMenuItems = Array.isArray(menuItems) ? menuItems : [];
  const safeOriginalMenuItems = Array.isArray(originalMenuItems)
    ? originalMenuItems
    : [];

  // Calculate available items
  const availableItems = safeMenuItems.filter(
    (item) => item.isAvailable === true,
  );

  const unavailableItems = safeMenuItems.filter(
    (item) => item.isAvailable !== true,
  );

  const handleDelete = async (itemId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://localhost:8000/api/menu-item/${itemId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMenuItems((prevItems) =>
        (Array.isArray(prevItems) ? prevItems : []).filter(
          (item) => item._id !== itemId,
        ),
      );
      setOriginalMenuItems((prevItems) =>
        (Array.isArray(prevItems) ? prevItems : []).filter(
          (item) => item._id !== itemId,
        ),
      );
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleSwitch = async (event, item) => {
    const token = localStorage.getItem("token");
    const isAvailable = event.target.checked;

    try {
      const response = await axios.patch(
        `http://localhost:8000/api/menu-item/manageItemAvaibility/${item._id}`,
        { isAvailable },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const updatedAvailability = response.data?.item?.isAvailable ?? isAvailable;

      focusAfterMove.current = {
        id: item._id,
        collection: updatedAvailability ? "available" : "unavailable",
      };

      setMenuItems((prevItems) =>
        (Array.isArray(prevItems) ? prevItems : []).map((i) =>
          i._id === item._id
            ? { ...i, isAvailable: updatedAvailability }
            : i,
        ),
      );
      setOriginalMenuItems((prevItems) =>
        (Array.isArray(prevItems) ? prevItems : []).map((i) =>
          i._id === item._id
            ? { ...i, isAvailable: updatedAvailability }
            : i,
        ),
      );
    } catch (error) {
      console.error("Error updating availability:", error);
    }
  };

  const handleFilter = (value) => {
    setFilter(value);

    if (value === "All") {
      setMenuItems(safeOriginalMenuItems);
    } else {
      setMenuItems(
        safeOriginalMenuItems.filter((item) => item.category === value),
      );
    }
  };

  const countForFilter = (value) =>
    value === "All"
      ? safeOriginalMenuItems.length
      : safeOriginalMenuItems.filter((item) => item.category === value).length;

  const isInitialLoading = !ownerDetail || isLoading;
  const hasNoItems = safeOriginalMenuItems.length === 0;
  const hasNoFilteredItems = safeMenuItems.length === 0;

  const handleRetry = () => {
    setLoadFailed(false);
    setIsLoading(true);
    setReloadKey((key) => key + 1);
  };

  const renderRow = (item) => (
    <li className="rmn-row" key={item._id} data-rmn-item={item._id}>
      <span className={`rmn-thumb${item.image ? "" : " is-fallback"}`}>
        {item.image ? (
          <img
            src={item.image}
            alt=""
            loading="lazy"
            onError={hideBrokenImage}
          />
        ) : null}
        <UtensilsCrossed size={18} aria-hidden="true" />
      </span>

      <div className="rmn-row-body">
        <h3 className="rmn-row-name">{item.name}</h3>
        <p className={`rmn-row-desc${item.description ? "" : " is-missing"}`}>
          {item.description || "No description"}
        </p>

        <div className="rmn-meta">
          <span className="rmn-meta-category">
            {item.category || "Uncategorized"}
          </span>
          <span className="rmn-meta-sep" aria-hidden="true"></span>
          <span className="rmn-meta-price">{formatPrice(item.price)}</span>
          <span className="rmn-meta-sep" aria-hidden="true"></span>
          <span className="rmn-meta-time">
            <Clock size={13} aria-hidden="true" />
            {item.preparationTime ? `${item.preparationTime} min` : "—"}
          </span>
        </div>
      </div>

      <div className="rmn-controls">
        <FormControlLabel
          className="rmn-switch"
          control={
            <Switch
              checked={item.isAvailable === true}
              onChange={(event) => handleSwitch(event, item)}
              slotProps={{
                input: { "aria-label": `${item.name} availability` },
              }}
            />
          }
          label={item.isAvailable === true ? "Available" : "Unavailable"}
        />

        <div className="rmn-actions">
          <IconButton
            className="rmn-icon"
            size="small"
            aria-label={`Edit ${item.name}`}
            title="Edit item"
            onClick={() =>
              navigate(`/restaurant-owner/menu/editItem/${item._id}`)
            }
          >
            <Pencil size={16} aria-hidden="true" />
          </IconButton>

          <IconButton
            className="rmn-icon rmn-icon--danger"
            size="small"
            aria-label={`Delete ${item.name}`}
            title="Delete item"
            onClick={() => handleDelete(item._id)}
          >
            <Trash2 size={16} aria-hidden="true" />
          </IconButton>
        </div>
      </div>
    </li>
  );

  const renderCollection = (variant, items) => {
    const isAvailable = variant === "available";

    return (
      <section
        className={`rmn-col rmn-col--${variant}`}
        aria-labelledby={`rmn-col-${variant}`}
      >
        <div className="rmn-col-head">
          <h2 className="rmn-col-title" id={`rmn-col-${variant}`}>
            <span
              className={`rmn-col-dot rmn-col-dot--${variant}`}
              aria-hidden="true"
            ></span>
            {isAvailable ? "Available" : "Unavailable"}
          </h2>
          <span className="rmn-count">{items.length}</span>
        </div>

        {items.length === 0 ? (
          <p className="rmn-col-empty">
            {isAvailable
              ? "No available items in this view."
              : "No unavailable items in this view."}
          </p>
        ) : (
          <ul className="rmn-list">{items.map(renderRow)}</ul>
        )}
      </section>
    );
  };

  return (
    <div className="owner-layout">
      <OwnerSidebar />
      <div className="owner-content">
        <div className="rmn-page">
          <div className="rmn-shell">
            <header className="rmn-head">
              <div className="rmn-head-text">
                <h1 className="rmn-title">Menu management</h1>
                {ownerDetail?.name ? (
                  <p className="rmn-sub">
                    <Store size={15} aria-hidden="true" />
                    {ownerDetail.name}
                  </p>
                ) : null}
              </div>

              <Button
                className="rmn-add"
                variant="contained"
                disableElevation
                startIcon={<Plus size={16} aria-hidden="true" />}
                onClick={() => navigate("/restaurant-owner/menu/addNewItem")}
              >
                Add new item
              </Button>
            </header>

            {loadFailed ? (
              <div className="rmn-empty">
                <span className="rmn-empty-icon rmn-empty-icon--alert">
                  <AlertCircle size={22} aria-hidden="true" />
                </span>
                <h2>Menu couldn&rsquo;t be loaded</h2>
                <p>The menu request failed. Try again.</p>
                <Button
                  className="rmn-empty-action"
                  variant="outlined"
                  disableElevation
                  onClick={handleRetry}
                >
                  Try again
                </Button>
              </div>
            ) : isInitialLoading ? (
              <>
                <div className="rmn-skeleton" aria-hidden="true">
                  <div className="rmn-skel-toolbar" />
                  <div className="rmn-skel-panels">
                    {[0, 1].map((panel) => (
                      <div className="rmn-skel-panel" key={panel}>
                        <div className="rmn-skel-head" />
                        {[0, 1, 2, 3].map((row) => (
                          <div className="rmn-skel-row" key={row}>
                            <span className="rmn-skel-thumb" />
                            <div className="rmn-skel-lines">
                              <span />
                              <span />
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
                <p className="rmn-sr-only" role="status">
                  Loading menu…
                </p>
              </>
            ) : (
              <>
                {hasNoItems ? null : (
                  <div className="rmn-toolbar">
                    <div
                      className="rmn-filters"
                      role="group"
                      aria-label="Filter menu items by category"
                    >
                      {FILTERS.map((option) => (
                        <button
                          type="button"
                          key={option}
                          className={`rmn-filter${
                            filter === option ? " is-active" : ""
                          }`}
                          aria-pressed={filter === option}
                          onClick={() => handleFilter(option)}
                        >
                          {option}
                          <span className="rmn-filter-count">
                            {countForFilter(option)}
                          </span>
                        </button>
                      ))}
                    </div>

                    <span className="rmn-total">
                      <strong>{safeMenuItems.length}</strong>
                      {safeMenuItems.length === 1 ? " item" : " items"}
                    </span>
                  </div>
                )}

                {hasNoItems ? (
                  <div className="rmn-empty">
                    <span className="rmn-empty-icon">
                      <UtensilsCrossed size={22} aria-hidden="true" />
                    </span>
                    <h2>No menu items yet</h2>
                    <p>Add your first item to start building the menu.</p>
                    <Button
                      className="rmn-empty-action rmn-empty-action--primary"
                      variant="contained"
                      disableElevation
                      startIcon={<Plus size={16} aria-hidden="true" />}
                      onClick={() =>
                        navigate("/restaurant-owner/menu/addNewItem")
                      }
                    >
                      Add new item
                    </Button>
                  </div>
                ) : hasNoFilteredItems ? (
                  <div className="rmn-empty">
                    <span className="rmn-empty-icon">
                      <UtensilsCrossed size={22} aria-hidden="true" />
                    </span>
                    <h2>No {filter} items</h2>
                    <p>There are no menu items in this category.</p>
                    <Button
                      className="rmn-empty-action"
                      variant="outlined"
                      disableElevation
                      onClick={() => handleFilter("All")}
                    >
                      Show all items
                    </Button>
                  </div>
                ) : (
                  <>
                    <div
                      className="rmn-tabs"
                      role="group"
                      aria-label="Choose availability view"
                    >
                      <button
                        type="button"
                        className="rmn-tab"
                        data-collection="available"
                        aria-pressed={activeCollection === "available"}
                        onClick={() => setActiveCollection("available")}
                      >
                        Available
                        <span>{availableItems.length}</span>
                      </button>
                      <button
                        type="button"
                        className="rmn-tab"
                        data-collection="unavailable"
                        aria-pressed={activeCollection === "unavailable"}
                        onClick={() => setActiveCollection("unavailable")}
                      >
                        Unavailable
                        <span>{unavailableItems.length}</span>
                      </button>
                    </div>

                    <div className="rmn-collections" data-active={activeCollection}>
                      {renderCollection("available", availableItems)}
                      {renderCollection("unavailable", unavailableItems)}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
