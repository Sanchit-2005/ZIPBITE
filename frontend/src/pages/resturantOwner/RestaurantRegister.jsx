import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const RestaurantRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    ownerName: "",
    email: "",
    password: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
    },
  });

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name in formData.address) {
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [name]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", text: "" });

    try {
      const data = new FormData();

      data.append("name", formData.name);
      data.append("ownerName", formData.ownerName);
      data.append("email", formData.email);
      data.append("password", formData.password);
      data.append("phone", formData.phone);
      data.append("address", JSON.stringify(formData.address));

      if (image) {
        data.append("image", image);
      }

      const response = await axios.post(
        "http://localhost:8000/restaurants/register",
        data,
      );

      navigate("/auth");
    } catch (error) {
      setStatus({
        type: "error",
        text: error.response?.data?.message || "Restaurant registration failed",
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100";

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm sm:p-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Register Your Restaurant
          </h1>
          <p className="mt-2 text-gray-500">
            Join ZipBite and start serving customers.
          </p>
        </div>

        {status.text && (
          <div
            className={`mb-6 rounded-lg p-4 text-sm ${
              status.type === "success"
                ? "border border-green-200 bg-green-50 text-green-700"
                : "border border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {status.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
              Restaurant Details
            </h2>

            <div className="space-y-4">
              <input
                className={inputClass}
                name="name"
                placeholder="Restaurant Name"
                value={formData.name}
                onChange={handleChange}
                required
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Restaurant Image (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className={inputClass}
                  onChange={(e) => setImage(e.target.files[0])}
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
              Owner Details
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <input
                className={inputClass}
                name="ownerName"
                placeholder="Owner Name"
                value={formData.ownerName}
                onChange={handleChange}
                required
              />

              <input
                className={inputClass}
                name="phone"
                type="tel"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                required
              />

              <input
                className={inputClass}
                name="email"
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <input
                className={inputClass}
                name="password"
                type="password"
                placeholder="Create Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
              Restaurant Address
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <input
                className={inputClass}
                name="street"
                placeholder="Street Address"
                value={formData.address.street}
                onChange={handleChange}
                required
              />

              <input
                className={inputClass}
                name="city"
                placeholder="City"
                value={formData.address.city}
                onChange={handleChange}
                required
              />

              <input
                className={inputClass}
                name="state"
                placeholder="State"
                value={formData.address.state}
                onChange={handleChange}
                required
              />

              <input
                className={inputClass}
                name="postalCode"
                placeholder="Postal Code"
                value={formData.address.postalCode}
                onChange={handleChange}
                required
              />

              <input
                className={inputClass}
                name="country"
                placeholder="Country"
                value={formData.address.country}
                onChange={handleChange}
                required
              />
            </div>
          </section>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Registering..." : "Register Restaurant"}
          </button>

          <p className="mt-4 text-center text-sm text-gray-600">
            Already registered your restaurant?{" "}
            <Link
              to="/auth"
              className="font-semibold text-orange-600 hover:underline"
            >
              Log in here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RestaurantRegister;
