const db = require('../config/db');

const createPackage = async (deliveryAddress, deliveryId) => {
  const query = 'INSERT INTO packages (delivery_address, delivery_id, status) VALUES ($1, $2, $3) RETURNING *';
  const values = [deliveryAddress, deliveryId, 'asignado'];
  const result = await db.query(query, values);
  return result.rows[0];
};

const getPackagesByDeliveryId = async (deliveryId) => {
  const query = 'SELECT * FROM packages WHERE delivery_id = $1';
  const result = await db.query(query, [deliveryId]);
  return result.rows;
};

const updatePackageStatus = async (packageId, status) => {
  const query = 'UPDATE packages SET status = $1 WHERE id = $2 RETURNING *';
  const result = await db.query(query, [status, packageId]);
  return result.rows[0];
};

const getAllPackages = async () => {
  const query = `
    SELECT p.*, u.username as delivery_name 
    FROM packages p
    LEFT JOIN users u ON p.delivery_id = u.id
  `;
  const result = await db.query(query);
  return result.rows;
};

module.exports = {
  createPackage,
  getPackagesByDeliveryId,
  updatePackageStatus,
  getAllPackages
};