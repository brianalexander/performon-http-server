const { createRoutingKey, LIVE_DATA_EXCHANGE } = require("../config/rabbitmq");

const DefaultDict = require("../utilities/DefaultDict");

const listenForRoutingKeys = new DefaultDict(0);
const socketToUserKey = new DefaultDict(null);

function subscribeToUserUUID(socket, channel, q, userUUID) {
  if (true) {
    const key = createRoutingKey("*", "http", "*", userUUID);

    socketToUserKey[socket.id] = key;

    listenForRoutingKeys[key]++;
    console.log(key, listenForRoutingKeys[key]);

    channel.bindQueue(q.queue, LIVE_DATA_EXCHANGE, key);
    socket.join(userUUID);
    console.log("Queue", q.queue, "listening to topic", key);
  }
}

function unsubscribeFromUserUUID(socket, channel, q, userUUID) {
  const key = socketToUserKey[socket.id];
  if (key !== null) {
    listenForRoutingKeys[key]--;
    console.log(key, listenForRoutingKeys[key]);

    if (listenForRoutingKeys[key] < 1) {
      channel.unbindQueue(q.queue, LIVE_DATA_EXCHANGE, key);
      console.log("Queue", q.queue, "stopped listening to topic", key);
    }
  }
}

function unsubscribeFromAllUserUUIDs(socket, channel, q) {
  console.log(`${socket.id} disconnected`);
  const key = socketToUserKey[socket.id];
  if (key !== null) {
    listenForRoutingKeys[key]--;
    console.log(key, listenForRoutingKeys[key]);

    if (listenForRoutingKeys[key] < 1) {
      channel.unbindQueue(q.queue, LIVE_DATA_EXCHANGE, key);
      console.log("Queue", q.queue, "stopped listening to topic", key);
    }
  }
}

module.exports = {
  subscribeToUserUUID,
  unsubscribeFromUserUUID,
  unsubscribeFromAllUserUUIDs
};
