const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = token => {
  return new Promise((resolve, reject) => {
    if (token == null) return resolve("Please Login");

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, user) => {
      if (error) return resolve(false);
      else return resolve(true);
    });
  });
};

module.exports = verifyToken;
