import React from 'react';
import { MapPin, Phone, Mail, Clock, Users, Wifi, Car, Utensils } from 'lucide-react';

const Information: React.FC = () => {
  const venueData = {
    name: 'University Convention Center',
    description: 'Modern venue facility designed for events and conferences with state-of-the-art amenities.',
    capacity: 5000,
    address: '123 Convention Center Blvd, University City',
    phone: '(555) 123-4567',
    email: 'info@venue.com',
    rating: 4.8
  };

  const facilities = [
    { name: 'Free WiFi', icon: Wifi, hours: '24/7' },
    { name: 'Parking', icon: Car, hours: '6 AM - 12 AM' },
    { name: 'Food Court', icon: Utensils, hours: '9 AM - 9 PM' }
  ];

  const hours = [
    { day: 'Monday - Friday', time: '8:00 AM - 10:00 PM' },
    { day: 'Saturday', time: '9:00 AM - 11:00 PM' },
    { day: 'Sunday', time: '10:00 AM - 9:00 PM' }
  ];

  return (
    <div className="py-8 px-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Venue Information</h1>
      
      {/* General Info */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">About the Venue</h2>
        <p className="text-gray-600 mb-4">{venueData.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-blue-500" />
            <span>Capacity: {venueData.capacity.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-blue-500" />
            <span>{venueData.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone size={16} className="text-blue-500" />
            <span>{venueData.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail size={16} className="text-blue-500" />
            <span>{venueData.email}</span>
          </div>
        </div>
      </div>

      {/* Facilities */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Facilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {facilities.map((facility, index) => {
            const IconComponent = facility.icon;
            return (
              <div key={index} className="text-center p-4 border rounded-lg">
                <IconComponent size={24} className="text-blue-500 mx-auto mb-2" />
                <h3 className="font-medium">{facility.name}</h3>
                <p className="text-sm text-gray-500">{facility.hours}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Operating Hours */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Operating Hours</h2>
        <div className="space-y-2">
          {hours.map((schedule, index) => (
            <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
              <span className="font-medium">{schedule.day}</span>
              <span className="text-gray-600">{schedule.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Information;