import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function UpdateVehiclePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [vehicle, setVehicle] = useState(null);
  const [formData, setFormData] = useState({
    plateNumber: '',
    make: '',
    model: '',
    year: '',
    capacity: '',
    fuelType: 'petrol',
    status: 'active',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [unassigning, setUnassigning] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Enhanced validation function
  const validateForm = () => {
    const errors = {};
    
    if (!formData.plateNumber.trim()) {
      errors.plateNumber = 'Plate number is required';
    } else if (!/^[A-Z0-9\s-]{3,15}$/i.test(formData.plateNumber)) {
      errors.plateNumber = 'Invalid plate number format';
    }
    
    if (!formData.make.trim()) {
      errors.make = 'Make is required';
    } else if (formData.make.length < 2) {
      errors.make = 'Make must be at least 2 characters';
    }
    
    if (!formData.model.trim()) {
      errors.model = 'Model is required';
    } else if (formData.model.length < 2) {
      errors.model = 'Model must be at least 2 characters';
    }
    
    const currentYear = new Date().getFullYear();
    if (!formData.year || formData.year < 1900 || formData.year > currentYear + 1) {
      errors.year = `Year must be between 1900 and ${currentYear + 1}`;
    }
    
    if (!formData.capacity || formData.capacity < 1 || formData.capacity > 100) {
      errors.capacity = 'Capacity must be between 1 and 100';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    const fetchVehicle = async () => {
      if (!user || user.role !== 'admin') {
        setError('Unauthorized access. Admin privileges required.');
        setLoading(false);
        setTimeout(() => navigate('/'), 2000);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Enhanced API call with better error handling
        const res = await axios.get(`/api/vehicles/${id}`, {
          headers: { 'x-auth-token': token },
          timeout: 10000, // 10 second timeout
        });

        if (res.data) {
          setVehicle(res.data);
          setFormData({
            plateNumber: res.data.plateNumber || '',
            make: res.data.make || '',
            model: res.data.model || '',
            year: res.data.year || '',
            capacity: res.data.capacity || '',
            fuelType: res.data.fuelType || 'petrol',
            status: res.data.status || 'active',
          });
        }
      } catch (err) {
        console.error('Error fetching vehicle:', err);
        let errorMessage = 'Failed to load vehicle details.';
        
        if (err.code === 'ECONNABORTED') {
          errorMessage = 'Request timed out. Please check your connection.';
        } else if (err.response?.status === 404) {
          errorMessage = 'Vehicle not found. It may have been deleted.';
        } else if (err.response?.status === 401) {
          errorMessage = 'Session expired. Please log in again.';
          setTimeout(() => navigate('/'), 2000);
        } else if (err.response?.status === 403) {
          errorMessage = 'Access denied. Admin privileges required.';
        } else if (err.response?.data?.msg) {
          errorMessage = err.response.data.msg;
        } else if (err.message === 'Network Error') {
          errorMessage = 'Unable to connect to server. Please check if the backend is running.';
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [id, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear general messages
    setError('');
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please fix the validation errors below.');
      return;
    }

    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const res = await axios.put(`/api/vehicles/${id}`, formData, {
        headers: { 'x-auth-token': token },
        timeout: 10000,
      });

      setMessage(res.data.msg || 'Vehicle updated successfully!');
      
      // Update local vehicle state
      setVehicle(prev => ({ ...prev, ...formData }));
      
      // Navigate back after a short delay
      setTimeout(() => {
        navigate('/admin', { 
          state: { message: 'Vehicle updated successfully!' }
        });
      }, 2000);

    } catch (err) {
      console.error('Error updating vehicle:', err);
      let errorMessage = 'Error updating vehicle.';
      
      if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Please try again.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Vehicle not found or API endpoint not available. Please check if the backend is running.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Session expired. Please log in again.';
        setTimeout(() => navigate('/'), 2000);
      } else if (err.response?.status === 403) {
        errorMessage = 'Access denied. Admin privileges required.';
      } else if (err.response?.data?.msg) {
        errorMessage = err.response.data.msg;
      } else if (err.message === 'Network Error') {
        errorMessage = 'Unable to connect to server. Please check if the backend is running on the correct port.';
      }
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnassignDriver = async () => {
    if (!vehicle?.assignedDriver) {
      setError('No driver assigned to this vehicle.');
      return;
    }

    const confirmUnassign = window.confirm(
      `Are you sure you want to unassign ${vehicle.assignedDriver.name} from ${vehicle.plateNumber}?`
    );

    if (!confirmUnassign) return;

    setUnassigning(true);
    setError('');
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const res = await axios.put('/api/vehicles/assign-driver', 
        { vehicleId: id, driverId: null }, 
        {
          headers: { 'x-auth-token': token },
          timeout: 10000,
        }
      );

      setMessage(res.data.msg || 'Driver unassigned successfully!');
      setVehicle(prev => ({ ...prev, assignedDriver: null }));

    } catch (err) {
      console.error('Error unassigning driver:', err);
      let errorMessage = 'Error unassigning driver.';
      
      if (err.response?.status === 404) {
        errorMessage = 'Assignment endpoint not found. Please check backend configuration.';
      } else if (err.response?.data?.msg) {
        errorMessage = err.response.data.msg;
      }
      
      setError(errorMessage);
    } finally {
      setUnassigning(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  // Error state without vehicle data
  if (error && !vehicle) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-4">
            <h2 className="font-bold text-lg mb-2">Error Loading Vehicle</h2>
            <p>{error}</p>
          </div>
          <button
            onClick={() => navigate('/admin')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Back to Admin Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Vehicle not found
  if (!vehicle) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-6 py-4 rounded-lg mb-4">
            <h2 className="font-bold text-lg mb-2">Vehicle Not Found</h2>
            <p>The requested vehicle could not be found.</p>
          </div>
          <button
            onClick={() => navigate('/admin')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Back to Admin Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Update Vehicle</h1>
              <p className="text-gray-600 mt-1">Plate Number: <span className="font-semibold">{vehicle.plateNumber}</span></p>
            </div>
            <button
              onClick={() => navigate('/admin')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Admin
            </button>
          </div>
        </div>

        {/* Status Messages */}
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-lg mb-6 flex items-center gap-3">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg mb-6 flex items-center gap-3">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Vehicle Details</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Plate Number *
                    </label>
                    <input
                      type="text"
                      name="plateNumber"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        validationErrors.plateNumber ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      value={formData.plateNumber}
                      onChange={handleChange}
                      placeholder="e.g., ABC-123"
                      required
                    />
                    {validationErrors.plateNumber && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.plateNumber}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year *
                    </label>
                    <input
                      type="number"
                      name="year"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        validationErrors.year ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      value={formData.year}
                      onChange={handleChange}
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      required
                    />
                    {validationErrors.year && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.year}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Make *
                    </label>
                    <input
                      type="text"
                      name="make"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        validationErrors.make ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      value={formData.make}
                      onChange={handleChange}
                      placeholder="e.g., Toyota"
                      required
                    />
                    {validationErrors.make && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.make}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Model *
                    </label>
                    <input
                      type="text"
                      name="model"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        validationErrors.model ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      value={formData.model}
                      onChange={handleChange}
                      placeholder="e.g., Camry"
                      required
                    />
                    {validationErrors.model && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.model}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Capacity *
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        validationErrors.capacity ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      value={formData.capacity}
                      onChange={handleChange}
                      min="1"
                      max="100"
                      placeholder="Number of passengers"
                      required
                    />
                    {validationErrors.capacity && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.capacity}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fuel Type *
                    </label>
                    <select
                      name="fuelType"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      value={formData.fuelType}
                      onChange={handleChange}
                      required
                    >
                      <option value="petrol">Petrol</option>
                      <option value="diesel">Diesel</option>
                      <option value="electric">Electric</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    name="status"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={formData.status}
                    onChange={handleChange}
                    required
                  >
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Update Vehicle
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Driver Assignment */}
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Driver Assignment</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {vehicle?.assignedDriver?.name || 'No driver assigned'}
                    </p>
                    {vehicle?.assignedDriver && (
                      <p className="text-sm text-gray-600">
                        {vehicle.assignedDriver.email}
                      </p>
                    )}
                  </div>
                </div>

                {vehicle?.assignedDriver && (
                  <button
                    type="button"
                    onClick={handleUnassignDriver}
                    disabled={unassigning}
                    className="w-full bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {unassigning ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        Unassigning...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Unassign Driver
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Vehicle Info */}
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Information</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">
                    {vehicle.createdAt ? new Date(vehicle.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-medium">
                    {vehicle.updatedAt ? new Date(vehicle.updatedAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ID:</span>
                  <span className="font-mono text-xs">{vehicle._id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}