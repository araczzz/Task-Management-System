const bcrypt = require("bcryptjs");
const con = require("../config/database");
const ErrorHandler = require("../error/errorHandler");

const update_user_details = async (req, res, next) => {
  let { username, password, email } = req.body;

  if (password === "" && email === "") {
    return next(new ErrorHandler("Please fill in your password and/or email."));
  }

  if (password) {
    const minNumberOfChars = 8;
    const maxNumberOfChars = 10;
    const regularExpression = /^(?=.*[A-Za-z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]/;
    if (password.length < minNumberOfChars || password.length > maxNumberOfChars) {
      return next(new ErrorHandler("Password must be 8-10 characters long."));
    }
    if (!regularExpression.test(password)) {
      return next(new ErrorHandler("Password must contain alphabets, numbers and special symbols."));
    }
    if (email) {
      const select_sql_accounts = `SELECT * FROM accounts WHERE email = ?`;
      con.query(select_sql_accounts, [email], async function (err, result) {
        if (err) throw err;
        if (result.length > 0) {
          return next(new ErrorHandler("Email already exist. Please try another email."));
        } else {
          const hash = await bcrypt.hash(password, 10);

          const update_sql_accounts = `UPDATE accounts SET password = ?, email = ? WHERE username = ?`;
          con.query(update_sql_accounts, [hash, email, username], function (err, result) {
            if (err) throw err;
            res.send(result);
          });
        }
      });
    } else {
      const hash = await bcrypt.hash(password, 10);
      const update_sql_accounts = `UPDATE accounts SET password = ? WHERE username = ?`;
      con.query(update_sql_accounts, [hash, username], function (err, result) {
        if (err) throw err;
        res.send(result);
      });
    }
  } else {
    if (email) {
      const select_sql_accounts = `SELECT * FROM accounts WHERE email = ?`;
      con.query(select_sql_accounts, [email], async function (err, result) {
        if (err) throw err;
        if (result.length > 0) {
          return next(new ErrorHandler("Email already exist. Please try another email."));
        } else {
          const update_sql_accounts = `UPDATE accounts SET email = ? WHERE username = ?`;
          con.query(update_sql_accounts, [email, username], function (err, result) {
            if (err) throw err;
            res.send(result);
          });
        }
      });
    }
  }
};

module.exports = { update_user_details };
