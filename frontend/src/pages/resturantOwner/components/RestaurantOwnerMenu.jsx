import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRestaurantOwner } from "../../../context/RestaurantOwnerContext";
import { useNavigate } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import OwnerSidebar from "../mainBox/OwnerSidebar";
import "../RestaurantOwner.css";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";

export default function RestaurantOwnerMenu() {
  const navigate = useNavigate();
  const { ownerDetail, fetchOwnerInfo } = useRestaurantOwner();

  const [menuItems, setMenuItems] = useState([]);

  // Fetch restaurant owner information
  useEffect(() => {
    fetchOwnerInfo();
  }, [fetchOwnerInfo]);

  // Fetch restaurant menu items
  useEffect(() => {
    const fetchMenuItems = async () => {
      if (!ownerDetail?._id) return;

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

        console.log("Menu response:", response.data);

        // Adjust this according to your API response structure
        setMenuItems(response.data || []);
      } catch (error) {
        console.error("Error fetching menu:", error);
      }
    };

    fetchMenuItems();
  }, [ownerDetail?._id]);

  // Calculate available items
  const availableItems = menuItems.filter((item) => item.isAvailable === true);

  const handleDelete = async (itemId) => {
    const token = localStorage.getItem("token");
    console.log("deleted button clicked");
    axios.delete(`http://localhost:8000/api/menu-item/${itemId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setMenuItems((prevItems) =>
      prevItems.filter((item) => item._id !== itemId),
    );
  };

  return (
    <div className="owner-layout">
      <OwnerSidebar />
      <div className="owner-content">
        <h1>Menu Management</h1>

        <h2>{ownerDetail?.name}</h2>

        <div>
          <h3>Total Items: {menuItems.length}</h3>
          <p>Available Items: {availableItems.length}</p>
          <p>Unavailable Items: {menuItems.length - availableItems.length}</p>

          <Button
            variant="contained"
            onClick={() => navigate("/restaurant-owner/menu/addNewItem")}
          >
            Add new Item
          </Button>
        </div>

        <div>
          {menuItems.map((item) => (
            // <p key={item._id}>{item.name}</p>
            <div key={item._id}>
              <hr />
              <b>{item.name}</b> &nbsp; &nbsp; &nbsp;
              {item.category}
              &nbsp; &nbsp;
              <EditIcon
                onClick={() =>
                  navigate(`/restaurant-owner/menu/editItem/${item._id}`)
                }
                style={{ cursor: "pointer" }}
              />{" "}
              &nbsp; &nbsp;
              <DeleteIcon
                onClick={() => handleDelete(item._id)}
                style={{ cursor: "pointer" }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
