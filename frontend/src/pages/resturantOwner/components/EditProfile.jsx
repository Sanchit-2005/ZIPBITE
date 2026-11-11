import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ImagePlus,
  Loader2,
  RotateCcw,
  Store,
  Trash2,
  UserRound,
} from "lucide-react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

import { useRestaurantOwner } from "../../../context/RestaurantOwnerContext";
import OwnerSidebar from "../mainBox/OwnerSidebar";
import "../RestaurantOwner.css";
import "./EditProfile.css";

const ROLE_LABELS = {
  restaurant: "Restaurant owner",
  customer: "Customer",
  delivery: "Delivery partner",
  admin: "Administrator",
};

const hideBrokenImage = (event) => {
  event.currentTarget.style.display = "none";
};

const getInitials = (name) =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

export default function EditProfile() {
  const navigate = useNavigate();
  const { ownerDetail, fetchOwnerInfo } = useRestaurantOwner();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: { name: "", email: "", phone: "" },
  });

  const nameValue = useWatch({ control, name: "name" }) || "";
  const emailValue = useWatch({ control, name: "email" }) || "";
  const phoneValue = useWatch({ control, name: "phone" }) || "";

  const [baseline, setBaseline] = useState(null);
  const [preview, setPreview] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [photoRemoved, setPhotoRemoved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  const initializedFor = useRef(null);

  const owner =
    ownerDetail?.owner && typeof ownerDetail.owner === "object"
      ? ownerDetail.owner
      : null;

  useEffect(() => {
    fetchOwnerInfo();
  }, [fetchOwnerInfo]);

  useEffect(() => {
    if (!owner?._id) return;
    if (initializedFor.current === owner._id) return;

    initializedFor.current = owner._id;

    const initial = {
      name: owner.name || "",
      email: owner.email || "",
      phone: owner.phone || "",
      image: owner.image || "",
    };

    setBaseline(initial);
    setPreview(initial.image);
    reset({ name: initial.name, email: initial.email, phone: initial.phone });
  }, [owner, reset]);

  const typedName = nameValue.trim();
  const initials = getInitials(nameValue);
  const roleLabel = ROLE_LABELS[owner?.role] || owner?.role || "Account";

  const photoChange = imageFile
    ? "replaced"
    : photoRemoved && baseline?.image
      ? "removed"
      : null;

  const changes = [];

  if (baseline) {
    if (typedName !== baseline.name.trim()) {
      changes.push({
        key: "name",
        label: "Name",
        from: baseline.name,
        to: nameValue,
      });
    }

    if (emailValue.trim() !== baseline.email.trim()) {
      changes.push({
        key: "email",
        label: "Email",
        from: baseline.email,
        to: emailValue,
      });
    }

    if (phoneValue.trim() !== baseline.phone.trim()) {
      changes.push({
        key: "phone",
        label: "Phone",
        from: baseline.phone,
        to: phoneValue,
      });
    }

    if (photoChange) {
      changes.push({
        key: "photo",
        label: "Photo",
        to: photoChange === "replaced" ? "Replaced" : "Removed",
      });
    }
  }

  const ready = Boolean(owner && baseline);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setImageFile(file);
    setPhotoRemoved(false);
    setPreview(URL.createObjectURL(file));
    event.target.value = "";
  };

  const handleRemovePhoto = () => {
    if (preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setImageFile(null);
    setPhotoRemoved(true);
    setPreview("");
    setStatus(null);
  };

  const handleRevertPhoto = () => {
    if (preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setImageFile(null);
    setPhotoRemoved(false);
    setPreview(baseline?.image || "");
    setStatus(null);
  };

  const handleRevertField = (field) => {
    if (!baseline) return;

    setValue(field, baseline[field], {
      shouldDirty: true,
      shouldValidate: true,
    });
    setStatus(null);
  };

  const revertChange = (key) => {
    if (key === "photo") {
      handleRevertPhoto();
      return;
    }

    handleRevertField(key);
  };

  const onSubmit = async (data) => {
    if (!changes.length || saving) return;

    setSaving(true);
    setStatus(null);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setStatus({
          type: "error",
          message: "Your session has expired. Sign in again to save changes.",
        });
        return;
      }

      let imageUrl = baseline?.image || "";

      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append("image", imageFile);

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
      } else if (photoRemoved) {
        imageUrl = "";
      }

      const payload = {
        name: data.name.trim(),
        email: data.email.trim(),
        phone: (data.phone || "").trim(),
        image: imageUrl,
      };

      const response = await axios.patch(
        "http://localhost:8000/apiV4/restaurant-owner/profile",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const updated = response.data?.user || payload;
      const next = {
        name: updated.name ?? payload.name,
        email: updated.email ?? payload.email,
        phone: updated.phone ?? payload.phone,
        image: updated.image ?? imageUrl,
      };

      setBaseline(next);
      reset({ name: next.name, email: next.email, phone: next.phone });

      if (preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }

      setPreview(next.image || "");
      setImageFile(null);
      setPhotoRemoved(false);
      setStatus({ type: "success", message: "Profile updated." });

      // Keep the shared owner context in sync for the profile page and sidebar.
      fetchOwnerInfo();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Couldn't save your profile. Try again.";

      setStatus({ type: "error", message });

      if (error.response?.status === 409) {
        setError("email", { type: "server", message }, { shouldFocus: true });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="owner-layout">
      <OwnerSidebar />
      <div className="owner-content">
        <div className="epr-page">
          <div className="epr-shell">
            <button
              type="button"
              className="epr-back"
              onClick={() => navigate("/restaurant-owner/profile")}
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Back to profile
            </button>

            <header className="epr-head">
              <h1 className="epr-title">Edit profile</h1>
              {ownerDetail?.name ? (
                <p className="epr-sub">
                  <Store size={15} aria-hidden="true" />
                  {ownerDetail.name}
                </p>
              ) : null}
            </header>

            {!ready ? (
              <>
                <div className="epr-skeleton" aria-hidden="true">
                  <div className="epr-skel-grid">
                    <div className="epr-skel-card">
                      <div className="epr-skel-identity">
                        <span className="epr-skel-avatar" />
                        <div className="epr-skel-lines">
                          <span />
                          <span />
                        </div>
                      </div>
                      <div className="epr-skel-fields">
                        <span className="epr-skel-field" />
                        <div className="epr-skel-row">
                          <span className="epr-skel-field" />
                          <span className="epr-skel-field" />
                        </div>
                      </div>
                    </div>
                    <div className="epr-skel-rail">
                      <span />
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </div>
                <p className="epr-sr-only" role="status">
                  Loading your profile…
                </p>
              </>
            ) : (
              <form
                className="epr-form"
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                aria-busy={saving}
              >
                <div className="epr-grid">
                  <section className="epr-card" aria-label="Account details">
                    <div className="epr-identity">
                      <span
                        className={`epr-avatar${preview ? " has-image" : ""}`}
                      >
                        <span className="epr-avatar-fallback" aria-hidden="true">
                          {initials ? (
                            initials
                          ) : (
                            <UserRound size={26} aria-hidden="true" />
                          )}
                        </span>
                        {preview ? (
                          <img
                            src={preview}
                            alt={
                              typedName
                                ? `${typedName} profile photo`
                                : "Profile photo"
                            }
                            onError={hideBrokenImage}
                          />
                        ) : null}
                      </span>

                      <div className="epr-identity-text">
                        <h2 className="epr-name">{typedName || "Your name"}</h2>
                        <p className="epr-role">{roleLabel}</p>
                      </div>

                      <div className="epr-photo-actions">
                        <label className="epr-photo-btn">
                          <input
                            className="epr-file-input"
                            type="file"
                            accept="image/*"
                            disabled={saving}
                            onChange={handleFileChange}
                          />
                          <ImagePlus size={15} aria-hidden="true" />
                          {preview ? "Replace photo" : "Add photo"}
                        </label>

                        {preview ? (
                          <button
                            type="button"
                            className="epr-photo-remove"
                            onClick={handleRemovePhoto}
                            disabled={saving}
                          >
                            <Trash2 size={13} aria-hidden="true" />
                            Remove
                          </button>
                        ) : null}
                      </div>
                    </div>

                    <div className="epr-fields">
                      <TextField
                        className="epr-field"
                        label="Full name"
                        autoComplete="name"
                        fullWidth
                        required
                        disabled={saving}
                        slotProps={{
                          inputLabel: { shrink: true },
                          htmlInput: { maxLength: 80 },
                        }}
                        error={!!errors.name}
                        helperText={errors.name?.message}
                        {...register("name", {
                          required: "Full name is required",
                          validate: (value) =>
                            value.trim().length >= 2 ||
                            "Enter at least 2 characters",
                        })}
                      />

                      <div className="epr-row2">
                        <TextField
                          className="epr-field"
                          label="Email address"
                          type="email"
                          autoComplete="email"
                          fullWidth
                          required
                          disabled={saving}
                          slotProps={{
                            inputLabel: { shrink: true },
                            htmlInput: { maxLength: 120 },
                          }}
                          error={!!errors.email}
                          helperText={
                            errors.email?.message || "Used to sign in."
                          }
                          {...register("email", {
                            required: "Email is required",
                            pattern: {
                              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                              message: "Enter a valid email address",
                            },
                          })}
                        />

                        <TextField
                          className="epr-field"
                          label="Phone number"
                          type="tel"
                          autoComplete="tel"
                          fullWidth
                          disabled={saving}
                          slotProps={{
                            inputLabel: { shrink: true },
                            htmlInput: { maxLength: 18 },
                          }}
                          error={!!errors.phone}
                          helperText={errors.phone?.message}
                          {...register("phone", {
                            validate: (value) =>
                              !value?.trim() ||
                              /^[+0-9][0-9\s()-]{5,17}$/.test(value.trim()) ||
                              "Enter a valid phone number",
                          })}
                        />
                      </div>
                    </div>
                  </section>

                  <aside className="epr-rail" aria-label="Pending changes">
                    <div className="epr-rail-head">
                      <h2 className="epr-rail-title">Changes</h2>
                      <span className="epr-rail-count">{changes.length}</span>
                    </div>

                    {status ? (
                      <div
                        className={`epr-status epr-status--${status.type}`}
                        role="status"
                      >
                        {status.type === "success" ? (
                          <CheckCircle2 size={15} aria-hidden="true" />
                        ) : (
                          <AlertCircle size={15} aria-hidden="true" />
                        )}
                        <span>{status.message}</span>
                      </div>
                    ) : null}

                    {changes.length ? (
                      <ul className="epr-change-list">
                        {changes.map((change) => (
                          <li className="epr-change" key={change.key}>
                            <div className="epr-change-head">
                              <span className="epr-change-label">
                                {change.label}
                              </span>
                              <button
                                type="button"
                                className="epr-revert"
                                onClick={() => revertChange(change.key)}
                                disabled={saving}
                                aria-label={`Revert ${change.label.toLowerCase()} change`}
                              >
                                <RotateCcw size={12} aria-hidden="true" />
                                Revert
                              </button>
                            </div>

                            <div className="epr-change-values">
                              {change.from !== undefined ? (
                                <>
                                  <span className="epr-change-from">
                                    {change.from || "Not set"}
                                  </span>
                                  <ArrowRight
                                    size={12}
                                    aria-hidden="true"
                                    className="epr-change-arrow"
                                  />
                                </>
                              ) : null}
                              <span className="epr-change-to">
                                {change.to || "Not set"}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="epr-no-changes">
                        <strong>All saved</strong>
                        <span>No pending changes.</span>
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="epr-save"
                      variant="contained"
                      disableElevation
                      disabled={!changes.length || saving}
                    >
                      {saving ? (
                        <>
                          <Loader2
                            className="epr-spinner"
                            size={16}
                            aria-hidden="true"
                          />
                          Saving…
                        </>
                      ) : (
                        "Save changes"
                      )}
                    </Button>
                  </aside>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
