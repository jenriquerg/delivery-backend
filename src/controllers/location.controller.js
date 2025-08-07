const pool = require('../db');

// Guardar ubicación del delivery
exports.saveLocation = async (req, res) => {
  const { lat, lng } = req.body;
  const userId = req.user.id;

  try {
    await pool.query(
      `INSERT INTO locations (user_id, location) VALUES ($1, ST_GeographyFromText('SRID=4326;POINT(' || $2 || ' ' || $3 || ')'))`,
      [userId, lng, lat]
    );
    res.status(200).json({ message: 'Ubicación guardada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al guardar ubicación' });
  }
};

// Obtener la última ubicación de cada delivery
exports.getLatestLocations = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.username, u.status, 
             ST_X(l.location::geometry) AS lng, 
             ST_Y(l.location::geometry) AS lat
      FROM users u
      JOIN LATERAL (
        SELECT * FROM locations 
        WHERE user_id = u.id 
        ORDER BY timestamp DESC 
        LIMIT 1
      ) l ON true
      WHERE u.role = 'delivery'
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener ubicaciones' });
  }
};
