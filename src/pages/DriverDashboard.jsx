import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../utils/api';
import { User, Truck, Calendar, MapPin, Settings, LogOut, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

// Driver Profile Component
const DriverProfile = ({ driver, onRefresh }) => {
  if (!driver) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <User className="mr-2 h-5 w-5 text-blue-600" />
          Driver Profile
        </h2>
        <button
          onClick={onRefresh}
          className="text-gray-500 hover:text-blue-600 transition-colors"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-gray-600 font-medium">Name:</span>
          <span className="text-gray-800 font-semibold">{driver.name}</span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-gray-600 font-medium">Email:</span>
          <span className="text-gray-800">{driver.email}</span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-gray-600 font-medium">Role:</span>
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium capitalize">
            {driver.role}
          </span>
        </div>
        
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-600 font-medium">Member Since:</span>
          <span className="text-gray-800">
            {new Date(driver.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};

// Vehicle Status Badge Component
const VehicleStatusBadge = ({ status }) => {
  const statusConfig = {
    active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    maintenance: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
    inactive: { color: 'bg-red-100 text-red-800', icon: XCircle }
  };

  const config = statusConfig[status] || statusConfig.inactive;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Assigned Vehicle Component
const AssignedVehicle = ({ vehicle, loading, onRefresh }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <Truck className="mr-2 h-5 w-5 text-blue-600" />
            Assigned Vehicle
          </h2>
          <button
            onClick={onRefresh}
            className="text-gray-500 hover:text-blue-600 transition-colors"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
        
        <div className="text-center py-8">
          <Truck className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">No vehicle assigned</p>
          <p className="text-gray-400 text-sm mt-2">Contact your administrator to get a vehicle assigned</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <Truck className="mr-2 h-5 w-5 text-blue-600" />
          Assigned Vehicle
        </h2>
        <button
          onClick={onRefresh}
          className="text-gray-500 hover:text-blue-600 transition-colors"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800">{vehicle.plateNumber}</h3>
            <p className="text-gray-600">{vehicle.make} {vehicle.model}</p>
          </div>
          <VehicleStatusBadge status={vehicle.status} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600 font-medium">Year:</span>
            <span className="text-gray-800">{vehicle.year}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600 font-medium">Capacity:</span>
            <span className="text-gray-800">{vehicle.capacity} seats</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600 font-medium">Fuel Type:</span>
            <span className="text-gray-800 capitalize">{vehicle.fuelType}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600 font-medium">Added:</span>
            <span className="text-gray-800">
              {new Date(vehicle.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Quick Stats Component
const QuickStats = ({ vehicle }) => {
  const stats = [
    {
      title: 'Vehicle Status',
      value: vehicle ? vehicle.status : 'Not Assigned',
      icon: Truck,
      color: vehicle ? 
        (vehicle.status === 'active' ? 'text-green-600' : 
         vehicle.status === 'maintenance' ? 'text-yellow-600' : 'text-red-600') 
        : 'text-gray-400'
    },
    {
      title: 'Total Trips',
      value: 'Coming Soon',
      icon: MapPin,
      color: 'text-blue-600'
    },
    {
      title: 'This Month',
      value: 'Coming Soon',
      icon: Calendar,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center">
            <div className={`p-3 rounded-full bg-gray-100 ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Main Driver Dashboard Component
const DriverDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [driverData, setDriverData] = useState(null);
  const [assignedVehicle, setAssignedVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vehicleLoading, setVehicleLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDriverData = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/drivers/${user.id}`);
      setDriverData(response.data.driver);
      setError(null);
    } catch (err) {
      console.error('Error fetching driver data:', err);
      setError('Failed to load driver information');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedVehicle = async () => {
    try {
      setVehicleLoading(true);
      const response = await API.get('/vehicles');
      const vehicles = response.data;
      const myVehicle = vehicles.find(vehicle => 
        vehicle.assignedDriver && vehicle.assignedDriver._id === user.id
      );
      setAssignedVehicle(myVehicle || null);
      setError(null);
    } catch (err) {
      console.error('Error fetching vehicle data:', err);
      setError('Failed to load vehicle information');
    } finally {
      setVehicleLoading(false);
    }
  };

  const refreshData = () => {
    fetchDriverData();
    fetchAssignedVehicle();
  };

  useEffect(() => {
    if (user && user.id) {
      fetchDriverData();
      fetchAssignedVehicle();
    }
  }, [user]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Driver Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name}</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <QuickStats vehicle={assignedVehicle} />

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Driver Profile */}
          <DriverProfile 
            driver={driverData} 
            onRefresh={fetchDriverData}
          />

          {/* Assigned Vehicle */}
          <AssignedVehicle 
            vehicle={assignedVehicle} 
            loading={vehicleLoading}
            onRefresh={fetchAssignedVehicle}
          />
        </div>

        {/* Coming Soon Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-blue-600" />
            Trip Management
          </h2>
          <div className="text-center py-8">
            <Calendar className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">Trip management coming soon</p>
            <p className="text-gray-400 text-sm mt-2">
              View your assigned trips, trip history, and manage your schedule
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DriverDashboard;