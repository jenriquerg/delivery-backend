const pool = require('../db');

// GET /api/packages → Paquetes asignados al usuario (si es delivery)
exports.getAssignedPackages = async (req, res) => {
  const userId = req.user.id;
  const role = req.user.role;

  try {
    if (role === 'delivery') {
      const result = await pool.query(
        'SELECT * FROM packages WHERE delivery_id = $1',
        [userId]
      );
      return res.json(result.rows);
    }

    // si es admin, retorna todos
    const result = await pool.query('SELECT * FROM packages');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener paquetes' });
  }
};

// PUT /api/packages/:id → Cambiar status de paquete
exports.updatePackageStatus = async (req, res) => {
  const packageId = req.params.id;
  const { status } = req.body;

  try {
    await pool.query(
      'UPDATE packages SET status = $1 WHERE id = $2',
      [status, packageId]
    );
    res.json({ message: 'Estado actualizado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar estado' });
  }
};

// POST /api/packages/assign → Asignar paquete a un delivery
exports.assignPackageToDelivery = async (req, res) => {
  const { direccion_entrega, delivery_id } = req.body;

  try {
    await pool.query(
      'INSERT INTO packages (delivery_id, direccion_entrega) VALUES ($1, $2)',
      [delivery_id, direccion_entrega]
    );
    res.json({ message: 'Paquete asignado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al asignar paquete' });
  }
};
