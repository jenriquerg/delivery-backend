// socket.js o server.js (donde configures el socket.io)
const pool = require("../db");

let ioInstance = null;

function initSocket(io) {
  ioInstance = io;

  io.on("connection", (socket) => {
    console.log("Cliente conectado:", socket.id);

    // Unir socket a sala según rol (ejemplo: 'admin' o 'delivery')
    socket.on("join", (role) => {
      socket.join(role);
      console.log(`Socket ${socket.id} joined to ${role}`);
    });

    // Evento para recibir ubicación y guardarla en DB
    socket.on("locationUpdate", async ({ userId, lat, lng }) => {
        console.log('Evento locationUpdate recibido:', { userId, lat, lng });
      try {
        await pool.query(
          `INSERT INTO locations (user_id, location) 
           VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography)`,
          [userId, lng, lat]
        );
        console.log(`Ubicación guardada para usuario ${userId}: ${lat}, ${lng}`);

        // Emitir la actualización a todos los admins conectados
        io.to("admin").emit("locationUpdate", { userId, lat, lng });
      } catch (err) {
        console.error("Error al guardar/enviar ubicación por socket:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("Cliente desconectado:", socket.id);
    });
  });
}

module.exports = { initSocket };
