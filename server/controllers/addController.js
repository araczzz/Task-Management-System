const bcrypt = require("bcryptjs");
const con = require("../config/database");
const ErrorHandler = require("../error/errorHandler");

const add_user = (req, res, next) => {
  const { username, password, email, groupString, isActive } = req.body;

  // Checking if username contains whitespaces or if username already exists in database
  if (username) {
    const regularExpressionUsername = /^\S*$/; //  a string consisting only of non-whitespaces.
    if (!regularExpressionUsername.test(username)) {
      return next(new ErrorHandler("Username cannot contain spaces."));
    } else {
      const check_username_accounts = "SELECT * FROM accounts WHERE username = ?";
      con.query(check_username_accounts, [username], async function (err, result) {
        if (err) throw err;
        else if (result.length > 0) {
          return next(new ErrorHandler("Username already exists in database. Please try again."));
        } else {
          // Password validation
          if (password) {
            const minNumberOfChars = 8;
            const maxNumberOfChars = 10;
            const regularExpressionPassword = /^(?=.*[A-Za-z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]/;
            if (password.length < minNumberOfChars || password.length > maxNumberOfChars) {
              return next(new ErrorHandler("Password length must be 8-10 characters long!"));
            } else if (!regularExpressionPassword.test(password)) {
              return next(new ErrorHandler("Password must contain alphabets, numbers and special symbols!"));
            } else {
              // Checking if email exists
              if (email) {
                const check_email_accounts = "SELECT * FROM accounts WHERE email = ?";
                con.query(check_email_accounts, [email], async function (err, result) {
                  if (err) throw err;
                  else if (result.length > 0) {
                    return next(new ErrorHandler("Email already exists in database. Please try again."));
                  } else {
                    const hash = await bcrypt.hash(password, 10);

                    const into_sql_accounts = "INSERT INTO accounts (username, password, email, groupName, isActive) VALUES (?,?,?,?,?)";
                    con.query(into_sql_accounts, [username, hash, email, groupString, isActive], function (err, result) {
                      if (err) throw err;
                      else {
                        res.send(result);
                        if (groupString == "") {
                          return;
                        } else {
                          let groupArray = groupString.split(",");
                          for (let i = 0; i < groupArray.length; i++) {
                            const into_sql_usergroup = "INSERT INTO usergroup (username, groupName) VALUES (?,?)";
                            con.query(into_sql_usergroup, [username, groupArray[i]], function (err, result) {
                              if (err) throw err;
                            });
                          }
                        }
                      }
                    });
                  }
                });
              } else {
                // no email
                let blankEmail = "";

                const hash = await bcrypt.hash(password, 10);

                const into_sql_accounts = "INSERT INTO accounts (username, password, email, groupname, isActive) VALUES (?,?,?,?,?)";
                con.query(into_sql_accounts, [username, hash, blankEmail, groupString, isActive], function (err, result) {
                  if (err) throw err;
                  else {
                    res.send(result);
                    if (groupString == "") {
                      return;
                    } else {
                      let groupArray = groupString.split(",");
                      for (let i = 0; i < groupArray.length; i++) {
                        const into_sql_usergroup = "INSERT INTO usergroup (username, groupName) VALUES (?,?)";
                        con.query(into_sql_usergroup, [username, groupArray[i]], function (err, result) {
                          if (err) throw err;
                        });
                      }
                    }
                  }
                });
              }
            }
          } else {
            return next(new ErrorHandler("Please enter a password!"));
          }
        }
      });
    }
  } else {
    return next(new ErrorHandler("Please enter a username!"));
  }
};

const get_group = (req, res, next) => {
  check_sql_groups = "SELECT * FROM groupdescription";
  con.query(check_sql_groups, function (err, result) {
    if (err) throw err;
    res.send(result);
  });
};

module.exports = { add_user, get_group };
