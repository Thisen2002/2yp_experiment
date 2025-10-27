import React, { useEffect, useState } from 'react';
import L from 'leaflet';

/**
 * NodeVisualizer - Test Component to Display All Nodes
 * Shows all nodes from path.json as colored dots on the map
 * - Green: Connected nodes (have edges)
 * - Red: Isolated nodes (no edges)
 */

const NodeVisualizer = ({ map }) => {
  const [nodesData, setNodesData] = useState(null);
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    // Fetch path.json data from backend
    fetch('http://localhost:3001/api/path')
      .then(res => res.json())
      .then(data => {
        setNodesData(data);
      })
      .catch(err => {
        console.error('Failed to load path.json, trying direct file:', err);
        // Fallback: try to load from public folder if API fails
        import('../../../backend/Maps/backend map/path.json')
          .then(data => setNodesData(data))
          .catch(err2 => console.error('Failed to load path.json:', err2));
      });
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
          <div style="display: flex; align-items: center;">
            <div style="width: 12px; height: 12px; border-radius: 50%; background: #ff0000; margin-right: 8px;"></div>
            <span style="font-size: 12px;">Isolated (${nodesData.nodes.length - connectedNodes.size} nodes)</span>
          </div>
          <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #ddd; font-size: 11px; color: #666;">
            Total Nodes: ${nodesData.nodes.length}
          </div>
        </div>
      `;
      return div;
    };
    legend.addTo(map);

    // Cleanup function
    return () => {
      newMarkers.forEach(marker => marker.remove());
      legend.remove();
    };
  }, [map, nodesData]);

  return null; // This is a non-visual component
};

export default NodeVisualizer;
