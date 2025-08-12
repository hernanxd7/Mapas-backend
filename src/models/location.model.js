const db = require('../config/db');

const saveLocation = async (userId, latitude, longitude) => {
  const query = `
    INSERT INTO locations (user_id, location) 
    VALUES ($1, ST_SetSRID(ST_MakePoint($3, $2), 4326)) 
    RETURNING id, user_id, ST_Y(location::geometry) as latitude, ST_X(location::geometry) as longitude, created_at
  `;
  const values = [userId, latitude, longitude]; // Mantener el orden original
  const result = await db.query(query, values);
  return result.rows[0];
};

const getLastLocation = async (userId) => {
  const query = `
    SELECT id, user_id, ST_Y(location::geometry) as latitude, ST_X(location::geometry) as longitude, created_at 
    FROM locations 
    WHERE user_id = $1 
    ORDER BY created_at DESC 
    LIMIT 1
  `;
  const result = await db.query(query, [userId]);
  return result.rows[0];
};

const getAllDeliveryLocations = async () => {
  const query = `
    SELECT l.id, l.user_id, u.username, 
    ST_Y(l.location::geometry) as latitude, 
    ST_X(l.location::geometry) as longitude, 
    l.created_at 
    FROM locations l
    JOIN users u ON l.user_id = u.id
    WHERE u.role = 'delivery'
    AND l.id IN (
      SELECT MAX(id) FROM locations GROUP BY user_id
    )
    ORDER BY l.created_at DESC
  `;
  const result = await db.query(query);
  console.log('Ubicaciones encontradas:', result.rows.length, result.rows);
  return result.rows;
};

module.exports = {
  saveLocation,
  getLastLocation,
  getAllDeliveryLocations
};