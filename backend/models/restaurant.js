import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    // Restaurant owner must have a registered User account
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    cuisineTypes: {
      type: [String],
    //   required: true,
    //   validate: {
    //     validator: (value) => value.length > 0,
    //     message: "At least one cuisine type is required",
    //   },
    },

    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, default: "India" },
    },

    location: {
      latitude: { type: Number },
      longitude: { type: Number },
    },

    openingHours: [
      {
        day: {
          type: String,
          enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
        //   required: true,
        },
        openTime: { type: String },
        closeTime: { type: String },
        isClosed: { type: Boolean, default: false },
      },
    ],

    deliveryTime: {
      type: Number,
      default: 30,
      min: 1,
    },

    minimumOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    deliveryFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    isOpen: {
      type: Boolean,
      default: false,
    },

    isApproved: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalRatings: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

restaurantSchema.index({ owner: 1 });
restaurantSchema.index({ "address.city": 1 });

const Restaurant = mongoose.model("Restaurant", restaurantSchema);

export default Restaurant;
