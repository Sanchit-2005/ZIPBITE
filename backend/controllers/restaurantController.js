import Restaurant from "../models/restaurant.js";
import { StatusCodes } from "http-status-codes";
const registerRestaurant = async (req, res) => {
  try {
    const { name, email, owner, phone, address, location } = req.body;
    const checkRestaurant = await Restaurant.findOne({
      name,
      email,
    });

    if (checkRestaurant) {
      return res
        .status(StatusCodes.CONFLICT)
        .json({ message: "Restaurant already Exists!" });
    }
    const hotel = new Restaurant({
      name: name,
      owner: owner,
      email: email,
      phone: phone,
      address: address,
      location: location,
      image: req.file ? req.file.path : "",
    });
    await hotel.save();
    res.status(StatusCodes.CREATED).json({ message: "Restaurant Added!" });
  } catch (err) {
    console.log(err);
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

export { registerRestaurant, getRestaurant, editRestaurant, deleteRestaurant };
