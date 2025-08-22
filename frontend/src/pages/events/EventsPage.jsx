import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import EventCard from "../../components/events/EventCard";
import Footer from "../../components/layout/Footer";
import { debounce } from "lodash";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

const EventsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();

  // State management
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [sortBy, setSortBy] = useState("date");
  const [activeFilters, setActiveFilters] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalEvents: 0,
  });
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [filterAnimation, setFilterAnimation] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );

  // Refs for form elements
  const searchInputRef = useRef(null);
  const minPriceRef = useRef(null);
  const maxPriceRef = useRef(null);
  const startDateRef = useRef(null);
  const endDateRef = useRef(null);

  // Categories with icons for enhanced visual presentation
  const categoryOptions = [
    { value: "Music", icon: "🎵" },
    { value: "Sports", icon: "🏆" },
    { value: "Arts", icon: "🎨" },
    { value: "Business", icon: "💼" },
    { value: "Conference", icon: "🎤" },
    { value: "Workshop", icon: "🔧" },
    { value: "Community", icon: "👥" },
    { value: "Festival", icon: "🎪" },
    { value: "Food", icon: "🍽️" },
    { value: "Networking", icon: "🤝" },
    { value: "Other", icon: "✨" },
  ];

  // Parse URL parameters on load
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    // Set initial states from URL if they exist
    if (params.get("search")) setSearchTerm(params.get("search"));
    if (params.get("category")) setSelectedCategory(params.get("category"));
    if (params.get("minPrice"))
      setPriceRange((prev) => ({ ...prev, min: params.get("minPrice") }));
    if (params.get("maxPrice"))
      setPriceRange((prev) => ({ ...prev, max: params.get("maxPrice") }));
    if (params.get("startDate"))
      setDateRange((prev) => ({ ...prev, start: params.get("startDate") }));
    if (params.get("endDate"))
      setDateRange((prev) => ({ ...prev, end: params.get("endDate") }));
    if (params.get("sort")) setSortBy(params.get("sort"));
    if (params.get("page"))
      setPagination((prev) => ({
        ...prev,
        currentPage: parseInt(params.get("page")) || 1,
      }));
    // Ignore any 'view' query param; always use grid layout

    // Update form refs with URL values
    if (searchInputRef.current && params.get("search"))
      searchInputRef.current.value = params.get("search");
    if (minPriceRef.current && params.get("minPrice"))
      minPriceRef.current.value = params.get("minPrice");
    if (maxPriceRef.current && params.get("maxPrice"))
      maxPriceRef.current.value = params.get("maxPrice");
    if (startDateRef.current && params.get("startDate"))
      startDateRef.current.value = params.get("startDate");
    if (endDateRef.current && params.get("endDate"))
      endDateRef.current.value = params.get("endDate");
  }, [location.search]);

  // Track window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Calculate active filters for display
  useEffect(() => {
    const newActiveFilters = [];

    if (searchTerm)
      newActiveFilters.push({ type: "search", label: `Search: ${searchTerm}` });
    if (selectedCategory)
      newActiveFilters.push({
        type: "category",
        label: `Category: ${selectedCategory}`,
      });
    if (priceRange.min)
      newActiveFilters.push({
        type: "minPrice",
        label: `Min Price: $${priceRange.min}`,
      });
    if (priceRange.max)
      newActiveFilters.push({
        type: "maxPrice",
        label: `Max Price: $${priceRange.max}`,
      });
    if (dateRange.start)
      newActiveFilters.push({
        type: "startDate",
        label: `From: ${new Date(dateRange.start).toLocaleDateString()}`,
      });
    if (dateRange.end)
      newActiveFilters.push({
        type: "endDate",
        label: `To: ${new Date(dateRange.end).toLocaleDateString()}`,
      });

    setActiveFilters(newActiveFilters);
  }, [searchTerm, selectedCategory, priceRange, dateRange]);

  // Update URL with current filters
  const updateUrlParams = useCallback(
    (page = pagination.currentPage, overrides = {}) => {
      const params = new URLSearchParams();
      const nextSearch =
        overrides.searchTerm !== undefined ? overrides.searchTerm : searchTerm;
      const nextCategory =
        overrides.selectedCategory !== undefined
          ? overrides.selectedCategory
          : selectedCategory;
      const nextPrice = overrides.priceRange || priceRange;
      const nextDate = overrides.dateRange || dateRange;
      const nextSort = overrides.sortBy || sortBy;

      if (nextSearch) params.append("search", nextSearch);
      if (nextCategory) params.append("category", nextCategory);
      if (nextPrice.min) params.append("minPrice", nextPrice.min);
      if (nextPrice.max) params.append("maxPrice", nextPrice.max);
      if (nextDate.start) params.append("startDate", nextDate.start);
      if (nextDate.end) params.append("endDate", nextDate.end);
      if (nextSort !== "date") params.append("sort", nextSort);
      if (page > 1) params.append("page", page);

      navigate(`?${params.toString()}`, { replace: true });
    },
    [
      searchTerm,
      selectedCategory,
      priceRange,
      dateRange,
      sortBy,
      pagination.currentPage,
      navigate,
    ]
  );

  // Fetch events with filters
  const fetchEvents = useCallback(
    async (page = 1, overrides = {}) => {
      try {
        setLoading(true);
        setError("");

        // Build query parameters
        const params = new URLSearchParams();
        params.append("page", page);
        params.append("limit", 12);

        const nextSearch =
          overrides.searchTerm !== undefined
            ? overrides.searchTerm
            : searchTerm;
        const nextCategory =
          overrides.selectedCategory !== undefined
            ? overrides.selectedCategory
            : selectedCategory;
        const nextPrice = overrides.priceRange || priceRange;
        const nextDate = overrides.dateRange || dateRange;
        const nextSort = overrides.sortBy || sortBy;
        if (nextSearch && nextSearch.trim()) {
          params.append("search", nextSearch.trim());
        }

        if (nextCategory) {
          params.append("category", nextCategory);
        }

        if (nextPrice.min !== "") {
          params.append("minPrice", Number(nextPrice.min));
        }

        if (nextPrice.max !== "") {
          params.append("maxPrice", Number(nextPrice.max));
        }

        if (nextDate.start) {
          params.append("startDate", nextDate.start);
        }

        if (nextDate.end) {
          params.append("endDate", nextDate.end);
        }

        params.append("sort", nextSort);

        // Fetch events from API
        const response = await fetch(
          `http://localhost:3003/api/events?${params.toString()}`,
          {
            headers: {
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch events");
        }

        const data = await response.json();

        setEvents(data.data || []);
        setPagination({
          currentPage: data.pagination?.page || 1,
          totalPages: data.pagination?.pages || 1,
          totalEvents: data.pagination?.total || 0,
        });

        // Update URL params after successful fetch
        updateUrlParams(page, {
          searchTerm: nextSearch,
          selectedCategory: nextCategory,
          priceRange: nextPrice,
          dateRange: nextDate,
          sortBy: nextSort,
        });

        if (page === 1) {
          setFiltersApplied(true);
          setFilterAnimation(true);
          setTimeout(() => setFilterAnimation(false), 1800);
        }
      } catch (err) {
        console.error("Error fetching events:", err);
        setError(err.message || "Error loading events");
        setEvents([]);
      } finally {
        setLoading(false);
      }
    },
    [
      searchTerm,
      selectedCategory,
      priceRange,
      dateRange,
      sortBy,
      token,
      updateUrlParams,
    ]
  );

  // Initialize with data load (respect URL params on first load)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const overrides = {
      searchTerm: params.get("search") || "",
      selectedCategory: params.get("category") || "",
      priceRange: {
        min: params.get("minPrice") || "",
        max: params.get("maxPrice") || "",
      },
      dateRange: {
        start: params.get("startDate") || "",
        end: params.get("endDate") || "",
      },
      sortBy: params.get("sort") || "date",
    };
    const pageFromUrl =
      parseInt(params.get("page")) || pagination.currentPage || 1;
    fetchEvents(pageFromUrl, overrides);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((term) => {
      setSearchTerm(term);
      fetchEvents(1, { searchTerm: term });
    }, 600),
    [fetchEvents]
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    if (searchInputRef.current) {
      searchInputRef.current.value = value;
    }
    debouncedSearch(value);
  };

  // Handle page navigation
  const handlePageChange = (page) => {
    if (page === pagination.currentPage) return;

    fetchEvents(page);
    const resultsTop = document.getElementById("results-top");
    if (resultsTop) {
      window.scrollTo({
        top: resultsTop.offsetTop - 100,
        behavior: "smooth",
      });
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    const overrides = {
      searchTerm: "",
      selectedCategory: "",
      priceRange: { min: "", max: "" },
      dateRange: { start: "", end: "" },
      sortBy: "date",
    };
    setSearchTerm(overrides.searchTerm);
    setSelectedCategory(overrides.selectedCategory);
    setPriceRange(overrides.priceRange);
    setDateRange(overrides.dateRange);
    setSortBy(overrides.sortBy);

    if (searchInputRef.current) searchInputRef.current.value = "";
    if (minPriceRef.current) minPriceRef.current.value = "";
    if (maxPriceRef.current) maxPriceRef.current.value = "";
    if (startDateRef.current) startDateRef.current.value = "";
    if (endDateRef.current) endDateRef.current.value = "";

    // Cancel any pending debounced search and fetch with explicit overrides
    if (debouncedSearch.cancel) debouncedSearch.cancel();
    fetchEvents(1, overrides);
  };

  // Apply filters
  const handleApplyFilters = () => {
    fetchEvents(1);
    if (windowWidth < 640) {
      setIsFilterMenuOpen(false);
    }
  };

  // Remove a single filter
  const handleRemoveFilter = (filterType) => {
    const overrides = {
      searchTerm,
      selectedCategory,
      priceRange: { ...priceRange },
      dateRange: { ...dateRange },
      sortBy,
    };

    switch (filterType) {
      case "search":
        setSearchTerm("");
        overrides.searchTerm = "";
        if (searchInputRef.current) searchInputRef.current.value = "";
        break;
      case "category":
        setSelectedCategory("");
        overrides.selectedCategory = "";
        break;
      case "minPrice":
        setPriceRange((prev) => ({ ...prev, min: "" }));
        overrides.priceRange.min = "";
        if (minPriceRef.current) minPriceRef.current.value = "";
        break;
      case "maxPrice":
        setPriceRange((prev) => ({ ...prev, max: "" }));
        overrides.priceRange.max = "";
        if (maxPriceRef.current) maxPriceRef.current.value = "";
        break;
      case "startDate":
        setDateRange((prev) => ({ ...prev, start: "" }));
        overrides.dateRange.start = "";
        if (startDateRef.current) startDateRef.current.value = "";
        break;
      case "endDate":
        setDateRange((prev) => ({ ...prev, end: "" }));
        overrides.dateRange.end = "";
        if (endDateRef.current) endDateRef.current.value = "";
        break;
      default:
        break;
    }

    if (debouncedSearch.cancel) debouncedSearch.cancel();
    fetchEvents(1, overrides);
  };

  // Single view enforced (grid). No view toggle.

  return (
    <div className="min-h-screen bg-inherit text-inherit transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
        {/* Hero section with background pattern */}
        <motion.div
          className="relative overflow-hidden mb-10 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 shadow-xl"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Decorative pattern background */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundSize: "30px 30px",
              }}
            />
          </div>

          {/* Glowing accent */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-400 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
          <div
            className="absolute -bottom-32 -left-32 w-80 h-80 bg-indigo-400 rounded-full filter blur-3xl opacity-30 animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>

          {/* Content */}
          <div className="relative px-8 py-20 text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight">
              Discover Incredible Events
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-indigo-100">
              Find and book unique experiences that match your interests
            </p>
            <div className="mt-8 flex justify-center space-x-4">
              <motion.button
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md transition-all duration-200"
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 10px 25px -5px rgba(79, 70, 229, 0.4)",
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const filterMenu = document.getElementById("filter-menu");
                  if (filterMenu) {
                    filterMenu.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              >
                <svg
                  className="mr-2 h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                Find Events
              </motion.button>
              <motion.a
                href="#featured"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-500 bg-opacity-30 hover:bg-opacity-40 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md transition-all duration-200"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg
                  className="mr-2 h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Featured Events
              </motion.a>
            </div>
          </div>
        </motion.div>

        <div id="results-top"></div>

        {/* Enhanced Search and filter section */}
        <motion.div
          className="mb-8 bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-800 transition-colors"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Main search area with enhanced visual design */}
          <div className="p-5 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 transition-colors">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Enhanced search bar with animated focus state */}
              <div className="relative flex-grow group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-200"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  defaultValue={searchTerm}
                  placeholder="Search by name, location, or keyword..."
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  onChange={handleSearchChange}
                  aria-label="Search events"
                />
                <AnimatePresence>
                  {searchTerm && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => {
                        setSearchTerm("");
                        if (searchInputRef.current)
                          searchInputRef.current.value = "";
                        if (debouncedSearch.cancel) debouncedSearch.cancel();
                        fetchEvents(1, { searchTerm: "" });
                      }}
                      aria-label="Clear search"
                    >
                      <svg
                        className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* Filter button with enhanced styling */}
              <div className="flex space-x-2">
                {/* Enhanced filter button with animated state */}
                <motion.button
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 py-3 px-5 rounded-lg text-sm font-medium text-white hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-md flex items-center space-x-2"
                  onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 4px 12px rgba(79, 70, 229, 0.25)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  aria-expanded={isFilterMenuOpen}
                  aria-controls="filter-menu"
                >
                  <svg
                    className={`h-5 w-5 transition-transform duration-300 ${
                      isFilterMenuOpen ? "rotate-180" : ""
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                  <span>
                    {isFilterMenuOpen ? "Hide Filters" : "Refine Results"}
                  </span>
                </motion.button>
              </div>
            </div>
          </div>

          {/* Active filters display with animation and improved styling */}
          <AnimatePresence>
            {activeFilters.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors"
              >
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400 mr-1 transition-colors">
                    Active filters:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activeFilters.map((filter, index) => (
                      <motion.span
                        key={filter.type + index}
                        className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-indigo-50 text-indigo-700 border border-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800 shadow-sm transition-colors"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{
                          opacity: 0,
                          scale: 0.8,
                          transition: { duration: 0.2 },
                        }}
                        transition={{ duration: 0.2 }}
                        layout
                      >
                        {filter.label}
                        <motion.button
                          onClick={() => handleRemoveFilter(filter.type)}
                          className="ml-1.5 rounded-full hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 p-0.5"
                          whileHover={{
                            scale: 1.1,
                            backgroundColor: "#e0e7ff",
                          }}
                          whileTap={{ scale: 0.9 }}
                          aria-label={`Remove ${filter.label} filter`}
                        >
                          <svg
                            className="h-4 w-4 text-indigo-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </motion.button>
                      </motion.span>
                    ))}
                  </div>
                  {activeFilters.length > 0 && (
                    <motion.button
                      onClick={handleResetFilters}
                      className="text-xs text-indigo-600 font-medium hover:text-indigo-800 hover:underline focus:outline-none ml-2 flex items-center"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Clear all
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enhanced filter section with better organization and visual style */}
          <AnimatePresence>
            {(isFilterMenuOpen || windowWidth >= 640) && (
              <motion.div
                id="filter-menu"
                className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 transition-colors"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Category filter with accent color and improved dropdown */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center transition-colors">
                        <svg
                          className="w-4 h-4 mr-1.5 text-indigo-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Category
                      </label>
                      <div className="relative">
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="block w-full pl-3 pr-10 py-2.5 text-base border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm appearance-none"
                          aria-label="Select event category"
                        >
                          <option value="">All Categories</option>
                          {categoryOptions.map((cat) => (
                            <option key={cat.value} value={cat.value}>
                              {cat.icon} {cat.value}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-indigo-600">
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Price range with improved visual grouping */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center transition-colors">
                        <svg
                          className="w-4 h-4 mr-1.5 text-indigo-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Price Range
                      </label>
                      <div className="flex space-x-3">
                        <div className="relative flex-1 shadow-sm rounded-lg">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 dark:text-gray-400 sm:text-sm">
                              $
                            </span>
                          </div>
                          <input
                            ref={minPriceRef}
                            type="number"
                            placeholder="Min"
                            className="block w-full pl-7 pr-3 py-2.5 text-base border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200"
                            defaultValue={priceRange.min}
                            onChange={(e) =>
                              setPriceRange({
                                ...priceRange,
                                min: e.target.value,
                              })
                            }
                            min="0"
                            aria-label="Minimum price"
                          />
                        </div>
                        <div className="flex-none flex items-center">
                          <div className="w-5 h-0.5 bg-gray-300 dark:bg-gray-700"></div>
                        </div>
                        <div className="relative flex-1 shadow-sm rounded-lg">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 dark:text-gray-400 sm:text-sm">
                              $
                            </span>
                          </div>
                          <input
                            ref={maxPriceRef}
                            type="number"
                            placeholder="Max"
                            className="block w-full pl-7 pr-3 py-2.5 text-base border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200"
                            defaultValue={priceRange.max}
                            onChange={(e) =>
                              setPriceRange({
                                ...priceRange,
                                max: e.target.value,
                              })
                            }
                            min={priceRange.min || "0"}
                            aria-label="Maximum price"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Date range with improved calendar inputs */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center transition-colors">
                        <svg
                          className="w-4 h-4 mr-1.5 text-indigo-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Date Range
                      </label>
                      <div className="space-y-3">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg
                              className="h-5 w-5 text-indigo-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                          <input
                            ref={startDateRef}
                            type="date"
                            className="block w-full pl-10 pr-3 py-2.5 text-base border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200 shadow-sm"
                            defaultValue={dateRange.start}
                            onChange={(e) =>
                              setDateRange({
                                ...dateRange,
                                start: e.target.value,
                              })
                            }
                            aria-label="Start date"
                            placeholder="Start date"
                          />
                        </div>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg
                              className="h-5 w-5 text-indigo-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                          <input
                            ref={endDateRef}
                            type="date"
                            className="block w-full pl-10 pr-3 py-2.5 text-base border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200 shadow-sm"
                            defaultValue={dateRange.end}
                            onChange={(e) =>
                              setDateRange({
                                ...dateRange,
                                end: e.target.value,
                              })
                            }
                            min={dateRange.start || ""}
                            aria-label="End date"
                            placeholder="End date"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Sort options with enhanced select styling */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center transition-colors">
                        <svg
                          className="w-4 h-4 mr-1.5 text-indigo-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 100-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
                        </svg>
                        Sort By
                      </label>
                      <div className="relative">
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="block w-full pl-3 pr-10 py-2.5 text-base border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm appearance-none"
                          aria-label="Sort events by"
                        >
                          <option value="date">Upcoming First</option>
                          <option value="date-desc">Recent First</option>
                          <option value="price">Price: Low to High</option>
                          <option value="price-desc">Price: High to Low</option>
                          <option value="title">Name: A to Z</option>
                          <option value="popularity">Most Popular</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-indigo-600">
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced filter action buttons */}
                  <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-800 transition-colors">
                    <motion.button
                      onClick={handleResetFilters}
                      className="inline-flex items-center px-5 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 mr-4 transition-all duration-200 shadow-sm"
                      whileHover={{ scale: 1.02, backgroundColor: "#f9fafb" }}
                      whileTap={{ scale: 0.98 }}
                      aria-label="Reset all filters"
                    >
                      <svg
                        className="mr-2 h-4 w-4 text-gray-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Reset Filters
                    </motion.button>

                    <motion.button
                      onClick={handleApplyFilters}
                      className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md"
                      whileHover={{
                        scale: 1.02,
                        boxShadow: "0 4px 12px -1px rgba(79, 70, 229, 0.3)",
                      }}
                      whileTap={{ scale: 0.98 }}
                      aria-label="Apply filters"
                    >
                      <svg
                        className="mr-2 h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Apply Filters
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Elegant filter feedback badge */}
        <AnimatePresence>
          {filtersApplied && filterAnimation && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="fixed top-20 right-8 bg-gradient-to-r from-green-600 to-teal-500 text-white px-4 py-2 rounded-lg shadow-xl z-50 flex items-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Filters applied successfully</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results info bar with counts and current filters */}
        {!loading && events.length > 0 && (
          <motion.div
            className="flex justify-between items-center mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-sm text-gray-700 dark:text-gray-300 transition-colors">
              Showing <span className="font-medium">{events.length}</span> of{" "}
              <span className="font-medium">{pagination.totalEvents}</span>{" "}
              events
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors">
              Page {pagination.currentPage} of {pagination.totalPages}
            </div>
          </motion.div>
        )}

        {/* Improved error message with retry option */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="mb-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-700 p-4 rounded-lg shadow-sm transition-colors"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9h2V5H9v4zm0 4h2v-2H9v2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm text-red-700 dark:text-red-300 transition-colors">
                    {error}
                  </p>
                  <div className="mt-2">
                    <button
                      onClick={() => fetchEvents(pagination.currentPage)}
                      className="text-sm text-red-700 dark:text-red-300 font-medium hover:text-red-800 dark:hover:text-red-200 focus:outline-none focus:underline transition-colors"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading state with elegant animation */}
        {loading ? (
          <div className="py-20">
            <div className="flex flex-col items-center justify-center">
              <div className="relative flex">
                <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-indigo-500 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-10 w-10 rounded-full border-t-4 border-b-4 border-purple-500 animate-spin"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-5 w-5 rounded-full bg-indigo-600 animate-pulse"></div>
                </div>
              </div>
              <p className="mt-6 text-indigo-600 font-medium animate-pulse">
                Finding amazing events for you...
              </p>
            </div>
          </div>
        ) : events.length === 0 ? (
          <motion.div
            className="py-16 flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.2 } }}
          >
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-8 rounded-full transition-colors">
              <svg
                className="h-20 w-20 text-indigo-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="mt-6 text-2xl font-medium text-gray-900 dark:text-gray-100 transition-colors">
              No events found
            </h3>
            <p className="mt-3 text-gray-500 dark:text-gray-400 text-center max-w-md transition-colors">
              We couldn't find any events matching your search criteria. Try
              adjusting your filters or search for something else.
            </p>
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <motion.button
                onClick={handleResetFilters}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md text-sm font-medium hover:bg-indigo-700 transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Clear All Filters
              </motion.button>
              <Link
                to="/"
                className="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-100 rounded-lg shadow-sm text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
              >
                Back to Home
              </Link>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Event results (single grid layout) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              <LayoutGroup>
                {events.map((event, index) => (
                  <motion.div
                    key={event._id || index}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: index * 0.03,
                      duration: 0.4,
                      ease: "easeOut",
                    }}
                  >
                    <EventCard event={event} />
                  </motion.div>
                ))}
              </LayoutGroup>
            </div>

            {/* Enhanced pagination with visual indicators */}
            {pagination.totalPages > 1 && (
              <motion.div
                className="flex justify-center mt-12 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-lg -space-x-px"
                  aria-label="Pagination"
                >
                  <motion.button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className={`relative inline-flex items-center px-3 py-2.5 rounded-l-lg border text-sm font-medium transition-colors ${
                      pagination.currentPage === 1
                        ? "border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                        : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-300"
                    }`}
                    whileHover={
                      pagination.currentPage !== 1 ? { scale: 1.05 } : {}
                    }
                    whileTap={
                      pagination.currentPage !== 1 ? { scale: 0.95 } : {}
                    }
                    aria-label="Previous page"
                  >
                    <span className="sr-only">Previous</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </motion.button>

                  {/* Page numbers with enhanced logic for large page counts */}
                  {[...Array(pagination.totalPages).keys()].map((page) => {
                    const pageNumber = page + 1;

                    // Always show first, last, current page and pages around current
                    if (
                      pageNumber === 1 ||
                      pageNumber === pagination.totalPages ||
                      (pageNumber >= pagination.currentPage - 1 &&
                        pageNumber <= pagination.currentPage + 1)
                    ) {
                      return (
                        <motion.button
                          key={page}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`relative inline-flex items-center px-4 py-2.5 border text-sm font-medium transition-colors ${
                            pagination.currentPage === pageNumber
                              ? "z-10 bg-indigo-100 dark:bg-indigo-900/30 border-indigo-500 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 font-bold"
                              : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-300"
                          }`}
                          whileHover={{
                            scale: 1.08,
                            backgroundColor:
                              pagination.currentPage !== pageNumber
                                ? "#EEF2FF"
                                : undefined,
                          }}
                          whileTap={{ scale: 0.95 }}
                          aria-label={`Page ${pageNumber}`}
                          aria-current={
                            pagination.currentPage === pageNumber
                              ? "page"
                              : undefined
                          }
                        >
                          {pageNumber}
                        </motion.button>
                      );
                    } else if (
                      pageNumber === pagination.currentPage - 2 ||
                      pageNumber === pagination.currentPage + 2
                    ) {
                      // Show ellipsis for skipped pages
                      return (
                        <span
                          key={page}
                          className="relative inline-flex items-center px-4 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                        >
                          <span className="tracking-widest">...</span>
                        </span>
                      );
                    }
                    return null;
                  })}

                  <motion.button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className={`relative inline-flex items-center px-3 py-2.5 rounded-r-lg border text-sm font-medium transition-colors ${
                      pagination.currentPage === pagination.totalPages
                        ? "border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                        : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-300"
                    }`}
                    whileHover={
                      pagination.currentPage !== pagination.totalPages
                        ? { scale: 1.05 }
                        : {}
                    }
                    whileTap={
                      pagination.currentPage !== pagination.totalPages
                        ? { scale: 0.95 }
                        : {}
                    }
                    aria-label="Next page"
                  >
                    <span className="sr-only">Next</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </motion.button>
                </nav>
              </motion.div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default EventsPage;
