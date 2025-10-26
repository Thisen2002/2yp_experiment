import React from 'react';
import { useNavigate } from 'react-router-dom';

const EventCard = ({ event }) => {
    const navigate = useNavigate();

    const handleNavigateToMap = () => {
        // Navigate to the map page
        navigate('/map');
        // TODO: Add building highlighting logic when building ID mapping is provided
    };


    return (
        <div className="max-w-sm rounded-xl overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300 bg-gradient-to-r from-purple-400 via-pink-500 to-red-400 text-white">
            {event.image && (
                <img className="w-full h-48 object-cover" src={event.image} alt={event.name} />
            )}
            <div className="px-6 py-4">
                <div className="font-extrabold text-2xl mb-2 drop-shadow-lg">{event.name}</div>
                <p className="text-white text-base drop-shadow-md">
                    {event.description}
                </p>
            </div>
            <div className="px-6 pt-4 pb-4">
                <div className="flex justify-between items-center mb-3">
                    <span className="bg-white text-purple-700 font-bold px-3 py-1 rounded-full shadow-md">
                        {event.date}
                    </span>
                </div>
                <div className="flex gap-2 justify-center">
                    <button className="bg-yellow-400 text-purple-800 font-bold px-4 py-2 rounded-full shadow-md hover:bg-yellow-300 hover:scale-105 transition-all duration-200 flex-1">
                        Details
                    </button>
                    <button 
                        className="bg-green-400 text-white font-bold px-4 py-2 rounded-full shadow-md hover:bg-green-300 hover:scale-105 transition-all duration-200 flex-1"
                        onClick={handleNavigateToMap}
                    >
                        Navigate
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventCard;
