import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import EventCard from "../../components/events/EventCard";
import Footer from "../../components/layout/Footer";
import Button from "../../components/common/Button";
import { debounce } from "lodash";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import HorizontalRail from "../../components/events/HorizontalRail";

const EventsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();

  // State management
  const [events, setEvents] = useState([]);
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
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
  const [featuredLoaded, setFeaturedLoaded] = useState(false);
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
    if (params.get("category")) {
        setSelectedCategories(params.get("category").split(","));
    }
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
    if (selectedCategories.length > 0)
      newActiveFilters.push({
        type: "category",
        label: `Categories: ${selectedCategories.join(", ")}`,
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
  }, [searchTerm, selectedCategories, priceRange, dateRange]);

  // Fetch initial featured events (separate from filtered view)
  useEffect(() => {
    const fetchFeatured = async () => {
        try {
            const res = await fetch(`http://localhost:3003/api/events?limit=8&sort=popularity`);
            const data = await res.json();
            if(data.success && data.data) {
                setFeaturedEvents(data.data);
            }
        } catch (e) { console.error("Failed to fetch featured events", e); }
        finally { setFeaturedLoaded(true); }
    };
    fetchFeatured();
  }, []);

  // Update URL with current filters
  const updateUrlParams = useCallback(
    (page = pagination.currentPage, overrides = {}) => {
      const params = new URLSearchParams();
      const nextSearch =
        overrides.searchTerm !== undefined ? overrides.searchTerm : searchTerm;
      const nextCategories =
        overrides.selectedCategories !== undefined
          ? overrides.selectedCategories
          : selectedCategories;
      const nextPrice = overrides.priceRange || priceRange;
      const nextDate = overrides.dateRange || dateRange;
      const nextSort = overrides.sortBy || sortBy;

      if (nextSearch) params.append("search", nextSearch);
      if (nextCategories.length > 0) params.append("category", nextCategories.join(","));
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
      selectedCategories,
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
        const nextCategories =
          overrides.selectedCategories !== undefined
            ? overrides.selectedCategories
            : selectedCategories;
        const nextPrice = overrides.priceRange || priceRange;
        const nextDate = overrides.dateRange || dateRange;
        const nextSort = overrides.sortBy || sortBy;
        if (nextSearch && nextSearch.trim()) {
          params.append("search", nextSearch.trim());
        }

        if (nextCategories.length > 0) {
          params.append("category", nextCategories.join(","));
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
          selectedCategories: nextCategories,
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
      selectedCategories,
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
      selectedCategories: params.get("category") ? params.get("category").split(",") : [],
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

  // Scroll helper - defined early to be used in effects
  const scrollToResults = useCallback(() => {
    const element = document.getElementById("results-top");
    if (element) {
      // Using scrollIntoView coupled with scroll-mt CSS class handles offsets significantly better
      // than manual calculation which can be thrown off by dynamic content loading above
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // Capture initial hash on mount — updateUrlParams strips it from the URL later,
  // so we must preserve it in a ref to know we need to scroll
  const initialHashRef = useRef(location.hash);
  const hasScrolledRef = useRef(false);
  
  useEffect(() => {
    // Use the captured initial hash (not location.hash, which gets wiped by updateUrlParams)
    if (initialHashRef.current === '#results-top' && !hasScrolledRef.current && !loading && featuredLoaded) {
        // Both fetches are done — rails and events are in the DOM. Scroll now.
        scrollToResults();
        hasScrolledRef.current = true;

        // Single correction after images/animations settle
        const correction = setTimeout(() => scrollToResults(), 500);
        return () => clearTimeout(correction);
    }
  }, [loading, events.length, featuredLoaded, scrollToResults]);
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
    scrollToResults();
  };

  // Reset all filters
  const handleResetFilters = () => {
    const overrides = {
      searchTerm: "",
      selectedCategories: [],
      priceRange: { min: "", max: "" },
      dateRange: { start: "", end: "" },
      sortBy: "date",
    };
    setSearchTerm(overrides.searchTerm);
    setSelectedCategories(overrides.selectedCategories);
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
    scrollToResults();
    if (windowWidth < 640) {
      setIsFilterMenuOpen(false);
    }
  };

  // Remove a single filter
  const handleRemoveFilter = (filterType) => {
    const overrides = {
      searchTerm,
      selectedCategories,
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
        setSelectedCategories([]);
        overrides.selectedCategories = [];
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
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F0F13] text-gray-900 dark:text-gray-200 font-sans transition-colors duration-500">
      {/* Immersive Hero Section */}
      <div className="relative w-full top-0 left-0 right-0 z-0">
        <motion.div
          className="relative w-full min-h-[400px] md:min-h-[550px] flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Decorative pattern background */}
          <div className="absolute inset-0 opacity-20 mix-blend-overlay">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundSize: "40px 40px",
              }}
            />
          </div>

          {/* Animated Glowing Accents */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/30 rounded-full filter blur-[120px] animate-pulse mix-blend-screen" />
          <div
            className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/30 rounded-full filter blur-[100px] animate-pulse mix-blend-screen"
            style={{ animationDelay: "2s" }}
          />

          {/* Hero Content */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center z-10 w-full ">
            <motion.h1
              className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight mb-6 drop-shadow-2xl -mt-20 sm:-mt-40"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Discover
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-white to-purple-200 ml-0 sm:ml-4 block sm:inline">
                Incredible Events
              </span>
            </motion.h1>
            
            <motion.p
              className="mt-6 max-w-2xl mx-auto text-lg sm:text-2xl text-indigo-100/90 leading-relaxed font-light"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Find and book unique experiences that match your interests, from intimate workshops to massive festivals.
            </motion.p>
          </div>

          {/* Bottom Fade Gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-gray-50 dark:from-gray-900 to-transparent pointer-events-none z-20" />
        </motion.div>
      </div>

      {/* Full Width Rails Section - Pulled up to sit under text */}
      {/* Full Width Rails Section - Pulled up to sit under text */}
      <div className="relative w-full z-30 pb-12 space-y-12 -mt-32 sm:-mt-56 md:-mt-64">
        <HorizontalRail 
          title="Best Sellers" 
          events={featuredEvents.slice(0, 5)} 
          isLoading={featuredEvents.length === 0} 
        />
        
        <HorizontalRail 
            title="Trending Now" 
            events={[...featuredEvents].reverse().slice(0, 5)} 
            isLoading={featuredEvents.length === 0} 
        />

        <HorizontalRail 
            title="Browse by Category" 
            items={categoryOptions.map((cat, i) => ({
                id: i,
                ...cat
            }))}
            isLoading={false}
            renderItem={(item) => (
                <div 
                    onClick={() => {
                        setSelectedCategories([item.value]);
                        fetchEvents(1, { selectedCategories: [item.value] });
                        scrollToResults();
                    }}
                    className="cursor-pointer h-full w-full rounded-2xl p-6 flex flex-col justify-between bg-gradient-to-br from-[#1e1b4b] to-[#0f172a] border border-indigo-500/20 hover:border-indigo-400/30 shadow-lg hover:shadow-indigo-500/20 hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                        <span className="text-8xl grayscale">{item.icon}</span>
                    </div>
                    <div className="relative z-10">
                        <span className="text-4xl mb-4 block filter drop-shadow-lg group-hover:scale-110 transition-transform duration-300 origin-left">{item.icon}</span>
                        <h3 className="text-2xl font-bold text-white tracking-tight">{item.value}</h3>
                        <p className="text-gray-400 text-sm mt-2 font-medium group-hover:text-indigo-400 transition-colors flex items-center">
                            Explore <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </p>
                    </div>
                </div>
            )}
        />
      </div>

      {/* Stylized Separator */}
      <div className="relative w-full overflow-hidden leading-none z-30">
        <svg className="relative block w-full h-[100px] text-white dark:text-gray-900 fill-current transform rotate-180" viewBox="0 0 1200 120" preserveAspectRatio="none">
             <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"></path>
        </svg>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center space-x-4">
             <div className="h-[1px] w-12 sm:w-64 bg-gradient-to-r from-transparent via-gray-400 to-transparent opacity-50"></div>
             <span className="text-gray-400 font-medium uppercase tracking-widest text-xs sm:text-sm bg-white dark:bg-gray-900 px-4 py-1 rounded-full border border-gray-100 dark:border-gray-800 shadow-sm z-10 whitespace-nowrap">Browse All Events</span>
             <div className="h-[1px] w-12 sm:w-64 bg-gradient-to-r from-transparent via-gray-400 to-transparent opacity-50"></div>
        </div>
      </div>
      {/* Main Content Grid - Back in Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 relative z-30">
        <div id="results-top" className="pt-8 scroll-mt-28">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">All Events</h2>
                    <div className="h-1 w-20 bg-gray-200 dark:bg-gray-700 rounded-full mt-2"></div>
                </div>
                {/* Minimal Sort Control & Filter Button */}
                <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
                    <Button 
                        variant="secondary" 
                        size="small"
                        className="!rounded-lg !px-4 !py-2 !bg-white/5 !border-white/10 hover:!bg-white/10 text-gray-700 dark:text-gray-300"
                        onClick={() => setIsFilterMenuOpen(true)}
                        icon={
                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                        }
                    >
                        Filters {activeFilters.length > 0 && <span className="ml-2 bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">{activeFilters.length}</span>}
                    </Button>

                    <div className="relative">
                        <select 
                            value={sortBy}
                            onChange={(e) => {
                                setSortBy(e.target.value);
                                fetchEvents(1, { sortBy: e.target.value })
                            }}
                            className="bg-transparent text-gray-600 dark:text-gray-400 font-medium text-sm border-none focus:ring-0 cursor-pointer hover:text-indigo-500 pr-8"
                        >
                            <option value="date">Sort by Date</option>
                            <option value="price">Sort by Price</option>
                            <option value="popularity">Sort by Popularity</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        {/* Events Grid */}
        <AnimatePresence mode="wait">
          {loading ? (
             <motion.div
               key="loading"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
             >
               {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                 <div
                   key={i}
                   className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden h-[400px] animate-pulse"
                 >
                   <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
                   <div className="p-5 space-y-4">
                     <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                     <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                   </div>
                 </div>
               ))}
             </motion.div>
          ) : events.length === 0 ? (
            <motion.div
              key="no-results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
                <div className="text-6xl mb-4">🤔</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No events found</h3>
                <p className="text-gray-500 dark:text-gray-400">Try adjusting your search terms</p>
                <Button 
                    variant="outline" 
                    className="mt-6"
                    onClick={handleResetFilters}
                >
                    Clear Search
                </Button>
            </motion.div>
          ) : (
             <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
             >
                {events.map((event, index) => (
                    <EventCard key={event._id} event={event} />
                ))}
             </motion.div>
          )}
        </AnimatePresence>
     
        {/* Simple Pagination */}
        {/* Numbered Pagination */}
        {pagination.totalPages > 1 && (
            <div className="mt-16 flex justify-center items-center space-x-2">
                {/* Previous Button */}
                <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous Page"
                >
                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                {/* Page Numbers */}
                <div className="flex items-center space-x-1">
                    {(() => {
                        const pages = [];
                        const { currentPage, totalPages } = pagination;
                        
                        if (totalPages <= 7) {
                             for (let i = 1; i <= totalPages; i++) pages.push(i);
                        } else {
                            if (currentPage <= 4) {
                                pages.push(1, 2, 3, 4, 5, '...', totalPages);
                            } else if (currentPage >= totalPages - 3) {
                                pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                            } else {
                                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
                            }
                        }

                        return pages.map((page, idx) => (
                            page === '...' ? (
                                <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 text-sm">...</span>
                            ) : (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`w-10 h-10 rounded-lg text-sm font-bold transition-all duration-200 ${
                                        pagination.currentPage === page
                                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-105"
                                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-indigo-600"
                                    }`}
                                >
                                    {page}
                                </button>
                            )
                        ));
                    })()}
                </div>

                {/* Next Button */}
                <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Next Page"
                >
                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        )}
      </div>

      <Footer />

      {/* Filter Slide-over Panel */}
      <AnimatePresence>
        {isFilterMenuOpen && (
          <>
            <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }}
               className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
               onClick={() => setIsFilterMenuOpen(false)}
            />
            <motion.div
               initial={{ x: "100%" }} 
               animate={{ x: 0 }} 
               exit={{ x: "100%" }}
               transition={{ type: "spring", damping: 25, stiffness: 200 }}
               className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#0F0F13] border-l border-white/10 shadow-2xl z-50 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
            >
               <div className="p-8 h-full flex flex-col">
                  <div className="flex justify-between items-center mb-10">
                      <h2 className="text-3xl font-black text-white tracking-tight">Filters</h2>
                      <button 
                        onClick={() => setIsFilterMenuOpen(false)}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                      >
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                      </button>
                  </div>

                  <div className="space-y-10 flex-1">
                      {/* Search */}
                      <div>
                          <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Search</label>
                          <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Keywords..."
                                className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-gray-600 transition-all outline-none"
                                defaultValue={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <svg className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                          </div>
                      </div>

                      {/* Categories */}
                      <div>
                          <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Category</label>
                          <div className="flex flex-wrap gap-3">
                              {categoryOptions.map((cat) => (
                                  <button
                                      key={cat.value}
                                      onClick={() => setSelectedCategories(prev => 
                                          prev.includes(cat.value) 
                                              ? prev.filter(c => c !== cat.value) 
                                              : [...prev, cat.value]
                                      )}
                                      className={`px-4 py-3 rounded-lg text-sm font-bold transition-all duration-200 border flex items-center gap-2 ${
                                          selectedCategories.includes(cat.value)
                                          ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-900/50" 
                                          : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20"
                                      }`}
                                  >
                                      <span>{cat.icon}</span>
                                      {cat.value}
                                  </button>
                              ))}
                          </div>
                      </div>

                      {/* Price Range */}
                      <div>
                          <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Price Range</label>
                          <div className="flex items-center space-x-4">
                              <div className="relative flex-1">
                                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                  <input 
                                      type="number" 
                                      placeholder="Min"
                                      className="w-full pl-10 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-gray-600 outline-none transition-all"
                                      value={priceRange.min}
                                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                                  />
                              </div>
                              <span className="text-gray-600">-</span>
                              <div className="relative flex-1">
                                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                  <input 
                                      type="number" 
                                      placeholder="Max"
                                      className="w-full pl-10 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-gray-600 outline-none transition-all"
                                      value={priceRange.max}
                                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                                  />
                              </div>
                          </div>
                      </div>

                      {/* Date Range */}
                      <div>
                          <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Date Range</label>
                          <div className="space-y-4">
                              <div className="relative">
                                <input 
                                    type="date" 
                                    className={`w-full pl-16 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all [color-scheme:dark] ${dateRange.start ? 'text-white' : 'text-gray-500'}`}
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                />
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                                    <span className="text-xs font-bold tracking-wider">FROM</span>
                                </div>
                              </div>
                              <div className="relative">
                                <input 
                                    type="date" 
                                    className={`w-full pl-16 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all [color-scheme:dark] ${dateRange.end ? 'text-white' : 'text-gray-500'}`}
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                />
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                                    <span className="text-xs font-bold tracking-wider">TO</span>
                                </div>
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="pt-8 mt-auto flex space-x-4 border-t border-white/10">
                      <Button 
                          variant="outline" 
                          size="default"
                          onClick={() => {
                              handleResetFilters();
                              setIsFilterMenuOpen(false);
                          }}
                      >
                          Reset
                      </Button>
                      <Button 
                          variant="primary" 
                          size="default"
                          onClick={() => {
                              handleApplyFilters();
                              setIsFilterMenuOpen(false);
                          }}
                      >
                          Apply Filters
                      </Button>
                  </div>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventsPage;
