import React from "react";
import RestaurantDashboard from "./RestaurantDashboard";
import OwnerSidebar from "./mainBox/OwnerSidebar";
import "./RestaurantOwner.css";

export default function RestaurantOwner() {
  return (
    <div className="owner-layout">
      <OwnerSidebar />
      <div className="owner-content">
        <RestaurantDashboard />
      </div>
    </div>
  );
}
