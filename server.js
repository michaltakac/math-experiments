const express = require("express");
const next = require("next");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const glob = require("glob");
const nextI18NextMiddleware = require("next-i18next/middleware");

const nextI18next = require("./i18n");

const app = next({ dev: process.env.NODE_ENV !== "production" });
const handle = app.getRequestHandler();

const PORT = 3000;

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb://localhost/nextjs-express-boilerplate"(async () => {
    await app.prepare();
    const server = express();

    server.use(nextI18NextMiddleware(nextI18next));

    // Parse application/x-www-form-urlencoded
    server.use(bodyParser.urlencoded({ extended: false }));
    // Parse application/json
    server.use(bodyParser.json());

    // Allows for cross origin domain request:
    server.use(function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      next();
    });

    // MongoDB
    mongoose.connect(MONGODB_URI, { useMongoClient: true });
    var db = mongoose.connection;
    db.on("error", console.error.bind(console, "connection error:"));

    // API routes
    const rootPath = require("path").normalize(__dirname + "/..");
    glob
      .sync(rootPath + "/server/routes/*.js")
      .forEach(controllerPath => require(controllerPath)(server));

    server.get("*", (req, res) => handle(req, res));

    await server.listen(PORT);
    console.log(`> Ready on http://localhost:${PORT}`); // eslint-disable-line no-console
  })();
