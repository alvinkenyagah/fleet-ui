import React, { useState } from 'react';
import {
  User,
  Mail,
  Lock,
  Plus,
  Search,
  Eye,
  EyeOff,
  UserPlus,
  Calendar,
  Badge,
  Users,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  AlertCircle,
  Check
} from 'lucide-react';

import API from '../utils/api';

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);

// Success/Error Message Component
const MessageAlert = ({ message, type, onClose }) => {
  if (!message) return null;

  const alertClasses = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  const iconClasses = {
    success: 'text-green-400',
    error: 'text-red-400',
    info: 'text-blue-400'
  };

  return (
    <div className={`border rounded-lg p-4 mb-6 ${alertClasses[type]}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          {type === 'success' ? (
            <Check className={`h-5 w-5 ${iconClasses[type]}`} />
          ) : (
            <AlertCircle className={`h-5 w-5 ${iconClasses[type]}`} />
          )}
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <div className="ml-auto pl-3">
          <button
            onClick={onClose}
            className={`inline-flex rounded-md p-1.5 hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              type === 'success' ? 'hover:bg-green-200 focus:ring-green-600' :
              type === 'error' ? 'hover:bg-red-200 focus:ring-red-600' :
              'hover:bg-blue-200 focus:ring-blue-600'
            }`}
          >
            <span className="sr-only">Close</span>
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// Driver Stats Component
const DriverStats = ({ drivers }) => {
  const totalDrivers = drivers.length;
  // Assuming a 'status' field or similar for active drivers, or just counting all if no status exists.
  // For now, let's just count all drivers if 'role' is the only distinguishing factor
  const activeDrivers = drivers.filter(driver => driver.role === 'driver').length;
  const recentDrivers = drivers.filter(driver => {
    const createdDate = new Date(driver.createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return createdDate >= thirtyDaysAgo;
  }).length;

  const stats = [
    {
      name: 'Total Drivers',
      value: totalDrivers,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      name: 'Active Drivers',
      value: activeDrivers,
      icon: Badge,
      color: 'bg-green-500',
      bgColor: 'bg-green-50'
    },
    {
      name: 'New This Month',
      value: recentDrivers,
      icon: UserPlus,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className={`${stat.bgColor} rounded-xl p-6 border border-opacity-20`}>
          <div className="flex items-center">
            <div className={`${stat.color} p-3 rounded-lg`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{stat.name}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Enhanced Driver Form Component
const DriverForm = ({ onCreateDriver, setMessage, setError, clearMessages }) => {
  const [driverForm, setDriverForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};

    if (!driverForm.name.trim()) {
      errors.name = 'Name is required';
    } else if (driverForm.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!driverForm.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(driverForm.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!driverForm.password) {
      errors.password = 'Password is required';
    } else if (driverForm.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    clearMessages();

    try {
      await onCreateDriver(driverForm);
      setDriverForm({ name: '', email: '', password: '' });
      setFormErrors({});
      setMessage('Driver created successfully!');
    } catch (error) {
      setError('Failed to create driver. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setDriverForm({ ...driverForm, [field]: value });
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors({ ...formErrors, [field]: '' });
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-8 border border-gray-100">
      <div className="flex items-center mb-6">
        <div className="bg-blue-100 p-3 rounded-lg">
          <UserPlus className="h-6 w-6 text-blue-600" />
        </div>
        <div className="ml-4">
          <h2 className="text-2xl font-bold text-gray-900">Create New Driver</h2>
          <p className="text-gray-600">Add a new driver to your fleet management system</p>
        </div>
      </div>

      <form className="space-y-6">
        {/* Name Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                formErrors.name
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              placeholder="Enter driver's full name"
              value={driverForm.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </div>
          {formErrors.name && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {formErrors.name}
            </p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                formErrors.email
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              placeholder="Enter driver's email address"
              value={driverForm.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
          </div>
          {formErrors.email && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {formErrors.email}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              className={`block w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                formErrors.password
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              placeholder="Enter a secure password"
              value={driverForm.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          {formErrors.password && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {formErrors.password}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner />
              <span className="ml-2">Creating Driver...</span>
            </>
          ) : (
            <>
              <Plus className="h-5 w-5 mr-2" />
              Create Driver
            </>
          )}
        </button>
      </form>
    </div>
  );
};

// Enhanced Driver Table Component
const DriverTable = ({ drivers, onDeleteDriver }) => { // Accept onDeleteDriver prop
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const filteredDrivers = drivers.filter(driver =>
    driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedDrivers = [...filteredDrivers].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    if (sortBy === 'createdAt') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-xl font-bold text-gray-900">Driver Directory</h3>
              <p className="text-gray-600">Manage and view all registered drivers</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search drivers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {sortedDrivers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <p className="text-xl font-medium text-gray-500 mb-2">
              {searchTerm ? 'No drivers found' : 'No drivers registered yet'}
            </p>
            <p className="text-gray-400">
              {searchTerm
                ? 'Try adjusting your search terms'
                : 'Create your first driver to get started'
              }
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Name
                    {sortBy === 'name' && (
                      <div className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </div>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('email')}
                >
                  <div className="flex items-center">
                    Email
                    {sortBy === 'email' && (
                      <div className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </div>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center">
                    Created At
                    {sortBy === 'createdAt' && (
                      <div className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </div>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedDrivers.map((driver, index) => (
                <tr key={driver._id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {driver.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{driver.name}</div>
                        <div className="text-sm text-gray-500">ID: {driver._id.slice(-6)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{driver.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {driver.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      {new Date(driver.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded hover:bg-blue-50">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDeleteDriver(driver._id)} // Call onDeleteDriver
                        className="text-red-600 hover:text-red-900 transition-colors p-1 rounded hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900 transition-colors p-1 rounded hover:bg-gray-50">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      {sortedDrivers.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{sortedDrivers.length}</span> of{' '}
              <span className="font-medium">{drivers.length}</span> drivers
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear search
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Main Enhanced Driver Management Component
export default function DriverManagement({ onCreateDriver, drivers, message, error, setMessage, setError, clearMessages, fetchDrivers }) { // Add fetchDrivers
  const handleDeleteDriver = async (driverId) => {
    if (window.confirm('Are you sure you want to delete this driver?')) { // Confirmation dialog
      clearMessages();
      try {
        // You'll need to replace this with your actual API call logic (e.g., using axios or fetch)
        const token = localStorage.getItem('token'); // Get token from local storage
        if (!token) {
          setError('Authentication token not found. Please log in.');
          return;
        }

        const response = await fetch(`/api/drivers/${driverId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Include the token
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.msg || 'Failed to delete driver');
        }

        setMessage('Driver deleted successfully!');
        fetchDrivers(); // Re-fetch drivers to update the list
      } catch (err) {
        console.error('Error deleting driver:', err);
        setError(err.message || 'Failed to delete driver. Please try again.');
      }
    }
  };

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      {/* Messages */}
      <MessageAlert
        message={message}
        type="success"
        onClose={() => setMessage('')}
      />
      <MessageAlert
        message={error}
        type="error"
        onClose={() => setError('')}
      />

      {/* Stats */}
      <DriverStats drivers={drivers} />

      {/* Driver Form */}
      <DriverForm
        onCreateDriver={onCreateDriver}
        setMessage={setMessage}
        setError={setError}
        clearMessages={clearMessages}
      />

      {/* Driver Table */}
      <DriverTable
        drivers={drivers}
        onDeleteDriver={handleDeleteDriver} // Pass the delete function
      />
    </div>
  );
}