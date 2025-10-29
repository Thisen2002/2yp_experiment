import React, { useEffect, useState, useRef, useCallback } from 'react';
import L from 'leaflet';

/*
 * NodeVisualizer - Advanced Node & Edge Management Component
 * Features:
 * - Visualize all nodes (Green: connected, Red: isolated)
 * - Draggable purple marker for positioning
 * - Add new nodes at marker position
 * - Create edges between nodes by clicking them
 * - Arrow key controls for precise positioning (±0.000001)
 * 
 * Optimizations:
 * - useCallback for memoized functions
 * - useRef for special marker to prevent re-renders
 * - Removed specialCoords from dependencies
 * - Single timeout for status messages
 */

const NodeVisualizer = ({ map }) => {
  const [nodesData, setNodesData] = useState(null);
  const [markers, setMarkers] = useState([]);
  const specialMarkerRef = useRef(null);
  const [specialCoords, setSpecialCoords] = useState([7.252820, 80.593404]);
  const statusTimeoutRef = useRef(null);
  
  // New state for node/edge creation
  const [edgeCreationMode, setEdgeCreationMode] = useState(false);
  const [edgeRemovalMode, setEdgeRemovalMode] = useState(false);
  const [deletionMode, setDeletionMode] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingNodeIndex, setEditingNodeIndex] = useState(null);
  const [editingNodeCoords, setEditingNodeCoords] = useState(null);
  const editingMarkerRef = useRef(null);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [clickableMarkers, setClickableMarkers] = useState(new Map());
  const [statusMessage, setStatusMessage] = useState('');

  // Clear status message with cleanup
  const clearStatusMessage = useCallback(() => {
    if (statusTimeoutRef.current) {
      clearTimeout(statusTimeoutRef.current);
    }
    statusTimeoutRef.current = setTimeout(() => setStatusMessage(''), 2000);
  }, []);

  // Show status message
  const showStatus = useCallback((message) => {
    setStatusMessage(message);
    clearStatusMessage();
  }, [clearStatusMessage]);

  // Reload navigation data from API
  const reloadNavigationData = useCallback(async () => {
    try {
      console.log('🔄 Reloading navigation graph...');
      const response = await fetch('http://localhost:3001/api/navigation/graph');
      
      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`✅ Reloaded: ${data.nodes.length} nodes, ${data.edges.length} edges`);
      console.log('📊 Nodes:', data.nodes);
      console.log('📊 Edges:', data.edges);
      setNodesData(data);
      showStatus('✅ Data reloaded successfully!');
    } catch (err) {
      console.error('❌ Failed to reload data:', err);
      showStatus('❌ Failed to reload data');
    }
  }, [showStatus]);

  // Add new node at special marker position
  const addNewNode = useCallback(async () => {
    if (!nodesData) {
      console.error('❌ No nodes data available');
      showStatus('❌ No data loaded');
      return;
    }

    // Get current position from the marker ref (not state)
    const currentMarker = specialMarkerRef.current;
    if (!currentMarker) {
      console.error('❌ Special marker not available');
      showStatus('❌ Marker not ready');
      return;
    }

    const currentLatLng = currentMarker.getLatLng();
    const lat = currentLatLng.lat;
    const lng = currentLatLng.lng;

    // Find the maximum node index and add 1 (to handle gaps from deleted nodes)
    const maxIndex = nodesData.nodes.length > 0 
      ? Math.max(...nodesData.nodes.map(n => n.index))
      : -1;
    const nextIndex = maxIndex + 1;

    console.log(`➕ Adding node ${nextIndex} at [${lat}, ${lng}]`);
    console.log(`📊 Current nodes count: ${nodesData.nodes.length}, Max index: ${maxIndex}`);

    try {
      showStatus('⏳ Adding new node...');
      
      const response = await fetch('http://localhost:3001/api/navigation/node', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          node_index: nextIndex,
          latitude: lat,
          longitude: lng
        })
      });

      const responseData = await response.json();
      console.log('📥 Server response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to add node');
      }

      console.log('✅ Node added successfully:', responseData);
      
      // Reload data to show new node
      await reloadNavigationData();
    } catch (err) {
      console.error('❌ Error adding node:', err);
      showStatus(`❌ Error: ${err.message}`);
    }
  }, [nodesData, reloadNavigationData, showStatus]);

  // Create edge between two selected nodes
  const createEdge = useCallback(async () => {
    if (selectedNodes.length !== 2) {
      showStatus('⚠️ Please select exactly 2 nodes');
      return;
    }

    const [node1Index, node2Index] = selectedNodes;
    const edgeCode = `${node1Index}_${node2Index}`;

    // Find the actual nodes by their index
    const node1 = nodesData.nodes.find(n => n.index === node1Index);
    const node2 = nodesData.nodes.find(n => n.index === node2Index);

    if (!node1 || !node2) {
      showStatus('❌ Selected nodes not found');
      console.error('❌ Could not find nodes:', node1Index, node2Index);
      return;
    }

    // Get coordinates for the edge path (straight line for now)
    const coord1 = [node1.lat, node1.lng];
    const coord2 = [node2.lat, node2.lng];

    try {
      showStatus('⏳ Creating edge...');
      
      const response = await fetch('http://localhost:3001/api/navigation/edge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          edge_code: edgeCode,
          from_node: node1Index,
          to_node: node2Index,
          path_coordinates: [coord1, coord2]
        })
      });

      if (!response.ok) {
        let errorMessage = 'Failed to create edge';
        try {
          const error = await response.json();
          errorMessage = error.error || errorMessage;
        } catch (parseError) {
          // Response is not JSON, use status text
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('✅ Edge created:', result);
      
      // Reset selection and reload data
      setSelectedNodes([]);
      setEdgeCreationMode(false);
      await reloadNavigationData();
    } catch (err) {
      console.error('❌ Error creating edge:', err);
      showStatus(`❌ Error: ${err.message}`);
    }
  }, [selectedNodes, nodesData, reloadNavigationData, showStatus]);

  // Remove edge between two selected nodes
  const removeEdge = useCallback(async () => {
    if (selectedNodes.length !== 2) {
      showStatus('⚠️ Please select exactly 2 nodes');
      return;
    }

    const [node1Index, node2Index] = selectedNodes;

    // Check if an edge exists between these nodes (in either direction)
    const edgeExists = nodesData.edges.find(edge => 
      (edge.from === node1Index && edge.to === node2Index) ||
      (edge.from === node2Index && edge.to === node1Index)
    );

    if (!edgeExists) {
      showStatus('⚠️ No edge exists between these nodes');
      console.log(`⚠️ No edge found between nodes ${node1Index} and ${node2Index}`);
      return;
    }

    // Get the actual edge code from the found edge
    const actualEdgeCode = edgeExists.id;
    console.log(`🔍 Found edge: ${actualEdgeCode} (from: ${edgeExists.from}, to: ${edgeExists.to})`);

    try {
      showStatus('⏳ Removing edge...');
      console.log(`🗑️ Deleting edge ${actualEdgeCode}`);
      
      const response = await fetch(`http://localhost:3001/api/navigation/edge/${actualEdgeCode}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        let errorMessage = 'Failed to remove edge';
        try {
          const error = await response.json();
          errorMessage = error.error || errorMessage;
        } catch (parseError) {
          // Response is not JSON, use status text
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('✅ Edge removed:', result);
      
      // Reset selection and reload data
      setSelectedNodes([]);
      setEdgeCreationMode(false);
      setEdgeRemovalMode(false);
      await reloadNavigationData();
    } catch (err) {
      console.error('❌ Error removing edge:', err);
      showStatus(`❌ Error: ${err.message}`);
    }
  }, [selectedNodes, nodesData, reloadNavigationData, showStatus]);

  // Delete selected nodes
  const deleteSelectedNodes = useCallback(async () => {
    if (selectedNodes.length === 0) {
      showStatus('⚠️ Please select nodes to delete');
      return;
    }

    const nodeCount = selectedNodes.length;
    const nodeIndices = [...selectedNodes].sort((a, b) => a - b);

    console.log(`🗑️ Attempting to delete ${nodeCount} node(s):`, nodeIndices);

    try {
      showStatus(`⏳ Deleting ${nodeCount} node(s)...`);
      
      // Delete each selected node (edges will be CASCADE deleted in database)
      const deletePromises = nodeIndices.map(async (nodeIndex) => {
        console.log(`🗑️ Deleting node ${nodeIndex}...`);
        
        const response = await fetch(`http://localhost:3001/api/navigation/node/${nodeIndex}`, {
          method: 'DELETE'
        });

        const responseData = await response.json();
        console.log(`📥 Delete response for node ${nodeIndex}:`, responseData);

        if (!response.ok) {
          throw new Error(responseData.error || `Failed to delete node ${nodeIndex}`);
        }

        return responseData;
      });

      const results = await Promise.all(deletePromises);
      console.log(`✅ Deleted ${nodeCount} node(s):`, results);
      
      // Reset selection and exit deletion mode
      setSelectedNodes([]);
      setDeletionMode(false);
      
      showStatus(`✅ Deleted ${nodeCount} node(s) successfully!`);
      
      // Reload data to show changes
      await reloadNavigationData();
    } catch (err) {
      console.error('❌ Error deleting nodes:', err);
      showStatus(`❌ Error: ${err.message}`);
    }
  }, [selectedNodes, reloadNavigationData, showStatus]);

  // Start editing a node
  const startEditNode = useCallback(() => {
    if (selectedNodes.length !== 1) {
      showStatus('⚠️ Please select exactly 1 node to edit');
      return;
    }

    const nodeIndex = selectedNodes[0];
    const node = nodesData.nodes.find(n => n.index === nodeIndex);
    
    if (!node) {
      showStatus('❌ Selected node not found');
      return;
    }

    console.log(`✏️ Starting to edit node ${nodeIndex} at [${node.lat}, ${node.lng}]`);
    
    setEditingNodeIndex(nodeIndex);
    setEditingNodeCoords([node.lat, node.lng]);
    setEditMode(true);
    setEdgeCreationMode(false);
    setDeletionMode(false);
    showStatus(`✏️ Editing node ${nodeIndex}`);
  }, [selectedNodes, nodesData, showStatus]);

  // Cancel editing
  const cancelEditNode = useCallback(() => {
    console.log('❌ Cancelled editing node');
    setEditMode(false);
    setEditingNodeIndex(null);
    setEditingNodeCoords(null);
    setSelectedNodes([]);
    showStatus('Editing cancelled');
  }, [showStatus]);

  // Confirm and save edited node position
  const confirmEditNode = useCallback(async () => {
    if (!editingMarkerRef.current || editingNodeIndex === null) {
      showStatus('❌ No node being edited');
      return;
    }

    const currentLatLng = editingMarkerRef.current.getLatLng();
    const newLat = currentLatLng.lat;
    const newLng = currentLatLng.lng;

    console.log(`💾 Saving node ${editingNodeIndex} to new position: [${newLat}, ${newLng}]`);

    try {
      showStatus(`⏳ Updating node ${editingNodeIndex}...`);
      
      const response = await fetch(`http://localhost:3001/api/navigation/node/${editingNodeIndex}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: newLat,
          longitude: newLng
        })
      });

      const responseData = await response.json();
      console.log('📥 Server response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to update node');
      }

      console.log(`✅ Node ${editingNodeIndex} updated successfully`);
      
      // Exit edit mode and reload data
      setEditMode(false);
      setEditingNodeIndex(null);
      setEditingNodeCoords(null);
      setSelectedNodes([]);
      
      await reloadNavigationData();
    } catch (err) {
      console.error('❌ Error updating node:', err);
      showStatus(`❌ Error: ${err.message}`);
    }
  }, [editingNodeIndex, reloadNavigationData, showStatus]);

  // Handle node click for edge creation, deletion, or general selection
  const handleNodeClick = useCallback((nodeIndex) => {
    setSelectedNodes(prev => {
      if (prev.includes(nodeIndex)) {
        // Deselect node
        return prev.filter(n => n !== nodeIndex);
      } else if ((edgeCreationMode || edgeRemovalMode) && prev.length < 2) {
        // In edge mode (add or remove), max 2 nodes
        return [...prev, nodeIndex];
      } else if ((edgeCreationMode || edgeRemovalMode) && prev.length >= 2) {
        // Already have 2 nodes selected in edge mode, replace the second one
        return [prev[0], nodeIndex];
      } else if (deletionMode) {
        // In deletion mode, allow multiple selections
        return [...prev, nodeIndex];
      } else {
        // General selection mode (for edit, etc.) - only allow 1 node
        return [nodeIndex];
      }
    });
  }, [edgeCreationMode, edgeRemovalMode, deletionMode]);

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

  // Create and manage special marker (separate from nodes rendering)
  useEffect(() => {
    if (!map) return;

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
        `<strong>📍 Set Node Position</strong><br/>` +
        `Lat: <strong>${latlng.lat.toFixed(6)}</strong><br/>` +
        `Lng: <strong>${latlng.lng.toFixed(6)}</strong>`,
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

    specialMarkerRef.current = special;

    // Keyboard controls (only when not in edit mode)
    const PRECISION = 0.000001;
    const handleKeyPress = (e) => {
      // Don't handle arrow keys if in edit mode
      if (editMode) return;
      
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      e.preventDefault();
      
      const currentMarker = specialMarkerRef.current;
      if (!currentMarker) return;
      
      const currentLatLng = currentMarker.getLatLng();
      let newLat = currentLatLng.lat;
      let newLng = currentLatLng.lng;

      switch(e.key) {
        case 'ArrowUp': newLat += PRECISION; break;
        case 'ArrowDown': newLat -= PRECISION; break;
        case 'ArrowRight': newLng += PRECISION; break;
        case 'ArrowLeft': newLng -= PRECISION; break;
      }

      const newLatLng = L.latLng(newLat, newLng);
      currentMarker.setLatLng(newLatLng);
      setSpecialCoords([newLat, newLng]);
      updateTooltip(newLatLng);
    };

    document.addEventListener('keydown', handleKeyPress);

    // Cleanup
    return () => {
      if (special) special.remove();
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [map, editMode]); // Re-create when edit mode changes to update keyboard handler

  // Create and manage editing marker (when in edit mode)
  useEffect(() => {
    if (!map || !editMode || !editingNodeCoords) return;

    console.log(`🎨 Creating draggable marker for node ${editingNodeIndex} at [${editingNodeCoords[0]}, ${editingNodeCoords[1]}]`);

    // Create draggable editing marker (blue color to distinguish from special marker)
    const editMarker = L.marker(editingNodeCoords, {
      draggable: true,
      icon: L.divIcon({
        html: `
          <div style="
            width: 28px; 
            height: 28px; 
            background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 10px rgba(0, 123, 255, 0.7);
            cursor: move;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="white"/>
            </svg>
          </div>
        `,
        className: 'editing-draggable-marker',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      })
    }).addTo(map);

    // Permanent tooltip showing node being edited
    const updateEditTooltip = (latlng) => {
      editMarker.bindTooltip(
        `<strong>✏️ Editing Node ${editingNodeIndex}</strong><br/>` +
        `Lat: <strong>${latlng.lat.toFixed(6)}</strong><br/>` +
        `Lng: <strong>${latlng.lng.toFixed(6)}</strong>`,
        { permanent: true, direction: 'top', offset: [0, -14] }
      ).openTooltip();
    };

    updateEditTooltip(editMarker.getLatLng());

    // Update coordinates on drag
    editMarker.on('drag', (e) => {
      const latlng = e.target.getLatLng();
      setEditingNodeCoords([latlng.lat, latlng.lng]);
      updateEditTooltip(latlng);
    });

    editMarker.on('dragend', (e) => {
      const latlng = e.target.getLatLng();
      console.log(`📍 Node ${editingNodeIndex} moved to: [${latlng.lat}, ${latlng.lng}]`);
    });

    editingMarkerRef.current = editMarker;

    // Keyboard controls for editing marker (only when in edit mode)
    const PRECISION = 0.000001;
    const handleEditKeyPress = (e) => {
      // Only handle if we're in edit mode
      if (!editMode) return;
      
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      e.preventDefault();
      
      const currentMarker = editingMarkerRef.current;
      if (!currentMarker) return;
      
      const currentLatLng = currentMarker.getLatLng();
      let newLat = currentLatLng.lat;
      let newLng = currentLatLng.lng;

      switch(e.key) {
        case 'ArrowUp': newLat += PRECISION; break;
        case 'ArrowDown': newLat -= PRECISION; break;
        case 'ArrowRight': newLng += PRECISION; break;
        case 'ArrowLeft': newLng -= PRECISION; break;
      }

      const newLatLng = L.latLng(newLat, newLng);
      currentMarker.setLatLng(newLatLng);
      setEditingNodeCoords([newLat, newLng]);
      updateEditTooltip(newLatLng);
    };

    document.addEventListener('keydown', handleEditKeyPress);

    // Cleanup
    return () => {
      if (editMarker) editMarker.remove();
      document.removeEventListener('keydown', handleEditKeyPress);
    };
  }, [map, editMode, editingNodeIndex]); // Only re-create when these change, not coords

  // Render nodes and UI controls
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

    console.log('🔗 Connected nodes:', Array.from(connectedNodes));
    console.log('📍 Available nodes:', nodesData.nodes.map(n => n.index));
    console.log('📊 Total nodes:', nodesData.nodes.length, 'Total edges:', nodesData.edges.length);
    
    // Debug: Check if nodes have index property
    if (nodesData.nodes.length > 0 && !nodesData.nodes[0].hasOwnProperty('index')) {
      console.error('❌ CRITICAL: Nodes missing "index" property! Backend needs to be restarted.');
      showStatus('❌ Please restart backend server');
    }
    // Create markers for all nodes
    const newMarkers = [];
    const newClickableMarkers = new Map();

    nodesData.nodes.forEach((node) => {
      const nodeIndex = node.index;  // Use actual node index from database
      const isConnected = connectedNodes.has(nodeIndex);
      const isSelected = selectedNodes.includes(nodeIndex);
      
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
        `Node ${nodeIndex}<br/>` +
        `Lat: ${node.lat}<br/>` +
        `Lng: ${node.lng}<br/>` +
        `Status: ${isConnected ? 'Connected' : 'ISOLATED'}` +
        (isSelected ? '<br/><strong style="color: #ff6600;">SELECTED</strong>' : ''),
        { permanent: false, direction: 'top' }
      );

      newMarkers.push(baseMarker);

      // Clickable overlay marker (always available for selection)
      const clickMarker = L.circleMarker([node.lat, node.lng], {
        radius: 8,
        fillColor: 'transparent',
        color: 'transparent',
        weight: 0,
        opacity: 0,
        fillOpacity: 0
      }).addTo(map);

      // Copy tooltip to clickable marker so it shows on hover
      clickMarker.bindTooltip(
        `Node ${nodeIndex}<br/>` +
        `Lat: ${node.lat}<br/>` +
        `Lng: ${node.lng}<br/>` +
        `Status: ${isConnected ? 'Connected' : 'ISOLATED'}` +
        (isSelected ? '<br/><strong style="color: #ff6600;">SELECTED</strong>' : ''),
        { permanent: false, direction: 'top' }
      );

      clickMarker.on('click', () => handleNodeClick(nodeIndex));
      clickMarker.setStyle({ cursor: 'pointer' });
      
      newClickableMarkers.set(nodeIndex, clickMarker);

      // Don't show the node marker if it's being edited (the editing marker will replace it)
      if (editMode && nodeIndex === editingNodeIndex) {
        baseMarker.setStyle({ opacity: 0, fillOpacity: 0 });
      }
    });

    setMarkers(newMarkers);
    setClickableMarkers(newClickableMarkers);

    // Control panel - positioned above the Nodes ON/OFF button
    const controlPanel = L.control({ position: 'bottomleft' });
    controlPanel.onAdd = function () {
      const div = L.DomUtil.create('div', 'node-control-panel');
      div.style.position = 'absolute';
      div.style.bottom = '60px'; // Position above the Nodes ON/OFF button
      div.style.left = '10px';
      div.style.zIndex = '950'; // Above toggle button (900) but below sheets
      
      div.innerHTML = `
        <div style="
          background: white; 
          padding: 8px; 
          border-radius: 6px; 
          box-shadow: 0 2px 6px rgba(0,0,0,0.25);
          width: 140px;
        ">
          <h4 style="margin: 0 0 6px 0; font-size: 12px; font-weight: 600; text-align: center;">Node Editor</h4>
          
          ${statusMessage ? `
            <div style="
              padding: 4px 6px; 
              margin-bottom: 6px; 
              background: ${statusMessage.includes('✅') ? '#d4edda' : statusMessage.includes('❌') ? '#f8d7da' : '#fff3cd'}; 
              border-radius: 3px; 
              font-size: 9px;
              color: #333;
              text-align: center;
            ">
              ${statusMessage}
            </div>
          ` : ''}
          
          <button id="add-node-btn" style="
            width: 100%;
            padding: 5px 6px;
            margin-bottom: 4px;
            background: #9333ea;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 10px;
            font-weight: 500;
          ">
            ➕ Add Node
          </button>
          
          <button id="create-edge-btn" style="
            width: 100%;
            padding: 5px 6px;
            margin-bottom: 4px;
            background: ${edgeCreationMode ? '#dc3545' : '#28a745'};
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 10px;
            font-weight: 500;
          ">
            ${edgeCreationMode ? '❌ Cancel' : '🔗 Add Edge'}
          </button>
          
          <button id="remove-edge-btn" style="
            width: 100%;
            padding: 5px 6px;
            margin-bottom: 4px;
            background: #ff9800;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 10px;
            font-weight: 500;
          ">
            ⚡ Remove Edge
          </button>
          
          <button id="delete-node-btn" style="
            width: 100%;
            padding: 5px 6px;
            margin-bottom: 4px;
            background: ${deletionMode ? '#dc3545' : '#dc3545'};
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 10px;
            font-weight: 500;
          ">
            ${deletionMode ? '❌ Cancel' : '🗑️ Delete Node'}
          </button>
          
          <button id="edit-node-btn" style="
            width: 100%;
            padding: 5px 6px;
            margin-bottom: 4px;
            background: ${editMode ? '#dc3545' : '#17a2b8'};
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 10px;
            font-weight: 500;
          ">
            ${editMode ? '❌ Cancel' : '✏️ Edit'}
          </button>
          
          ${edgeCreationMode ? `
            <div style="
              padding: 4px;
              background: #e7f3ff;
              border-radius: 3px;
              margin-bottom: 4px;
              font-size: 9px;
              text-align: center;
            ">
              <strong>🔗 Click 2 nodes to add edge</strong><br/>
              ${selectedNodes.length}/2
              ${selectedNodes.length > 0 ? `<br/>${selectedNodes.join(', ')}` : ''}
            </div>
            
            <button id="confirm-edge-btn" style="
              width: 100%;
              padding: 5px 6px;
              margin-bottom: 4px;
              background: ${selectedNodes.length === 2 ? '#007bff' : '#6c757d'};
              color: white;
              border: none;
              border-radius: 4px;
              cursor: ${selectedNodes.length === 2 ? 'pointer' : 'not-allowed'};
              font-size: 10px;
              font-weight: 500;
            " ${selectedNodes.length !== 2 ? 'disabled' : ''}>
              ✓ Add Edge
            </button>
          ` : ''}
          
          ${edgeRemovalMode ? `
            <div style="
              padding: 4px;
              background: #fff3e0;
              border-radius: 3px;
              margin-bottom: 4px;
              font-size: 9px;
              text-align: center;
            ">
              <strong>⚡ Click 2 nodes to remove edge</strong><br/>
              ${selectedNodes.length}/2
              ${selectedNodes.length > 0 ? `<br/>${selectedNodes.join(', ')}` : ''}
            </div>
            
            <button id="confirm-remove-edge-btn" style="
              width: 100%;
              padding: 5px 6px;
              margin-bottom: 4px;
              background: ${selectedNodes.length === 2 ? '#ff9800' : '#6c757d'};
              color: white;
              border: none;
              border-radius: 4px;
              cursor: ${selectedNodes.length === 2 ? 'pointer' : 'not-allowed'};
              font-size: 10px;
              font-weight: 500;
            " ${selectedNodes.length !== 2 ? 'disabled' : ''}>
              ✓ Remove Edge
            </button>
          ` : ''}
          
          ${deletionMode ? `
            <div style="
              padding: 4px;
              background: #ffe7e7;
              border-radius: 3px;
              margin-bottom: 4px;
              font-size: 9px;
              text-align: center;
            ">
              <strong>⚠️ Click nodes to delete</strong><br/>
              Selected: ${selectedNodes.length}
              ${selectedNodes.length > 0 ? `<br/>${selectedNodes.join(', ')}` : ''}
            </div>
            
            <button id="confirm-delete-btn" style="
              width: 100%;
              padding: 5px 6px;
              margin-bottom: 4px;
              background: ${selectedNodes.length > 0 ? '#dc3545' : '#6c757d'};
              color: white;
              border: none;
              border-radius: 4px;
              cursor: ${selectedNodes.length > 0 ? 'pointer' : 'not-allowed'};
              font-size: 10px;
              font-weight: 500;
            " ${selectedNodes.length === 0 ? 'disabled' : ''}>
              ⚠️ Confirm Delete
            </button>
          ` : ''}
          
          ${editMode ? `
            <div style="
              padding: 4px;
              background: #e7f9ff;
              border-radius: 3px;
              margin-bottom: 4px;
              font-size: 9px;
              text-align: center;
            ">
              <strong>✏️ Editing Node ${editingNodeIndex}</strong><br/>
              Drag marker to new position
            </div>
            
            <button id="confirm-edit-btn" style="
              width: 100%;
              padding: 5px 6px;
              margin-bottom: 4px;
              background: #28a745;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-size: 10px;
              font-weight: 500;
            ">
              ✓ OK (Save)
            </button>
          ` : ''}
          
          <button id="reload-data-btn" style="
            width: 100%;
            padding: 4px 6px;
            background: #6c757d;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 10px;
          ">
            🔄 Reload
          </button>
          
          <div style="
            margin-top: 6px;
            padding-top: 6px;
            border-top: 1px solid #ddd;
            font-size: 9px;
            color: #666;
            text-align: center;
          ">
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
      const removeEdgeBtn = document.getElementById('remove-edge-btn');
      const deleteNodeBtn = document.getElementById('delete-node-btn');
      const editNodeBtn = document.getElementById('edit-node-btn');
      const confirmEdgeBtn = document.getElementById('confirm-edge-btn');
      const confirmRemoveEdgeBtn = document.getElementById('confirm-remove-edge-btn');
      const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
      const confirmEditBtn = document.getElementById('confirm-edit-btn');
      const reloadBtn = document.getElementById('reload-data-btn');

      if (addNodeBtn) addNodeBtn.onclick = addNewNode;
      if (createEdgeBtn) createEdgeBtn.onclick = () => {
        setEdgeCreationMode(!edgeCreationMode);
        setEdgeRemovalMode(false);
        setDeletionMode(false);
        setEditMode(false);
        setSelectedNodes([]);
      };
      if (removeEdgeBtn) removeEdgeBtn.onclick = () => {
        if (selectedNodes.length === 2) {
          removeEdge();
        } else {
          setEdgeRemovalMode(true);
          setEdgeCreationMode(false);
          setDeletionMode(false);
          setEditMode(false);
          setSelectedNodes([]);
          showStatus('⚠️ Select 2 nodes to remove edge');
        }
      };
      if (deleteNodeBtn) deleteNodeBtn.onclick = () => {
        setDeletionMode(!deletionMode);
        setEdgeCreationMode(false);
        setEdgeRemovalMode(false);
        setEditMode(false);
        setSelectedNodes([]);
      };
      if (editNodeBtn) editNodeBtn.onclick = () => {
        if (editMode) {
          cancelEditNode();
        } else {
          startEditNode();
        }
      };
      if (confirmEdgeBtn) confirmEdgeBtn.onclick = createEdge;
      if (confirmRemoveEdgeBtn) confirmRemoveEdgeBtn.onclick = removeEdge;
      if (confirmDeleteBtn) confirmDeleteBtn.onclick = deleteSelectedNodes;
      if (confirmEditBtn) confirmEditBtn.onclick = confirmEditNode;
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
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <div style="width: 12px; height: 12px; border-radius: 50%; background: linear-gradient(135deg, #9333ea 0%, #7e22ce 100%); border: 2px solid white; margin-right: 8px;"></div>
            <span style="font-size: 12px;">Set Node</span>
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <div style="width: 14px; height: 14px; border-radius: 50%; background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); border: 2px solid white; margin-right: 8px;"></div>
            <span style="font-size: 12px;">Editing</span>
          </div>
          <div style="
            padding-top: 8px;
            border-top: 1px solid #ddd;
            font-size: 11px;
            color: #333;
            font-weight: 500;
          ">
            Total: ${nodesData.nodes.length} Nodes<br/>
            Total: ${nodesData.edges.length} Edges
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
      controlPanel.remove();
      legend.remove();
      
      // Clear any pending status message timeout
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current);
      }
    };
  }, [map, nodesData, edgeCreationMode, edgeRemovalMode, deletionMode, editMode, editingNodeIndex, selectedNodes, statusMessage, handleNodeClick, startEditNode, cancelEditNode, confirmEditNode]);

  return null;
};

export default NodeVisualizer;
