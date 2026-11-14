
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

import DashboardIcon from "@mui/icons-material/Dashboard";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import FilterFramesIcon from "@mui/icons-material/FilterFrames";
import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import ChatIcon from "@mui/icons-material/Chat";

import "./OwnerSidebar.css";

export default function OwnerSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    {
      name: "Dashboard",
      icon: <DashboardIcon />,
      path: "/restaurant-owner",
    },
    {
      name: "Orders",
      icon: <FilterFramesIcon />,
      path: "/restaurant-owner/orders",
    },
    {
      name: "Menu",
      icon: <RestaurantMenuIcon />,
      path: "/restaurant-owner/menu",
    },
    {
      name: "Messages",
      icon: <ChatIcon />,
      path: "/restaurant-owner/chats",
    },
    {
      name: "Profile",
      icon: <PermIdentityIcon />,
      path: "/restaurant-owner/profile",
    },
  ];

  return (
    <nav className="owner-sidebar">
      <h3 className="owner-sidebar__brand">Zipbite</h3>

      <ul className="owner-sidebar__list">
        {items.map((item) => {
          const isActive =
            item.path === "/restaurant-owner"
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);

          return (
            <li
              key={item.path}
              className={`owner-sidebar__item ${
                isActive ? "active" : ""
              }`}
              onClick={() => navigate(item.path)}
            >
              <span className="owner-sidebar__icon">
                {item.icon}
              </span>

              <span className="owner-sidebar__label">
                {item.name}
              </span>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
