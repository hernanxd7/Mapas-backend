const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Función para probar la conexión a la base de datos
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Conexión a Supabase establecida correctamente');
    console.log(`📊 Base de datos: ${process.env.DB_NAME}`);
    console.log(`🖥️ Host: ${process.env.DB_HOST}`);
    console.log(`👤 Usuario: ${process.env.DB_USER}`);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con Supabase:', error.message);
    return false;
  }
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  testConnection
};