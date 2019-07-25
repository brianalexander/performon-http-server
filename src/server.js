const server = require("./config/express");
const io = require("./config/socketio")(server);
const amqp = require("amqplib/callback_api");

const {
  DATABASE_EXCHANGE,
  LIVE_DATA_EXCHANGE,
  parseRoutingKey
} = require("./config/rabbitmq");

const {
  subscribeToUserUUID,
  unsubscribeFromUserUUID,
  unsubscribeFromAllUserUUIDs
} = require("./socketio/controller");

const AMQP_CONNECTION_URI = process.env.AMQP_CONNECTION_URI;

io.on("connection", socket => {
  console.log(`client ${socket.id} connected`);
});

//
// Start listening for data to RabbitMQ
//
amqp.connect(AMQP_CONNECTION_URI, (error0, connection) => {
  if (error0) {
    throw error0;
  }

  connection.createChannel((error1, channel) => {
    channel.assertExchange(DATABASE_EXCHANGE, "topic", { durable: false });
    channel.assertExchange(LIVE_DATA_EXCHANGE, "topic", { durable: false });

    channel.assertQueue("", { exclusive: true }, (error2, q) => {
      if (error2) {
        throw error2;
      }

      io.on("connection", socket => {
        socket.on("subscribeToUserUUID", userUUID => {
          // if userUUID is a valid key...
          subscribeToUserUUID(socket, channel, q, userUUID);
        });

        socket.on("unsubscribeFromUserUUID", userUUID => {
          console.log("unsubscribe called");
          unsubscribeFromUserUUID(socket, channel, q, userUUID);
        });

        socket.on("disconnect", () => {
          unsubscribeFromAllUserUUIDs(socket, channel, q);
        });
      });

      channel.consume(
        q.queue,
        msg => {
          console.log([msg.fields.routingKey]);
          const { source, destination, action, forwardTo } = parseRoutingKey(
            msg
          );
          if (source === "live" && action === "broadcast") {
            const data = JSON.parse(msg.content.toString());
            io.to(forwardTo).emit("performanceData", data);
            // console.log(data);
          }
          // channel.ack(msg);
        },
        {
          noAck: true
        }
      );
    });
  });
});

module.exports = server;
