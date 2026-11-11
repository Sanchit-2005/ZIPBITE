import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Star,
  Store,
  Truck,
  UserRound,
} from "lucide-react";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";

import { useRestaurantOwner } from "../../../context/RestaurantOwnerContext";
import OwnerSidebar from "../mainBox/OwnerSidebar";
import "../RestaurantOwner.css";
import "./RestaurantOwnerProfile.css";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const ROLE_LABELS = {
  restaurant: "Restaurant owner",
  customer: "Customer",
  delivery: "Delivery partner",
  admin: "Administrator",
};

const moneyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const integerFormatter = new Intl.NumberFormat("en-IN");

const formatMoney = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? moneyFormatter.format(amount) : "Not set";
};

const formatMonthYear = (value) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

const getInitials = (name) =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

const hideBrokenImage = (event) => {
  event.currentTarget.style.display = "none";
};

const parseTimeToMinutes = (value) => {
  if (!value) return null;

  const match = String(value)
    .trim()
    .match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*([AaPp][Mm])?$/);

  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3] ? match[3].toLowerCase() : null;

  if (!Number.isInteger(hours) || hours > 23 || minutes > 59) return null;

  if (meridiem) {
    if (hours > 12) return null;
    if (hours === 12) hours = 0;
    if (meridiem === "pm") hours += 12;
  }

  return hours * 60 + minutes;
};

const formatTime = (value) => {
  const total = parseTimeToMinutes(value);
  if (total === null) return "";

  const hours24 = Math.floor(total / 60);
  const minutes = String(total % 60).padStart(2, "0");
  const meridiem = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 || 12;

  return `${hours12}:${minutes} ${meridiem}`;
};

const getTodayName = () =>
  new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date());

const buildWeekHours = (openingHours) => {
  const slots = Array.isArray(openingHours) ? openingHours : [];
  const today = getTodayName();

  return DAYS.map((day) => {
    const entry = slots.find((slot) => slot?.day === day) || null;
    const isClosed = entry?.isClosed === true;
    const openLabel = formatTime(entry?.openTime);
    const closeLabel = formatTime(entry?.closeTime);
    const hasTimes =
      Boolean(entry) &&
      !isClosed &&
      Boolean(openLabel) &&
      Boolean(closeLabel);

    let hasSpan = false;
    let startPct = 0;
    let widthPct = 0;

    if (hasTimes) {
      const start = parseTimeToMinutes(entry.openTime);
      const end = parseTimeToMinutes(entry.closeTime);

      if (start !== null && end !== null) {
        // Hours that close after midnight run to the end of the axis.
        const endClamped = end <= start ? 1440 : end;
        startPct = (start / 1440) * 100;
        widthPct = Math.max(((endClamped - start) / 1440) * 100, 1.2);
        hasSpan = true;
      }
    }

    return {
      day,
      isToday: day === today,
      closed: isClosed,
      hasEntry: Boolean(entry),
      hasTimes,
      hasSpan,
      startPct,
      widthPct,
      label: isClosed
        ? "Closed"
        : hasTimes
          ? `${openLabel} – ${closeLabel}`
          : "Not set",
    };
  });
};

export default function RestaurantOwnerProfile() {
  const { ownerDetail, fetchOwnerInfo } = useRestaurantOwner();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOwnerInfo();
  }, [fetchOwnerInfo]);

  const owner =
    ownerDetail?.owner && typeof ownerDetail.owner === "object"
      ? ownerDetail.owner
      : null;
  const restaurant = ownerDetail || null;
  const ready = Boolean(owner);

  const displayName = owner?.name?.trim() || "";
  const email = owner?.email?.trim() || "";
  const phone = owner?.phone?.trim() || "";
  const initials = getInitials(displayName);
  const roleLabel = ROLE_LABELS[owner?.role] || owner?.role || "Account";

  const restaurantName = restaurant?.name?.trim() || "";
  const description = restaurant?.description?.trim() || "";
  const cuisines = Array.isArray(restaurant?.cuisineTypes)
    ? restaurant.cuisineTypes.filter(
        (item) => typeof item === "string" && item.trim(),
      )
    : [];

  const address = restaurant?.address || {};
  const cityLine = [
    [address.city, address.state].filter(Boolean).join(", "),
    address.postalCode,
  ]
    .filter(Boolean)
    .join(" ");
  const addressLines = [address.street, cityLine, address.country]
    .map((line) => (typeof line === "string" ? line.trim() : ""))
    .filter(Boolean);

  const deliveryTime = Number(restaurant?.deliveryTime);
  const deliveryTimeLabel =
    Number.isFinite(deliveryTime) && deliveryTime > 0
      ? `${deliveryTime} min`
      : "Not set";
  const minimumOrderLabel =
    restaurant?.minimumOrderAmount === undefined ||
    restaurant?.minimumOrderAmount === null
      ? "Not set"
      : formatMoney(restaurant.minimumOrderAmount);
  const deliveryFeeLabel =
    restaurant?.deliveryFee === undefined ||
    restaurant?.deliveryFee === null
      ? "Not set"
      : formatMoney(restaurant.deliveryFee);

  const ratingValue = Number(restaurant?.rating) || 0;
  const ratingCount = Number(restaurant?.totalRatings) || 0;
  const hasRating = ratingCount > 0;

  const openState =
    typeof restaurant?.isOpen === "boolean"
      ? restaurant.isOpen
        ? "open"
        : "closed"
      : null;

  const week = buildWeekHours(restaurant?.openingHours);
  const hasHours = week.some((day) => day.hasEntry);

  const sinceLabel = formatMonthYear(restaurant?.createdAt);
  const telHref = phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : null;

  const handleEdit = () => {
    navigate("/restaurant-owner/profile/edit");
  };

  return (
    <div className="owner-layout">
      <OwnerSidebar />
      <div className="owner-content">
        <div className="opp-page">
          <div className="opp-shell">
            <header className="opp-head">
              <div className="opp-head-text">
                <h1 className="opp-title">Profile</h1>
                {restaurantName ? (
                  <p className="opp-sub">
                    <Store size={15} aria-hidden="true" />
                    {restaurantName}
                  </p>
                ) : null}
              </div>

              <Button
                className="opp-edit"
                variant="contained"
                disableElevation
                disabled={!ready}
                startIcon={<Pencil size={15} aria-hidden="true" />}
                onClick={handleEdit}
              >
                Edit profile
              </Button>
            </header>

            {!ready ? (
              <>
                <div className="opp-ledger" aria-hidden="true">
                  <aside className="opp-spine opp-skel-spine">
                    <span className="opp-skel opp-skel-avatar" />
                    <span className="opp-skel opp-skel-name" />
                    <span className="opp-skel opp-skel-role" />
                    <div className="opp-skel-contact">
                      <span className="opp-skel" />
                      <span className="opp-skel" />
                    </div>
                    <span className="opp-skel opp-skel-foot" />
                  </aside>

                  <div className="opp-record">
                    <div className="opp-skel-placard">
                      <span className="opp-skel opp-skel-mark" />
                      <div className="opp-skel-lines">
                        <span className="opp-skel opp-skel-line-lg" />
                        <span className="opp-skel opp-skel-line-sm" />
                      </div>
                    </div>

                    <div className="opp-skel-rows">
                      {[0, 1, 2].map((row) => (
                        <div className="opp-skel-row" key={row}>
                          <span className="opp-skel opp-skel-label" />
                          <span className="opp-skel opp-skel-value" />
                        </div>
                      ))}
                    </div>

                    <div className="opp-skel-hours">
                      <span className="opp-skel opp-skel-line-md" />
                      {[0, 1, 2, 3, 4, 5, 6].map((row) => (
                        <span className="opp-skel opp-skel-hour" key={row} />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="opp-sr-only" role="status">
                  Loading your profile…
                </p>
              </>
            ) : (
              <div className="opp-ledger">
                <aside className="opp-spine" aria-label="Owner account">
                  <span
                    className={`opp-avatar${owner.image ? " has-image" : ""}`}
                  >
                    <span className="opp-avatar-fallback" aria-hidden="true">
                      {initials ? (
                        initials
                      ) : (
                        <UserRound size={30} aria-hidden="true" />
                      )}
                    </span>
                    {owner.image ? (
                      <img
                        src={owner.image}
                        alt={
                          displayName
                            ? `${displayName} profile photo`
                            : "Profile photo"
                        }
                        onError={hideBrokenImage}
                      />
                    ) : null}
                  </span>

                  <h2 className="opp-name">{displayName || "Unnamed owner"}</h2>
                  <p className="opp-role">{roleLabel}</p>

                  <dl className="opp-contact">
                    <div>
                      <dt>
                        <Mail size={13} aria-hidden="true" />
                        Email
                      </dt>
                      <dd>
                        {email ? (
                          <a className="opp-link" href={`mailto:${email}`}>
                            {email}
                          </a>
                        ) : (
                          <span className="opp-missing">Not provided</span>
                        )}
                      </dd>
                    </div>

                    <div>
                      <dt>
                        <Phone size={13} aria-hidden="true" />
                        Phone
                      </dt>
                      <dd>
                        {phone && telHref ? (
                          <a className="opp-link" href={telHref}>
                            {phone}
                          </a>
                        ) : (
                          <span className="opp-missing">Not provided</span>
                        )}
                      </dd>
                    </div>
                  </dl>

                  {sinceLabel ? (
                    <footer className="opp-spine-foot">
                      <span>On Zipbite since</span>
                      <b>{sinceLabel}</b>
                    </footer>
                  ) : null}
                </aside>

                <section className="opp-record" aria-label="Restaurant profile">
                  <div className="opp-placard">
                    <span className="opp-mark" aria-hidden="true">
                      <Store size={26} />
                      {restaurant?.image ? (
                        <img
                          src={restaurant.image}
                          alt=""
                          loading="lazy"
                          onError={hideBrokenImage}
                        />
                      ) : null}
                    </span>

                    <div className="opp-placard-text">
                      <h2 className="opp-restaurant-name">
                        {restaurantName || "Restaurant name not set"}
                      </h2>
                      {cuisines.length ? (
                        <div className="opp-cuisines">
                          {cuisines.map((cuisine) => (
                            <Chip
                              key={cuisine}
                              className="opp-cuisine"
                              label={cuisine}
                              size="small"
                            />
                          ))}
                        </div>
                      ) : (
                        <p className="opp-cuisines-empty">Cuisines not set</p>
                      )}
                    </div>

                    {openState ? (
                      <span className={`opp-open is-${openState}`}>
                        <span aria-hidden="true" />
                        {openState === "open" ? "Open now" : "Closed"}
                      </span>
                    ) : null}
                  </div>

                  {description ? (
                    <p className="opp-description">{description}</p>
                  ) : null}

                  <dl className="opp-rows">
                    <div className="opp-fact-row">
                      <dt>
                        <MapPin size={14} aria-hidden="true" />
                        Address
                      </dt>
                      <dd>
                        {addressLines.length ? (
                          <address className="opp-address">
                            {addressLines.map((line) => (
                              <span key={line}>{line}</span>
                            ))}
                          </address>
                        ) : (
                          <span className="opp-missing">Not provided</span>
                        )}
                      </dd>
                    </div>

                    <div className="opp-fact-row">
                      <dt>
                        <Truck size={14} aria-hidden="true" />
                        Delivery
                      </dt>
                      <dd>
                        <div className="opp-inline-facts">
                          <span>
                            <em>Time</em>
                            <b>{deliveryTimeLabel}</b>
                          </span>
                          <span>
                            <em>Minimum order</em>
                            <b>{minimumOrderLabel}</b>
                          </span>
                          <span>
                            <em>Fee</em>
                            <b>{deliveryFeeLabel}</b>
                          </span>
                        </div>
                      </dd>
                    </div>

                    <div className="opp-fact-row">
                      <dt>
                        <Star size={13} aria-hidden="true" />
                        Rating
                      </dt>
                      <dd>
                        {hasRating ? (
                          <span className="opp-rating">
                            <b>{ratingValue.toFixed(1)}</b>
                            <span>
                              {integerFormatter.format(ratingCount)}{" "}
                              {ratingCount === 1 ? "rating" : "ratings"}
                            </span>
                          </span>
                        ) : (
                          <span className="opp-missing">No ratings yet</span>
                        )}
                      </dd>
                    </div>
                  </dl>

                  <div className="opp-hours">
                    <h3 className="opp-hours-title">
                      <Clock size={14} aria-hidden="true" />
                      Opening hours
                    </h3>

                    {hasHours ? (
                      <dl className="opp-hours-list">
                        {week.map((day) => (
                          <div
                            key={day.day}
                            className={`opp-hour-row${day.isToday ? " is-today" : ""}${day.closed ? " is-closed" : ""}`}
                          >
                            <dt>
                              {day.day}
                              {day.isToday ? (
                                <span className="opp-today-tag">Today</span>
                              ) : null}
                            </dt>
                            <dd>
                              <span
                                className="opp-hour-track"
                                aria-hidden="true"
                              >
                                {day.hasSpan ? (
                                  <span
                                    className="opp-hour-band"
                                    style={{
                                      "--start": `${day.startPct}%`,
                                      "--span": `${day.widthPct}%`,
                                    }}
                                  />
                                ) : null}
                              </span>
                              <span
                                className={`opp-hour-time${day.hasTimes ? "" : " is-muted"}`}
                              >
                                {day.label}
                              </span>
                            </dd>
                          </div>
                        ))}
                      </dl>
                    ) : (
                      <p className="opp-hours-empty">Opening hours not set.</p>
                    )}
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
