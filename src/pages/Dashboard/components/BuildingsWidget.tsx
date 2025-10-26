import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, ChevronDown, ChevronUp, Edit, Trash } from "lucide-react";

interface Building {
  id: string;
  building_id: string;  // Changed to string to match API format (e.g., "B1", "B2")
  building_name: string;
  description?: string;
  building_capacity?: number;
  exhibits: string[];
  exhibit_tags: Record<string, string[]>;  // Consistent format: exhibit name -> array of tag strings
}

const BuildingsWidget: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);

  const [formData, setFormData] = useState<Building>({
    id: "",
    building_id: "",
    building_name: "",
    description: "",
    building_capacity: 0,
    exhibits: [],
    exhibit_tags: {}, // Initially empty object
  });

  const [newExhibit, setNewExhibit] = useState<string>("");



  const token = localStorage.getItem("authToken");

  const axiosInstance = axios.create({
    baseURL: "http://localhost:5000",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Fetch tags
  const fetchTags = async () => {
    try {
      const res = await axiosInstance.get("/api/buildings/tags");
      setTags(res.data.tags || []);
    } catch (err) {
      console.error("Error fetching tags:", err);
      // Fallback to hardcoded tags
      setTags([
        "AI","ICT","Structures","Mechanical","Civil","Power","Automation","Robotics","Electronics","Software"
      ]);
    }
  };

  // Fetch buildings
  const fetchBuildings = async () => {
    try {
      const res = await axiosInstance.get("/api/buildings");
      console.log("Raw API response:", res.data);
      const formatted = res.data.map((b: any) => {
        console.log("Processing building:", b.building_name, "exhibit_tags:", b.exhibit_tags);
        
        // Process exhibit_tags to handle the nested API structure
        let processedExhibitTags: Record<string, string[]> = {};
        if (b.exhibit_tags && typeof b.exhibit_tags === "object") {
          Object.keys(b.exhibit_tags).forEach(exhibit => {
            const exhibitData = b.exhibit_tags[exhibit];
            
            // Handle the nested structure: { "exhibit_name": { "exhibit_name": ["tag1", "tag2"] } }
            if (exhibitData && typeof exhibitData === 'object') {
              // Look for the tags array inside the nested object
              const nestedTags = exhibitData[exhibit];
              if (Array.isArray(nestedTags)) {
                processedExhibitTags[exhibit] = nestedTags;
              } else {
                // Fallback: try to find any array in the nested object
                const firstArrayValue = Object.values(exhibitData).find(val => Array.isArray(val));
                processedExhibitTags[exhibit] = Array.isArray(firstArrayValue) ? firstArrayValue : [];
              }
            } else if (Array.isArray(exhibitData)) {
              // Direct array (flat structure)
              processedExhibitTags[exhibit] = exhibitData;
            } else {
              processedExhibitTags[exhibit] = [];
            }
          });
        }
        
        return {
          ...b,
          id: String(b.building_id), // Use building_id as the unique identifier
          building_id: String(b.building_id), // Ensure building_id is a string
          description: b.description || "", // Default empty description
          exhibits: Array.isArray(b.exhibits) ? b.exhibits : [],
          exhibit_tags: processedExhibitTags,
        };
      });
      console.log("Formatted buildings:", formatted);
      setBuildings(formatted);
    } catch (err: any) {
      console.error("Error fetching buildings:", err);
      if (err.response?.status === 401) {
        window.location.href = "/login";
      }
    }
  };

  useEffect(() => {
    fetchBuildings();
    fetchTags();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.building_name || !formData.building_id) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      if (formData.id) {
        // Find original building to compare exhibits
        const originalBuilding = buildings.find(b => b.id === formData.id);
        const originalExhibits = originalBuilding?.exhibits || [];
        const newExhibits = formData.exhibits;

        // Determine exhibits to remove
        const exhibits_to_remove = originalExhibits
          .filter(exhibit => !newExhibits.includes(exhibit));

        // Send ALL current exhibits (both new and existing) with their current tags
        // This ensures that tag updates for existing exhibits are also saved
        const exhibits_to_add = newExhibits.map(exhibit => {
          // Format tags in the nested structure the API expects
          const tags = formData.exhibit_tags[exhibit] || [];
          const nestedTags = { [exhibit]: tags };
          
          return {
            exhibit_name: exhibit,
            exhibit_tags: nestedTags
          };
        });

        // Update existing building using the API structure
        const updateData: any = {
          building_name: formData.building_name,
          building_capacity: formData.building_capacity || null,
        };

        // Always send exhibits_to_add to update all exhibit tags
        if (exhibits_to_add.length > 0) {
          updateData.exhibits_to_add = exhibits_to_add;
        }

        if (exhibits_to_remove.length > 0) {
          updateData.exhibits_to_remove = exhibits_to_remove;
        }

        console.log("Sending update data:", updateData);
        await axiosInstance.put(`/api/buildings/${formData.building_id}`, updateData);

        // Refresh buildings list to get updated data
        await fetchBuildings();

        alert("Building updated successfully");
      } else {
        // Create new building - this functionality may need to be implemented in the backend
        alert("Creating new buildings is not currently supported. Please contact an administrator.");
        return;
      }
    } catch (err: any) {
      console.error("Error saving building:", err);

      if (err.response?.status === 409) {
        alert("Building already exists or exhibit name conflict.");
      } else if (err.response?.data?.message) {
        alert(`Error: ${err.response.data.message}`);
      } else {
        alert("An unexpected error occurred while saving the building.");
      }
    }

    // Reset form
    setFormData({
      id: "",
      building_id: "",
      building_name: "",
      description: "",
      building_capacity: 0,
      exhibits: [],
      exhibit_tags: {},
    });
    setShowForm(false);
    setNewExhibit("");
  };

  const handleEdit = (building: Building) => {
    console.log("Editing building:", building.building_name);
    console.log("Original building data:", building);
    console.log("Exhibit tags:", building.exhibit_tags);
    
    // Ensure all exhibits have entry in exhibit_tags
    const processedExhibitTags: Record<string, string[]> = { ...building.exhibit_tags };
    
    building.exhibits?.forEach(exhibit => {
      if (!processedExhibitTags[exhibit]) {
        processedExhibitTags[exhibit] = [];
      }
    });
    
    console.log("Processed exhibit_tags for editing:", processedExhibitTags);
    
    setFormData({
      ...building,
      exhibit_tags: processedExhibitTags,
    });
    setNewExhibit("");
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const building = buildings.find((b) => b.id === id);
    if (!building) return;

    if (!confirm(`Are you sure you want to delete "${building.building_name}"?`)) {
      return;
    }

    try {
      await axiosInstance.delete(`/api/buildings/${building.building_id}`);
      await fetchBuildings(); // Refresh the list
    } catch (err) {
      console.error("Error deleting building:", err);
      alert("Error deleting building. It may not be deletable through this interface.");
    }
  };



  const addExhibit = () => {
    const trimmed = newExhibit.trim();
    if (!trimmed) return;

    // Avoid duplicates
    if (formData.exhibits.includes(trimmed)) {
      alert("Exhibit already added.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      exhibits: [...prev.exhibits, trimmed],
      exhibit_tags: { ...prev.exhibit_tags, [trimmed]: [] }, // Initialize with empty array for multiple tags
    }));
    setNewExhibit("");
  };

  const removeExhibit = (exhibit: string) => {
    setFormData((prev) => {
      const updatedTags = { ...prev.exhibit_tags };
      delete updatedTags[exhibit]; // Clear tags for removed exhibit
      return {
        ...prev,
        exhibits: prev.exhibits.filter((e) => e !== exhibit),
        exhibit_tags: updatedTags,
      };
    });
  };

  const addTagToExhibit = (exhibit: string, tag: string) => {
    console.log(`Adding tag "${tag}" to exhibit "${exhibit}"`);
    setFormData((prev) => {
      const updatedTags = { ...prev.exhibit_tags };
      if (!Array.isArray(updatedTags[exhibit])) {
        updatedTags[exhibit] = [];
      }
      if (!updatedTags[exhibit].includes(tag)) {
        updatedTags[exhibit].push(tag);
      }
      console.log("Updated tags after adding:", updatedTags);
      return {
        ...prev,
        exhibit_tags: updatedTags,
      };
    });
  };

  const removeTagFromExhibit = (exhibit: string, tag: string) => {
    console.log(`Removing tag "${tag}" from exhibit "${exhibit}"`);
    setFormData((prev) => {
      const updatedTags = { ...prev.exhibit_tags };
      if (Array.isArray(updatedTags[exhibit])) {
        updatedTags[exhibit] = updatedTags[exhibit].filter((t: any) => t !== tag);
      }
      console.log("Updated tags after removing:", updatedTags);
      return {
        ...prev,
        exhibit_tags: updatedTags,
      };
    });
  };

  const renderExhibitsSummary = (b: Building) => {
    if (!b.exhibits?.length) return "No exhibits available";
    return b.exhibits.map((ex) => {
      const tags = b.exhibit_tags?.[ex] || [];
      console.log(`Rendering exhibit "${ex}":`, tags);
      
      return (
        <div key={ex}>
          <span className="font-semibold">{ex}</span>:{" "}
          {Array.isArray(tags) && tags.length > 0 ? (
            tags.map((tag, index) => (
              <span key={index} className="text-blue-600 bg-blue-100 px-2 py-1 rounded text-sm mr-1">
                {tag}
              </span>
            ))
          ) : (
            <span className="text-gray-400 italic">No tags</span>
          )}
        </div>
      );
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={16} /> Add Building
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">
              {formData.id ? "Edit Building" : "Add Building"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-medium mb-1">Building ID</label>
                <input
                  type="text"
                  value={formData.building_id}
                  onChange={(e) =>
                    setFormData({ ...formData, building_id: e.target.value })
                  }
                  className="w-full border p-2 rounded"
                  placeholder="Enter building ID (e.g., B1, B2)"
                  required
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Building Name</label>
                <input
                  type="text"
                  value={formData.building_name}
                  onChange={(e) =>
                    setFormData({ ...formData, building_name: e.target.value })
                  }
                  className="w-full border p-2 rounded"
                  placeholder="Enter building name"
                  required
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  className="w-full border p-2 rounded"
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                ></textarea>
              </div>

              <div>
                <label className="block font-medium mb-1">Building Capacity</label>
                <input
                  type="number"
                  value={formData.building_capacity || ''}
                  placeholder="Enter capacity"
                  className="w-full border p-2 rounded"
                  onChange={(e) =>
                    setFormData({ ...formData, building_capacity: parseInt(e.target.value) || 0 })
                  }
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Exhibits</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add Exhibit"
                    value={newExhibit}
                    onChange={(e) => setNewExhibit(e.target.value)}
                    className="flex-1 border p-2 rounded"
                  />
                  <button
                    type="button"
                    onClick={addExhibit}
                    className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Exhibits list with tag dropdowns */}
                <div className="mt-3 space-y-2">
                  {formData.exhibits.map((exhibit, index) => (
                    <div
                      key={`${exhibit}-${index}`}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-gray-50 p-2 rounded"
                    >
                      <div className="sm:col-span-6">
                        <span className="font-medium">{exhibit}</span>
                      </div>
                      <div className="sm:col-span-5">
                        {/* Selected Tags */}
                        <div className="mb-2">
                          <div className="text-xs text-gray-600 mb-1">Selected Tags:</div>
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(formData.exhibit_tags[exhibit]) ? formData.exhibit_tags[exhibit].map((selectedTag: any) => (
                              <span
                                key={selectedTag}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                              >
                                {selectedTag}
                                <button
                                  type="button"
                                  onClick={() => removeTagFromExhibit(exhibit, selectedTag)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  ×
                                </button>
                              </span>
                            )) : null}
                            {(!Array.isArray(formData.exhibit_tags[exhibit]) || formData.exhibit_tags[exhibit].length === 0) && (
                              <span className="text-gray-400 text-xs">No tags selected</span>
                            )}
                          </div>
                        </div>
                        
                        {/* Available Tags */}
                        <div>
                          <div className="text-xs text-gray-600 mb-1">Available Tags:</div>
                          <div className="flex flex-wrap gap-1">
                            {tags
                              .filter(t => !(formData.exhibit_tags[exhibit] || []).includes(t))
                              .map((t) => (
                                <button
                                  type="button"
                                  key={t}
                                  onClick={() => addTagToExhibit(exhibit, t)}
                                  className="px-2 py-1 border rounded text-xs hover:bg-gray-100"
                                >
                                  {t}
                                </button>
                              ))}
                            {tags.filter(t => !(formData.exhibit_tags[exhibit] || []).includes(t)).length === 0 && (
                              <span className="text-gray-400 text-xs">All tags selected</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="sm:col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() => removeExhibit(exhibit)}
                          className="text-red-600 hover:text-red-800"
                          title="Remove exhibit"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-200 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Buildings List */}
      <div className="space-y-3">
        {buildings.map((b) => (
          <div key={b.id} className="border rounded-lg bg-white shadow-sm">
            <button
              onClick={() => setExpanded(expanded === b.id ? null : b.id)}
              className="w-full flex justify-between items-center px-4 py-3 text-left font-medium hover:bg-gray-50"
            >
              {b.building_name}
              {expanded === b.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {expanded === b.id && (
              <div className="px-4 pb-4 space-y-2">
                <p>
                  <span className="font-semibold">Building ID:</span> {b.building_id}
                </p>
                <p>
                  <span className="font-semibold">Capacity:</span> {b.building_capacity || 'Not specified'}
                </p>
                <p>
                  <span className="font-semibold">Description:</span> {b.description}
                </p>
                <div>
                  <span className="font-semibold">Exhibits:</span>{" "}
                  {renderExhibitsSummary(b)}
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => handleEdit(b)}
                    className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    <Edit size={14} className="inline-block mr-1" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    <Trash size={14} className="inline-block mr-1" /> Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BuildingsWidget;
