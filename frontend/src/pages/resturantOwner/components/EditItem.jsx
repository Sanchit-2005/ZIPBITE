import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, useWatch, Controller } from "react-hook-form";
import OwnerSidebar from "../mainBox/OwnerSidebar";
import "../RestaurantOwner.css";
import "./EditItem.css";
import {
  ArrowLeft,
  FileImage,
  ImagePlus,
  Loader2,
  RotateCcw,
  Store,
  UtensilsCrossed,
} from "lucide-react";

import {
  Button,
  TextField,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  FormHelperText,
} from "@mui/material";

const hideBrokenImage = (event) => {
  event.currentTarget.style.display = "none";
};

function OwnerShell({ children }) {
  return (
    <div className="owner-layout">
      <OwnerSidebar />
      <div className="owner-content">{children}</div>
    </div>
  );
}

export default function EditItem() {
  const { itemId } = useParams();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm();

  const typedName = useWatch({ control, name: "name" });

  const [menuData, setMenuData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    const fetchMenuItem = async () => {
      try {
        setLoading(true);

        const response = await axios.get(
          `http://localhost:8000/api/menu-item/${itemId}`,
        );

        setMenuData(response.data);

        reset({
          name: response.data.name,
          price: response.data.price,
          description: response.data.description,
          category: response.data.category,
        });

        setPreview(response.data.image || "");
      } catch (error) {
        console.error("Error fetching menu item:", error);
      } finally {
        setLoading(false);
      }
    };

    if (itemId) {
      fetchMenuItem();
    }
  }, [itemId, reset]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setImage(file);

    setPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleRevertPhoto = () => {
    if (preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setImage(null);
    setPreview(menuData?.image || "");
  };

  const onSubmit = async (data) => {
    try {
      setUpdating(true);
      const token = localStorage.getItem("token");

      if (!token) {
        alert(
          "You are not logged in or your session has expired. Please log in first.",
        );
        navigate("/auth");
        return;
      }

      let imageUrl = menuData?.image || "";

      // Only upload if a new image was chosen
      if (image) {
        const imageFormData = new FormData();
        imageFormData.append("image", image);

        const uploadRes = await axios.post(
          "http://localhost:8000/upload/image",
          imageFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        );
        imageUrl = uploadRes.data.imageUrl;
      }

      const updateData = {
        name: data.name,
        price: data.price,
        description: data.description,
        category: data.category,
        image: imageUrl,
      };

      const response = await axios.patch(
        `http://localhost:8000/api/menu-item/${itemId}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("Updated successfully:", response.data);
      alert("Menu item updated successfully!");
      navigate("/restaurant-owner/menu");
    } catch (error) {
      console.error("Error updating menu item:", error);

      if (error.response?.status === 401) {
        alert(
          "Authentication failed (Session expired or invalid token). Please log in again to refresh your session.",
        );
        navigate("/auth");
      } else {
        alert(error.response?.data?.message || "Failed to update menu item.");
      }
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <OwnerShell>
        <div className="edi-page">
          <div className="edi-shell">
            <div className="edi-skeleton" aria-hidden="true">
              <div className="edi-skel-back" />
              <div className="edi-skel-title" />
              <div className="edi-skel-sub" />
              <div className="edi-card">
                <div className="edi-skel-cover" />
                <div className="edi-skel-grid">
                  <div className="edi-skel-field" />
                  <div className="edi-skel-field" />
                  <div className="edi-skel-field" />
                  <div className="edi-skel-field edi-skel-wide" />
                </div>
                <div className="edi-skel-footer" />
              </div>
            </div>
            <p className="edi-sr-only" role="status">
              Loading item details...
            </p>
          </div>
        </div>
      </OwnerShell>
    );
  }

  if (!menuData) {
    return (
      <OwnerShell>
        <div className="edi-page">
          <div className="edi-shell">
            <div className="edi-card edi-empty">
              <span className="edi-empty-icon">
                <UtensilsCrossed size={22} aria-hidden="true" />
              </span>
              <h1>Menu item not found</h1>
              <p>The item may have been removed from the menu.</p>
              <Button
                type="button"
                className="edi-empty-action"
                variant="outlined"
                startIcon={<ArrowLeft size={16} aria-hidden="true" />}
                onClick={() => navigate("/restaurant-owner/menu")}
              >
                Back to menu
              </Button>
            </div>
          </div>
        </div>
      </OwnerShell>
    );
  }

  return (
    <OwnerShell>
      <div className="edi-page">
        <div className="edi-shell">
          <button
            type="button"
            className="edi-back"
            onClick={() => navigate("/restaurant-owner/menu")}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to menu
          </button>

          <header className="edi-head">
            <h1 className="edi-title">Edit menu item</h1>
            <p className="edi-context">
              <Store size={15} aria-hidden="true" />
              {menuData?.restaurant?.name || "Restaurant"}
              {typedName?.trim() ? (
                <>
                  <span className="edi-context-sep" aria-hidden="true"></span>
                  <span className="edi-context-item">{typedName.trim()}</span>
                </>
              ) : null}
            </p>
          </header>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <section className="edi-card" aria-busy={updating}>
              <div
                className={`edi-cover${preview ? "" : " edi-cover--empty"}`}
              >
                <div className="edi-cover-media">
                  <UtensilsCrossed size={34} aria-hidden="true" />
                  {preview ? (
                    <img
                      key={preview}
                      src={preview}
                      alt={`${menuData.name || "Menu item"} photo`}
                      onError={hideBrokenImage}
                    />
                  ) : null}
                </div>

                <div className="edi-cover-top">
                  <label className="edi-replace">
                    <input
                      className="edi-file-input"
                      type="file"
                      accept="image/*"
                      disabled={updating}
                      onChange={handleFileChange}
                    />
                    <ImagePlus size={15} aria-hidden="true" />
                    {image
                      ? "Choose another photo"
                      : preview
                        ? "Replace photo"
                        : "Add photo"}
                  </label>
                </div>

                {image ? (
                  <div className="edi-cover-bottom">
                    <span className="edi-file-chip">
                      <FileImage size={13} aria-hidden="true" />
                      <span title={image.name}>{image.name}</span>
                    </span>
                    <span className="edi-pending">New photo</span>
                    <button
                      type="button"
                      className="edi-revert"
                      onClick={handleRevertPhoto}
                      disabled={updating}
                    >
                      <RotateCcw size={13} aria-hidden="true" />
                      Revert
                    </button>
                  </div>
                ) : null}
              </div>

              <div className="edi-body">
                <div className="edi-grid">
                  <TextField
                    className="edi-field"
                    label="Item name"
                    fullWidth
                    required
                    slotProps={{ inputLabel: { shrink: true } }}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    {...register("name", {
                      required: "Item name is required",
                    })}
                  />

                  <FormControl
                    className="edi-field"
                    fullWidth
                    required
                    error={!!errors.category}
                  >
                    <InputLabel id="edi-category-label" shrink>
                      Category
                    </InputLabel>

                    <Controller
                      name="category"
                      control={control}
                      defaultValue=""
                      rules={{
                        required: "Category is required",
                      }}
                      render={({ field }) => (
                        <Select
                          {...field}
                          id="edi-category"
                          label="Category"
                          labelId="edi-category-label"
                        >
                          <MenuItem value="Veg">Veg</MenuItem>
                          <MenuItem value="Non-veg">Non-veg</MenuItem>
                          <MenuItem value="Vegan">Vegan</MenuItem>
                        </Select>
                      )}
                    />

                    <FormHelperText>
                      {errors.category?.message}
                    </FormHelperText>
                  </FormControl>

                  <TextField
                    className="edi-field"
                    label="Price (₹)"
                    type="number"
                    fullWidth
                    required
                    slotProps={{
                      inputLabel: { shrink: true },
                      htmlInput: { min: 1, step: "any" },
                    }}
                    error={!!errors.price}
                    helperText={errors.price?.message}
                    {...register("price", {
                      required: "Price is required",
                      valueAsNumber: true,
                      min: {
                        value: 1,
                        message: "Price must be greater than zero",
                      },
                    })}
                  />

                  <TextField
                    className="edi-field edi-span-all"
                    label="Description"
                    fullWidth
                    required
                    multiline
                    minRows={3}
                    slotProps={{ inputLabel: { shrink: true } }}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                    {...register("description", {
                      required: "Description is required",
                    })}
                  />
                </div>
              </div>

              <div className="edi-footer">
                <span className="edi-footer-note">
                  {image ? "The new photo is uploaded when you update." : ""}
                </span>
                <Button
                  type="submit"
                  className="edi-submit"
                  variant="contained"
                  disableElevation
                  disabled={updating}
                >
                  {updating ? (
                    <>
                      <Loader2
                        className="edi-spinner"
                        size={16}
                        aria-hidden="true"
                      />
                      Updating…
                    </>
                  ) : (
                    "Update menu item"
                  )}
                </Button>
              </div>
            </section>
          </form>
        </div>
      </div>
    </OwnerShell>
  );
}
