const db = require('../config/db');

const saveLocation = async (userId, latitude, longitude) => {
  const query = `
    INSERT INTO locations (user_id, location) 
    VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326)) 
    RETURNING id, user_id, ST_X(location) as latitude, ST_Y(location) as longitude, created_at
  `;
  const values = [userId, latitude, longitude];
  const result = await db.query(query, values);
  return result.rows[0];
};

const getLastLocation = async (userId) => {
  const query = `
    SELECT id, user_id, ST_X(location) as latitude, ST_Y(location) as longitude, created_at 
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
    SELECT l.id, l.user_id, u.username, ST_X(l.location) as latitude, ST_Y(l.location) as longitude, l.created_at 
    FROM locations l
    JOIN users u ON l.user_id = u.id
    WHERE u.role = 'delivery'
    AND l.id IN (
      SELECT MAX(id) FROM locations GROUP BY user_id
    )
  `;
  const result = await db.query(query);
  return result.rows;
};

module.exports = {
  saveLocation,
  getLastLocation,
  getAllDeliveryLocations
};