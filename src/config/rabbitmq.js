module.exports = {
  DATABASE_EXCHANGE: "topic_data_database",
  LIVE_DATA_EXCHANGE: "topic_data_live",
  LISTEN_ALL_DATABASE_MESSAGES_ROUTING_KEY: "*.database.#",
  createRoutingKey: function(source, destination, action, forwardId = null) {
    const routingKey = [source, destination, action];
    forwardId !== null ? routingKey.push(forwardId) : null;
    return routingKey.join(".");
  },
  parseRoutingKey: function(msg) {
    const [
      source,
      destination,
      action,
      forwardTo
    ] = msg.fields.routingKey.split(".");

    return { source, destination, action, forwardTo };
  }
};
