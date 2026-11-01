import React from "react";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";

const COLORS = ["#4a5fa5", "#e8433f", "#2a9d8f", "#f4a63a"];
const RADIUS = 70;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP = 3; // small gap between segments

export default function SalesByCategory({ data = [], onSeeMore }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let offset = 0;

  return (
    <div className="sales-card">
      <div className="sales-card__header">
        <h3>Sales by category</h3>
        <button className="sales-card__more" onClick={onSeeMore}>
          See More <OpenInFullIcon sx={{ fontSize: 14 }} />
        </button>
      </div>

      {total === 0 ? (
        <p className="sales-card__empty">No sales data yet.</p>
      ) : (
        <div className="sales-card__body">
          <div className="sales-card__chart">
            <svg viewBox="0 0 180 180" width="180" height="180">
              {data.map((d, i) => {
                const length = (d.value / total) * CIRCUMFERENCE;
                const segment = (
                  <circle
                    key={d.name}
                    cx="90"
                    cy="90"
                    r={RADIUS}
                    fill="none"
                    stroke={COLORS[i % COLORS.length]}
                    strokeWidth="18"
                    strokeDasharray={`${Math.max(length - GAP, 0)} ${CIRCUMFERENCE}`}
                    strokeDashoffset={-offset}
                    transform="rotate(-90 90 90)"
                  />
                );
                offset += length;
                return segment;
              })}
            </svg>

            <div className="sales-card__center">
              <RestaurantMenuIcon sx={{ fontSize: 32, color: "#ff6b35" }} />
            </div>
          </div>

          <ul className="sales-card__legend">
            {data.map((d, i) => (
              <li key={d.name}>
                <span
                  className="dot"
                  style={{ background: COLORS[i % COLORS.length] }}
                />
                <span className="name">{d.name}</span>
                <span className="value">
                  ₹{d.value.toLocaleString("en-IN")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
