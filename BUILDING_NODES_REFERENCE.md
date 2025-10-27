# Building to Node Mapping Reference

This file shows all buildings with their SVG IDs, node IDs, and coordinates from path.json.

## Complete Mapping

| ID  | SVG_ID | Node | Latitude | Longitude | Building Name                                                                                  |
| --- | ------ | ---- | -------- | --------- | ---------------------------------------------------------------------------------------------- |
| 1   | b11    | 88   | 7.255225 | 80.592301 | Department of Chemical and Process Engineering                                                 |
| 2   | b32    | 75   | 7.254951 | 80.592186 | Department of Engineering Mathematics / Department of Engineering Management / Computer Center |
| 3   | b33    | 87   | 7.254714 | 80.592312 | Drawing Office 1                                                                               |
| 4   | b16    | 81   | 7.254350 | 80.591274 | Professor E.O.E. Pereira Theatre                                                               |
| 5   | b7     | 57   | 7.254284 | 80.592546 | Administrative Building                                                                        |
| 6   | b12    | 22   | 7.253966 | 80.592060 | Security Unit                                                                                  |
| 7   | b17    | NULL | N/A      | N/A       | Electronic Lab                                                                                 |
| 8   | b34    | 71   | 7.254825 | 80.591804 | Department of Electrical and Electronic Engineering                                            |
| 9   | b20    | 92   | 7.254585 | 80.591161 | Department of Computer Engineering                                                             |
| 10  | b19    | NULL | N/A      | N/A       | Electrical and Electronic Workshop                                                             |
| 11  | b31    | 61   | 7.254455 | 80.591824 | Surveying Lab                                                                                  |
| 12  | b31    | 61   | 7.254455 | 80.591824 | Soil Lab                                                                                       |
| 13  | b28    | 27   | 7.254118 | 80.591824 | Materials Lab                                                                                  |
| 14  | b22    | 25   | 7.253934 | 80.591763 | Environmental Lab                                                                              |
| 15  | b30    | 30   | 7.253765 | 80.591763 | Fluids Lab                                                                                     |
| 16  | b24    | 48   | 7.253537 | 80.591361 | New Mechanics Lab                                                                              |
| 17  | b23    | 50   | 7.253579 | 80.591639 | Applied Mechanics Lab                                                                          |
| 18  | b29    | 35   | 7.253399 | 80.591801 | Thermodynamics Lab                                                                             |
| 19  | b2     | 44   | 7.253209 | 80.591648 | Engineering Workshop                                                                           |
| 20  | b1     | 40   | 7.252885 | 80.591801 | Engineering Carpentry Shop                                                                     |
| 21  | b13    | 20   | 7.253658 | 80.592373 | Drawing Office 2                                                                               |
| 24  | b9     | NULL | N/A      | N/A       | Lecture Room (bottom-right)                                                                    |
| 25  | b6     | 15   | 7.253727 | 80.592677 | Structures Laboratory                                                                          |
| 26  | b10    | 29   | 7.253765 | 80.591899 | Engineering Library                                                                            |
| 28  | b15    | 10   | 7.252826 | 80.592544 | Department of Manufacturing and Industrial Engineering                                         |
| 29  | b14    | 8    | 7.252608 | 80.592518 | Faculty Canteen                                                                                |
| 49  | b18A   | 64   | 7.254656 | 80.591784 | Building 18A                                                                                   |
| 52  | b18    | 68   | 7.254714 | 80.591632 | Building 18                                                                                    |

## Buildings Without Nodes (No Navigation)

- b17 (Electronic Lab)
- b19 (Electrical and Electronic Workshop)
- b9 (Lecture Room bottom-right)

## How to Update a Node ID

To fix incorrect navigation for any building:

1. Open `shared/buildings.json`
2. Find the building by `building_ID`
3. Change the `node_id` value
4. Save the file

The change will automatically apply to:

- Frontend (buildingMappings.js)
- Backend Maps (search.js)
- Backend Events (search.js)

## Current Issue

**Professor E.O.E. Pereira Theatre (b16)**

- Current node: 81
- Coordinates: lat=7.254350, lng=80.591274
- If navigation is incorrect, update node_id in shared/buildings.json

To find the correct node, check the actual location on the map and match it with nearby node coordinates.
