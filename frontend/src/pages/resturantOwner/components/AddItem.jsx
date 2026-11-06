import { useEffect, useRef, useState } from "react";
import {
  Button,
  TextField,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  FormHelperText,
} from "@mui/material";
import { ArrowLeft, CheckCircle2, ImagePlus, Store, Upload } from "lucide-react";

import { useRestaurantOwner } from "../../../context/RestaurantOwnerContext";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AddItem.css";

export default function AddItem() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();

  const { ownerDetail, fetchOwnerInfo } = useRestaurantOwner();

  useEffect(() => {
    fetchOwnerInfo();
  }, [fetchOwnerInfo]);

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [url, setUrl] = useState("");
  // ref always holds the latest uploaded URL — no stale closure in onSubmit
  const urlRef = useRef("");

  const onSubmit = async (data) => {
    const finalData = {
      ...data,
      restaurant: ownerDetail?._id,
      image: urlRef.current, 
    };
    const token = localStorage.getItem("token");
    await axios.post("http://localhost:8000/api/restaurants", finalData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    navigate("/restaurant-owner/menu");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!image) {
      alert("Please select an image first.");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);

    try {
      const res = await axios.post(
        "http://localhost:8000/upload/image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      const imageUrl = res.data.imageUrl;
      urlRef.current = imageUrl; // ✅ update ref immediately
      setUrl(imageUrl); // ✅ update state for UI display
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  return (
    <div className="ami-page">
      <div className="ami-shell">
        <button
          type="button"
          className="ami-back"
          onClick={() => navigate("/restaurant-owner/menu")}
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to menu
        </button>

        <header className="ami-head">
          <h1 className="ami-title">Add menu item</h1>
        </header>

        <div className="ami-context">
          <span className="ami-context-icon">
            <Store size={17} aria-hidden="true" />
          </span>
          <div className="ami-context-body">
            <span className="ami-context-label">RESTAURANT</span>
            <span className="ami-context-value">{ownerDetail?.name || "—"}</span>
          </div>
        </div>

        <form className="ami-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="ami-card">
            <div className="ami-columns">
              <div className="ami-fields">
                <TextField
                  className="ami-field"
                  label="Item name"
                  placeholder="Enter item name"
                  fullWidth
                  required
                  slotProps={{ inputLabel: { shrink: true } }}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  {...register("name", {
                    required: "Item name is required",
                  })}
                />

                <TextField
                  className="ami-field"
                  label="Description"
                  placeholder="Description info"
                  fullWidth
                  required
                  multiline
                  minRows={4}
                  slotProps={{ inputLabel: { shrink: true } }}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                  {...register("description", {
                    required: "Description is required",
                  })}
                />

                <div className="ami-row3">
                  <FormControl
                    className="ami-field"
                    fullWidth
                    required
                    error={!!errors.category}
                  >
                    <InputLabel id="ami-category-label" shrink>
                      Category
                    </InputLabel>

                    <Controller
                      name="category"
                      control={control}
                      defaultValue=""
                      rules={{ required: "Category is required" }}
                      render={({ field }) => (
                        <Select
                          {...field}
                          id="ami-category"
                          label="Category"
                          labelId="ami-category-label"
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
                    className="ami-field"
                    label="Price (₹)"
                    placeholder="0"
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
                    className="ami-field"
                    label="Preparation time (minutes)"
                    placeholder="30"
                    type="number"
                    fullWidth
                    required
                    slotProps={{
                      inputLabel: { shrink: true },
                      htmlInput: { min: 1, step: 1 },
                    }}
                    error={!!errors.preparationTime}
                    helperText={errors.preparationTime?.message}
                    {...register("preparationTime", {
                      required: "Preparation time is required",
                      valueAsNumber: true,
                      min: {
                        value: 1,
                        message: "Preparation time must be positive",
                      },
                    })}
                  />
                </div>
              </div>

              <aside className="ami-photo">
                <div className="ami-photo-head">
                  <h2>Food photo</h2>
                  <span className="ami-photo-hint">Optional</span>
                </div>

                <div
                  className={`ami-preview${preview ? " has-image" : ""}`}
                  aria-live="polite"
                >
                  {preview ? (
                    <img src={preview} alt="Selected item photo preview" />
                  ) : (
                    <div className="ami-preview-empty">
                      <ImagePlus size={26} aria-hidden="true" />
                      <span>No photo selected</span>
                    </div>
                  )}
                </div>

                <div className="ami-photo-controls">
                  <label className="ami-choose">
                    <input
                      className="ami-file-input"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <ImagePlus size={16} aria-hidden="true" />
                    {image ? "Choose another photo" : "Choose photo"}
                  </label>

                  {image ? (
                    <span className="ami-filename" title={image.name}>
                      {image.name}
                    </span>
                  ) : null}
                </div>

                <Button
                  type="button"
                  className="ami-upload"
                  variant="outlined"
                  startIcon={<Upload size={16} aria-hidden="true" />}
                  onClick={handleUpload}
                >
                  Upload photo
                </Button>

                {url ? (
                  <div className="ami-uploaded">
                    <CheckCircle2 size={15} aria-hidden="true" />
                    <span>Photo uploaded</span>
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      Open
                    </a>
                  </div>
                ) : null}
              </aside>
            </div>

            <div className="ami-footer">
              <Button
                type="submit"
                className="ami-submit"
                variant="contained"
                disableElevation
              >
                Add menu item
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
