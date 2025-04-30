import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import OrganizerSidebar from '../../components/layout/OrganizerSidebar';
import { createEvent } from '../../services/organizerService';

const CATEGORIES = [
  'Conference', 'Workshop', 'Concert', 'Festival', 
  'Exhibition', 'Networking', 'Sports', 'Seminar',
  'Party', 'Competition', 'Charity', 'Other'
];

const CreateEventPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  
  // Clone event data if provided in location state
  const cloneFrom = location.state?.cloneFrom || null;

  // Form state
  const [formData, setFormData] = useState({
    title: cloneFrom?.title || '',
    description: cloneFrom?.description || '',
    date: cloneFrom?.date ? new Date(cloneFrom.date).toISOString().slice(0, 16) : '',
    location: cloneFrom?.location || '',
    category: cloneFrom?.category || '',
    image: cloneFrom?.image || '',
    ticketPrice: cloneFrom?.ticketPrice || 0,
    totalTickets: cloneFrom?.totalTickets || 100,
    remainingTickets: cloneFrom?.remainingTickets || 100
  });

  // Validation state
  const [formErrors, setFormErrors] = useState({});

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for the field being edited
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  // Handle number input changes
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);
    
    setFormData({
      ...formData,
      [name]: isNaN(numValue) ? 0 : numValue
    });
    
    // Clear error for the field being edited
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  // Handle image input change with preview
  const handleImageChange = (e) => {
    const imageUrl = e.target.value;
    setFormData({
      ...formData,
      image: imageUrl
    });
    setImagePreview(imageUrl);
    
    // Clear error
    if (formErrors.image) {
      setFormErrors({
        ...formErrors,
        image: ''
      });
    }
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.date) errors.date = 'Event date and time are required';
    if (!formData.location.trim()) errors.location = 'Location is required';
    if (!formData.category) errors.category = 'Please select a category';
    if (formData.ticketPrice < 0) errors.ticketPrice = 'Price cannot be negative';
    if (formData.totalTickets <= 0) errors.totalTickets = 'Total tickets must be greater than zero';
    if (formData.remainingTickets < 0 || formData.remainingTickets > formData.totalTickets) {
      errors.remainingTickets = 'Available tickets must be between 0 and total tickets';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!validateForm()) {
      setError('Please correct the errors in the form');
      // Scroll to the first error
      const firstErrorField = Object.keys(formErrors)[0];
      document.getElementsByName(firstErrorField)[0]?.focus();
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Auto-set remaining tickets to total tickets if creating a new event
      const eventData = {
        ...formData,
        remainingTickets: cloneFrom ? formData.remainingTickets : formData.totalTickets
      };
      
      const response = await createEvent(token, eventData);
      
      // Success - redirect to event details
      navigate(`/organizer/events/${response.data._id}`, { 
        state: { message: 'Event created successfully!' }
      });
    } catch (err) {
      console.error('Error creating event:', err);
      
      // Detailed error message
      let errorMessage = 'Failed to create event. Please try again.';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
      window.scrollTo(0, 0); // Scroll to top to see error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <OrganizerSidebar />
      <div className="flex-grow p-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              {cloneFrom ? 'Clone Event' : 'Create New Event'}
            </h1>
            <button 
              onClick={() => navigate('/organizer/events')}
              className="text-indigo-600 hover:text-indigo-800 flex items-center"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Events
            </button>
          </div>
          
          {/* Error message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <form onSubmit={handleSubmit}>
              {/* Two-column layout for desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left column */}
                <div className="space-y-6">
                  {/* Event Title */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Event Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      value={formData.title}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 border ${
                        formErrors.title ? 'border-red-300' : 'border-gray-300'
                      } focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                    />
                    {formErrors.title && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
                    )}
                  </div>
                  
                  {/* Event Date & Time */}
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                      Date & Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      name="date"
                      id="date"
                      value={formData.date}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 border ${
                        formErrors.date ? 'border-red-300' : 'border-gray-300'
                      } focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                    />
                    {formErrors.date && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.date}</p>
                    )}
                  </div>
                  
                  {/* Location */}
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                      Location <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="location"
                      id="location"
                      value={formData.location}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 border ${
                        formErrors.location ? 'border-red-300' : 'border-gray-300'
                      } focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                      placeholder="Event venue or address"
                    />
                    {formErrors.location && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.location}</p>
                    )}
                  </div>
                  
                  {/* Category */}
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      id="category"
                      value={formData.category}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 border ${
                        formErrors.category ? 'border-red-300' : 'border-gray-300'
                      } focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                    >
                      <option value="">Select a category</option>
                      {CATEGORIES.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    {formErrors.category && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.category}</p>
                    )}
                  </div>
                  
                  {/* Image URL */}
                  <div>
                    <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                      Image URL (Optional)
                    </label>
                    <input
                      type="url"
                      name="image"
                      id="image"
                      value={formData.image}
                      onChange={handleImageChange}
                      className="mt-1 block w-full rounded-md shadow-sm py-2 px-3 border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="https://example.com/image.jpg"
                    />
                    {formErrors.image && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.image}</p>
                    )}
                    {imagePreview && (
                      <div className="mt-2">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="h-24 w-auto object-contain rounded"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/150?text=Invalid+Image';
                          }} 
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Right column */}
                <div className="space-y-6">
                  {/* Ticket Price */}
                  <div>
                    <label htmlFor="ticketPrice" className="block text-sm font-medium text-gray-700">
                      Ticket Price ($) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="ticketPrice"
                      id="ticketPrice"
                      min="0"
                      step="0.01"
                      value={formData.ticketPrice}
                      onChange={handleNumberChange}
                      className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 border ${
                        formErrors.ticketPrice ? 'border-red-300' : 'border-gray-300'
                      } focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                    />
                    {formErrors.ticketPrice && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.ticketPrice}</p>
                    )}
                  </div>
                  
                  {/* Total Tickets */}
                  <div>
                    <label htmlFor="totalTickets" className="block text-sm font-medium text-gray-700">
                      Total Tickets <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="totalTickets"
                      id="totalTickets"
                      min="1"
                      value={formData.totalTickets}
                      onChange={handleNumberChange}
                      className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 border ${
                        formErrors.totalTickets ? 'border-red-300' : 'border-gray-300'
                      } focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                    />
                    {formErrors.totalTickets && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.totalTickets}</p>
                    )}
                  </div>
                  
                  {/* Remaining Tickets (Only for cloned events) */}
                  {cloneFrom && (
                    <div>
                      <label htmlFor="remainingTickets" className="block text-sm font-medium text-gray-700">
                        Available Tickets <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="remainingTickets"
                        id="remainingTickets"
                        min="0"
                        max={formData.totalTickets}
                        value={formData.remainingTickets}
                        onChange={handleNumberChange}
                        className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 border ${
                          formErrors.remainingTickets ? 'border-red-300' : 'border-gray-300'
                        } focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                      />
                      {formErrors.remainingTickets && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.remainingTickets}</p>
                      )}
                    </div>
                  )}
                  
                  {/* Description */}
                  <div className="col-span-1 md:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      rows="6"
                      value={formData.description}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 border ${
                        formErrors.description ? 'border-red-300' : 'border-gray-300'
                      } focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                      placeholder="Provide details about your event"
                    />
                    {formErrors.description && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Form Actions */}
              <div className="mt-8 flex items-center justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/organizer/events')}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Creating Event...' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
          
          <div className="text-gray-600 text-sm">
            <p>Fields marked with <span className="text-red-500">*</span> are required</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEventPage;