const bcrypt = require("bcryptjs");
const ErrorHandler = require("../error/errorHandler");
const con = require("../config/database");
const generateToken = require("../jwt/generateToken");
require("dotenv").config();

const login_page = (req, res, next) => {
  let username = req.body.username;
  let password = req.body.password;

  // Checking if both username exists
  if (username && password) {
    let regularExpressionUsername = /^\S*$/; //  a string consisting only of non-whitespaces.

    // Checking if username contains white spaces
    if (!regularExpressionUsername.test(username)) {
      return next(new ErrorHandler("Username must contain no whitespaces!"));
    } else {
      check_sql_accounts = "SELECT * FROM accounts WHERE username = ?";
      con.query(check_sql_accounts, [username], async function (err, result) {
        if (err) throw err;
        // Checking if username exists in database
        else if (result.length > 0) {
          const validPass = await bcrypt.compare(password, result[0].password);
          if (validPass) {
            // Checking if account if Active
            if (result[0].isActive === "Active") {
              const accessToken = await generateToken({ username });
              res.send(JSON.stringify({ username, accessToken }));
            } else {
              return next(new ErrorHandler("Your account has been disabled. Please look for an admin!"));
            }
          } else {
            return next(new ErrorHandler("You have entered an incorrect username and/or password. Please try again."));
          }
        } else {
          return next(new ErrorHandler("You have entered an incorrect username and/or password. Please try again."));
        }
      });
    }
  } else {
    return next(new ErrorHandler("Please fill in all input fields!"));
  }
};

module.exports = { login_page };
