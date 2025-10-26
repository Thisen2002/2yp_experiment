import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { RefreshCw, AlertTriangle, Bell, BellOff } from "lucide-react";
import SvgHeatmap from "./SvgHeatmap.jsx";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import GaugeChart from './HeatMapAnalysis/GaugeChart';
import EnhancedSearchBar from "./HeatMapAnalysis/EnhancedSearchBar";
import { LoadingView, ErrorView } from "./utils/uiHelpers";
import { fetchBuildingHistoryByName, getIntervalOptions, getPollOptions } from "./utils/api";

// Types
interface CrowdData {
  buildingId: string;
  buildingName: string;
  currentCount: number;
  predictedCount: number;
  timestamp: string;
  color: string;
  capacity: number;
}

interface BuildingHistoryData {
  timestamp: string;
  current_count: number;
}

interface CapacityAlert {
  id: string;
  buildingId: string;
  buildingName: string;
  currentCount: number;
  capacity: number;
  alertLevel: 'warning' | 'critical' | 'full';
  percentage: number;
  timestamp: string;
}

interface AlertSettings {
  enabled: boolean;
  warningThreshold: number;
  criticalThreshold: number;
  fullThreshold: number;
  showNotifications: boolean;
}

// Constants
const BUILDING_DATA = [
  { id: 'B1', name: 'Engineering Carpentry Shop', capacity: 25 },
  { id: 'B2', name: 'Engineering Workshop', capacity: 60 },
  { id: 'B3', name: 'Building B3', capacity: 100 },
  { id: 'B4', name: 'Generator Room', capacity: 10 },
  { id: 'B5', name: 'Building B5', capacity: 100 },
  { id: 'B6', name: 'Structure Lab', capacity: 50 },
  { id: 'B7', name: 'Administrative Building', capacity: 100 },
  { id: 'B8', name: 'Canteen', capacity: 30 },
  { id: 'B9', name: 'Lecture Room 10/11', capacity: 80 },
  { id: 'B10', name: 'Engineering Library', capacity: 120 },
  { id: 'B11', name: 'Department of Chemical and Process Engineering', capacity: 80 },
  { id: 'B12', name: 'Security Unit', capacity: 20 },
  { id: 'B13', name: 'Drawing Office 2', capacity: 60 },
  { id: 'B14', name: 'Faculty Canteen', capacity: 30 },
  { id: 'B15', name: 'Department of Manufacturing and Industrial Engineering', capacity: 30 },
  { id: 'B16', name: 'Professor E.O.E. Perera Theater', capacity: 200 },
  { id: 'B17', name: 'Electronic Lab', capacity: 35 },
  { id: 'B18', name: 'Washrooms', capacity: 100 },
  { id: 'B19', name: 'Electrical and Electronic Workshop', capacity: 45 },
  { id: 'B20', name: 'Department of Computer Engineering', capacity: 30 },
  { id: 'B21', name: 'Building B21', capacity: 50 },
  { id: 'B22', name: 'Environmental Lab', capacity: 30 },
  { id: 'B23', name: 'Applied Mechanics Lab', capacity: 30 },
  { id: 'B24', name: 'New Mechanics Lab', capacity: 35 },
  { id: 'B25', name: 'Building B25', capacity: 50 },
  { id: 'B26', name: 'Building B26', capacity: 50 },
  { id: 'B27', name: 'Building B27', capacity: 50 },
  { id: 'B28', name: 'Materials Lab', capacity: 40 },
  { id: 'B29', name: 'Thermodynamics Lab', capacity: 40 },
  { id: 'B30', name: 'Fluids Lab', capacity: 50 },
  { id: 'B31', name: 'Surveying and Soil Lab', capacity: 70 },
  { id: 'B32', name: 'Department of Engineering Mathematics', capacity: 120 },
  { id: 'B33', name: 'Drawing Office 1', capacity: 50 },
  { id: 'B34', name: 'Department of Electrical and Electronic Engineering', capacity: 150 }
];

const COLORS = ['#ff6b6b', '#4ecdc4', '#ff9f43', '#6c5ce7', '#a29bfe', '#74b9ff', '#fd79a8', '#fdcb6e', '#6c5ce7', '#55a3ff'];

const CHART_STYLES = `
  .chart-scroll-container::-webkit-scrollbar {
    height: 14px;
  }
  .chart-scroll-container::-webkit-scrollbar-track {
    background: linear-gradient(90deg, #f8fafc 0%, #e2e8f0 100%);
    border-radius: 8px;
    border: 1px solid #e2e8f0;
  }
  .chart-scroll-container::-webkit-scrollbar-thumb {
    background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%);
    border-radius: 8px;
    border: 2px solid #f8fafc;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  .chart-scroll-container::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(90deg, #2563eb 0%, #1e40af 100%);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  .chart-scroll-container::-webkit-scrollbar-corner {
    background: #f8fafc;
  }
`;

// Helper functions
const getOccupancyRate = (buildingName: string): number => {
  const name = buildingName.toLowerCase();
  if (name.includes('canteen') || name.includes('library')) {
    return 0.6 + Math.random() * 0.3; // 60-90%
  }
  if (name.includes('lab') || name.includes('workshop')) {
    return 0.4 + Math.random() * 0.4; // 40-80%
  }
  if (name.includes('theater') || name.includes('lecture')) {
    return 0.2 + Math.random() * 0.6; // 20-80%
  }
  if (name.includes('washroom') || name.includes('generator')) {
    return 0.1 + Math.random() * 0.2; // 10-30%
  }
  return 0.3; // Default 30%
};

const generateMockData = (): CrowdData[] => {
  return BUILDING_DATA.map((building, index) => {
    const occupancyRate = getOccupancyRate(building.name);
    const currentCount = Math.floor(building.capacity * occupancyRate);
    const predictedCount = Math.max(0, Math.min(building.capacity, 
      currentCount + Math.floor((Math.random() - 0.5) * 20)));
    
    return {
      buildingId: building.id,
      buildingName: building.name,
      currentCount,
      predictedCount,
      timestamp: new Date().toLocaleTimeString(),
      color: COLORS[index % COLORS.length],
      capacity: building.capacity
    };
  });
};

const generateMockHistory = (): BuildingHistoryData[] => {
  return Array.from({ length: 24 }, (_, i) => ({
    timestamp: new Date(Date.now() - (23 - i) * 5000).toLocaleTimeString(),
    current_count: Math.floor(Math.random() * 100) + 20
  }));
};

const CrowdManagement: React.FC = () => {
  // State
  const [crowdData, setCrowdData] = useState<CrowdData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"current" | "predicted">("current");
  const [selectedBuilding, setSelectedBuilding] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [buildingHistory, setBuildingHistory] = useState<BuildingHistoryData[]>([]);
  const [alerts, setAlerts] = useState<CapacityAlert[]>([]);
  const [alertSettings, setAlertSettings] = useState<AlertSettings>({
    enabled: true,
    warningThreshold: 80,
    criticalThreshold: 90,
    fullThreshold: 100,
    showNotifications: true
  });

  // Options and intervals
  const intervalOptions = getIntervalOptions();
  const pollOptions = getPollOptions();
  const [intervalMinutes, setIntervalMinutes] = useState<number>(() => 
    intervalOptions.includes(30) ? 30 : intervalOptions[0]
  );
  const [pollSeconds, setPollSeconds] = useState<number>(() => 
    pollOptions.includes(10) ? 10 : pollOptions[0]
  );

  // Refs
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const historyIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Check for capacity alerts
  const checkCapacityAlerts = useCallback((data: CrowdData[]): CapacityAlert[] => {
    if (!alertSettings.enabled) return [];
    
    return data
      .map(building => {
        const percentage = Math.round((building.currentCount / building.capacity) * 100);
        
        let alertLevel: 'warning' | 'critical' | 'full' | null = null;
        if (percentage >= alertSettings.fullThreshold) alertLevel = 'full';
        else if (percentage >= alertSettings.criticalThreshold) alertLevel = 'critical';
        else if (percentage >= alertSettings.warningThreshold) alertLevel = 'warning';
        
        return alertLevel ? {
          id: `${building.buildingId}-${Date.now()}`,
          buildingId: building.buildingId,
          buildingName: building.buildingName,
          currentCount: building.currentCount,
          capacity: building.capacity,
          alertLevel,
          percentage,
          timestamp: new Date().toLocaleTimeString()
        } : null;
      })
      .filter((alert): alert is CapacityAlert => alert !== null);
  }, [alertSettings]);

  // Fetch data
  const fetchData = useCallback(async (): Promise<void> => {
    setError("Using real building data from database.");
    const mockData = generateMockData();
    setCrowdData(mockData);
    setAlerts(checkCapacityAlerts(mockData));
    setLoading(false);
  }, [checkCapacityAlerts]);

  // Fetch building history
  const fetchBuildingHistory = useCallback(async (): Promise<void> => {
    if (selectedBuilding === "all") return;
    
    try {
      const selectedBuildingData = crowdData.find(d => d.buildingId === selectedBuilding);
      if (selectedBuildingData) {
        const data = await fetchBuildingHistoryByName(selectedBuildingData.buildingName);
        setBuildingHistory(data);
      }
    } catch (err) {
      console.error("Error fetching building history:", err);
      setBuildingHistory(generateMockHistory());
    }
  }, [crowdData, selectedBuilding]);

  // Effect for main data fetching
  useEffect(() => {
    fetchData();
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (pollSeconds > 0) {
      intervalRef.current = setInterval(fetchData, pollSeconds * 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData, pollSeconds]);

  // Effect for building history
  useEffect(() => {
    if (selectedBuilding !== "all") {
      fetchBuildingHistory();
      if (historyIntervalRef.current) clearInterval(historyIntervalRef.current);
      if (pollSeconds > 0) {
        historyIntervalRef.current = setInterval(fetchBuildingHistory, pollSeconds * 1000);
      }
    } else {
      setBuildingHistory([]);
      if (historyIntervalRef.current) clearInterval(historyIntervalRef.current);
    }
    
    return () => {
      if (historyIntervalRef.current) clearInterval(historyIntervalRef.current);
    };
  }, [selectedBuilding, fetchBuildingHistory, pollSeconds]);

  // Filter data
  const filteredData: CrowdData[] = useMemo(() => {
    if (selectedBuilding !== "all") {
      return crowdData.filter((d) => d.buildingId === selectedBuilding);
    }
    if (searchTerm.trim()) {
      return crowdData.filter((d) =>
        d.buildingName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return crowdData;
  }, [crowdData, selectedBuilding, searchTerm]);

  // Event handlers
  const handleSearch = (query: string): void => {
    setSearchTerm(query);
    if (!query.trim()) {
      setSelectedBuilding("all");
    }
  };

  const handleBuildingSelect = (id: string): void => {
    setSelectedBuilding(id);
    if (id !== "all") {
      setSearchTerm("");
    }
  };

  const toggleAlerts = () => {
    setAlertSettings(prev => ({ ...prev, enabled: !prev.enabled }));
  };

  const resetFilters = () => {
    setSelectedBuilding("all");
    setSearchTerm("");
  };

  // Loading and error states
  if (loading) {
    return (
      <div className="pt-24 pb-8 min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <LoadingView message="Loading crowd data..." />
        </div>
      </div>
    );
  }

  if (error && crowdData.length === 0) {
    return (
      <div className="pt-24 pb-8 min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <ErrorView error={error} onRetry={fetchData} />
        </div>
      </div>
    );
  }

  const selectedBuildingData = crowdData.find(d => d.buildingId === selectedBuilding);

  return (
    <div className="pt-24 pb-8 min-h-screen bg-gray-50">
      <style>{CHART_STYLES}</style>
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        {/* <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-xl shadow-sm">
          <h1 className="text-3xl font-bold text-gray-800 m-0">Crowd Management</h1>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white border-0 rounded-lg font-medium cursor-pointer transition-all duration-200 shadow-md hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-lg"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div> */}

        Live Timestamp
        <div className="text-sm text-gray-500 mb-6 bg-white px-4 py-3 rounded-lg border-l-4 border-emerald-500">
          <strong>Live Data Time:</strong> {crowdData[0]?.timestamp || "--:--"}
        </div>

        {/* Controls */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8 relative z-20">
          <div className="flex flex-wrap items-center gap-6">
            {/* View Mode */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              <label className="text-sm font-medium text-gray-700">View Mode:</label>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as "current" | "predicted")}
                className="px-3 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 text-sm transition-all duration-150 min-w-[150px] focus:outline-none focus:border-blue-500 focus:shadow-sm focus:shadow-blue-100"
              >
                <option value="current">Current</option>
                <option value="predicted">Predicted</option>
              </select>
            </div>

            {/* Building Selection */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              <label className="text-sm font-medium text-gray-700">Building:</label>
              <div className="flex gap-2">
                <button
                  onClick={resetFilters}
                  className={`px-4 py-3 border rounded-lg font-medium text-sm transition-all duration-150 focus:outline-none ${
                    selectedBuilding === "all"
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  All
                </button>
                <select
                  value={selectedBuilding}
                  onChange={(e) => handleBuildingSelect(e.target.value)}
                  className="px-3 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 text-sm transition-all duration-150 min-w-[150px] focus:outline-none focus:border-blue-500 focus:shadow-sm focus:shadow-blue-100"
                >
                  <option value="all">All Buildings</option>
                  {crowdData.map((d) => (
                    <option key={d.buildingId} value={d.buildingId}>
                      {d.buildingName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Time Controls */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              <label className="text-sm font-medium text-gray-700">Horizon (mins):</label>
              <select
                value={intervalMinutes}
                onChange={(e) => setIntervalMinutes(Number(e.target.value))}
                className="px-3 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 text-sm transition-all duration-150 min-w-[150px] focus:outline-none focus:border-blue-500 focus:shadow-sm focus:shadow-blue-100"
              >
                {intervalOptions.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2 flex-shrink-0">
              <label className="text-sm font-medium text-gray-700">Auto-refresh (sec):</label>
              <select
                value={pollSeconds}
                onChange={(e) => setPollSeconds(Number(e.target.value))}
                className="px-3 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 text-sm transition-all duration-150 min-w-[150px] focus:outline-none focus:border-blue-500 focus:shadow-sm focus:shadow-blue-100"
              >
                {pollOptions.map(s => (
                  <option key={s} value={s}>{s === 0 ? "Paused" : s}</option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              <label className="text-sm font-medium text-gray-700">Search Buildings:</label>
              <EnhancedSearchBar 
                onSearch={handleSearch}
                onBuildingSelect={handleBuildingSelect}
                buildings={crowdData.map(d => ({
                  buildingId: d.buildingId,
                  buildingName: d.buildingName
                }))}
                placeholder="Search buildings..."
              />
            </div>
          </div>
        </div>

        

        {/* Heat Map */}
        <div className="mb-8">
          <SvgHeatmap />
        </div>
      </div>
    </div>
  );
};

export default CrowdManagement;