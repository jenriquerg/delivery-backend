const pool = require("../db");

let ioInstance = null;

// Mapa para asociar socket.id -> userId
const socketUserMap = new Map();

function initSocket(io) {
  ioInstance = io;

  io.on("connection", (socket) => {
    console.log("Cliente conectado:", socket.id);

    // Unir socket a sala según rol
    socket.on("join", (role) => {
      socket.join(role);
      console.log(`Socket ${socket.id} joined to ${role}`);
    });

    // Recibir ubicación y guardar userId asociado al socket
    socket.on("locationUpdate", async ({ userId, lat, lng }) => {
      console.log('Evento locationUpdate recibido:', { userId, lat, lng });

      // Guardamos la asociación socketId -> userId
      socketUserMap.set(socket.id, userId);

      try {
        // Guardar ubicación en DB
        await pool.query(
          `INSERT INTO locations (user_id, location) 
           VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography)`,
          [userId, lng, lat]
        );
        console.log(`Ubicación guardada para usuario ${userId}: ${lat}, ${lng}`);

        // Actualizar estado del usuario a 'working' porque está conectado y activo
        await pool.query(
          `UPDATE users SET status = 'working' WHERE id = $1`,
          [userId]
        );

        // Emitir actualización a admins
        io.to("admin").emit("locationUpdate", { userId, lat, lng });
      } catch (err) {
        console.error("Error al guardar/enviar ubicación por socket:", err);
      }
    });

    socket.on("disconnect", async () => {
      console.log("Cliente desconectado:", socket.id);

      // Obtener userId asociado a este socket
      const userId = socketUserMap.get(socket.id);

      if (userId) {
        try {
          // Actualizar estado del usuario a 'off' porque se desconectó
          await pool.query(
            `UPDATE users SET status = 'off' WHERE id = $1`,
            [userId]
          );
          console.log(`Estado del usuario ${userId} actualizado a 'off'`);

          // Eliminar la asociación
          socketUserMap.delete(socket.id);
        } catch (err) {
          console.error("Error al actualizar estado en desconexión:", err);
        }
      }
    });
  });
}

module.exports = { initSocket };
