// Gathering the required fields
const express = require("express");
const app = express();
const session = require("express-session");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

// Error Middleware
const errorMiddleware = require("./middlewares/errors");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Body Parser allows express to read the body and then parse that into a JSON object.
// Parses the URL-encoded data
app.use(bodyParser.urlencoded({ extended: true }));

// Setting up port 3002 for Backend
const port = process.env.API_PORT;

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
  })
);

// Importing all routes
const routeRoute = require("./routes/routes");

// Sending all /api routes to routeRoute
app.use("/api", routeRoute);

app.use("*", (req, res) => {
  res.send({ code: 4004 });
});

// Middleware to handle errors
app.use(errorMiddleware);

app.listen(port, function (err) {
  if (err) console.log("Error in server setup");
  console.log(`Server is listening on Port: ${port}`);
});
