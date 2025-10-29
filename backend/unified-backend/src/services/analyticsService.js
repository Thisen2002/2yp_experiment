const pool = require("../config/database");

// 1. Total visitors (from daily_visitor_counts table)
async function getTotalVisitors(buildingId) {
  let query, params;
  if (buildingId) {
    query = `
      SELECT 
        b.building_name,
        COALESCE(dvc.total_visitors, 0) AS total_visitors,
        dvc.visit_date
      FROM buildings b
      LEFT JOIN daily_visitor_counts dvc ON b.building_id = dvc.building_id 
        AND dvc.visit_date = CURRENT_DATE
      WHERE b.building_id = $1
    `;
    params = [buildingId];
  } else {
    query = `
      SELECT COALESCE(SUM(dvc.total_visitors), 0) AS total_visitors
      FROM daily_visitor_counts dvc
      WHERE dvc.visit_date = CURRENT_DATE
    `;
    params = [];
  }
  const { rows } = await pool.query(query, params);
  return rows[0];
}

// 2. Total check-ins (current visitors in building - visitors who entered but haven't exited)
async function getTotalCheckIns(buildingId) {
  let query, params;
  if (buildingId) {
    query = `
      SELECT 
        b.building_name,
        COUNT(eel.visitor_id) AS total_checkins
      FROM buildings b
      LEFT JOIN entry_exit_log eel ON b.building_id = eel.building_id 
        AND eel.exit_time IS NULL
      WHERE b.building_id = $1
      GROUP BY b.building_id, b.building_name
    `;
    params = [buildingId];
  } else {
    query = `
      SELECT COUNT(*) AS total_checkins 
      FROM entry_exit_log 
      WHERE exit_time IS NULL
    `;
    params = [];
  }
  const { rows } = await pool.query(query, params);
  return rows[0] || { total_checkins: 0 };
}

// 3. Average duration (from entry_exit_log table)
async function getAverageDuration(buildingId, slot) {
  let timeFilter = '';
  if (slot) {
    switch (slot.toLowerCase()) {
      case 'morning':
        timeFilter = `AND EXTRACT(HOUR FROM entry_time) BETWEEN 6 AND 11`;
        break;
      case 'afternoon':
        timeFilter = `AND EXTRACT(HOUR FROM entry_time) BETWEEN 12 AND 17`;
        break;
      case 'evening':
        timeFilter = `AND EXTRACT(HOUR FROM entry_time) BETWEEN 18 AND 23`;
        break;
    }
  }

  const query = `
    SELECT 
      AVG(EXTRACT(EPOCH FROM (exit_time - entry_time)) / 60) AS duration_minutes
    FROM entry_exit_log
    WHERE building_id = $1 
      AND exit_time IS NOT NULL
      AND DATE(entry_time) = CURRENT_DATE
      ${timeFilter}
  `;
  
  const { rows } = await pool.query(query, [buildingId]);
  
  if (rows.length === 0 || !rows[0].duration_minutes) {
    return { averageDuration: 0, unit: 'minutes' };
  }

  return { 
    averageDuration: Math.round(Number(rows[0].duration_minutes)), 
    unit: 'minutes',
    buildingId: buildingId,
    slot: slot || 'all_day'
  };
}

// 4. Repeat visitors (visitors who have visited the same building multiple times)
async function getRepeatVisitors(buildingId, slot) {
  let timeFilter = '';
  if (slot) {
    switch (slot.toLowerCase()) {
      case 'morning':
        timeFilter = `AND EXTRACT(HOUR FROM entry_time) BETWEEN 6 AND 11`;
        break;
      case 'afternoon':
        timeFilter = `AND EXTRACT(HOUR FROM entry_time) BETWEEN 12 AND 17`;
        break;
      case 'evening':
        timeFilter = `AND EXTRACT(HOUR FROM entry_time) BETWEEN 18 AND 23`;
        break;
    }
  }

  const query = `
    SELECT 
      visitor_id, 
      COUNT(DISTINCT DATE(entry_time)) AS visit_days,
      COUNT(*) AS total_visits
    FROM entry_exit_log
    WHERE building_id = $1 ${timeFilter}
    GROUP BY visitor_id
    HAVING COUNT(DISTINCT DATE(entry_time)) > 1 OR COUNT(*) > 1
  `;
  
  const { rows } = await pool.query(query, [buildingId]);
  
  return { 
    repeatVisitors: rows.length,
    buildingId: buildingId,
    slot: slot || 'all_time',
    details: rows
  };
}

// 5. Top 3 buildings by visitor count
async function getTop3Buildings() {
  const query = `
    SELECT 
      b.building_id,
      b.building_name AS building,
      COALESCE(SUM(dvc.total_visitors), 0) AS visitors
    FROM buildings b
    LEFT JOIN daily_visitor_counts dvc ON b.building_id = dvc.building_id
      AND dvc.visit_date >= CURRENT_DATE - INTERVAL '7 days'
    GROUP BY b.building_id, b.building_name
    ORDER BY visitors DESC, b.building_name ASC
    LIMIT 3
  `;
  
  const { rows } = await pool.query(query);
  return rows;
}

// 6. All buildings ranked by visitor count (top 10)
async function getVisitorsPerBuilding() {
  const query = `
    SELECT 
      b.building_id,
      b.building_name AS building,
      b.building_capacity,
      COALESCE(SUM(dvc.total_visitors), 0) AS total_visitors,
      COALESCE(
        ROUND(
          (SUM(dvc.total_visitors)::DECIMAL / b.building_capacity) * 100, 
          2
        ), 
        0
      ) AS capacity_utilization_percent
    FROM buildings b
    LEFT JOIN daily_visitor_counts dvc ON b.building_id = dvc.building_id
      AND dvc.visit_date >= CURRENT_DATE - INTERVAL '7 days'
    GROUP BY b.building_id, b.building_name, b.building_capacity
    ORDER BY total_visitors DESC, b.building_name ASC
    LIMIT 10
  `;
  
  const { rows } = await pool.query(query);
  return rows;
}

module.exports = {
  getTotalVisitors,
  getTotalCheckIns,
  getAverageDuration,
  getRepeatVisitors,
  getTop3Buildings,
  getVisitorsPerBuilding
};