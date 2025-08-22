import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
    endDate: "",
    endTime: "",
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
  const addTicket = () => {
    const newTicket = {
      id: Date.now(),
      name: "",
      price: 0,
      quantity: 100,
      description: "",
      isEarlyBird: false,
      earlyBirdPrice: 0,
      earlyBirdEndDate: "",
    };

    setFormData((prev) => ({
      ...prev,
      tickets: [...prev.tickets, newTicket],
    }));
  };

  const updateTicket = (ticketId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      tickets: prev.tickets.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, [field]: value } : ticket
      ),
    }));
  };

  const removeTicket = (ticketId) => {
    setFormData((prev) => ({
      ...prev,
      tickets: prev.tickets.filter((ticket) => ticket.id !== ticketId),
    }));
  };

  // Handle file uploads
  const handleCoverImageUpload = (event) => {
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

      setFormData((prev) => ({
        ...prev,
        coverImage: file,
        coverImagePreview: URL.createObjectURL(file),
      }));
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
        if (!formData.endDate) newErrors.endDate = "End date is required";
        if (!formData.endTime) newErrors.endTime = "End time is required";
        if (!formData.isOnline && !formData.venue.trim())
          newErrors.venue = "Venue is required for in-person events";
        if (formData.isOnline && !formData.onlineLink.trim())
          newErrors.onlineLink = "Online link is required for virtual events";
        break;

      case 3:
        if (formData.tickets.length === 0)
          newErrors.tickets = "At least one ticket type is required";
        formData.tickets.forEach((ticket, index) => {
          if (!ticket.name.trim())
            newErrors[`ticket_${index}_name`] = "Ticket name is required";
          if (ticket.quantity <= 0)
            newErrors[`ticket_${index}_quantity`] =
              "Quantity must be greater than 0";
        });
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
      // Convert image to base64 if exists
      let imageBase64 = "";
      if (formData.coverImage) {
        const reader = new FileReader();
        imageBase64 = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(formData.coverImage);
        });
      }

      // Prepare event data for API
      const eventData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        tags: formData.tags,

        // Combine date and time for backend
        date: new Date(`${formData.startDate}T${formData.startTime}`),
        endDate: new Date(`${formData.endDate}T${formData.endTime}`),

        // Location data
        location: formData.isOnline ? "Online Event" : formData.venue,
        address: formData.isOnline ? "" : formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        isOnline: formData.isOnline,
        onlineLink: formData.onlineLink,

        // Image data
        image: imageBase64,

        // Ticket information - use first ticket for basic pricing
        ticketPrice: formData.tickets[0]?.price || 0,
        totalTickets: formData.tickets.reduce(
          (total, ticket) => total + ticket.quantity,
          0
        ),
        remainingTickets: formData.tickets.reduce(
          (total, ticket) => total + ticket.quantity,
          0
        ),
        availableTickets: formData.tickets.reduce(
          (total, ticket) => total + ticket.quantity,
          0
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

      // Make API call to create event
      const response = await fetch("http://localhost:3003/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(eventData),
      });

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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Tell us about your event
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Let's start with the basic information that will help people discover
          your event
        </p>
      </div>

      {/* Event Title */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Event Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleInputChange("title", e.target.value)}
          placeholder="Enter your event title"
          className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
            errors.title
              ? "border-red-300 focus:border-red-500"
              : "border-gray-200 dark:border-gray-700 focus:border-indigo-500"
          } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none`}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.title}
          </p>
        )}
      </div>

      {/* Event Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Event Description *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          placeholder="Describe your event in detail..."
          rows={5}
          className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 resize-none ${
            errors.description
              ? "border-red-300 focus:border-red-500"
              : "border-gray-200 dark:border-gray-700 focus:border-indigo-500"
          } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none`}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.description}
          </p>
        )}
      </div>

      {/* Category Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Event Category *
        </label>
        <select
          value={formData.category}
          onChange={(e) => handleInputChange("category", e.target.value)}
          className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
            errors.category
              ? "border-red-300 focus:border-red-500"
              : "border-gray-200 dark:border-gray-700 focus:border-indigo-500"
          } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none`}
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.category}
          </p>
        )}
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Event Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {formData.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex">
          <input
            type="text"
            placeholder="Add a tag and press Enter"
            className="flex-1 px-4 py-2 rounded-l-xl border-2 border-r-0 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag(e.target.value.trim());
                e.target.value = "";
              }
            }}
          />
          <button
            type="button"
            onClick={(e) => {
              const input = e.target.previousElementSibling;
              addTag(input.value.trim());
              input.value = "";
            }}
            className="px-4 py-2 rounded-r-xl border-2 border-l-0 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  // Step 2: Date & Location
  const renderDateLocation = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          When and where is your event?
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Set the date, time, and location details for your event
        </p>
      </div>

      {/* Event Type Toggle */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Event Type
          </span>
          <div className="flex bg-white dark:bg-gray-700 rounded-lg p-1">
            <button
              type="button"
              onClick={() => handleInputChange("isOnline", false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                !formData.isOnline
                  ? "bg-indigo-500 text-white shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
              }`}
            >
              In-Person
            </button>
            <button
              type="button"
              onClick={() => handleInputChange("isOnline", true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                formData.isOnline
                  ? "bg-indigo-500 text-white shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
              }`}
            >
              Online
            </button>
          </div>
        </div>
      </div>

      {/* Date and Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Start Date *
          </label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => handleInputChange("startDate", e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
              errors.startDate
                ? "border-red-300 focus:border-red-500"
                : "border-gray-200 dark:border-gray-700 focus:border-indigo-500"
            } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none`}
          />
          {errors.startDate && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.startDate}
            </p>
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
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
              errors.startTime
                ? "border-red-300 focus:border-red-500"
                : "border-gray-200 dark:border-gray-700 focus:border-indigo-500"
            } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none`}
          />
          {errors.startTime && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.startTime}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            End Date *
          </label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => handleInputChange("endDate", e.target.value)}
            min={formData.startDate || new Date().toISOString().split("T")[0]}
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
              errors.endDate
                ? "border-red-300 focus:border-red-500"
                : "border-gray-200 dark:border-gray-700 focus:border-indigo-500"
            } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none`}
          />
          {errors.endDate && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.endDate}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            End Time *
          </label>
          <input
            type="time"
            value={formData.endTime}
            onChange={(e) => handleInputChange("endTime", e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
              errors.endTime
                ? "border-red-300 focus:border-red-500"
                : "border-gray-200 dark:border-gray-700 focus:border-indigo-500"
            } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none`}
          />
          {errors.endTime && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.endTime}
            </p>
          )}
        </div>
      </div>

      {/* Location Details */}
      {formData.isOnline ? (
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Online Event Link *
          </label>
          <input
            type="url"
            value={formData.onlineLink}
            onChange={(e) => handleInputChange("onlineLink", e.target.value)}
            placeholder="https://zoom.us/meeting/..."
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
              errors.onlineLink
                ? "border-red-300 focus:border-red-500"
                : "border-gray-200 dark:border-gray-700 focus:border-indigo-500"
            } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none`}
          />
          {errors.onlineLink && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.onlineLink}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Venue Name *
            </label>
            <input
              type="text"
              value={formData.venue}
              onChange={(e) => handleInputChange("venue", e.target.value)}
              placeholder="Enter venue name"
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                errors.venue
                  ? "border-red-300 focus:border-red-500"
                  : "border-gray-200 dark:border-gray-700 focus:border-indigo-500"
              } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none`}
            />
            {errors.venue && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.venue}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="Street address"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleInputChange("city", e.target.value)}
              placeholder="City"
              className="px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
            />
            <input
              type="text"
              value={formData.state}
              onChange={(e) => handleInputChange("state", e.target.value)}
              placeholder="State/Province"
              className="px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
            />
            <input
              type="text"
              value={formData.country}
              onChange={(e) => handleInputChange("country", e.target.value)}
              placeholder="Country"
              className="px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Set up your tickets
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Create different ticket types and set pricing for your event
        </p>
      </div>

      <div className="space-y-4">
        {formData.tickets.map((ticket, index) => (
          <div
            key={ticket.id}
            className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Ticket #{index + 1}
              </h3>
              {formData.tickets.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTicket(ticket.id)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Ticket Name *
                </label>
                <input
                  type="text"
                  value={ticket.name}
                  onChange={(e) =>
                    updateTicket(ticket.id, "name", e.target.value)
                  }
                  placeholder="e.g., General Admission"
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                    errors[`ticket_${index}_name`]
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-200 dark:border-gray-700 focus:border-indigo-500"
                  } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none`}
                />
                {errors[`ticket_${index}_name`] && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors[`ticket_${index}_name`]}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Price ($)
                </label>
                <input
                  type="number"
                  value={ticket.price}
                  onChange={(e) =>
                    updateTicket(
                      ticket.id,
                      "price",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Quantity Available *
                </label>
                <input
                  type="number"
                  value={ticket.quantity}
                  onChange={(e) =>
                    updateTicket(
                      ticket.id,
                      "quantity",
                      parseInt(e.target.value) || 0
                    )
                  }
                  min="1"
                  placeholder="100"
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                    errors[`ticket_${index}_quantity`]
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-200 dark:border-gray-700 focus:border-indigo-500"
                  } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none`}
                />
                {errors[`ticket_${index}_quantity`] && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors[`ticket_${index}_quantity`]}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={ticket.description}
                  onChange={(e) =>
                    updateTicket(ticket.id, "description", e.target.value)
                  }
                  placeholder="Brief description of this ticket type"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Early Bird Pricing */}
            <div className="mt-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={ticket.isEarlyBird}
                  onChange={(e) =>
                    updateTicket(ticket.id, "isEarlyBird", e.target.checked)
                  }
                  className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Enable Early Bird Pricing
                </span>
              </label>

              {ticket.isEarlyBird && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Early Bird Price ($)
                    </label>
                    <input
                      type="number"
                      value={ticket.earlyBirdPrice}
                      onChange={(e) =>
                        updateTicket(
                          ticket.id,
                          "earlyBirdPrice",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Early Bird End Date
                    </label>
                    <input
                      type="date"
                      value={ticket.earlyBirdEndDate}
                      onChange={(e) =>
                        updateTicket(
                          ticket.id,
                          "earlyBirdEndDate",
                          e.target.value
                        )
                      }
                      min={new Date().toISOString().split("T")[0]}
                      max={formData.startDate}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {errors.tickets && (
          <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.tickets}
          </p>
        )}

        <button
          type="button"
          onClick={addTicket}
          className="w-full py-3 px-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Another Ticket Type</span>
        </button>
      </div>
    </div>
  );

  // Step 4: Media & Gallery
  const renderMediaGallery = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Add images to showcase your event
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Upload a cover image and additional photos to make your event more
          appealing
        </p>
      </div>

      {/* Cover Image Upload */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Cover Image
        </label>
        <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors">
          {formData.coverImagePreview ? (
            <div className="relative">
              <img
                src={formData.coverImagePreview}
                alt="Cover preview"
                className="max-h-64 mx-auto rounded-lg shadow-lg object-cover"
              />
              <button
                type="button"
                onClick={clearCoverImage}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formData.coverImage?.name} (
                  {(formData.coverImage?.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              </div>
            </div>
          ) : (
            <div className="py-8">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-2 font-medium">
                Click to upload or drag and drop
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                PNG, JPG, WebP up to 10MB
              </p>
            </div>
          )}
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleCoverImageUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        {errors.coverImage && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.coverImage}
          </p>
        )}
      </div>
    </div>
  );

  // Step 5: Settings & Review
  const renderSettingsReview = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Final settings and review
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Configure additional settings and review your event before publishing
        </p>
      </div>

      {/* Event Settings */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Event Settings
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.isPublic}
              onChange={(e) => handleInputChange("isPublic", e.target.checked)}
              className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Make event public
            </span>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.requiresApproval}
              onChange={(e) =>
                handleInputChange("requiresApproval", e.target.checked)
              }
              className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Require approval for registration
            </span>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.allowWaitlist}
              onChange={(e) =>
                handleInputChange("allowWaitlist", e.target.checked)
              }
              className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Allow waitlist when sold out
            </span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Maximum Attendees (optional)
          </label>
          <input
            type="number"
            value={formData.maxAttendees}
            onChange={(e) => handleInputChange("maxAttendees", e.target.value)}
            placeholder="Leave empty for unlimited"
            min="1"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Refund Policy
          </label>
          <select
            value={formData.refundPolicy}
            onChange={(e) => handleInputChange("refundPolicy", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
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
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Additional Information
          </label>
          <textarea
            value={formData.additionalInfo}
            onChange={(e) =>
              handleInputChange("additionalInfo", e.target.value)
            }
            placeholder="Any additional information for attendees..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none resize-none"
          />
        </div>
      </div>

      {/* Event Summary */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Event Summary
        </h3>
        <div className="space-y-2 text-sm">
          <p>
            <span className="font-semibold">Title:</span>{" "}
            {formData.title || "Not set"}
          </p>
          <p>
            <span className="font-semibold">Category:</span>{" "}
            {formData.category || "Not set"}
          </p>
          <p>
            <span className="font-semibold">Date:</span>{" "}
            {formData.startDate
              ? `${formData.startDate} at ${formData.startTime}`
              : "Not set"}
          </p>
          <p>
            <span className="font-semibold">Location:</span>{" "}
            {formData.isOnline ? "Online Event" : formData.venue || "Not set"}
          </p>
          <p>
            <span className="font-semibold">Tickets:</span>{" "}
            {formData.tickets.length} type(s)
          </p>
          <p>
            <span className="font-semibold">Tags:</span>{" "}
            {formData.tags.join(", ") || "None"}
          </p>
        </div>
      </div>

      {errors.submit && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4">
          <p className="text-red-600 dark:text-red-400 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            {errors.submit}
          </p>
        </div>
      )}
    </div>
  );

  // Main render
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/organizer/events")}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Create New Event
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Step {currentStep} of 5
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleSubmit(true)}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                Save Draft
              </button>
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>Preview</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                  currentStep >= step.number
                    ? "bg-indigo-500 border-indigo-500 text-white"
                    : "border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400"
                }`}
              >
                {currentStep > step.number ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-12 h-0.5 mx-2 transition-all duration-200 ${
                    currentStep > step.number
                      ? "bg-indigo-500"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {currentStep === 1 && renderBasicInfo()}
          {currentStep === 2 && renderDateLocation()}
          {currentStep === 3 && renderTicketsPricing()}
          {currentStep === 4 && renderMediaGallery()}
          {currentStep === 5 && renderSettingsReview()}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center space-x-2 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {currentStep === 5 ? (
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={isLoading}
                className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Publish Event</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center space-x-2 px-6 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEventPage;
