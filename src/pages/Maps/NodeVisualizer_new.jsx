import React, { useEffect, useState } from 'react';
import L from 'leaflet';

/**
 * NodeVisualizer - Advanced Node & Edge Management Component
 * Features:
 * - Visualize all nodes (Green: connected, Red: isolated)
 * - Draggable purple marker for positioning
 * - Add new nodes at marker position
 * - Create edges between nodes by clicking them
 * - Arrow key controls for precise positioning (±0.000001)
 */

const NodeVisualizer = ({ map }) => {
  const [nodesData, setNodesData] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [specialMarker, setSpecialMarker] = useState(null);
  const [specialCoords, setSpecialCoords] = useState([7.253750, 80.594450]);
  
  // New state for node/edge creation
  const [edgeCreationMode, setEdgeCreationMode] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [clickableMarkers, setClickableMarkers] = useState(new Map());
  const [statusMessage, setStatusMessage] = useState('');

  // Reload navigation data from API
  const reloadNavigationData = async () => {
    try {
      console.log('🔄 Reloading navigation graph...');
      const response = await fetch('http://localhost:3001/api/navigation/graph');
      
      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`✅ Reloaded: ${data.nodes.length} nodes, ${data.edges.length} edges`);
      setNodesData(data);
      setStatusMessage('✅ Data reloaded successfully!');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err) {
      console.error('❌ Failed to reload data:', err);
      setStatusMessage('❌ Failed to reload data');
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  // Add new node at special marker position
  const addNewNode = async () => {
    if (!nodesData) return;

    const nextIndex = nodesData.nodes.length;
    const [lat, lng] = specialCoords;

    try {
      setStatusMessage('⏳ Adding new node...');
      
      const response = await fetch('http://localhost:3001/api/navigation/node', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          node_index: nextIndex,
          latitude: lat,
          longitude: lng
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add node');
      }

      const result = await response.json();
      console.log('✅ Node added:', result);
      
      // Reload data to show new node
      await reloadNavigationData();
    } catch (err) {
      console.error('❌ Error adding node:', err);
      setStatusMessage(`❌ Error: ${err.message}`);
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  // Create edge between two selected nodes
  const createEdge = async () => {
    if (selectedNodes.length !== 2) {
      setStatusMessage('⚠️ Please select exactly 2 nodes');
      setTimeout(() => setStatusMessage(''), 3000);
      return;
    }

    const [node1, node2] = selectedNodes;
    const edgeCode = `${node1}_${node2}`;

    // Get coordinates for the edge path (straight line for now)
    const coord1 = [nodesData.nodes[node1].lat, nodesData.nodes[node1].lng];
    const coord2 = [nodesData.nodes[node2].lat, nodesData.nodes[node2].lng];

    try {
      setStatusMessage('⏳ Creating edge...');
      
      const response = await fetch('http://localhost:3001/api/navigation/edge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          edge_code: edgeCode,
          from_node: node1,
          to_node: node2,
          path_coordinates: [coord1, coord2]
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create edge');
      }

      const result = await response.json();
      console.log('✅ Edge created:', result);
      
      // Reset selection and reload data
      setSelectedNodes([]);
      setEdgeCreationMode(false);
      await reloadNavigationData();
    } catch (err) {
      console.error('❌ Error creating edge:', err);
      setStatusMessage(`❌ Error: ${err.message}`);
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  // Handle node click for edge creation
  const handleNodeClick = (nodeIndex) => {
    if (!edgeCreationMode) return;

    if (selectedNodes.includes(nodeIndex)) {
      // Deselect node
      setSelectedNodes(selectedNodes.filter(n => n !== nodeIndex));
    } else if (selectedNodes.length < 2) {
      // Select node
      setSelectedNodes([...selectedNodes, nodeIndex]);
    } else {
      // Already have 2 nodes selected, replace the second one
      setSelectedNodes([selectedNodes[0], nodeIndex]);
    }
  };

  // Initial data load
  useEffect(() => {
    const loadNavigationData = async () => {
      try {
        console.log('🔄 NodeVisualizer: Fetching navigation graph from API...');
        const response = await fetch('http://localhost:3001/api/navigation/graph');
        
        if (!response.ok) {
          throw new Error(`API responded with status ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.nodes || !data.edges || !Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
          throw new Error('Invalid data structure from API');
        }
        
        console.log(`✅ NodeVisualizer: Loaded from API - ${data.nodes.length} nodes, ${data.edges.length} edges`);
        setNodesData(data);
      } catch (err) {
        console.warn('⚠️ NodeVisualizer: API failed, loading from path.json:', err.message);
        
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

  // Render nodes and special marker
  useEffect(() => {
    if (!map || !nodesData) return;

    // Clear existing markers
    markers.forEach(marker => marker.remove());
    clickableMarkers.forEach(marker => marker.remove());

    // Find which nodes are connected
    const connectedNodes = new Set();
    nodesData.edges.forEach(edge => {
      connectedNodes.add(edge.from);
      connectedNodes.add(edge.to);
    });

    // Create markers for all nodes
    const newMarkers = [];
    const newClickableMarkers = new Map();

    nodesData.nodes.forEach((node, index) => {
      const isConnected = connectedNodes.has(index);
      const isSelected = selectedNodes.includes(index);
      
      // Base marker (always visible)
      const baseMarker = L.circleMarker([node.lat, node.lng], {
        radius: isSelected ? 6 : 4,
        fillColor: isSelected ? '#ffaa00' : (isConnected ? '#00ff00' : '#ff0000'),
        color: isSelected ? '#ff6600' : (isConnected ? '#008800' : '#880000'),
        weight: isSelected ? 2 : 1,
        opacity: 1,
        fillOpacity: isSelected ? 0.9 : 0.7
      }).addTo(map);

      baseMarker.bindTooltip(
        `Node ${index}<br/>` +
        `Lat: ${node.lat}<br/>` +
        `Lng: ${node.lng}<br/>` +
        `Status: ${isConnected ? 'Connected' : 'ISOLATED'}` +
        (isSelected ? '<br/><strong style="color: #ff6600;">SELECTED</strong>' : ''),
        { permanent: false, direction: 'top' }
      );

      newMarkers.push(baseMarker);

      // Clickable overlay marker (for edge creation mode)
      if (edgeCreationMode) {
        const clickMarker = L.circleMarker([node.lat, node.lng], {
          radius: 8,
          fillColor: 'transparent',
          color: 'transparent',
          weight: 0,
          opacity: 0,
          fillOpacity: 0
        }).addTo(map);

        clickMarker.on('click', () => handleNodeClick(index));
        clickMarker.setStyle({ cursor: 'pointer' });
        
        newClickableMarkers.set(index, clickMarker);
      }
    });

    setMarkers(newMarkers);
    setClickableMarkers(newClickableMarkers);

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

    const updateTooltip = (latlng) => {
      special.bindTooltip(
        `<strong>📍 New Node Position</strong><br/>` +
        `Lat: <strong>${latlng.lat.toFixed(6)}</strong><br/>` +
        `Lng: <strong>${latlng.lng.toFixed(6)}</strong>`,
        { permanent: true, direction: 'top', offset: [0, -12] }
      ).openTooltip();
    };

    updateTooltip(special.getLatLng());

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

    // Keyboard controls
    const PRECISION = 0.000001;
    const handleKeyPress = (e) => {
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      e.preventDefault();
      
      const currentLatLng = special.getLatLng();
      let newLat = currentLatLng.lat;
      let newLng = currentLatLng.lng;

      switch(e.key) {
        case 'ArrowUp': newLat += PRECISION; break;
        case 'ArrowDown': newLat -= PRECISION; break;
        case 'ArrowRight': newLng += PRECISION; break;
        case 'ArrowLeft': newLng -= PRECISION; break;
      }

      const newLatLng = L.latLng(newLat, newLng);
      special.setLatLng(newLatLng);
      setSpecialCoords([newLat, newLng]);
      updateTooltip(newLatLng);
    };

    document.addEventListener('keydown', handleKeyPress);

    // Control panel
    const controlPanel = L.control({ position: 'topright' });
    controlPanel.onAdd = function () {
      const div = L.DomUtil.create('div', 'node-control-panel');
      div.innerHTML = `
        <div style="
          background: white; 
          padding: 12px; 
          border-radius: 8px; 
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          min-width: 200px;
        ">
          <h4 style="margin: 0 0 10px 0; font-size: 14px; font-weight: 600;">Node Editor</h4>
          
          ${statusMessage ? `
            <div style="
              padding: 6px 8px; 
              margin-bottom: 10px; 
              background: ${statusMessage.includes('✅') ? '#d4edda' : statusMessage.includes('❌') ? '#f8d7da' : '#fff3cd'}; 
              border-radius: 4px; 
              font-size: 11px;
              color: #333;
            ">
              ${statusMessage}
            </div>
          ` : ''}
          
          <button id="add-node-btn" style="
            width: 100%;
            padding: 8px 12px;
            margin-bottom: 8px;
            background: #9333ea;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
          ">
            ➕ Add New Node
          </button>
          
          <button id="create-edge-btn" style="
            width: 100%;
            padding: 8px 12px;
            margin-bottom: 8px;
            background: ${edgeCreationMode ? '#dc3545' : '#28a745'};
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
          ">
            ${edgeCreationMode ? '❌ Cancel Edge' : '🔗 Create Edge'}
          </button>
          
          ${edgeCreationMode ? `
            <div style="
              padding: 8px;
              background: #e7f3ff;
              border-radius: 4px;
              margin-bottom: 8px;
              font-size: 11px;
            ">
              <strong>Click 2 nodes to connect</strong><br/>
              Selected: ${selectedNodes.length}/2
              ${selectedNodes.length > 0 ? `<br/>Nodes: ${selectedNodes.join(', ')}` : ''}
            </div>
            
            <button id="confirm-edge-btn" style="
              width: 100%;
              padding: 8px 12px;
              margin-bottom: 8px;
              background: ${selectedNodes.length === 2 ? '#007bff' : '#6c757d'};
              color: white;
              border: none;
              border-radius: 5px;
              cursor: ${selectedNodes.length === 2 ? 'pointer' : 'not-allowed'};
              font-size: 13px;
              font-weight: 500;
            " ${selectedNodes.length !== 2 ? 'disabled' : ''}>
              ✓ Confirm Edge
            </button>
          ` : ''}
          
          <button id="reload-data-btn" style="
            width: 100%;
            padding: 6px 10px;
            background: #6c757d;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 12px;
          ">
            🔄 Reload Data
          </button>
          
          <div style="
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid #ddd;
            font-size: 11px;
            color: #666;
          ">
            Total: ${nodesData.nodes.length} nodes, ${nodesData.edges.length} edges
          </div>
        </div>
      `;
      
      // Prevent map interactions when clicking on control panel
      L.DomEvent.disableClickPropagation(div);
      L.DomEvent.disableScrollPropagation(div);
      
      return div;
    };
    controlPanel.addTo(map);

    // Add event listeners to buttons
    setTimeout(() => {
      const addNodeBtn = document.getElementById('add-node-btn');
      const createEdgeBtn = document.getElementById('create-edge-btn');
      const confirmEdgeBtn = document.getElementById('confirm-edge-btn');
      const reloadBtn = document.getElementById('reload-data-btn');

      if (addNodeBtn) addNodeBtn.onclick = addNewNode;
      if (createEdgeBtn) createEdgeBtn.onclick = () => {
        setEdgeCreationMode(!edgeCreationMode);
        setSelectedNodes([]);
      };
      if (confirmEdgeBtn) confirmEdgeBtn.onclick = createEdge;
      if (reloadBtn) reloadBtn.onclick = reloadNavigationData;
    }, 0);

    // Add legend
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = function () {
      const div = L.DomUtil.create('div', 'node-legend');
      div.innerHTML = `
        <div style="background: white; padding: 10px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
          <h4 style="margin: 0 0 8px 0; font-size: 14px;">Legend</h4>
          <div style="display: flex; align-items: center; margin-bottom: 5px;">
            <div style="width: 12px; height: 12px; border-radius: 50%; background: #00ff00; margin-right: 8px;"></div>
            <span style="font-size: 12px;">Connected (${connectedNodes.size})</span>
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 5px;">
            <div style="width: 12px; height: 12px; border-radius: 50%; background: #ff0000; margin-right: 8px;"></div>
            <span style="font-size: 12px;">Isolated (${nodesData.nodes.length - connectedNodes.size})</span>
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 5px;">
            <div style="width: 12px; height: 12px; border-radius: 50%; background: #ffaa00; border: 2px solid #ff6600; margin-right: 8px;"></div>
            <span style="font-size: 12px;">Selected</span>
          </div>
          <div style="display: flex; align-items: center;">
            <div style="width: 12px; height: 12px; border-radius: 50%; background: linear-gradient(135deg, #9333ea 0%, #7e22ce 100%); border: 2px solid white; margin-right: 8px;"></div>
            <span style="font-size: 12px;">New Node Position</span>
          </div>
        </div>
      `;
      return div;
    };
    legend.addTo(map);

    // Cleanup
    return () => {
      newMarkers.forEach(marker => marker.remove());
      newClickableMarkers.forEach(marker => marker.remove());
      if (special) special.remove();
      document.removeEventListener('keydown', handleKeyPress);
      controlPanel.remove();
      legend.remove();
    };
  }, [map, nodesData, edgeCreationMode, selectedNodes, specialCoords, statusMessage]);

  return null;
};

export default NodeVisualizer;
