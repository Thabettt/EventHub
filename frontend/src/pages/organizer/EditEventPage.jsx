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
        t.id === id ? { ...t, [field]: value } : t
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
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFormData((prev) => ({
        ...prev,
        coverImage: file,
        coverImagePreview: ev.target.result,
      }));
    };
    reader.readAsDataURL(file);
  };
  const clearCoverImage = () => {
    setFormData((prev) => ({
      ...prev,
      coverImage: null,
      coverImagePreview: "",
    }));
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
      let imageData = formData.coverImagePreview;
      if (formData.coverImage) {
        // read file as base64
        const reader = new FileReader();
        imageData = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(formData.coverImage);
        });
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
        image: imageData,
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
        status: isDraft ? "draft" : "published",
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
        1200
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
    <div className="space-y-8">
      {/* Basic Info */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Basic Information
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Tell attendees about your event
        </p>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Event Title *
          </label>
          <input
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border-2 ${
              errors.title ? "border-red-300" : "border-gray-200"
            } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.title}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Event Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            rows={4}
            className={`w-full px-4 py-3 rounded-xl border-2 ${
              errors.description ? "border-red-300" : "border-gray-200"
            } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.description}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Category *
          </label>
          <select
            value={formData.category}
            onChange={(e) => handleInputChange("category", e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border-2 ${
              errors.category ? "border-red-300" : "border-gray-200"
            } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
          >
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.category}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200"
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
          <div className="flex">
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
              className="flex-1 px-4 py-2 rounded-l-xl border-2 border-r-0 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <Button
              type="button"
              onClick={() => addTag()}
              variant="outline"
              size="default"
              className="!rounded-l-none !border-l-0"
              icon={<Plus className="w-4 h-4" />}
            />
          </div>
        </div>
      </div>

      {/* Date & Location */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Date & Location
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Start Date *
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleInputChange("startDate", e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border-2 ${
                errors.startDate ? "border-red-300" : "border-gray-200"
              } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
            />
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Start Time *
            </label>
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) => handleInputChange("startTime", e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border-2 ${
                errors.startTime ? "border-red-300" : "border-gray-200"
              } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
            />
            {errors.startTime && (
              <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>
            )}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Event Type
            </span>
            <div className="flex bg-white dark:bg-gray-700 rounded-lg p-1">
              <Button
                type="button"
                onClick={() => handleInputChange("isOnline", false)}
                variant="solid"
                size="small"
                className={`!px-4 !py-2 !rounded-md !text-sm ${
                  !formData.isOnline
                    ? "!bg-indigo-500 !text-white"
                    : "!bg-transparent !text-gray-700 dark:!text-gray-300"
                }`}
              >
                In-Person
              </Button>
              <Button
                type="button"
                onClick={() => handleInputChange("isOnline", true)}
                variant="solid"
                size="small"
                className={`!px-4 !py-2 !rounded-md !text-sm ${
                  formData.isOnline
                    ? "!bg-indigo-500 !text-white"
                    : "!bg-transparent !text-gray-700 dark:!text-gray-300"
                }`}
              >
                Online
              </Button>
            </div>
          </div>
        </div>

        {formData.isOnline ? (
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Online Link *
            </label>
            <input
              value={formData.onlineLink}
              onChange={(e) => handleInputChange("onlineLink", e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border-2 ${
                errors.onlineLink ? "border-red-300" : "border-gray-200"
              } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
              placeholder="https://zoom.us/j/..."
            />
            {errors.onlineLink && (
              <p className="mt-1 text-sm text-red-600">{errors.onlineLink}</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Venue Name *
              </label>
              <input
                value={formData.venue}
                onChange={(e) => handleInputChange("venue", e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border-2 ${
                  errors.venue ? "border-red-300" : "border-gray-200"
                } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
              />
              {errors.venue && (
                <p className="mt-1 text-sm text-red-600">{errors.venue}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Address
              </label>
              <input
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder="City"
                className="px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <input
                value={formData.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                placeholder="State"
                className="px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <input
                value={formData.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
                placeholder="Country"
                className="px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* Tickets & Pricing */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Tickets & Pricing
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Configure ticket pricing (single tier)
        </p>
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
                className="border rounded-lg p-4 bg-white dark:bg-gray-800"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    value={t.name}
                    onChange={(e) => updateTicket(t.id, "name", e.target.value)}
                    placeholder="Ticket name"
                    className="px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  <input
                    type="number"
                    value={t.price}
                    onChange={(e) =>
                      updateTicket(t.id, "price", e.target.value)
                    }
                    placeholder="Price"
                    className="px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  <input
                    type="number"
                    value={t.quantity}
                    onChange={(e) =>
                      updateTicket(t.id, "quantity", e.target.value)
                    }
                    placeholder="Quantity"
                    className="px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="mt-3">
                  <textarea
                    value={t.description}
                    onChange={(e) =>
                      updateTicket(t.id, "description", e.target.value)
                    }
                    rows={2}
                    placeholder="Ticket description (optional)"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Media & Gallery */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Media & Gallery
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Upload cover image and gallery
        </p>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Event Cover Image
          </label>
          <div className="border-2 border-dashed rounded-lg p-6 bg-white dark:bg-gray-800">
            {formData.coverImagePreview ? (
              <div className="relative">
                <img
                  src={formData.coverImagePreview}
                  alt="cover"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  onClick={clearCoverImage}
                  variant="danger"
                  size="small"
                  className="absolute top-2 right-2 !rounded-full !p-1"
                  icon={<X className="w-4 h-4" />}
                />
              </div>
            ) : (
              <div className="text-center">
                <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
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
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            )}
            {errors.coverImage && (
              <p className="mt-2 text-sm text-red-600">{errors.coverImage}</p>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Additional Information
          </label>
          <textarea
            value={formData.additionalInfo}
            onChange={(e) =>
              handleInputChange("additionalInfo", e.target.value)
            }
            rows={4}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Settings & Review */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Settings & Review
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Maximum Attendees (Optional)
            </label>
            <input
              value={formData.maxAttendees}
              onChange={(e) =>
                handleInputChange("maxAttendees", e.target.value)
              }
              type="number"
              min="1"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Leave empty for unlimited"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Refund Policy
            </label>
            <select
              value={formData.refundPolicy}
              onChange={(e) =>
                handleInputChange("refundPolicy", e.target.value)
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="flexible">Flexible</option>
              <option value="no-refunds">No Refunds</option>
              <option value="full-refund">Full Refund</option>
              <option value="partial-refund">Partial Refund</option>
              <option value="custom">Custom Policy</option>
            </select>
          </div>
        </div>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.requiresApproval}
              onChange={(e) =>
                handleInputChange("requiresApproval", e.target.checked)
              }
              className="rounded text-indigo-600"
            />{" "}
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Require approval for registration
            </span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.allowWaitlist}
              onChange={(e) =>
                handleInputChange("allowWaitlist", e.target.checked)
              }
              className="rounded text-indigo-600"
            />{" "}
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Allow waitlist when full
            </span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.isPublic}
              onChange={(e) => handleInputChange("isPublic", e.target.checked)}
              className="rounded text-indigo-600"
            />{" "}
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Make event public
            </span>
          </label>
        </div>
        <div className="border rounded-lg p-6 bg-gray-50 dark:bg-gray-900">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
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
                  0
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-gray-900 dark:to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-3">
          <Button variant="back" size="small" />
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Edit Event
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Update your event details
            </p>
          </div>
        </div>
        <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-700/30 overflow-hidden">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (validateAll()) handleSubmit(false);
            }}
          >
            <div className="p-8">{renderFormContent()}</div>
            {Object.keys(errors).length > 0 && (
              <div className="px-8 pb-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                    <div className="text-sm text-red-700">
                      {Object.values(errors).map((e, i) => (
                        <p key={i}>{e}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {success && (
              <div className="px-8 pb-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex">
                    <Check className="w-5 h-5 text-green-400 mr-2" />
                    <p className="text-sm text-green-700">{success}</p>
                  </div>
                </div>
              </div>
            )}
            <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-200/50 dark:bg-gray-800/40">
              <div className="flex items-center justify-between">
                <div className="flex gap-3">
                  <Button
                    type="button"
                    to="/organizer/events"
                    variant="outline"
                    size="default"
                  >
                    Cancel
                  </Button>
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={() => {
                      if (validateAll()) handleSubmit(true);
                    }}
                    variant="secondary"
                    size="default"
                    className="!bg-gray-600 !text-white"
                  >
                    Save as Draft
                  </Button>
                  <Button type="submit" variant="primary" size="default">
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
