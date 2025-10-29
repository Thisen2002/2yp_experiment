const pool = require('../config/database');

const zoneToBuildingsMap = {
  "Zone A": ["B13", "B15", "B6", "B10"],
  "Zone B": ["B33", "B16", "B7", "B12", "B11"],
  "Zone C": ["B34", "B20", "B19", "B31", "B28"],
  "Zone D": ["B30", "B24", "B23", "B29", "B4", "B2", "B1"],
  "Other": ["B14", "B17", "B18", "B22", "B32", "B8", "B9"]
};

function validateDuration(durationHours) {
  const hours = parseInt(durationHours, 10);
  if (isNaN(hours) || hours <= 0 || hours > 168) return 24;
  return hours;
}

function getBuildingsForZoneAndBuilding(zone, building) {
  if (!zone) throw new Error('Zone is required');

  const buildings = zoneToBuildingsMap[zone];
  if (!buildings) {
    throw new Error('Invalid zone');
  }

  if (!building || building.trim().toLowerCase() === "all" || building.trim().toLowerCase() === "all buildings") {
    return buildings;
  }

  const b = building.trim();
  if (!buildings.includes(b)) {
    throw new Error('Building does not belong to the selected zone');
  }

  return [b];
}

function queryWithTimeout(queryText, params, timeoutMs = 20000) {
  return Promise.race([
    pool.query(queryText, params),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('DB query timeout')), timeoutMs)
    ),
  ]);
}

async function getPeakOccupancyByZoneAndBuilding(durationHours, zone, building) {
  const hours = validateDuration(durationHours);
  const buildings = getBuildingsForZoneAndBuilding(zone, building);
  
  // Calculate peak occupancy by counting concurrent visitors at any point in time
  const query = `
    WITH time_series AS (
      SELECT building_id, entry_time as event_time, 1 as change
      FROM entry_exit_log
      WHERE building_id = ANY($1)
        AND entry_time >= NOW() - INTERVAL '${hours} hours'
      UNION ALL
      SELECT building_id, exit_time as event_time, -1 as change
      FROM entry_exit_log
      WHERE building_id = ANY($1)
        AND exit_time IS NOT NULL
        AND exit_time >= NOW() - INTERVAL '${hours} hours'
    ),
    running_totals AS (
      SELECT building_id,
             event_time,
             SUM(change) OVER (PARTITION BY building_id ORDER BY event_time) as concurrent_visitors
      FROM time_series
      ORDER BY building_id, event_time
    )
    SELECT building_id as building,
           COALESCE(MAX(concurrent_visitors), 0) as peak_occupancy
    FROM running_totals
    GROUP BY building_id
    ORDER BY building_id;
  `;
  
  try {
    const { rows } = await queryWithTimeout(query, [buildings]);
    return rows;
  } catch (error) {
    console.error('Error in getPeakOccupancy:', error);
    throw error;
  }
}

async function getAvgDwellTimeByZoneAndBuilding(durationHours, zone, building) {
  const hours = validateDuration(durationHours);
  const buildings = getBuildingsForZoneAndBuilding(zone, building);
  
  const query = `
    SELECT building_id AS building,
           ROUND(AVG(EXTRACT(EPOCH FROM session_duration) / 60)::numeric, 2) AS avg_dwell_time_minutes
    FROM entry_exit_log
    WHERE building_id = ANY($1)
      AND entry_time >= NOW() - INTERVAL '${hours} hours'
      AND exit_time IS NOT NULL
      AND session_duration IS NOT NULL
    GROUP BY building_id
    ORDER BY building_id;
  `;
  
  try {
    const { rows } = await queryWithTimeout(query, [buildings]);
    return rows;
  } catch (error) {
    console.error('Error in getAvgDwellTime:', error);
    throw error;
  }
}

async function getActivityLevelByZoneAndBuilding(durationHours, zone, building) {
  const hours = validateDuration(durationHours);
  const buildings = getBuildingsForZoneAndBuilding(zone, building);
  
  const query = `
    SELECT building_id AS building,
           COUNT(DISTINCT visitor_id) AS unique_visitors,
           COUNT(*) AS total_entries,
           COUNT(CASE WHEN exit_time IS NOT NULL THEN 1 END) AS completed_visits,
           COUNT(CASE WHEN exit_time IS NULL THEN 1 END) AS current_visitors
    FROM entry_exit_log
    WHERE building_id = ANY($1)
      AND entry_time >= NOW() - INTERVAL '${hours} hours'
    GROUP BY building_id
    ORDER BY building_id;
  `;
  
  try {
    const { rows } = await queryWithTimeout(query, [buildings]);
    return rows.map(row => ({
      ...row,
      activity_level: row.unique_visitors > 50 ? 'High' : row.unique_visitors > 20 ? 'Medium' : 'Low',
    }));
  } catch (error) {
    console.error('Error in getActivityLevel:', error);
    throw error;
  }
}

module.exports = {
  getPeakOccupancyByZoneAndBuilding,
  getAvgDwellTimeByZoneAndBuilding,
  getActivityLevelByZoneAndBuilding
};