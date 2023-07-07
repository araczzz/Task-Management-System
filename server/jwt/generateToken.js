const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateToken = ({ username }) => {
  return new Promise((resolve, reject) => {
    // create JWT token
    jwt.sign({ username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRE }, (error, result) => {
      // console.log(result);
      if (error) reject(error);
      else resolve(result);
    });
  });
};
module.exports = generateToken;
