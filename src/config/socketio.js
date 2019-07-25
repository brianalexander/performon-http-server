const socketio = require("socket.io");

module.exports = function(server) {
  const io = socketio(server);

  // allow CORS
  io.origins("*:*");
  return io;
};
