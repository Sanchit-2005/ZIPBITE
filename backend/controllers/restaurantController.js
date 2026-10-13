import Restaurant from "../models/restaurant.js";
import { StatusCodes } from "http-status-codes";
import geocodeAddress from "../utils/geocodeAddress.js";
import MenuItem from "../models/menuItem.js";
const registerRestaurant = async (req, res) => {
  try {
    const { name, email, owner, phone, address } = req.body;

    const checkRestaurant = await Restaurant.findOne({
      name,
      email,
    });

    if (checkRestaurant) {
      return res.status(StatusCodes.CONFLICT).json({
        message: "Restaurant already exists!",
      });
    }

    // Convert address into a searchable string
    const fullAddress = [
      address.street,
      address.city,
      address.state,
      address.postalCode,
      address.country || "India",
    ]
      .filter(Boolean)
      .join(", ");

    // Get coordinates using geocoding
    const currLocation = await geocodeAddress(fullAddress);

    const hotel = new Restaurant({
      name,
      owner,
      email,
      phone,
      address,
      location: currLocation,
      image: req.file ? req.file.path : "",
    });

    await hotel.save();

    return res.status(StatusCodes.CREATED).json({
      message: "Restaurant added successfully!",
      restaurant: hotel,
    });
  } catch (err) {
    console.error("Register restaurant error:", err.message);

    return res
      .status(
        err.message.startsWith("Address not found")
          ? StatusCodes.BAD_REQUEST
          : StatusCodes.INTERNAL_SERVER_ERROR,
      )
      .json({
        message: err.message,
      });
  }
};

const getRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Restaurant not found" });
    }
    res.status(StatusCodes.OK).json({ restaurant });
  } catch (err) {}
};

const editRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Restaurant not found" });
    }
    const { name, email, phone, address, location } = req.body;

    restaurant.name = name || restaurant.name;
    restaurant.email = email || restaurant.email;
    restaurant.phone = phone || restaurant.phone;
    if (address) {
      restaurant.address =
        typeof address === "string" ? JSON.parse(address) : address;
    }

    if (location) {
      restaurant.location =
        typeof location === "string" ? JSON.parse(location) : location;
    }
    await restaurant.save();
    res.status(StatusCodes.ACCEPTED).json({ message: "Updated the details" });
  } catch (err) {
    console.log(err);
  }
};

const deleteRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Restaurant not found",
      });
    }
    await restaurant.deleteOne();
    res.status(StatusCodes.ACCEPTED).json({ message: "Restaurant Deleted" });
  } catch (err) {
    console.log(err);
  }
};

const getNearbyRestaurant = async (req, res) => {
  try {
    const { longitude, latitude, radius } = req.query;
    // Validate query parameters
    if (
      longitude === undefined ||
      latitude === undefined ||
      longitude.trim() === "" ||
      latitude.trim() === "" ||
      !Number.isFinite(Number(longitude)) ||
      !Number.isFinite(Number(latitude)) ||
      !Number.isFinite(Number(radius)) ||
      Number(latitude) < -90 ||
      Number(latitude) > 90 ||
      Number(longitude) < -180 ||
      Number(longitude) > 180 ||
      Number(radius) <= 0
    ) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Please provide valid  longitude,latitude and radius ",
      });
    }

    const restaurantslist = await Restaurant.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [Number(longitude), Number(latitude)],
          },
          $maxDistance: Number(radius),
        },
      },
      isApproved: true,
      isActive: true,
    });
    return res
      .status(StatusCodes.ACCEPTED)
      .json({ count: restaurantslist.length, restaurantslist });
  } catch (err) {
    console.error("Error fetching nearby restaurants:", err.message);

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Failed to fetch nearby restaurants.",
      error: err.message,
    });
  }
};

const searchRestaurant = async (req, res) => {
  const Restaurant = require("../models/restaurant");
  const MenuItem = require("../models/menuItem");

  const searchAll = async (req, res) => {
    try {
      const q = req.query.q?.trim();
      if (!q)
        return res.status(400).json({ message: "Please enter a search term" });

      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

      const [restaurants, menuItems] = await Promise.all([
        Restaurant.find({
          $or: [{ name: regex }, { cuisineTypes: regex }],
        }).limit(10),
        MenuItem.find({ $or: [{ name: regex }, { category: regex }] })
          .populate("restaurant", "name image")
          .limit(10),
      ]);

      res.json({ restaurants, menuItems });
    } catch (error) {
      res.status(500).json({ message: "Failed to search" });
    }
  };
};

const filters = async (req, res) => {
  try {
    const { category, isVegetarian, ratings, price } = req.query;

    const filter = {};

    
    if (category) {
      filter.category = category;
    }

    
    if (isVegetarian !== undefined) {
      filter.isVegetarian = isVegetarian === "true";
    }

    
    if (ratings) {
      filter.ratings = { $gte: Number(ratings) };
    }

    
    if (price) {
      filter.price = { $lte: Number(price) };
    }

    const itemsList = await MenuItem.find(filter);

    if (itemsList.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "No menu items found matching these filters",
      });
    }

    return res.status(StatusCodes.OK).json({
      count: itemsList.length,
      itemsList,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Failed to filter menu items",
      error: error.message,
    });
  }
};



export {
  registerRestaurant,
  getRestaurant,
  editRestaurant,
  deleteRestaurant,
  getNearbyRestaurant,
  searchRestaurant,
  filters
};
