import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Camera,
  FileText,
  Globe,
  Tag,
  Plus,
  X,
  ArrowLeft,
  ArrowRight,
  Save,
  Eye,
  Upload,
  Check,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import useDeviceDetection from "../../hooks/useDeviceDetection";

const CreateEventPage = () => {
  const navigate = useNavigate();
  const { currentUser, token } = useAuth();
  const deviceInfo = useDeviceDetection();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [errors, setErrors] = useState({});
  const [previewMode, setPreviewMode] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    // Basic Information
    title: "",
    description: "",
    category: "",
    tags: [],

    // Event Details
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

    // Tickets & Pricing
    tickets: [
      {
        id: 1,
        name: "General Admission",
        price: 0,
        quantity: 100,
        description: "",
        isEarlyBird: false,
        earlyBirdPrice: 0,
        earlyBirdEndDate: "",
      },
    ],

    // Media & Assets
    coverImage: null,
    coverImagePreview: "",
    gallery: [],

    // Additional Settings
    isPublic: true,
    requiresApproval: false,
    maxAttendees: "",
    allowWaitlist: true,
    refundPolicy: "flexible",
    additionalInfo: "",
  });

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

  const steps = [
    { number: 1, title: "Basic Info", icon: FileText },
    { number: 2, title: "Date & Location", icon: MapPin },
    { number: 3, title: "Tickets & Pricing", icon: DollarSign },
    { number: 4, title: "Media & Gallery", icon: Camera },
    { number: 5, title: "Settings & Review", icon: Eye },
  ];

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // Handle tag management
  const addTag = (tag) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  // Handle ticket management
  // Ticket management: single primary ticket only
  const updateTicket = (ticketId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      tickets: prev.tickets.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, [field]: value } : ticket,
      ),
    }));
  };

  // Handle file uploads
  const handleCoverImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          coverImage: "Please select a valid image file (JPEG, PNG, WebP)",
        }));
        return;
      }

      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        setErrors((prev) => ({
          ...prev,
          coverImage: "Image file size must be less than 10MB",
        }));
        return;
      }

      // Clear any previous errors
      setErrors((prev) => ({
        ...prev,
        coverImage: "",
      }));

      // Show compression indicator
      setIsCompressing(true);

      try {
        // Create preview URL
        const previewUrl = URL.createObjectURL(file);

        setFormData((prev) => ({
          ...prev,
          coverImage: file,
          coverImagePreview: previewUrl,
        }));

        setIsCompressing(false);
      } catch (error) {
        console.error("Error processing image:", error);
        setErrors((prev) => ({
          ...prev,
          coverImage: "Failed to process image. Please try again.",
        }));
        setIsCompressing(false);
      }
    }
  };

  // Handle clearing cover image
  const clearCoverImage = () => {
    // Revoke the object URL to prevent memory leaks
    if (formData.coverImagePreview) {
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

  // Form validation
  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.title.trim()) newErrors.title = "Event title is required";
        if (!formData.description.trim())
          newErrors.description = "Event description is required";
        if (!formData.category) newErrors.category = "Please select a category";
        break;

      case 2:
        if (!formData.startDate) newErrors.startDate = "Start date is required";
        if (!formData.startTime) newErrors.startTime = "Start time is required";
        if (!formData.isOnline && !formData.venue.trim())
          newErrors.venue = "Venue is required for in-person events";
        if (formData.isOnline && !formData.onlineLink.trim())
          newErrors.onlineLink = "Online link is required for virtual events";
        break;

      case 3:
        // validate primary ticket only
        const primary = formData.tickets && formData.tickets[0];
        if (!primary)
          newErrors.tickets = "At least one ticket type is required";
        else {
          if (!primary.name.trim())
            newErrors.ticket_name = "Ticket name is required";
          if (primary.quantity <= 0)
            newErrors.ticket_quantity = "Quantity must be greater than 0";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation handlers
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Form submission
  const handleSubmit = async (isDraft = false) => {
    if (!isDraft && !validateStep(5)) return;

    setIsLoading(true);

    try {
      // Upload image to Cloudinary if exists
      let imageUrl = "";
      let imagePublicId = "";
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

      // Prepare event data for API
      const eventData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        tags: formData.tags,

        // Combine date and time for backend (single start date/time)
        date: new Date(
          `${formData.startDate}T${formData.startTime}`,
        ).toISOString(),

        // Location data
        location: formData.isOnline ? "Online Event" : formData.venue,
        address: formData.isOnline ? "" : formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        isOnline: formData.isOnline,
        onlineLink: formData.onlineLink,

        // Image (Cloudinary URL)
        image: imageUrl,
        imagePublicId: imagePublicId,

        // Ticket information - use first ticket for basic pricing
        ticketPrice: formData.tickets[0]?.price || 0,
        totalTickets: formData.tickets.reduce(
          (total, ticket) => total + ticket.quantity,
          0,
        ),
        remainingTickets: formData.tickets.reduce(
          (total, ticket) => total + ticket.quantity,
          0,
        ),
        availableTickets: formData.tickets.reduce(
          (total, ticket) => total + ticket.quantity,
          0,
        ),
        tickets: formData.tickets,

        // Additional settings
        maxAttendees: formData.maxAttendees
          ? parseInt(formData.maxAttendees)
          : null,
        requiresApproval: formData.requiresApproval,
        allowWaitlist: formData.allowWaitlist,
        refundPolicy: formData.refundPolicy,
        additionalInfo: formData.additionalInfo,
        isPublic: formData.isPublic,

        // Status
        status: isDraft ? "draft" : "published",
        featured: false,
        attendeeCount: 0,
      };

      console.log("Submitting event data...", {
        ...eventData,
        image: imageUrl ? `[Cloudinary URL]` : "No image",
      });

      // Make API call to create event
      const response = await fetch("http://localhost:3003/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(eventData),
      });

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Server returned non-JSON response:", text);
        throw new Error(
          "Server error. Please check if the backend is running correctly.",
        );
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create event");
      }

      if (result.success) {
        // Clean up object URL to prevent memory leaks
        if (formData.coverImagePreview) {
          URL.revokeObjectURL(formData.coverImagePreview);
        }

        navigate("/organizer/events", {
          state: {
            message: `Event ${
              isDraft ? "saved as draft" : "created"
            } successfully!`,
            type: "success",
          },
        });
      }
    } catch (error) {
      console.error("Error creating event:", error);
      setErrors({ submit: error.message || "Failed to create event" });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1: Basic Information
  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
          Tell us about your event
        </h2>
        <p className="text-gray-600 dark:text-gray-400 font-medium">
          Let's start with the basic information that will help people discover
          your event
        </p>
      </div>

      {/* Event Title */}
      <div>
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 tracking-tight">
          Event Title *
        </label>
        <input
          type="text"
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

      {/* Event Description */}
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

      {/* Category Selection */}
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
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
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

      {/* Tags */}
      <div>
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 tracking-tight">
          Event Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {formData.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1.5 rounded-xl text-sm bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-indigo-800 dark:text-indigo-200 font-bold border border-indigo-200 dark:border-indigo-700"
            >
              {tag}
              <Button
                type="button"
                onClick={() => removeTag(tag)}
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
            type="text"
            placeholder="Add a tag and press Enter"
            className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-medium transition-all duration-200"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag(e.target.value.trim());
                e.target.value = "";
              }
            }}
          />
          <Button
            type="button"
            onClick={(e) => {
              const input = e.target.closest("div").querySelector("input");
              addTag(input.value.trim());
              input.value = "";
            }}
            variant="primary"
            size="default"
            className="!px-6"
            icon={<Plus className="w-4 h-4" />}
          />
        </div>
      </div>
    </div>
  );

  // Step 2: Date & Location
  const renderDateLocation = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
          When and where is your event?
        </h2>
        <p className="text-gray-600 dark:text-gray-400 font-medium">
          Set the date, time, and location details for your event
        </p>
      </div>

      {/* Event Type Toggle */}
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

      {/* Date and Time */}
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

      {/* Location Details */}
      {formData.isOnline ? (
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 tracking-tight">
            🔗 Online Event Link *
          </label>
          <input
            type="url"
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
              type="text"
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
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="Street address"
              className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium transition-all duration-200"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleInputChange("city", e.target.value)}
              placeholder="City"
              className="px-4 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium transition-all duration-200"
            />
            <input
              type="text"
              value={formData.state}
              onChange={(e) => handleInputChange("state", e.target.value)}
              placeholder="State/Province"
              className="px-4 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium transition-all duration-200"
            />
            <input
              type="text"
              value={formData.country}
              onChange={(e) => handleInputChange("country", e.target.value)}
              placeholder="Country"
              className="px-4 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium transition-all duration-200"
            />
          </div>
        </div>
      )}
    </div>
  );

  // Step 3: Tickets & Pricing
  const renderTicketsPricing = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <DollarSign className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
          Set up your tickets
        </h2>
        <p className="text-gray-600 dark:text-gray-400 font-medium">
          Create different ticket types and set pricing for your event
        </p>
      </div>

      <div className="space-y-4">
        {(() => {
          const ticket = (formData.tickets && formData.tickets[0]) || {
            id: 1,
            name: "General Admission",
            price: 0,
            quantity: 100,
            description: "",
            isEarlyBird: false,
            earlyBirdPrice: 0,
            earlyBirdEndDate: "",
          };
          return (
            <div
              key={ticket.id}
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
                    value={ticket.name}
                    onChange={(e) =>
                      updateTicket(ticket.id, "name", e.target.value)
                    }
                    placeholder="e.g., General Admission"
                    className={`w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200 font-medium ${
                      errors.ticket_name
                        ? "border-red-300 focus:border-red-500 bg-red-50/50 dark:bg-red-900/10"
                        : "border-gray-200 dark:border-gray-700 focus:border-indigo-500 bg-white dark:bg-gray-800"
                    } text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                  />
                  {errors.ticket_name && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium">
                      {errors.ticket_name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 tracking-tight">
                    💰 Price ($)
                  </label>
                  <input
                    type="number"
                    value={ticket.price}
                    onChange={(e) =>
                      updateTicket(
                        ticket.id,
                        "price",
                        parseFloat(e.target.value) || 0,
                      )
                    }
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 tracking-tight">
                    📊 Quantity Available *
                  </label>
                  <input
                    type="number"
                    value={ticket.quantity}
                    onChange={(e) =>
                      updateTicket(
                        ticket.id,
                        "quantity",
                        parseInt(e.target.value) || 0,
                      )
                    }
                    min="1"
                    placeholder="100"
                    className={`w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200 font-medium ${
                      errors.ticket_quantity
                        ? "border-red-300 focus:border-red-500 bg-red-50/50 dark:bg-red-900/10"
                        : "border-gray-200 dark:border-gray-700 focus:border-indigo-500 bg-white dark:bg-gray-800"
                    } text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                  />
                  {errors.ticket_quantity && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium">
                      {errors.ticket_quantity}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 tracking-tight">
                    📝 Description
                  </label>
                  <input
                    type="text"
                    value={ticket.description}
                    onChange={(e) =>
                      updateTicket(ticket.id, "description", e.target.value)
                    }
                    placeholder="Brief description of this ticket type"
                    className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium transition-all duration-200"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={ticket.isEarlyBird}
                    onChange={(e) =>
                      updateTicket(ticket.id, "isEarlyBird", e.target.checked)
                    }
                    className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors tracking-tight">
                    🎯 Enable Early Bird Pricing
                  </span>
                </label>

                {ticket.isEarlyBird && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-indigo-200 dark:border-indigo-700">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 tracking-tight">
                        🌟 Early Bird Price ($)
                      </label>
                      <input
                        type="number"
                        value={ticket.earlyBirdPrice}
                        onChange={(e) =>
                          updateTicket(
                            ticket.id,
                            "earlyBirdPrice",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 tracking-tight">
                        ⏰ Early Bird End Date
                      </label>
                      <input
                        type="date"
                        value={ticket.earlyBirdEndDate}
                        onChange={(e) =>
                          updateTicket(
                            ticket.id,
                            "earlyBirdEndDate",
                            e.target.value,
                          )
                        }
                        min={new Date().toISOString().split("T")[0]}
                        max={formData.startDate}
                        className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium transition-all duration-200"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );

  // Step 4: Media & Gallery
  const renderMediaGallery = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Camera className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
          Add images to showcase your event
        </h2>
        <p className="text-gray-600 dark:text-gray-400 font-medium">
          Upload a cover image to make your event more appealing
        </p>
      </div>

      {/* Cover Image Upload */}
      <div>
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 tracking-tight">
          📸 Cover Image
        </label>

        {isCompressing ? (
          // Loading State
          <div className="border-2 border-dashed border-indigo-300 dark:border-indigo-600 rounded-2xl p-12 text-center bg-gradient-to-br from-gray-50 to-indigo-50/30 dark:from-gray-800 dark:to-indigo-900/10">
            <div className="py-8">
              <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/50 animate-pulse">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-2 font-bold text-lg">
                Processing image...
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                Please wait while we optimize your image
              </p>
            </div>
          </div>
        ) : formData.coverImagePreview ? (
          // Image Preview State
          <div className="border-2 border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-lg">
            {/* Image Display with Overlay */}
            <div className="relative group">
              <img
                src={formData.coverImagePreview}
                alt="Cover preview"
                className="w-full h-80 object-cover"
              />

              {/* Dark overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300" />

              {/* Delete Button - Positioned in top-right */}
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

              {/* Change Image Button - Positioned in bottom-center */}
              <label className="absolute bottom-4 left-1/2 -translate-x-1/2 cursor-pointer opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                <span className="inline-flex items-center gap-2 px-6 py-3 bg-white/95 hover:bg-white dark:bg-gray-800/95 dark:hover:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-bold text-sm shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700">
                  <Upload className="w-4 h-4" />
                  Change Image
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleCoverImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isCompressing}
                />
              </label>
            </div>

            {/* Image Info Section */}
            <div className="p-5 bg-gradient-to-r from-gray-50 to-indigo-50/30 dark:from-gray-900/50 dark:to-indigo-900/10 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                {/* Success Icon */}
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
                  <Check className="w-6 h-6 text-white" />
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {formData.coverImage?.name}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      {(formData.coverImage?.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    {formData.coverImage?.size > 1024 * 1024 && (
                      <>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          •
                        </span>
                        <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                          Will be compressed
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Desktop Change Button */}
                <label className="hidden sm:block flex-shrink-0 cursor-pointer">
                  <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-105 active:scale-95">
                    <Upload className="w-4 h-4" />
                    Replace
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleCoverImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isCompressing}
                  />
                </label>
              </div>
            </div>
          </div>
        ) : (
          // Upload Prompt State
          <div className="relative group">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-12 text-center hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-300 bg-gradient-to-br from-gray-50 to-indigo-50/30 dark:from-gray-800 dark:to-indigo-900/10 cursor-pointer group-hover:shadow-lg">
              <div className="py-8">
                <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/50 group-hover:shadow-indigo-500/70 group-hover:scale-110 transition-all duration-300">
                  <Upload className="w-10 h-10 text-white" />
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-2 font-bold text-lg">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  PNG, JPG, WebP up to 10MB
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 max-w-md mx-auto">
                  Recommended: 1920x1080px or higher resolution
                  <br />
                  Images will be automatically optimized for web
                </p>
              </div>
            </div>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleCoverImageUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isCompressing}
            />
          </div>
        )}

        {/* Error Message */}
        {errors.coverImage && (
          <div className="mt-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4">
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center font-medium">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              {errors.coverImage}
            </p>
          </div>
        )}

        {/* Upload Tips */}
        <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-2 flex items-center">
            <span className="mr-2">💡</span>
            Image Tips
          </h4>
          <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1 ml-6">
            <li className="list-disc">
              Use high-quality images (1920x1080px recommended)
            </li>
            <li className="list-disc">
              Landscape orientation works best for event covers
            </li>
            <li className="list-disc">
              Large images will be automatically compressed
            </li>
            <li className="list-disc">Supported formats: JPEG, PNG, WebP</li>
          </ul>
        </div>
      </div>
    </div>
  );

  // Step 5: Settings & Review
  const renderSettingsReview = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Eye className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
          Final settings and review
        </h2>
        <p className="text-gray-600 dark:text-gray-400 font-medium">
          Configure additional settings and review your event before publishing
        </p>
      </div>

      {/* Event Settings */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 space-y-6 border border-indigo-200/50 dark:border-indigo-700/50">
        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4 tracking-tight">
          ⚙️ Event Settings
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center space-x-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={formData.isPublic}
              onChange={(e) => handleInputChange("isPublic", e.target.checked)}
              className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
            />
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors tracking-tight">
              🌍 Make event public
            </span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer group">
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

          <label className="flex items-center space-x-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={formData.allowWaitlist}
              onChange={(e) =>
                handleInputChange("allowWaitlist", e.target.checked)
              }
              className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
            />
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors tracking-tight">
              📋 Allow waitlist when sold out
            </span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 tracking-tight">
            👥 Maximum Attendees (optional)
          </label>
          <input
            type="number"
            value={formData.maxAttendees}
            onChange={(e) => handleInputChange("maxAttendees", e.target.value)}
            placeholder="Leave empty for unlimited"
            min="1"
            className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 tracking-tight">
            💳 Refund Policy
          </label>
          <select
            value={formData.refundPolicy}
            onChange={(e) => handleInputChange("refundPolicy", e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium transition-all duration-200"
          >
            <option value="flexible">
              Flexible - Full refund until 24 hours before
            </option>
            <option value="moderate">
              Moderate - Full refund until 7 days before
            </option>
            <option value="strict">Strict - No refunds</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 tracking-tight">
            📌 Additional Information
          </label>
          <textarea
            value={formData.additionalInfo}
            onChange={(e) =>
              handleInputChange("additionalInfo", e.target.value)
            }
            placeholder="Any additional information for attendees..."
            rows={3}
            className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none font-medium transition-all duration-200"
          />
        </div>
      </div>

      {/* Event Summary */}
      <div className="bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl p-8 border-2 border-indigo-300 dark:border-indigo-600 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
            📋 Event Summary
          </h3>
          <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/50">
            <span className="text-white text-xl">✨</span>
          </div>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex items-start bg-white/50 dark:bg-gray-800/50 rounded-xl p-3">
            <span className="font-black text-gray-700 dark:text-gray-300 min-w-[120px]">
              Title:
            </span>
            <span className="text-gray-900 dark:text-white font-medium flex-1">
              {formData.title || "Not set"}
            </span>
          </div>
          <div className="flex items-start bg-white/50 dark:bg-gray-800/50 rounded-xl p-3">
            <span className="font-black text-gray-700 dark:text-gray-300 min-w-[120px]">
              Category:
            </span>
            <span className="text-gray-900 dark:text-white font-medium flex-1">
              {formData.category || "Not set"}
            </span>
          </div>
          <div className="flex items-start bg-white/50 dark:bg-gray-800/50 rounded-xl p-3">
            <span className="font-black text-gray-700 dark:text-gray-300 min-w-[120px]">
              Date & Time:
            </span>
            <span className="text-gray-900 dark:text-white font-medium flex-1">
              {formData.startDate
                ? `${formData.startDate} at ${formData.startTime}`
                : "Not set"}
            </span>
          </div>
          <div className="flex items-start bg-white/50 dark:bg-gray-800/50 rounded-xl p-3">
            <span className="font-black text-gray-700 dark:text-gray-300 min-w-[120px]">
              Location:
            </span>
            <span className="text-gray-900 dark:text-white font-medium flex-1">
              {formData.isOnline
                ? "🌐 Online Event"
                : formData.venue || "Not set"}
            </span>
          </div>
          <div className="flex items-start bg-white/50 dark:bg-gray-800/50 rounded-xl p-3">
            <span className="font-black text-gray-700 dark:text-gray-300 min-w-[120px]">
              Total Tickets:
            </span>
            <span className="text-gray-900 dark:text-white font-medium flex-1">
              {formData.tickets.reduce(
                (total, t) => total + Number(t.quantity || 0),
                0,
              )}{" "}
              tickets
            </span>
          </div>
          <div className="flex items-start bg-white/50 dark:bg-gray-800/50 rounded-xl p-3">
            <span className="font-black text-gray-700 dark:text-gray-300 min-w-[120px]">
              Tags:
            </span>
            <span className="text-gray-900 dark:text-white font-medium flex-1">
              {formData.tags.length > 0 ? formData.tags.join(", ") : "None"}
            </span>
          </div>
        </div>
      </div>

      {errors.submit && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-2 border-red-300 dark:border-red-700 rounded-2xl p-5 shadow-lg">
          <p className="text-red-700 dark:text-red-400 flex items-center font-bold">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            {errors.submit}
          </p>
        </div>
      )}
    </div>
  );

  // Main render
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-all duration-300">
      {/* Header with Integrated Progress */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="px-8 py-4">
          {/* Single Row: Back Button + Title + Progress Steps + Actions */}
          <div className="flex items-center gap-6">
            {/* Left: Back Button + Title */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <Button variant="back" size="default" />
              <div>
                <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                  Create New Event
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mt-0.5">
                  Step {currentStep} of 5 • {steps[currentStep - 1]?.title}
                </p>
              </div>
            </div>

            {/* Center: Progress Steps */}
            <div className="flex-1 flex items-center justify-center px-4">
              <div className="flex items-center gap-4 w-full max-w-4xl">
                {steps.map((step, index) => (
                  <React.Fragment key={step.number}>
                    <div className="flex flex-col items-center flex-1 group">
                      <div
                        onClick={() => {
                          // Allow navigation to completed steps
                          if (currentStep > step.number) {
                            setCurrentStep(step.number);
                          }
                        }}
                        className={`relative flex items-center justify-center w-11 h-11 rounded-2xl border-2 transition-all duration-300 ${
                          currentStep > step.number
                            ? "cursor-pointer"
                            : "cursor-default"
                        } ${
                          currentStep >= step.number
                            ? "bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 border-transparent text-white shadow-xl scale-105"
                            : "border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md"
                        } ${
                          currentStep > step.number ? "hover:scale-110" : ""
                        }`}
                      >
                        {currentStep > step.number ? (
                          <Check className="w-5 h-5 stroke-[2.5]" />
                        ) : (
                          <step.icon
                            className={`w-5 h-5 ${
                              currentStep === step.number
                                ? "stroke-[2.5]"
                                : "stroke-[2]"
                            }`}
                          />
                        )}
                        {currentStep === step.number && (
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 opacity-30 animate-pulse"></div>
                        )}
                      </div>
                      <span
                        className={`mt-2 text-[10px] font-bold tracking-tight text-center whitespace-nowrap transition-colors duration-300 ${
                          currentStep >= step.number
                            ? "text-gray-900 dark:text-white"
                            : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                        }`}
                      >
                        {step.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className="flex items-center flex-shrink-0"
                        style={{ marginTop: "-22px" }}
                      >
                        <div
                          className={`w-16 h-0.5 transition-all duration-500 ${
                            currentStep > step.number
                              ? "bg-gradient-to-r from-indigo-500 to-purple-600"
                              : "bg-gray-300 dark:bg-gray-600"
                          }`}
                        ></div>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
              <Button
                onClick={() => handleSubmit(true)}
                disabled={isLoading}
                variant="outline"
                size="default"
                className="!border-gray-300 dark:!border-gray-600 !text-gray-700 dark:!text-gray-300 hover:!bg-gray-50 dark:hover:!bg-gray-800"
              >
                💾 Save Draft
              </Button>
              <Button
                onClick={() => setPreviewMode(!previewMode)}
                variant="secondary"
                size="default"
                icon={<Eye className="w-4 h-4" />}
                iconPosition="left"
              >
                Preview
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 pb-24 sm:pb-8">
        {/* Form Content */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl lg:rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 sm:p-8 lg:p-12">
          {currentStep === 1 && renderBasicInfo()}
          {currentStep === 2 && renderDateLocation()}
          {currentStep === 3 && renderTicketsPricing()}
          {currentStep === 4 && renderMediaGallery()}
          {currentStep === 5 && renderSettingsReview()}

          {/* Desktop Navigation Buttons */}
          <div className="hidden sm:flex items-center justify-between mt-12 pt-8 border-t-2 border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              variant="outline"
              size="default"
              className="!border-gray-300 dark:!border-gray-600 !text-gray-700 dark:!text-gray-300 hover:!bg-gray-50 dark:hover:!bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed !px-8"
              icon={<ArrowLeft className="w-4 h-4" />}
              iconPosition="left"
            >
              Previous Step
            </Button>

            {currentStep === 5 ? (
              <Button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={isLoading}
                variant="primary"
                size="default"
                className="!px-10 !py-4 !shadow-xl !shadow-indigo-500/50"
                icon={
                  isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )
                }
                iconPosition="left"
              >
                {isLoading ? "Publishing..." : "🚀 Publish Event"}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleNext}
                variant="primary"
                size="default"
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
              >
                Next Step
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Fixed Bottom Navigation */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 p-4 shadow-2xl z-40">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            variant="outline"
            size="default"
            className="!border-gray-300 dark:!border-gray-600 !text-gray-700 dark:!text-gray-300 hover:!bg-gray-50 dark:hover:!bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex-1"
            icon={<ArrowLeft className="w-4 h-4" />}
            iconPosition="left"
          >
            Previous
          </Button>

          <Button
            onClick={() => handleSubmit(true)}
            disabled={isLoading}
            variant="outline"
            size="default"
            className="!border-gray-300 dark:!border-gray-600 !text-gray-700 dark:!text-gray-300 hover:!bg-gray-50 dark:hover:!bg-gray-800 !px-3 !py-3 !min-w-[48px]"
            icon={<Save className="w-5 h-5" />}
          />

          {currentStep === 5 ? (
            <Button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={isLoading}
              variant="primary"
              size="default"
              className="flex-1 !shadow-xl !shadow-indigo-500/50"
              icon={
                isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )
              }
              iconPosition="left"
            >
              {isLoading ? "Publishing..." : "Publish"}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleNext}
              variant="primary"
              size="default"
              className="flex-1 !shadow-xl !shadow-indigo-500/50"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateEventPage;
