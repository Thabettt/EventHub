import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useDeviceDetection from "../../hooks/useDeviceDetection";
import { useAuth } from "../../hooks/useAuth";
import Button from "../../components/common/Button";
import {
  FileText,
  MapPin,
  DollarSign,
  Camera,
  Eye,
  AlertCircle,
  X,
  Plus,
  Loader,
  ArrowLeft,
  Check,
} from "lucide-react";

const categories = [
  "Conference",
  "Workshop",
  "Concert",
  "Festival",
  "Sports",
  "Business",
  "Technology",
  "Arts",
  "Food & Drink",
  "Health",
  "Education",
  "Entertainment",
  "Charity",
  "Community",
  "Other",
];

const EditEventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, token } = useAuth();
  const deviceInfo = useDeviceDetection();

  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    tags: [],
    startDate: "",
    startTime: "",
    timezone: "UTC",
    venue: "",
    address: "",
    city: "",
    state: "",
    country: "",
    isOnline: false,
    onlineLink: "",
    tickets: [
      {
        id: 1,
        name: "General Admission",
        price: 0,
        quantity: 100,
        description: "",
      },
    ],
    coverImage: null,
    coverImagePreview: "",
    gallery: [],
    isPublic: true,
    requiresApproval: false,
    maxAttendees: "",
    allowWaitlist: true,
    refundPolicy: "flexible",
    additionalInfo: "",
  });

  const [tagInput, setTagInput] = useState("");

  // fetch event details
  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    let mounted = true;
    const fetchEvent = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`http://localhost:3003/api/events/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        if (!mounted) return;
        if (res.ok && data && data.data) {
          const e = data.data;
          // map backend shape to formData
          setFormData((prev) => ({
            ...prev,
            title: e.title || "",
            description: e.description || "",
            category: e.category || "",
            tags: Array.isArray(e.tags) ? e.tags : [],
            startDate: e.date
              ? new Date(e.date).toISOString().split("T")[0]
              : "",
            startTime: e.date
              ? new Date(e.date).toTimeString().slice(0, 5)
              : "",
            venue: e.isOnline ? "" : e.location || "",
            address: e.address || "",
            city: e.city || "",
            state: e.state || "",
            country: e.country || "",
            isOnline: !!e.isOnline,
            onlineLink: e.onlineLink || "",
            tickets: [
              {
                id: 1,
                name: e.ticketName || "General Admission",
                price: e.ticketPrice || 0,
                quantity: e.totalTickets || 100,
                description: e.ticketDescription || "",
              },
            ],
            coverImagePreview: e.image || "",
            gallery: Array.isArray(e.gallery) ? e.gallery : [],
            isPublic: e.isPublic !== false,
            requiresApproval: !!e.requiresApproval,
            maxAttendees: e.maxAttendees || "",
            allowWaitlist: e.allowWaitlist !== false,
            refundPolicy: e.refundPolicy || "flexible",
            additionalInfo: e.additionalInfo || "",
          }));
        } else {
          setErrors({ fetch: data.message || "Failed to load event" });
        }
      } catch (err) {
        setErrors({ fetch: "Failed to fetch event" });
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetchEvent();
    return () => {
      mounted = false;
    };
  }, [id, token]);

  // input helper
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // tag management
  const addTag = (tag) => {
    const t = (tag || tagInput || "").trim();
    if (!t) return;
    if (formData.tags.includes(t)) return;
    setFormData((prev) => ({ ...prev, tags: [...prev.tags, t] }));
    setTagInput("");
  };
  const removeTag = (t) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((x) => x !== t),
    }));
  };

  // ticket management (simple single-ticket support but allow multiple)
  const updateTicket = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      tickets: prev.tickets.map((t) =>
        t.id === id ? { ...t, [field]: value } : t,
      ),
    }));
  };

  // image handling
  const handleCoverImageUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, coverImage: "Invalid image type" }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, coverImage: "Image must be < 10MB" }));
      return;
    }
    // Use object URL for local preview (no base64)
    const previewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({
      ...prev,
      coverImage: file,
      coverImagePreview: previewUrl,
    }));
  };
  const clearCoverImage = () => {
    if (
      formData.coverImagePreview &&
      formData.coverImagePreview.startsWith("blob:")
    ) {
      URL.revokeObjectURL(formData.coverImagePreview);
    }
    setFormData((prev) => ({
      ...prev,
      coverImage: null,
      coverImagePreview: "",
    }));
  };

  // Upload image to Cloudinary via backend endpoint
  const uploadImageToCloudinary = async (file) => {
    const uploadData = new FormData();
    uploadData.append("image", file);

    const response = await fetch(
      "http://localhost:3003/api/upload/image?folder=events",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadData,
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to upload image");
    }

    const result = await response.json();
    return result.data; // { url, publicId }
  };

  // validate the whole form before submit
  const validateAll = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title required";
    if (!formData.description.trim())
      newErrors.description = "Description required";
    if (!formData.category) newErrors.category = "Category required";

    if (!formData.startDate) newErrors.startDate = "Start date required";
    if (!formData.startTime) newErrors.startTime = "Start time required";
    if (!formData.isOnline && !formData.venue.trim())
      newErrors.venue = "Venue required";
    if (formData.isOnline && !formData.onlineLink.trim())
      newErrors.onlineLink = "Online link required";

    // validate primary ticket only (no multi-tier support)
    const primaryTicket = (formData.tickets && formData.tickets[0]) || null;
    if (!primaryTicket) newErrors.tickets = "At least one ticket required";
    else {
      if (!primaryTicket.name || !primaryTicket.name.trim())
        newErrors.ticket_name = "Ticket name required";
      if (!primaryTicket.quantity || Number(primaryTicket.quantity) <= 0)
        newErrors.ticket_qty = "Quantity must be > 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (isDraft = false) => {
    // validate entire form before submit
    if (!validateAll()) return;
    setIsLoading(true);
    setErrors({});
    try {
      let imageUrl = formData.coverImagePreview;
      let imagePublicId = "";

      // If a new file was selected, upload it to Cloudinary
      if (formData.coverImage) {
        try {
          const uploadResult = await uploadImageToCloudinary(
            formData.coverImage,
          );
          imageUrl = uploadResult.url;
          imagePublicId = uploadResult.publicId;
          console.log("Image uploaded to Cloudinary:", imageUrl);
        } catch (error) {
          console.error("Error uploading image:", error);
          throw new Error("Failed to upload image. Please try again.");
        }
      }

      // pick primary ticket for API compatibility if backend expects single ticket
      const primaryTicket = formData.tickets[0] || {
        name: "",
        price: 0,
        quantity: 0,
        description: "",
      };

      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        tags: formData.tags,
        date:
          formData.startDate && formData.startTime
            ? new Date(`${formData.startDate}T${formData.startTime}`)
            : null,
        // no end date/time field - single start date/time used
        location: formData.isOnline ? "Online Event" : formData.venue,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        isOnline: formData.isOnline,
        onlineLink: formData.onlineLink,
        image: imageUrl,
        imagePublicId: imagePublicId || undefined,
        ticketName: primaryTicket.name,
        ticketPrice: Number(primaryTicket.price || 0),
        totalTickets: Number(primaryTicket.quantity || 0),
        ticketDescription: primaryTicket.description,
        maxAttendees: formData.maxAttendees
          ? Number(formData.maxAttendees)
          : null,
        requiresApproval: formData.requiresApproval,
        allowWaitlist: formData.allowWaitlist,
        refundPolicy: formData.refundPolicy,
        additionalInfo: formData.additionalInfo,
        isPublic: formData.isPublic,
        status: isDraft ? "draft" : "pending",
      };

      const res = await fetch(`http://localhost:3003/api/events/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update event");
      setSuccess("Event updated successfully");
      setTimeout(
        () =>
          navigate("/organizer/events", {
            state: { message: "Event updated", type: "success" },
          }),
        1200,
      );
    } catch (err) {
      setErrors({ submit: err.message || "Failed to update event" });
    } finally {
      setIsLoading(false);
    }
  };

  // single-form editor (no multi-step)
  // render a single full form (no multi-step)
  const renderFormContent = () => (
    <div className="space-y-10">
      {/* Basic Info */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 tracking-tight">
            Event Title *
          </label>
          <input
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            placeholder="Enter your event title"
            className={`w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200 font-medium ${
              errors.title
                ? "border-red-300 focus:border-red-500 bg-red-50/50 dark:bg-red-900/10"
                : "border-gray-200 dark:border-gray-700 focus:border-indigo-500 bg-gray-50 dark:bg-gray-900/50"
            } text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
          />
          {errors.title && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center font-medium">
              <AlertCircle className="w-4 h-4 mr-1.5" />
              {errors.title}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 tracking-tight">
            Event Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Describe your event in detail..."
            rows={5}
            className={`w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200 resize-none font-medium ${
              errors.description
                ? "border-red-300 focus:border-red-500 bg-red-50/50 dark:bg-red-900/10"
                : "border-gray-200 dark:border-gray-700 focus:border-indigo-500 bg-gray-50 dark:bg-gray-900/50"
            } text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
          />
          {errors.description && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center font-medium">
              <AlertCircle className="w-4 h-4 mr-1.5" />
              {errors.description}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 tracking-tight">
            Event Category *
          </label>
          <select
            value={formData.category}
            onChange={(e) => handleInputChange("category", e.target.value)}
            className={`w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200 font-medium ${
              errors.category
                ? "border-red-300 focus:border-red-500 bg-red-50/50 dark:bg-red-900/10"
                : "border-gray-200 dark:border-gray-700 focus:border-indigo-500 bg-gray-50 dark:bg-gray-900/50"
            } text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
          >
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center font-medium">
              <AlertCircle className="w-4 h-4 mr-1.5" />
              {errors.category}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 tracking-tight">
            Event Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center px-3 py-1.5 rounded-xl text-sm bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-indigo-800 dark:text-indigo-200 font-bold border border-indigo-200 dark:border-indigo-700"
              >
                {t}
                <Button
                  type="button"
                  onClick={() => removeTag(t)}
                  variant="outline"
                  size="small"
                  className="ml-2 !p-0 !w-5 !h-5 !min-w-0 !shadow-none !border-0 !bg-transparent hover:!bg-transparent !text-indigo-600 dark:!text-indigo-400"
                  icon={<X className="w-3 h-3" />}
                />
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="Add a tag and press Enter"
              className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-medium transition-all duration-200"
            />
            <Button
              type="button"
              onClick={() => addTag()}
              variant="primary"
              size="default"
              className="!px-6"
              icon={<Plus className="w-4 h-4" />}
            />
          </div>
        </div>
      </div>

      {/* Date & Location */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 tracking-tight">
              📅 Start Date *
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleInputChange("startDate", e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className={`w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200 font-medium ${
                errors.startDate
                  ? "border-red-300 focus:border-red-500 bg-red-50/50 dark:bg-red-900/10"
                  : "border-gray-200 dark:border-gray-700 focus:border-indigo-500 bg-gray-50 dark:bg-gray-900/50"
              } text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
            />
            {errors.startDate && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium">
                {errors.startDate}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 tracking-tight">
              🕐 Start Time *
            </label>
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) => handleInputChange("startTime", e.target.value)}
              className={`w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200 font-medium ${
                errors.startTime
                  ? "border-red-300 focus:border-red-500 bg-red-50/50 dark:bg-red-900/10"
                  : "border-gray-200 dark:border-gray-700 focus:border-indigo-500 bg-gray-50 dark:bg-gray-900/50"
              } text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
            />
            {errors.startTime && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium">
                {errors.startTime}
              </p>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-5 border border-indigo-200/50 dark:border-indigo-700/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300 tracking-tight">
              Event Type
            </span>
            <div className="flex bg-white dark:bg-gray-700 rounded-xl p-1 shadow-inner">
              <Button
                type="button"
                onClick={() => handleInputChange("isOnline", false)}
                variant="solid"
                size="small"
                className={`!px-5 !py-2.5 !rounded-lg !text-sm !font-bold transition-all duration-200 ${
                  !formData.isOnline
                    ? "!bg-gradient-to-r !from-indigo-500 !to-purple-600 !text-white !shadow-lg !shadow-indigo-500/50"
                    : "!bg-transparent !text-gray-700 dark:!text-gray-300 hover:!bg-gray-100 dark:hover:!bg-gray-600"
                }`}
              >
                📍 In-Person
              </Button>
              <Button
                type="button"
                onClick={() => handleInputChange("isOnline", true)}
                variant="solid"
                size="small"
                className={`!px-5 !py-2.5 !rounded-lg !text-sm !font-bold transition-all duration-200 ${
                  formData.isOnline
                    ? "!bg-gradient-to-r !from-indigo-500 !to-purple-600 !text-white !shadow-lg !shadow-indigo-500/50"
                    : "!bg-transparent !text-gray-700 dark:!text-gray-300 hover:!bg-gray-100 dark:hover:!bg-gray-600"
                }`}
              >
                🌐 Online
              </Button>
            </div>
          </div>
        </div>

        {formData.isOnline ? (
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 tracking-tight">
              🔗 Online Event Link *
            </label>
            <input
              value={formData.onlineLink}
              onChange={(e) => handleInputChange("onlineLink", e.target.value)}
              placeholder="https://zoom.us/meeting/..."
              className={`w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200 font-medium ${
                errors.onlineLink
                  ? "border-red-300 focus:border-red-500 bg-red-50/50 dark:bg-red-900/10"
                  : "border-gray-200 dark:border-gray-700 focus:border-indigo-500 bg-gray-50 dark:bg-gray-900/50"
              } text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
            />
            {errors.onlineLink && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium">
                {errors.onlineLink}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 tracking-tight">
                🏢 Venue Name *
              </label>
              <input
                value={formData.venue}
                onChange={(e) => handleInputChange("venue", e.target.value)}
                placeholder="Enter venue name"
                className={`w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200 font-medium ${
                  errors.venue
                    ? "border-red-300 focus:border-red-500 bg-red-50/50 dark:bg-red-900/10"
                    : "border-gray-200 dark:border-gray-700 focus:border-indigo-500 bg-gray-50 dark:bg-gray-900/50"
                } text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
              />
              {errors.venue && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium">
                  {errors.venue}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 tracking-tight">
                📮 Address
              </label>
              <input
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Street address"
                className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium transition-all duration-200"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder="City"
                className="px-4 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium transition-all duration-200"
              />
              <input
                value={formData.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                placeholder="State/Province"
                className="px-4 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium transition-all duration-200"
              />
              <input
                value={formData.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
                placeholder="Country"
                className="px-4 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium transition-all duration-200"
              />
            </div>
          </div>
        )}
      </div>

      {/* Tickets & Pricing */}
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
            Tickets & Pricing
          </h2>
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Configure ticket pricing for your event
          </p>
        </div>

        <div className="space-y-4">
          {(() => {
            const t = (formData.tickets && formData.tickets[0]) || {
              id: "primary",
              name: "General Admission",
              price: 0,
              quantity: 100,
              description: "",
            };
            return (
              <div
                key={t.id}
                className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-indigo-200/50 dark:border-indigo-700/50"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
                    🎟️ Ticket Configuration
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 tracking-tight">
                      Ticket Name *
                    </label>
                    <input
                      type="text"
                      value={t.name}
                      onChange={(e) =>
                        updateTicket(t.id, "name", e.target.value)
                      }
                      placeholder="e.g., General Admission"
                      className={`w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200 font-medium ${
                        errors.ticketName
                          ? "border-red-300 focus:border-red-500 bg-red-50/50 dark:bg-red-900/10"
                          : "border-gray-200 dark:border-gray-700 focus:border-indigo-500 bg-white dark:bg-gray-800"
                      } text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                    />
                    {errors.ticketName && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium">
                        {errors.ticketName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 tracking-tight">
                      💵 Price ($) *
                    </label>
                    <input
                      type="number"
                      value={t.price}
                      onChange={(e) =>
                        updateTicket(
                          t.id,
                          "price",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className={`w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200 font-medium ${
                        errors.ticketPrice
                          ? "border-red-300 focus:border-red-500 bg-red-50/50 dark:bg-red-900/10"
                          : "border-gray-200 dark:border-gray-700 focus:border-indigo-500 bg-white dark:bg-gray-800"
                      } text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                    />
                    {errors.ticketPrice && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium">
                        {errors.ticketPrice}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 tracking-tight">
                      🎫 Quantity *
                    </label>
                    <input
                      type="number"
                      value={t.quantity}
                      onChange={(e) =>
                        updateTicket(
                          t.id,
                          "quantity",
                          parseInt(e.target.value) || 0,
                        )
                      }
                      min="1"
                      placeholder="100"
                      className={`w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200 font-medium ${
                        errors.ticketQuantity
                          ? "border-red-300 focus:border-red-500 bg-red-50/50 dark:bg-red-900/10"
                          : "border-gray-200 dark:border-gray-700 focus:border-indigo-500 bg-white dark:bg-gray-800"
                      } text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                    />
                    {errors.ticketQuantity && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium">
                        {errors.ticketQuantity}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 tracking-tight">
                      📝 Description
                    </label>
                    <input
                      type="text"
                      value={t.description}
                      onChange={(e) =>
                        updateTicket(t.id, "description", e.target.value)
                      }
                      placeholder="Optional ticket description"
                      className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium transition-all duration-200"
                    />
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Media & Gallery */}
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
            Media & Gallery
          </h2>
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Upload cover image for your event
          </p>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 tracking-tight">
            📸 Event Cover Image
          </label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-8 bg-gradient-to-br from-gray-50 to-indigo-50/30 dark:from-gray-800 dark:to-indigo-900/10 transition-all duration-300 hover:border-indigo-400 dark:hover:border-indigo-500">
            {formData.coverImagePreview ? (
              <div className="relative group">
                <img
                  src={formData.coverImagePreview}
                  alt="cover"
                  className="w-full h-64 object-cover rounded-xl shadow-lg"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    clearCoverImage();
                  }}
                  className="absolute top-4 right-4 p-3 bg-red-500/90 hover:bg-red-600 text-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-200 z-20 hover:scale-110 active:scale-95 backdrop-blur-sm"
                  aria-label="Remove image"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/50">
                  <Camera className="w-10 h-10 text-white" />
                </div>
                <div className="mb-4 flex gap-2 items-center justify-center">
                  <Button
                    type="button"
                    onClick={() =>
                      document.getElementById("coverImage").click()
                    }
                    variant="primary"
                    size="default"
                  >
                    Upload Image
                  </Button>
                  <input
                    id="coverImage"
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageUpload}
                    className="hidden"
                  />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  PNG, JPG, GIF up to 10MB
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  Recommended: 1920x1080px or higher
                </p>
              </div>
            )}
            {errors.coverImage && (
              <p className="mt-3 text-sm text-red-600 dark:text-red-400 flex items-center font-medium">
                <AlertCircle className="w-4 h-4 mr-2" />
                {errors.coverImage}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 tracking-tight">
            📝 Additional Information
          </label>
          <textarea
            value={formData.additionalInfo}
            onChange={(e) =>
              handleInputChange("additionalInfo", e.target.value)
            }
            rows={4}
            placeholder="Any additional details attendees should know..."
            className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium transition-all duration-200 resize-none"
          />
        </div>
      </div>

      {/* Settings & Review */}
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Eye className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
            Settings & Review
          </h2>
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Configure additional settings and review your event
          </p>
        </div>

        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 space-y-6 border border-indigo-200/50 dark:border-indigo-700/50">
          <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4 tracking-tight">
            ⚙️ Event Settings
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 tracking-tight">
                👥 Maximum Attendees (Optional)
              </label>
              <input
                value={formData.maxAttendees}
                onChange={(e) =>
                  handleInputChange("maxAttendees", e.target.value)
                }
                type="number"
                min="1"
                placeholder="Leave empty for unlimited"
                className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 tracking-tight">
                💳 Refund Policy
              </label>
              <select
                value={formData.refundPolicy}
                onChange={(e) =>
                  handleInputChange("refundPolicy", e.target.value)
                }
                className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium transition-all duration-200"
              >
                <option value="flexible">Flexible</option>
                <option value="moderate">Moderate</option>
                <option value="strict">Strict</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) =>
                  handleInputChange("isPublic", e.target.checked)
                }
                className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
              />
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors tracking-tight">
                🌍 Make event public
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.requiresApproval}
                onChange={(e) =>
                  handleInputChange("requiresApproval", e.target.checked)
                }
                className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
              />
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors tracking-tight">
                ✅ Require approval for registration
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.allowWaitlist}
                onChange={(e) =>
                  handleInputChange("allowWaitlist", e.target.checked)
                }
                className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
              />
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors tracking-tight">
                📝 Allow waitlist when tickets sold out
              </span>
            </label>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4 tracking-tight flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            Event Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <span className="font-medium">Title:</span>{" "}
              <span className="ml-2">{formData.title || "Not set"}</span>
            </div>
            <div>
              <span className="font-medium">Category:</span>{" "}
              <span className="ml-2">{formData.category || "Not set"}</span>
            </div>
            <div>
              <span className="font-medium">Date:</span>{" "}
              <span className="ml-2">
                {formData.startDate && formData.startTime
                  ? `${formData.startDate} at ${formData.startTime}`
                  : "Not set"}
              </span>
            </div>
            <div>
              <span className="font-medium">Location:</span>{" "}
              <span className="ml-2">
                {formData.isOnline
                  ? "Online Event"
                  : formData.venue || "Not set"}
              </span>
            </div>
            <div>
              <span className="font-medium">Total Tickets:</span>{" "}
              <span className="ml-2">
                {formData.tickets.reduce(
                  (sum, t) => sum + Number(t.quantity || 0),
                  0,
                )}
              </span>
            </div>
            <div>
              <span className="font-medium">Ticket Type:</span>{" "}
              <span className="ml-2">
                {formData.tickets[0]?.name || "Not set"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-gray-900 dark:to-indigo-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-700/30 p-8 text-center">
            <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
            <p className="text-gray-600 dark:text-gray-300">
              Loading event details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="back" size="small" className="mb-4" />
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
              Edit Your Event
            </h1>
            <p className="text-gray-600 dark:text-gray-400 font-medium max-w-2xl mx-auto">
              Update your event details and make changes as needed
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (validateAll()) handleSubmit(false);
            }}
          >
            <div className="p-6 md:p-10">{renderFormContent()}</div>

            {/* Error Messages */}
            {Object.keys(errors).length > 0 && (
              <div className="px-6 md:px-10 pb-6">
                <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-red-600 dark:text-red-400 font-medium space-y-1">
                      {Object.values(errors).map((e, i) => (
                        <p key={i}>• {e}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="px-6 md:px-10 pb-6">
                <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-4">
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                      {success}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Actions */}
            <div className="px-6 md:px-10 py-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <Button
                  type="button"
                  to="/organizer/events"
                  variant="outline"
                  size="default"
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>

                <div className="flex gap-3 w-full sm:w-auto">
                  <Button
                    type="button"
                    onClick={() => {
                      if (validateAll()) handleSubmit(true);
                    }}
                    variant="secondary"
                    size="default"
                    className="flex-1 sm:flex-none"
                  >
                    Save Draft
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="default"
                    className="flex-1 sm:flex-none"
                  >
                    Update Event
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditEventPage;
