import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';

// Simple Toast Component
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden ${
      type === 'success' ? 'border-l-4 border-green-400' : 'border-l-4 border-red-400'
    }`}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {type === 'success' ? (
              <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className={`text-sm font-medium ${
              type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

type Device = {
  _id: string;
  name: string;
  type: string;
  status: string;
  location: string;
  __v: number;
};


const AdminDevicesPage: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  // Add device modal states
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newDevice, setNewDevice] = useState({
    name: '',
    type: '',
    status: 'aready',
    location: ''
  });
  const [addLoading, setAddLoading] = useState<boolean>(false);
  
  // Edit device modal states
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [editLoading, setEditLoading] = useState<boolean>(false);
  
  // Toast states
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Delete confirmation modal states
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [deviceToDelete, setDeviceToDelete] = useState<Device | null>(null);

  // Show toast function
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  // Close toast function
  const closeToast = () => {
    setToast(null);
  };

  // Fetch devices from API
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('http://localhost:9999/api/devices/');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data); // Debug log
        
        // Handle different possible response structures
        if (data && Array.isArray(data)) {
          // If data is directly an array
          setDevices(data);
        } else if (data && data.devices && Array.isArray(data.devices)) {
          // If data has a devices property
          setDevices(data.devices);
        } else if (data && data.code === 200 && data.devices) {
          // If data has code and devices properties
          setDevices(data.devices);
        } else {
          throw new Error(data.message || 'Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching devices:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  // Get unique statuses and types for filters
  const uniqueStatuses = useMemo(() => {
    return Array.from(new Set(devices.map(device => device.status))).filter(Boolean);
  }, [devices]);

  const uniqueTypes = useMemo(() => {
    return Array.from(new Set(devices.map(device => device.type))).filter(Boolean);
  }, [devices]);

  // Filter devices based on search and filters
  const filteredDevices = useMemo(() => {
    return devices.filter(device => {
      const matchesSearch = searchQuery === '' || 
        device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || device.status === statusFilter;
      const matchesType = typeFilter === 'all' || device.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [devices, searchQuery, statusFilter, typeFilter]);

  // Handle delete confirmation
  const handleDeleteClick = (device: Device) => {
    if (device.status === 'borrowed') {
      showToast('Không thể xóa thiết bị đang được mượn', 'error');
      return;
    }
    setDeviceToDelete(device);
    setShowDeleteModal(true);
  };

  // Handle device deletion
  const handleDeleteDevice = async () => {
    if (!deviceToDelete) return;

    try {
      const response = await fetch(`http://localhost:9999/api/devices/${deviceToDelete._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDevices(devices.filter(device => device._id !== deviceToDelete._id));
        showToast('Xóa thiết bị thành công!', 'success');
        setShowDeleteModal(false);
        setDeviceToDelete(null);
      } else {
        throw new Error('Failed to delete device');
      }
    } catch (err) {
      console.error('Error deleting device:', err);
      showToast('Có lỗi xảy ra khi xóa thiết bị', 'error');
    }
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeviceToDelete(null);
  };

  // Handle device status update
  const handleStatusUpdate = async (deviceId: string, newStatus: string) => {
    try {
      const response = await fetch(`http://localhost:9999/api/devices/${deviceId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('Status update response:', responseData);
        
        // Update device in the list
        setDevices(devices.map(device => 
          device._id === deviceId ? { ...device, status: newStatus } : device
        ));
        showToast('Cập nhật trạng thái thành công!', 'success');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update device status');
      }
    } catch (err) {
      console.error('Error updating device status:', err);
      showToast('Có lỗi xảy ra khi cập nhật trạng thái: ' + (err instanceof Error ? err.message : 'Unknown error'), 'error');
    }
  };

  // Handle add new device
  const handleAddDevice = async () => {
    // Validate form
    if (!newDevice.name.trim() || !newDevice.type.trim() || !newDevice.location.trim()) {
      showToast('Vui lòng điền đầy đủ thông tin thiết bị', 'error');
      return;
    }

    try {
      setAddLoading(true);
      const response = await fetch('http://localhost:9999/api/devices/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDevice),
      });

      console.log('Add device response status:', response.status);
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('Add device response data:', responseData);
        
        // Handle different possible response structures
        let addedDevice;
        if (responseData && responseData.device) {
          // If response has device property
          addedDevice = responseData.device;
        } else if (responseData && responseData._id) {
          // If response is directly the device object
          addedDevice = responseData;
        } else if (Array.isArray(responseData) && responseData.length > 0) {
          // If response is an array
          addedDevice = responseData[0];
        } else {
          // Create a temporary device object with the data we sent
          addedDevice = {
            _id: Date.now().toString(), // Temporary ID
            ...newDevice,
            __v: 0
          };
        }
        
        setDevices([...devices, addedDevice]);
        setShowAddModal(false);
        setNewDevice({ name: '', type: '', status: 'aready', location: '' });
        showToast('Thêm thiết bị thành công!', 'success');
        
        // Refresh the device list to ensure consistency
        setTimeout(() => {
          const refreshDevices = async () => {
            try {
              const refreshResponse = await fetch('http://localhost:9999/api/devices/');
              if (refreshResponse.ok) {
                const refreshData = await refreshResponse.json();
                let devicesList = [];
                if (Array.isArray(refreshData)) {
                  devicesList = refreshData;
                } else if (refreshData && refreshData.devices && Array.isArray(refreshData.devices)) {
                  devicesList = refreshData.devices;
                } else if (refreshData && refreshData.code === 200 && refreshData.devices) {
                  devicesList = refreshData.devices;
                }
                setDevices(devicesList);
              }
            } catch (refreshErr) {
              console.error('Error refreshing devices:', refreshErr);
            }
          };
          refreshDevices();
        }, 1000);
      } else {
        const errorText = await response.text();
        console.error('Add device error response:', errorText);
        let errorMessage = 'Failed to add device';
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error('Error adding device:', err);
      showToast('Có lỗi xảy ra khi thêm thiết bị: ' + (err instanceof Error ? err.message : 'Unknown error'), 'error');
    } finally {
      setAddLoading(false);
    }
  };

  // Handle input change for new device
  const handleNewDeviceChange = (field: string, value: string) => {
    setNewDevice(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle edit device click
  const handleEditClick = (device: Device) => {
    if (device.status === 'borrowed') {
      showToast('Không thể chỉnh sửa thiết bị đang được mượn', 'error');
      return;
    }
    setEditingDevice(device);
    setShowEditModal(true);
  };

  // Handle edit device
  const handleEditDevice = async () => {
    if (!editingDevice) return;

    // Validate form
    if (!editingDevice.name.trim() || !editingDevice.type.trim() || !editingDevice.location.trim()) {
      showToast('Vui lòng điền đầy đủ thông tin thiết bị', 'error');
      return;
    }

    try {
      setEditLoading(true);
      const response = await fetch(`http://localhost:9999/api/devices/${editingDevice._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingDevice.name,
          type: editingDevice.type,
          location: editingDevice.location
        }),
      });

      console.log('Edit device response status:', response.status);
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('Edit device response data:', responseData);
        
        // Update device in the list
        setDevices(devices.map(device => 
          device._id === editingDevice._id 
            ? { ...device, name: editingDevice.name, type: editingDevice.type, location: editingDevice.location }
            : device
        ));
        
        setShowEditModal(false);
        setEditingDevice(null);
        showToast('Cập nhật thiết bị thành công!', 'success');
      } else {
        const errorText = await response.text();
        console.error('Edit device error response:', errorText);
        let errorMessage = 'Failed to update device';
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error('Error editing device:', err);
      showToast('Có lỗi xảy ra khi cập nhật thiết bị: ' + (err instanceof Error ? err.message : 'Unknown error'), 'error');
    } finally {
      setEditLoading(false);
    }
  };

  // Handle input change for editing device
  const handleEditDeviceChange = (field: string, value: string) => {
    if (editingDevice) {
      setEditingDevice(prev => prev ? ({
        ...prev,
        [field]: value
      }) : null);
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingDevice(null);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-gray-900';
      case 'borrowed':
        return 'bg-red-100 text-gray-900';
      case 'aready':
        return 'bg-yellow-100 text-gray-900';
      default:
        return 'bg-gray-100 text-gray-900';
    }
  };

  const getStatusText = (status: string) => {
        return status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quản lý thiết bị</h1>
              <p className="mt-2 text-gray-600">
                Quản lý và theo dõi tất cả thiết bị trong hệ thống
              </p>
            </div>
            <div className="flex space-x-3">
              <Link
                href="/admin"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                ← Quay lại
              </Link>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                + Thêm thiết bị
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">📱</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Tổng thiết bị
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {devices.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">✅</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Available
                    </dt>
                    <dd className="text-lg font-medium text-green-600">
                      {devices.filter(d => d.status === 'available').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">📦</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Borrowed
                    </dt>
                    <dd className="text-lg font-medium text-red-600">
                      {devices.filter(d => d.status === 'borrowed').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">🏷️</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Other
                    </dt>
                    <dd className="text-lg font-medium text-yellow-600">
                      {devices.filter(d => !['available', 'borrowed'].includes(d.status)).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-900 mb-3">
                🔍 Tìm kiếm thiết bị
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              <input
                type="text"
                placeholder="Tìm theo tên, loại, vị trí..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 placeholder-gray-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                📊 Trạng thái
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 bg-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>
                    {getStatusText(status)}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                🏷️ Loại thiết bị
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 bg-white"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">Tất cả loại</option>
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Lỗi tải dữ liệu
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Devices Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Danh sách thiết bị ({filteredDevices.length})
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-900">
              Tất cả thiết bị trong hệ thống
            </p>
          </div>
          
          {filteredDevices.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-4xl">📱</span>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Không có thiết bị</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Không tìm thấy thiết bị phù hợp với bộ lọc.'
                  : 'Chưa có thiết bị nào trong hệ thống.'}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredDevices.map((device) => (
                <li key={device._id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-indigo-600 font-medium">
                            {device.type.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <h4 className="text-lg font-medium text-gray-900">
                            {device.name}
                          </h4>
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(device.status)}`}>
                            {getStatusText(device.status)}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-900">
                          <span className="mr-4">Loại: {device.type}</span>
                          <span className="mr-4">Vị trí: {device.location}</span>
                          <span>ID: {device._id}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* Status Update Dropdown */}
                      <select
                        value={device.status}
                        onChange={(e) => handleStatusUpdate(device._id, e.target.value)}
                        className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                      >
                        <option value="available">available</option>
                        <option value="borrowed">borrowed</option>
                        <option value="aready">aready</option>
                      </select>
                      
                      {/* View Details Button */}
                      <Link
                        href={`/devices/${device._id}`}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Xem
                      </Link>
                      
                      {/* Edit Button */}
                      <button
                        onClick={() => handleEditClick(device)}
                        disabled={device.status === 'borrowed'}
                        className={`inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                          device.status === 'borrowed'
                            ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                            : 'text-indigo-700 bg-indigo-100 hover:bg-indigo-200'
                        }`}
                        title={device.status === 'borrowed' ? 'Không thể chỉnh sửa thiết bị đang được mượn' : 'Chỉnh sửa thiết bị'}
                      >
                        Sửa
                      </button>
                      
                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteClick(device)}
                        disabled={device.status === 'borrowed'}
                        className={`inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                          device.status === 'borrowed'
                            ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                            : 'text-red-700 bg-red-100 hover:bg-red-200'
                        }`}
                        title={device.status === 'borrowed' ? 'Không thể xóa thiết bị đang được mượn' : 'Xóa thiết bị'}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Add Device Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Thêm thiết bị mới
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="space-y-4">
                {/* Device Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên thiết bị *
                  </label>
                  <input
                    type="text"
                    value={newDevice.name}
                    onChange={(e) => handleNewDeviceChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                    placeholder="Nhập tên thiết bị"
                  />
                </div>

                {/* Device Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại thiết bị *
                  </label>
                  <input
                    type="text"
                    value={newDevice.type}
                    onChange={(e) => handleNewDeviceChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                    placeholder="Nhập loại thiết bị"
                  />
                </div>

                {/* Device Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={newDevice.status}
                    onChange={(e) => handleNewDeviceChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  >
                    <option value="aready">aready</option>
                    <option value="available">available</option>
                    <option value="borrowed">borrowed</option>
                  </select>
                </div>

                {/* Device Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vị trí *
                  </label>
                  <input
                    type="text"
                    value={newDevice.location}
                    onChange={(e) => handleNewDeviceChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                    placeholder="Nhập vị trí thiết bị"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  disabled={addLoading}
                >
                  Hủy
                </button>
                <button
                  onClick={handleAddDevice}
                  disabled={addLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang thêm...
                    </div>
                  ) : (
                    'Thêm thiết bị'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Device Modal */}
      {showEditModal && editingDevice && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Sửa thiết bị
                </h3>
                <button
                  onClick={handleCancelEdit}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="space-y-4">
                {/* Device Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên thiết bị *
                  </label>
                  <input
                    type="text"
                    value={editingDevice.name}
                    onChange={(e) => handleEditDeviceChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                    placeholder="Nhập tên thiết bị"
                  />
                </div>

                {/* Device Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại thiết bị *
                  </label>
                  <input
                    type="text"
                    value={editingDevice.type}
                    onChange={(e) => handleEditDeviceChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                    placeholder="Nhập loại thiết bị"
                  />
                </div>

                {/* Device Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vị trí *
                  </label>
                  <input
                    type="text"
                    value={editingDevice.location}
                    onChange={(e) => handleEditDeviceChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                    placeholder="Nhập vị trí thiết bị"
                  />
                </div>

                {/* Current Status (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái hiện tại
                  </label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(editingDevice.status)}`}>
                      {editingDevice.status}
                    </span>
                    <span className="ml-2 text-sm">(Chỉ có thể thay đổi bằng dropdown bên dưới)</span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  disabled={editLoading}
                >
                  Hủy
                </button>
                <button
                  onClick={handleEditDevice}
                  disabled={editLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang cập nhật...
                    </div>
                  ) : (
                    'Cập nhật thiết bị'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deviceToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Xác nhận xóa thiết bị
                </h3>
                <button
                  onClick={handleCancelDelete}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                      <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900">
                      Bạn có chắc chắn muốn xóa?
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Hành động này không thể hoàn tác.
                    </p>
                  </div>
                </div>

                {/* Device Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-indigo-600 font-medium text-sm">
                          {deviceToDelete.type.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <h5 className="text-sm font-medium text-gray-900">
                        {deviceToDelete.name}
                      </h5>
                      <p className="text-sm text-gray-500">
                        {deviceToDelete.type} • {deviceToDelete.location}
                      </p>
                    </div>
                    <div className="ml-auto">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(deviceToDelete.status)}`}>
                        {getStatusText(deviceToDelete.status)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancelDelete}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDeleteDevice}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Xóa thiết bị
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}
    </div>
  );
};

export default AdminDevicesPage;
