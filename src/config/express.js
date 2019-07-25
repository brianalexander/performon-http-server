const http = require("http");
const helmet = require("helmet");
const express = require("express");

// Create Express App
const app = express();

// Apply Middlewares
app.use(helmet());
// app.use(express.static(__dirname + "/public"));

// Create Server
const server = http.createServer(app);

module.exports = server;
