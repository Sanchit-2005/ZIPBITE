import mongoose, { Schema } from "mongoose";

const deliveryPartnerSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    vehicleType: {
      type: String,
      enum: ["bike", "scooter", "bicycle"],
      required: true,
    },

    vehicleNumber: {
      type: String,
      required: true,
    },

    licenseNumber: {
      type: String,
      required: true,
    },

    isAvailable: {
      type: Boolean,
      default: false,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    currentLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },

    totalDeliveries: {
      type: Number,
      default: 0,
    },

    totalEarnings: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

deliveryPartnerSchema.index({
  currentLocation: "2dsphere",
});

const DeliveryPartner = mongoose.model(
  "DeliveryPartner",
  deliveryPartnerSchema,
);

export default DeliveryPartner;
