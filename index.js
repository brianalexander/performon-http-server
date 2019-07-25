require("dotenv").config();

const server = require("./src/server");

const PORT = process.env.PORT;

server.listen(PORT, () => {
  console.log("Listening for connections on port 8080. To exit press CTRL+C");
});
