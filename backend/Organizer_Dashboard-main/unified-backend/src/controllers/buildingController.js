// controllers/buildingController.js

const pool = require('../config/database');

// ==============================
// GET ALL BUILDINGS
// ==============================
const getBuildings = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        b.building_id,
        b.building_name,
        b.building_capacity,
        COALESCE(
          jsonb_object_agg(
            e.exhibit_name, 
            e.exhibit_tags
          ) FILTER (WHERE e.exhibit_name IS NOT NULL), 
          '{}'::jsonb
        ) AS exhibit_tags,
        COALESCE(
          array_agg(e.exhibit_name) FILTER (WHERE e.exhibit_name IS NOT NULL),
          '{}'::text[]
        ) AS exhibits
      FROM buildings b
      LEFT JOIN exhibits e ON b.building_id = e.building_id
      GROUP BY b.building_id, b.building_name, b.building_capacity
      ORDER BY b.building_id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching buildings:', err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// ==============================
// GET BUILDING BY ID
// ==============================
const getBuildingById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT 
        b.building_id,
        b.building_name,
        b.building_capacity,
        COALESCE(
          jsonb_object_agg(
            e.exhibit_name, 
            e.exhibit_tags
          ) FILTER (WHERE e.exhibit_name IS NOT NULL), 
          '{}'::jsonb
        ) AS exhibit_tags,
        COALESCE(
          array_agg(e.exhibit_name) FILTER (WHERE e.exhibit_name IS NOT NULL),
          '{}'::text[]
        ) AS exhibits
      FROM buildings b
      LEFT JOIN exhibits e ON b.building_id = e.building_id
      WHERE b.building_id = $1
      GROUP BY b.building_id, b.building_name, b.building_capacity
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Building not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching building:', err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// ==============================
// CREATE A NEW BUILDING
// ==============================
// const createBuilding = async (req, res) => {
//   const { building_id, zone_id, building_name, description, exhibits, exhibit_tags } = req.body;

//   if (building_id === undefined || building_id === null || !zone_id || !building_name) {
//     return res.status(400).json({ message: 'building_id, zone_id and building_name are required' });
//   }

//   // Validate that building_id is a valid positive integer
//   if (typeof building_id !== 'number' || !Number.isInteger(building_id) || building_id <= 0) {
//     return res.status(400).json({ message: 'building_id must be a valid positive integer' });
//   }

//   // Validate that zone_id is a valid positive integer
//   if (typeof zone_id !== 'number' || !Number.isInteger(zone_id) || zone_id <= 0) {
//     return res.status(400).json({ message: 'zone_id must be a valid positive integer' });
//   }

//   try {
//     const client = await pool.connect();
//     try {
//       await client.query('BEGIN');
//       const result = await client.query(
//         `INSERT INTO Building (building_ID, zone_ID, building_name, description, exhibits, exhibit_tags)
//          VALUES ($1, $2, $3, $4, $5, $6::jsonb)
//          RETURNING building_ID, zone_ID, building_name, description, exhibits, exhibit_tags`,
//         [building_id, zone_id, building_name, description || null, exhibits || null, exhibit_tags ? JSON.stringify(exhibit_tags) : null]
//       );

//       // Maintain Exhibit_Tag_Map if exhibit_tags provided
//       if (exhibit_tags && typeof exhibit_tags === 'object') {
//         const entries = Object.entries(exhibit_tags);
//         for (const [exhibitName, tag] of entries) {
//           if (!exhibitName || !tag) continue;
//           await client.query(
//             `INSERT INTO Exhibit_Tag_Map (building_ID, exhibit_name, tag)
//              VALUES ($1, $2, $3)`,
//             [building_id, exhibitName, String(tag)]
//           );
//         }
//       }

//       await client.query('COMMIT');
//       res.status(201).json({ message: 'Building created successfully', building: result.rows[0] });
//     } catch (err) {
//       await client.query('ROLLBACK');
//       throw err;
//     } finally {
//       client.release();
//     }
//   } catch (err) {
//     if (err.code === '23505') {  // unique violation
//       if (err.constraint === 'building_pkey') {
//         return res.status(409).json({ message: 'Building ID already exists' });
//       } else if (err.constraint && err.constraint.includes('building_name')) {
//         return res.status(409).json({ message: 'Building name must be unique' });
//       }
//     }
//     console.error('Error creating building:', err);
//     res.status(500).json({ message: 'Database error', error: err.message });
//   }
// };

// ==============================
// UPDATE A BUILDING
// ==============================
const updateBuilding = async (req, res) => {
  const { id } = req.params;
  const { building_name, building_capacity, exhibits_to_add, exhibits_to_remove } = req.body;

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Update building basic info if provided
      if (building_name || building_capacity) {
        const result = await client.query(
          `UPDATE buildings
           SET building_name = COALESCE($1, building_name),
               building_capacity = COALESCE($2, building_capacity)
           WHERE building_id = $3
           RETURNING building_id, building_name, building_capacity`,
          [building_name || null, building_capacity || null, id]
        );

        if (result.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(404).json({ message: 'Building not found' });
        }
      }

      // Remove exhibits if specified
      if (exhibits_to_remove && Array.isArray(exhibits_to_remove)) {
        for (const exhibit_name of exhibits_to_remove) {
          await client.query(
            `DELETE FROM exhibits WHERE building_id = $1 AND exhibit_name = $2`,
            [id, exhibit_name]
          );
        }
      }

      // Add new exhibits if specified
      if (exhibits_to_add && Array.isArray(exhibits_to_add)) {
        for (const exhibit of exhibits_to_add) {
          const { exhibit_name, exhibit_tags } = exhibit;
          if (!exhibit_name) continue;
          
          await client.query(
            `INSERT INTO exhibits (exhibit_name, building_id, exhibit_tags)
             VALUES ($1, $2, $3::jsonb)
             ON CONFLICT (exhibit_name) DO UPDATE SET
             building_id = $2,
             exhibit_tags = $3::jsonb,
             updated_at = CURRENT_TIMESTAMP`,
            [exhibit_name, id, JSON.stringify(exhibit_tags || {})]
          );
        }
      }

      // Get updated building with all exhibits
      const updatedBuildingResult = await client.query(`
        SELECT 
          b.building_id,
          b.building_name,
          b.building_capacity,
          COALESCE(
            jsonb_object_agg(
              e.exhibit_name, 
              e.exhibit_tags
            ) FILTER (WHERE e.exhibit_name IS NOT NULL), 
            '{}'::jsonb
          ) AS exhibit_tags,
          COALESCE(
            array_agg(e.exhibit_name) FILTER (WHERE e.exhibit_name IS NOT NULL),
            '{}'::text[]
          ) AS exhibits
        FROM buildings b
        LEFT JOIN exhibits e ON b.building_id = e.building_id
        WHERE b.building_id = $1
        GROUP BY b.building_id, b.building_name, b.building_capacity
      `, [id]);

      await client.query('COMMIT');
      res.json({ 
        message: 'Building updated successfully', 
        building: updatedBuildingResult.rows[0] 
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Exhibit name already exists' });
    }
    console.error('Error updating building:', err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};


// ==============================
// DELETE A BUILDING
// ==============================
// const deleteBuilding = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const result = await pool.query(
//       `DELETE FROM Building
//        WHERE building_ID = $1
//        RETURNING building_ID, zone_ID, building_name, description, exhibits`,
//       [id]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: 'Building not found' });
//     }

//     res.json({ message: 'Building deleted successfully', building: result.rows[0] });
//   } catch (err) {
//     console.error('Error deleting building:', err);
//     res.status(500).json({ message: 'Database error', error: err.message });
//   }
// };



// ==============================
// GET BUILDINGS BY TAG
// ==============================
const getBuildingsByTag = async (req, res) => {
  const { tag } = req.query;

  // If no tag is provided, return all buildings
  if (!tag) {
    return getBuildings(req, res);
  }

  try {
    // Filter buildings that have exhibits with the specified tag (case-insensitive)
    const result = await pool.query(`
      SELECT 
        b.building_id,
        b.building_name,
        b.building_capacity,
        COALESCE(
          jsonb_object_agg(
            e.exhibit_name, 
            e.exhibit_tags
          ) FILTER (WHERE e.exhibit_name IS NOT NULL), 
          '{}'::jsonb
        ) AS exhibit_tags,
        COALESCE(
          array_agg(e.exhibit_name) FILTER (WHERE e.exhibit_name IS NOT NULL),
          '{}'::text[]
        ) AS exhibits
      FROM buildings b
      INNER JOIN exhibits e ON b.building_id = e.building_id
      WHERE EXISTS (
        SELECT 1
        FROM jsonb_each(e.exhibit_tags) AS tag_obj(key, value)
        WHERE EXISTS (
          SELECT 1
          FROM jsonb_array_elements_text(value) AS tag_value
          WHERE LOWER(tag_value) = LOWER($1)
        )
      )
      GROUP BY b.building_id, b.building_name, b.building_capacity
      ORDER BY b.building_id
    `, [tag]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No buildings found with exhibits containing the given tag' });
    }

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching buildings by tag:', err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// ==============================
// GET TAGS LIST
// ==============================
const getTags = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT tag
      FROM (
        SELECT jsonb_array_elements_text(jsonb_path_query_array(exhibit_tags, '$.*[*]')) AS tag
        FROM exhibits
        WHERE exhibit_tags IS NOT NULL AND exhibit_tags != '{}'::jsonb
      ) AS all_tags
      ORDER BY tag
    `);
    
    const tags = result.rows.map(row => row.tag);
    
    res.json({
      tags: tags
    });
  } catch (err) {
    console.error('Error fetching tags:', err);
    // Updated fallback with tags from your SQL data
    res.json({
      tags: [
        'AI',
        'Automation',
        'Chemical',
        'Civil',
        'Computer Science',
        'Construction',
        'Craftsmanship',
        'Design',
        'Electrical',
        'Electronics',
        'Engineering',
        'Environmental',
        'ICT',
        'Information',
        'Machine Learning',
        'Manufacturing',
        'Materials',
        'Mathematics',
        'Mechanical',
        'Precision',
        'Quantum',
        'Research',
        'Robotics',
        'Software',
        'Traditional'
      ]
    });
  }
};

module.exports = {
  getBuildings,
  getBuildingById,
  // createBuilding,
  updateBuilding,
  // deleteBuilding,
  getBuildingsByTag,
  getTags
};