# Node Visualizer - Testing Tool

## Purpose

This component displays all nodes from `path.json` as colored dots on the map to help debug navigation issues and identify isolated nodes.

## Color Code

- 🟢 **Green dots**: Connected nodes (have at least one edge)
- 🔴 **Red dots**: Isolated nodes (NOT connected to any edges - navigation won't work)

## How to Use

### 1. Import the component in your map file

In `src/pages/Maps/MapExtra.jsx` or your main map component:

```jsx
import NodeVisualizer from "./NodeVisualizer";
```

### 2. Add the component to your JSX

After the map is initialized, add:

```jsx
{
  map && <NodeVisualizer map={map} />;
}
```

### Example Integration in MapExtra.jsx:

```jsx
// Near the end of your return statement, after map rendering
return (
  <div>
    {/* Your existing map components */}

    {/* Add this line for testing */}
    {map && <NodeVisualizer map={map} />}
  </div>
);
```

### 3. View the nodes

- Open your map in the browser
- You'll see colored dots for each node
- Hover over any dot to see:
  - Node index
  - Latitude
  - Longitude
  - Connection status

### 4. Check the legend

- Look at the bottom-right corner
- Shows count of connected vs isolated nodes
- Total node count

## What to Look For

### ✅ Good Signs

- All nodes are green
- No isolated (red) nodes
- Buildings have green dots at their entry points

### ⚠️ Issues to Fix

- **Red nodes**: These nodes cannot be reached via navigation
  - Either delete them or add edges to connect them
  - Check if any building uses an isolated node

### Common Problems

1. **New node is red**: You forgot to add edges connecting it
2. **Building navigation fails**: Check if the building's node_id is red
3. **Path stops short**: There might be a red node in the route

## How to Fix Isolated Nodes

If you find isolated nodes (in red):

1. **Check if any building uses it:**

   ```bash
   # Search in buildings.json
   grep -n "node_id.*: 96" shared/buildings.json
   ```

2. **Add edges to connect it:**

   - Edit `backend/Maps/backend map/path.json`
   - Add an edge in the `edges` array
   - Example: `{ "id": "11_96", "from": 11, "to": 96, "coords": [[...], [...]] }`

3. **Or delete the isolated node:**
   - Remove from `nodes` array
   - Update all subsequent node indices
   - Update building references

## Removing the Visualizer

When you're done testing, simply remove or comment out the line:

```jsx
// {map && <NodeVisualizer map={map} />}
```

## Notes

- This is a **testing tool only** - don't deploy to production
- It may slow down the map with many nodes
- Use it to verify node connectivity after adding new buildings/paths
