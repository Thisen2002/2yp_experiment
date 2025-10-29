/**
 * BuildingEditor Component
 * Manages building data editing including names, descriptions, zones, and navigation node assignments.
 * Prevents node conflicts and provides real-time validation.
 */

import { useState, useEffect } from 'react';
import { getAllBuildings, getBuildingById } from '../../config/buildingMappings';

const API_BASE_URL = 'http://localhost:3001/api/map';

export default function BuildingEditor({ onClose, onBuildingUpdated }) {
  // State: Building list and selection
  const [buildings, setBuildings] = useState([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState('');
  const [buildingData, setBuildingData] = useState(null);
  
  // State: UI states
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [nodeAvailability, setNodeAvailability] = useState(null);

  // State: Form fields (controlled inputs)
  const [buildingName, setBuildingName] = useState('');
  const [description, setDescription] = useState('');
  const [nodeId, setNodeId] = useState('');
  const [zoneId, setZoneId] = useState('');

  // Load all buildings on mount
  useEffect(() => {
    loadBuildings();
  }, []);

  // Fetch all buildings for dropdown
  const loadBuildings = async () => {
    try {
      setLoading(true);
      const data = await getAllBuildings();
      setBuildings(data.sort((a, b) => a.building_name.localeCompare(b.building_name)));
    } catch (err) {
      setError('Failed to load buildings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load selected building details
  const loadBuildingDetails = async (buildingId) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const building = await getBuildingById(parseInt(buildingId));
      
      if (building) {
        setBuildingData(building);
        setBuildingName(building.building_name || '');
        setDescription(building.description || '');
        setNodeId(building.node_id !== null ? String(building.node_id) : '');
        setZoneId(String(building.zone_ID || ''));
      }
    } catch (err) {
      setError('Failed to load building details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Check if node is already assigned to another building
  const checkNodeAvailability = async (node) => {
    if (!node || node.trim() === '') {
      setNodeAvailability(null);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/buildings/node/${node}/check`);
      const data = await response.json();
      setNodeAvailability(data);
    } catch (err) {
      console.error('Failed to check node availability:', err);
      setNodeAvailability(null);
    }
  };

  // Handle building selection from dropdown
  const handleBuildingSelect = (e) => {
    const buildingId = e.target.value;
    setSelectedBuildingId(buildingId);
    
    if (buildingId) {
      loadBuildingDetails(buildingId);
    } else {
      // Clear form
      setBuildingData(null);
      setBuildingName('');
      setDescription('');
      setNodeId('');
      setZoneId('');
      setNodeAvailability(null);
    }
  };

  // Handle node ID input change with validation
  const handleNodeIdChange = (e) => {
    const value = e.target.value;
    setNodeId(value);
    
    // Only check if value changed from current
    if (value && value !== String(buildingData?.node_id)) {
      checkNodeAvailability(value);
    } else {
      setNodeAvailability(null);
    }
  };

  // Remove node assignment
  const handleUnassignNode = () => {
    setNodeId('');
    setNodeAvailability(null);
  };

  // Save changes to database
  const handleSave = async () => {
    // Validation
    if (!selectedBuildingId) {
      setError('Please select a building');
      return;
    }

    if (!buildingName.trim()) {
      setError('Building name is required');
      return;
    }

    if (nodeId && nodeAvailability && !nodeAvailability.available) {
      setError(`Node ${nodeId} is already assigned to another building`);
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Prepare update payload
      const updates = {
        building_name: buildingName.trim(),
        description: description.trim(),
        node_id: nodeId.trim() === '' ? null : parseInt(nodeId),
        zone_id: zoneId ? parseInt(zoneId) : buildingData.zone_ID
      };

      console.log('Sending updates:', updates);

      // Send PUT request
      const response = await fetch(`${API_BASE_URL}/buildings/${selectedBuildingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      const data = await response.json();
      console.log('Response:', response.status, data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update building');
      }

      // Success feedback
      alert(`✅ Building "${data.building_name}" updated successfully!`);
      setSuccess('Building updated successfully!');
      
      // Update local state with server response
      setBuildingData(data);
      setBuildingName(data.building_name || '');
      setDescription(data.description || '');
      setNodeId(data.node_id !== null ? String(data.node_id) : '');
      setZoneId(String(data.zone_ID || ''));
      setNodeAvailability(null);
      
      // Refresh building list
      await loadBuildings();
      
      // Notify parent
      if (onBuildingUpdated) {
        onBuildingUpdated(data);
      }

      // Auto-clear success message
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
      setError(err.message || 'Failed to save changes');
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  // ============================================================================
  // RENDER UI
  // ============================================================================

  // ============================================================================
  // RENDER UI
  // ============================================================================
  
  return (
    /* ========== MODAL OVERLAY ==========
     * Full-screen semi-transparent overlay that darkens the background
     * and contains the editor modal in the center
     * 
     * STYLING NOTES:
     * - position: fixed → stays in place even if page scrolls
     * - top/left/right/bottom: 0 → covers entire viewport
     * - backgroundColor: rgba(0,0,0,0.5) → semi-transparent black
     * - display: flex + alignItems/justifyContent: center → centers modal
     * - zIndex: 10000 → appears above everything else (map is usually 1000)
     */
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000
    }}>
      {/* ========== MODAL CONTAINER ==========
       * The white card that contains all editor content
       * 
       * RESPONSIVE DESIGN:
       * - maxWidth: 600px → doesn't get too wide on large screens
       * - width: 90% → shrinks on mobile devices
       * - maxHeight: 90vh → never taller than viewport (90% of viewport height)
       * - overflowY: auto → scrollable if content is tall
       * 
       * VISUAL DESIGN:
       * - backgroundColor: white → clean, readable background
       * - borderRadius: 12px → rounded corners for modern look
       * - padding: 24px → inner spacing around content
       * - boxShadow → depth/elevation effect
       */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 24,
        maxWidth: 600,
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
      }}>
        {/* ========== HEADER SECTION ==========
         * Title and close button at top of modal
         * 
         * LAYOUT:
         * - display: flex → horizontal layout
         * - justifyContent: space-between → title left, close right
         * - alignItems: center → vertically centered
         */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20
        }}>
          {/* Modal title with emoji for visual appeal */}
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>
            🏢 Building Editor
          </h2>
          
          {/* ========== CLOSE BUTTON ==========
           * X button to close the modal
           * 
           * onClick={onClose} → calls parent's close function
           * This removes the BuildingEditor from MapExtra.jsx
           * 
           * STYLING:
           * - background: none → transparent
           * - border: none → no border
           * - fontSize: 28 → large, easy to click
           * - cursor: pointer → shows it's clickable
           */}
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 28,
              cursor: 'pointer',
              color: '#666',
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>

        {/* ========== ERROR MESSAGE BANNER ==========
         * Conditional rendering: only shows when error state has content
         * 
         * EXAMPLES OF ERRORS:
         * - "Please select a building"
         * - "Building name is required"
         * - "Node 106 is already assigned to another building"
         * 
         * CONDITIONAL RENDERING:
         * {error && <div>...} means "if error is truthy, render div"
         * Empty strings are falsy, so no error = no banner
         * 
         * COLOR SCHEME:
         * - backgroundColor: #fee → light red background
         * - color: #c33 → dark red text
         * - ⚠️ emoji → visual warning indicator
         */}
        {error && (
          <div style={{
            backgroundColor: '#fee',
            color: '#c33',
            padding: 12,
            borderRadius: 6,
            marginBottom: 16,
            fontSize: 14
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* ========== SUCCESS MESSAGE BANNER ==========
         * Similar to error banner, but green for success
         * Shows after successful save operation
         * 
         * MESSAGE: "Building updated successfully!"
         * 
         * AUTO-DISMISS:
         * After 3 seconds, the success state is cleared (see handleSave)
         * setTimeout(() => setSuccess(''), 3000)
         * 
         * COLOR SCHEME:
         * - backgroundColor: #efe → light green background
         * - color: #3c3 → dark green text
         * - ✅ emoji → visual success indicator
         */}
        {success && (
          <div style={{
            backgroundColor: '#efe',
            color: '#3c3',
            padding: 12,
            borderRadius: 6,
            marginBottom: 16,
            fontSize: 14
          }}>
            ✅ {success}
          </div>
        )}

        {/* ========== BUILDING SELECTOR DROPDOWN ==========
         * First interaction: user picks which building to edit
         * 
         * CONTROLLED SELECT:
         * - value={selectedBuildingId} → current selection from state
         * - onChange={handleBuildingSelect} → updates state on change
         * 
         * DISABLED STATE:
         * - disabled={loading} → can't select while loading
         * - backgroundColor changes to #f5f5f5 when disabled (visual feedback)
         * 
         * DROPDOWN OPTIONS:
         * - First option: "-- Choose a building --" with empty value
         * - Then map over buildings array to create option for each
         * - Shows: "Building Name (ID: 1, SVG: b11)" for clarity
         * - key={b.building_ID} → React needs unique key for list items
         */}
        <div style={{ marginBottom: 20 }}>
          <label style={{
            display: 'block',
            marginBottom: 8,
            fontWeight: 600,
            fontSize: 14
          }}>
            Select Building
          </label>
          <select
            value={selectedBuildingId}
            onChange={handleBuildingSelect}
            disabled={loading}
            style={{
              width: '100%',
              padding: 10,
              fontSize: 14,
              border: '2px solid #ddd',
              borderRadius: 6,
              backgroundColor: loading ? '#f5f5f5' : 'white'
            }}
          >
            <option value="">-- Choose a building --</option>
            {buildings.map(b => (
              <option key={b.building_ID} value={b.building_ID}>
                {b.building_name} (ID: {b.building_ID}, SVG: {b.svg_id})
              </option>
            ))}
          </select>
        </div>

        {/* ========== BUILDING DETAILS FORM ==========
         * Conditional rendering: only shows when a building is selected
         * 
         * {buildingData && <> means "if buildingData exists, render this"
         * buildingData is set by loadBuildingDetails() when user selects building
         * 
         * FORM FIELDS:
         * 1. Building Name (required text input)
         * 2. Description (optional textarea)
         * 3. Zone ID (required select dropdown)
         * 4. Navigation Node ID (optional number input with validation)
         * 5. Current Info (read-only display)
         * 6. Action Buttons (Cancel and Save)
         */}
        {buildingData && (
          <>
            {/* ========== BUILDING NAME INPUT ==========
             * Required field for the building's display name
             * 
             * CONTROLLED INPUT:
             * - value={buildingName} → comes from state
             * - onChange → updates state on every keystroke
             * - (e) => setBuildingName(e.target.value)
             * 
             * VALIDATION:
             * Checked in handleSave():
             * if (!buildingName.trim()) → shows error
             * 
             * LABEL ASTERISK:
             * The * indicates this is a required field
             */}
            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: 'block',
                marginBottom: 8,
                fontWeight: 600,
                fontSize: 14
              }}>
                Building Name *
              </label>
              <input
                type="text"
                value={buildingName}
                onChange={(e) => setBuildingName(e.target.value)}
                style={{
                  width: '100%',
                  padding: 10,
                  fontSize: 14,
                  border: '2px solid #ddd',
                  borderRadius: 6
                }}
                placeholder="Enter building name"
              />
            </div>

            {/* ========== DESCRIPTION TEXTAREA ==========
             * Optional field for building description
             * 
             * TEXTAREA vs INPUT:
             * - <textarea> allows multiple lines
             * - rows={3} → initial height (3 lines)
             * - resize: vertical → user can resize up/down only
             * 
             * CONTROLLED TEXTAREA:
             * Same pattern as text input:
             * - value from state
             * - onChange updates state
             */}
            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: 'block',
                marginBottom: 8,
                fontWeight: 600,
                fontSize: 14
              }}>
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: 10,
                  fontSize: 14,
                  border: '2px solid #ddd',
                  borderRadius: 6,
                  resize: 'vertical'
                }}
                placeholder="Enter building description"
              />
            </div>

            {/* ========== ZONE SELECTOR ==========
             * Dropdown to select which campus zone this building belongs to
             * 
             * ZONES:
             * Buildings are grouped into zones (1-7) for organization
             * Each zone represents a different area of campus
             * 
             * CONTROLLED SELECT:
             * - value={zoneId} → current zone from state
             * - onChange updates zoneId state
             * 
             * OPTIONS:
             * Hardcoded Zone 1 through Zone 7
             * In the future, this could be loaded from database
             */}
            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: 'block',
                marginBottom: 8,
                fontWeight: 600,
                fontSize: 14
              }}>
                Zone ID
              </label>
              <select
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
                style={{
                  width: '100%',
                  padding: 10,
                  fontSize: 14,
                  border: '2px solid #ddd',
                  borderRadius: 6
                }}
              >
                <option value="1">Zone 1</option>
                <option value="2">Zone 2</option>
                <option value="3">Zone 3</option>
                <option value="4">Zone 4</option>
                <option value="5">Zone 5</option>
                <option value="6">Zone 6</option>
                <option value="7">Zone 7</option>
              </select>
            </div>

            {/* ========== NAVIGATION NODE ASSIGNMENT ==========
             * Most complex field: assigns a navigation node to this building
             * 
             * WHAT IS A NAVIGATION NODE?
             * Navigation nodes are points on the campus map used for pathfinding.
             * When user wants to navigate to a building, the system routes to its node.
             * 
             * FEATURES:
             * 1. Number input for node ID
             * 2. Real-time availability checking
             * 3. Visual feedback (red border if unavailable)
             * 4. Unassign button if currently assigned
             * 5. Availability status message
             * 6. Help text explaining purpose
             */}
            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: 'block',
                marginBottom: 8,
                fontWeight: 600,
                fontSize: 14
              }}>
                Navigation Node ID
              </label>
              
              {/* ========== INPUT + UNASSIGN BUTTON LAYOUT ==========
               * Flexbox layout: input on left, button on right
               * 
               * CONDITIONAL BUTTON:
               * {buildingData.node_id !== null && <button>
               * Only shows "Unassign" if building currently has a node
               * 
               * DYNAMIC BORDER COLOR:
               * border: `2px solid ${nodeAvailability?.available === false ? '#f44' : '#ddd'}`
               * - Red (#f44) if node is taken by another building
               * - Gray (#ddd) if available or not checked
               * 
               * This gives instant visual feedback before user clicks Save
               */}
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="number"
                  value={nodeId}
                  onChange={handleNodeIdChange}
                  style={{
                    flex: 1,
                    padding: 10,
                    fontSize: 14,
                    border: `2px solid ${
                      nodeAvailability?.available === false ? '#f44' : '#ddd'
                    }`,
                    borderRadius: 6
                  }}
                  placeholder="Enter node ID (leave empty for none)"
                />
                {buildingData.node_id !== null && (
                  <button
                    onClick={handleUnassignNode}
                    style={{
                      padding: '10px 16px',
                      fontSize: 14,
                      backgroundColor: '#f44',
                      color: 'white',
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer'
                    }}
                  >
                    Unassign
                  </button>
                )}
              </div>

              {/* ========== NODE AVAILABILITY STATUS ==========
               * Shows result of real-time node check
               * 
               * CONDITIONAL RENDERING:
               * Only shows when nodeAvailability state has data
               * Set by checkNodeAvailability() function
               * 
               * TWO STATES:
               * 
               * 1. AVAILABLE (Green):
               *    "✅ Node 106 is available"
               *    User can safely assign this node
               * 
               * 2. UNAVAILABLE (Red):
               *    "❌ Node 106 is assigned to 'Engineering Library' (ID: 5)"
               *    Prevents conflict by showing which building uses it
               * 
               * DYNAMIC STYLING:
               * backgroundColor and color change based on availability
               * - Green: #efe background, #3c3 text
               * - Red: #fee background, #c33 text
               */}
              {nodeAvailability && (
                <div style={{
                  marginTop: 8,
                  padding: 8,
                  borderRadius: 4,
                  fontSize: 13,
                  backgroundColor: nodeAvailability.available ? '#efe' : '#fee',
                  color: nodeAvailability.available ? '#3c3' : '#c33'
                }}>
                  {nodeAvailability.available ? (
                    <>✅ Node {nodeId} is available</>
                  ) : (
                    <>
                      ❌ Node {nodeId} is assigned to "{nodeAvailability.assignedTo.building_name}"
                      (ID: {nodeAvailability.assignedTo.building_ID})
                    </>
                  )}
                </div>
              )}

              {/* ========== HELP TEXT ==========
               * Explains what navigation nodes are for
               * Always visible to guide users
               * 
               * 💡 emoji → indicates this is a tip/hint
               */}
              <div style={{
                marginTop: 8,
                fontSize: 13,
                color: '#666'
              }}>
                💡 Assign a navigation node to enable routing to this building
              </div>
            </div>

            {/* ========== CURRENT INFO DISPLAY ==========
             * Read-only display of key building data
             * 
             * PURPOSE:
             * Shows immutable fields and current values for reference
             * User can see building ID, SVG ID, etc. without editing them
             * 
             * STYLING:
             * - Gray background (#f5f5f5) → indicates read-only
             * - Smaller font (13px) → less prominent than editable fields
             * 
             * DISPLAYED FIELDS:
             * - Building ID: Database primary key (immutable)
             * - SVG ID: ID in the SVG map file (immutable)
             * - Current Node: What's currently in database
             * - Zone: Current zone assignment
             */}
            <div style={{
              backgroundColor: '#f5f5f5',
              padding: 12,
              borderRadius: 6,
              marginBottom: 20,
              fontSize: 13
            }}>
              <div><strong>Building ID:</strong> {buildingData.building_ID}</div>
              <div><strong>SVG ID:</strong> {buildingData.svg_id}</div>
              <div><strong>Current Node:</strong> {buildingData.node_id !== null ? buildingData.node_id : 'Not assigned'}</div>
              <div><strong>Zone:</strong> {buildingData.zone_ID}</div>
            </div>

            {/* ========== ACTION BUTTONS ==========
             * Final step: user decides to save or cancel
             * 
             * LAYOUT:
             * - display: flex → horizontal layout
             * - gap: 12 → space between buttons
             * - justifyContent: flex-end → buttons aligned to right
             */}
            <div style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'flex-end'
            }}>
              {/* ========== CANCEL BUTTON ==========
               * Closes editor without saving
               * 
               * onClick={onClose} → calls parent's close function
               * All changes are discarded
               * 
               * STYLING:
               * Gray background → indicates secondary action
               */}
              <button
                onClick={onClose}
                style={{
                  padding: '12px 24px',
                  fontSize: 14,
                  backgroundColor: '#ddd',
                  color: '#333',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Cancel
              </button>
              
              {/* ========== SAVE BUTTON ==========
               * Submits changes to database
               * 
               * onClick={handleSave} → runs validation and save logic
               * 
               * DISABLED CONDITIONS:
               * Button is disabled when:
               * 1. saving === true (save in progress)
               * 2. nodeAvailability exists AND is unavailable
               *    (prevents saving when node conflict detected)
               * 
               * DYNAMIC STYLING:
               * - backgroundColor: #ccc (gray) when disabled, #2563eb (blue) when enabled
               * - cursor: not-allowed when disabled, pointer when enabled
               * 
               * DYNAMIC TEXT:
               * - "Saving..." when saving === true
               * - "Save Changes" when ready
               * 
               * This provides visual feedback during the save process
               */}
              <button
                onClick={handleSave}
                disabled={saving || (nodeAvailability && !nodeAvailability.available)}
                style={{
                  padding: '12px 24px',
                  fontSize: 14,
                  backgroundColor: saving || (nodeAvailability && !nodeAvailability.available) 
                    ? '#ccc' 
                    : '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  cursor: saving || (nodeAvailability && !nodeAvailability.available) 
                    ? 'not-allowed' 
                    : 'pointer',
                  fontWeight: 600
                }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </>
        )}

        {/* ========== LOADING STATE ==========
         * Shows when:
         * - loading === true (fetching data)
         * - buildingData === null (no building selected yet)
         * 
         * WHEN VISIBLE:
         * - Initial load when fetching buildings list
         * - When user selects a building and details are loading
         * 
         * SIMPLE MESSAGE:
         * "Loading..." centered with gray text
         * Could be enhanced with a spinner animation
         */}
        {loading && !buildingData && (
          <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
            Loading...
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================================
 * USAGE EXAMPLE IN PARENT COMPONENT (MapExtra.jsx)
 * ============================================================================
 * 
 * // State to control visibility
 * const [showBuildingEditor, setShowBuildingEditor] = useState(false);
 * 
 * // Render conditionally
 * {showBuildingEditor && (
 *   <BuildingEditor
 *     onClose={() => setShowBuildingEditor(false)}
 *     onBuildingUpdated={(building) => {
 *       console.log('Building updated:', building);
 *       // Could refresh map, update cache, etc.
 *     }}
 *   />
 * )}
 * 
 * // Button to open editor
 * <button onClick={() => setShowBuildingEditor(true)}>
 *   🏢 Edit Buildings
 * </button>
 * 
 * ============================================================================
 * BACKEND API ENDPOINTS USED
 * ============================================================================
 * 
 * 1. GET /api/map/buildings
 *    - Fetches all buildings for dropdown
 *    - Called by: loadBuildings()
 *    - Returns: Array of building objects
 * 
 * 2. GET /api/map/buildings/:id
 *    - Fetches single building details
 *    - Called by: loadBuildingDetails(buildingId)
 *    - Returns: Single building object
 * 
 * 3. GET /api/map/buildings/node/:nodeId/check
 *    - Checks if node is available
 *    - Called by: checkNodeAvailability(node)
 *    - Returns: { available: boolean, assignedTo: building|null }
 * 
 * 4. PUT /api/map/buildings/:id
 *    - Updates building in database
 *    - Called by: handleSave()
 *    - Body: { building_name, description, node_id, zone_id }
 *    - Returns: Updated building object
 * 
 * ============================================================================
 * DATABASE TABLE STRUCTURE
 * ============================================================================
 * 
 * Table: map_buildings
 * 
 * Columns:
 * - building_id: INTEGER PRIMARY KEY (auto-increment)
 * - building_name: VARCHAR(255) NOT NULL
 * - description: TEXT
 * - svg_id: VARCHAR(50) NOT NULL
 * - node_id: INTEGER (nullable, references navigation_nodes)
 * - zone_id: INTEGER NOT NULL
 * - coordinates: JSONB
 * - exhibits: JSONB
 * - created_at: TIMESTAMP
 * - updated_at: TIMESTAMP
 * 
 * ============================================================================
 */
