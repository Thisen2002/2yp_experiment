import React, { useEffect, useState } from 'react';
import L from 'leaflet';


/**
 * NodeVisualizer - Test Component to Display All Nodes
 * Shows all nodes from path.json as colored dots on the map
 * - Green: Connected nodes (have edges)
 * - Red: Isolated nodes (no edges)
 * - Purple: Draggable special node to find coordinates
 */

const NodeVisualizer = ({ map }) => {
  const [nodesData, setNodesData] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [specialMarker, setSpecialMarker] = useState(null);
  const [specialCoords, setSpecialCoords] = useState([7.253750, 80.594450]);

  useEffect(() => {
    // Fetch navigation graph from API with fallback to hardcoded data
    const loadNavigationData = async () => {
      try {
        console.log('🔄 NodeVisualizer: Fetching navigation graph from API...');
        const response = await fetch('http://localhost:3001/api/navigation/graph');
        
        if (!response.ok) {
          throw new Error(`API responded with status ${response.status}`);
        }
        
        const data = await response.json();
        
        // Validate data structure
        if (!data.nodes || !data.edges || !Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
          throw new Error('Invalid data structure from API');
        }
        
        console.log(`✅ NodeVisualizer: Loaded from API - ${data.nodes.length} nodes, ${data.edges.length} edges`);
        setNodesData(data);
      } catch (err) {
        console.warn('⚠️ NodeVisualizer: API failed, loading from path.json:', err.message);
        
        // Fallback: Load from local path.json file
        try {
          const pathData = await import('../../../backend/Maps/backend map/path.json');
          console.log(`📁 NodeVisualizer: Loaded from path.json - ${pathData.nodes.length} nodes, ${pathData.edges.length} edges`);
          setNodesData(pathData);
        } catch (fallbackErr) {
          console.error('❌ NodeVisualizer: Failed to load fallback data:', fallbackErr);
        }
      }
    };

    loadNavigationData();
  }, []);

  useEffect(() => {
    if (!map || !nodesData) return;

    // Clear existing markers
    markers.forEach(marker => marker.remove());

    // Find which nodes are connected
    const connectedNodes = new Set();
    nodesData.edges.forEach(edge => {
      connectedNodes.add(edge.from);
      connectedNodes.add(edge.to);
    });

    // Create markers for all nodes
    const newMarkers = nodesData.nodes.map((node, index) => {
      const isConnected = connectedNodes.has(index);
      
      const marker = L.circleMarker([node.lat, node.lng], {
        radius: 4,
        fillColor: isConnected ? '#00ff00' : '#ff0000',
        color: isConnected ? '#008800' : '#880000',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.7
      }).addTo(map);

      // Add tooltip with node information
      marker.bindTooltip(
        `Node ${index}<br/>` +
        `Lat: ${node.lat}<br/>` +
        `Lng: ${node.lng}<br/>` +
        `Status: ${isConnected ? 'Connected' : 'ISOLATED'}`,
        { permanent: false, direction: 'top' }
      );

      return marker;
    });

    setMarkers(newMarkers);

    // Create draggable special marker
    const special = L.marker(specialCoords, {
      draggable: true,
      icon: L.divIcon({
        html: `
          <div style="
            width: 24px; 
            height: 24px; 
            background: linear-gradient(135deg, #9333ea 0%, #7e22ce 100%);
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(147, 51, 234, 0.6);
            cursor: move;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
              <path d="M12 2L12 22M2 12L22 12" stroke="white" stroke-width="3" stroke-linecap="round"/>
            </svg>
          </div>
        `,
        className: 'special-draggable-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      })
    }).addTo(map);

    // Permanent tooltip showing coordinates
    const updateTooltip = (latlng) => {
      special.bindTooltip(
        `<strong>📍 Special Node</strong><br/>` +
        `Lat: <strong>${latlng.lat.toFixed(6)}</strong><br/>` +
        `Lng: <strong>${latlng.lng.toFixed(6)}</strong><br/>`,
        //+ `<em>Drag or use arrow keys</em>`,
        { permanent: true, direction: 'top', offset: [0, -12] }
      ).openTooltip();
    };

    updateTooltip(special.getLatLng());

    // Update coordinates on drag
    special.on('drag', (e) => {
      const latlng = e.target.getLatLng();
      setSpecialCoords([latlng.lat, latlng.lng]);
      updateTooltip(latlng);
    });

    special.on('dragend', (e) => {
      const latlng = e.target.getLatLng();
      console.log(`📍 Special node moved to: [${latlng.lat}, ${latlng.lng}]`);
    });

    setSpecialMarker(special);

    // Keyboard controls for precise movement
    const PRECISION = 0.000001;
    const handleKeyPress = (e) => {
      // Only move if arrow keys are pressed
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      
      e.preventDefault(); // Prevent page scrolling
      
      const currentLatLng = special.getLatLng();
      let newLat = currentLatLng.lat;
      let newLng = currentLatLng.lng;

      switch(e.key) {
        case 'ArrowUp':
          newLat += PRECISION;
          break;
        case 'ArrowDown':
          newLat -= PRECISION;
          break;
        case 'ArrowRight':
          newLng += PRECISION;
          break;
        case 'ArrowLeft':
          newLng -= PRECISION;
          break;
      }

      const newLatLng = L.latLng(newLat, newLng);
      special.setLatLng(newLatLng);
      setSpecialCoords([newLat, newLng]);
      updateTooltip(newLatLng);
      console.log(`⌨️ Moved to: [${newLat}, ${newLng}]`);
    };

    // Add keyboard listener
    document.addEventListener('keydown', handleKeyPress);

    // Add legend to map
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = function () {
      const div = L.DomUtil.create('div', 'node-legend');
      div.innerHTML = `
        <div style="background: white; padding: 10px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
          <h4 style="margin: 0 0 8px 0; font-size: 14px;">Node Visualizer</h4>
          <div style="display: flex; align-items: center; margin-bottom: 5px;">
            <div style="width: 12px; height: 12px; border-radius: 50%; background: #00ff00; margin-right: 8px;"></div>
            <span style="font-size: 12px;">Connected (${connectedNodes.size} nodes)</span>
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 5px;">
            <div style="width: 12px; height: 12px; border-radius: 50%; background: #ff0000; margin-right: 8px;"></div>
            <span style="font-size: 12px;">Isolated (${nodesData.nodes.length - connectedNodes.size} nodes)</span>
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 5px;">
            <div style="width: 12px; height: 12px; border-radius: 50%; background: linear-gradient(135deg, #9333ea 0%, #7e22ce 100%); border: 2px solid white; margin-right: 8px;"></div>
            <span style="font-size: 12px;">Draggable Marker</span>
          </div>
          <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #ddd; font-size: 11px; color: #666;">
            Total Nodes: ${nodesData.nodes.length}<br/>
            <span style="color: #9333ea; font-weight: 600;">Precision: ±0.000001</span>
          </div>
        </div>
      `;
      return div;
    };
    legend.addTo(map);

    // Cleanup function
    return () => {
      newMarkers.forEach(marker => marker.remove());
      if (special) special.remove();
      document.removeEventListener('keydown', handleKeyPress);
      legend.remove();
    };
  }, [map, nodesData]);

  return null; // This is a non-visual component
};

export default NodeVisualizer;
