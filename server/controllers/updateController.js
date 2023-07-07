const bcrypt = require("bcryptjs");
const con = require("../config/database");
const ErrorHandler = require("../error/errorHandler");

const update_user = (req, res, next) => {
  let { username, password, email, groupString, isActive } = req.body;

  let trimUsername = username.trim();
  let trimEmail = email.trim();

  // Checking if username exists in database
  if (trimUsername) {
    const check_username_accounts = "SELECT * FROM accounts WHERE username = ?";
    con.query(check_username_accounts, [trimUsername], async function (err, result) {
      if (err) throw err;
      else if (result.length == 0) {
        return next(new ErrorHandler("Username does not exist in database. Please enter a valid username."));
      } else {
        // Validating password
        if (password) {
          const minNumberOfChars = 8;
          const maxNumberOfChars = 10;
          const regularExpression = /^(?=.*[A-Za-z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]/;
          if (password.length < minNumberOfChars || password.length > maxNumberOfChars) {
            return next(new ErrorHandler("Password length must be 8-10 characters long!"));
          } else if (!regularExpression.test(password)) {
            return next(new ErrorHandler("Password must contain alphabets, numbers and special symbols."));
          } else {
            let hash = await bcrypt.hash(password, 10);
            // Checking if email exists in database
            if (trimEmail) {
              const check_email_accounts = "SELECT * FROM accounts WHERE email = ?";
              con.query(check_email_accounts, [trimEmail], function (err, result) {
                if (err) throw err;
                else if (result.length > 0) {
                  return next(new ErrorHandler("Email already exists in database. Please try again."));
                } else {
                  const select_sql_accounts = "SELECT * FROM accounts WHERE username = ?";
                  con.query(select_sql_accounts, [trimUsername], function (err, result) {
                    if (err) throw err;
                    else {
                      let oldPassword = result[0].password;
                      let oldEmail = result[0].email;
                      let oldGroupName = result[0].groupName;
                      let oldIsActive = result[0].isActive;
                      if (password === "") {
                        password = oldPassword;
                      } else {
                        password = hash;
                      }
                      if (trimEmail === "") {
                        trimEmail = oldEmail;
                      }
                      let newGroupString = "";
                      let oldGroupArray = "";
                      let newGroupArray = "";
                      if (groupString === "") {
                        groupString = oldGroupName;
                        oldGroupArray = oldGroupName.split(",");
                      } else {
                        oldGroupArray.split(",");
                        newGroupArray = groupString.split(",");
                      }
                      for (let i = 0; i < newGroupArray.length; i++) {
                        if (!oldGroupArray.includes(newGroupArray[i])) {
                          oldGroupArray.push(newGroupArray[i]);
                        }
                      }
                      // newGroupString contains only unqiue values of groupnames (so wont duplicate)
                      newGroupString = oldGroupArray.toString();
                      if (isActive === "") {
                        isActive = oldIsActive;
                      }
                      // To update database
                      const update_sql_accounts = "UPDATE accounts SET password = ?, email = ?, groupName = ?, isActive = ? WHERE username = ?";
                      con.query(update_sql_accounts, [password, trimEmail, newGroupString, isActive, trimUsername], function (err, result) {
                        if (err) throw err;
                        else {
                          res.send(result);
                          if (groupString === "") {
                            return;
                          } else {
                            let checkGroupArray = newGroupString.split(",");
                            for (let i = 0; i < checkGroupArray.length; i++) {
                              if (checkGroupArray[i] === "") {
                                continue;
                              }
                              let compositeGroup = checkGroupArray[i];
                              const check_sql_usergroup = "SELECT * FROM usergroup WHERE username = ? AND groupName = ?";
                              con.query(check_sql_usergroup, [trimUsername, compositeGroup], function (err, result) {
                                if (err) throw err;
                                else if (result.length == 0) {
                                  const insert_sql_usergroup = "INSERT INTO usergroup VALUES (?,?)";
                                  con.query(insert_sql_usergroup, [trimUsername, compositeGroup], function (err, result) {
                                    if (err) throw err;
                                  });
                                }
                              });
                            }
                          }
                        }
                      });
                    }
                  });
                }
              });
            } else {
              // Passed: User entered email and email does not exist in database
              const select_sql_accounts = "SELECT * FROM accounts WHERE username = ?";
              con.query(select_sql_accounts, [trimUsername], async function (err, result) {
                if (err) throw err;
                else {
                  let hash = await bcrypt.hash(password, 10);
                  let oldPassword = result[0].password;
                  let oldEmail = result[0].email;
                  let oldGroupName = result[0].groupName;
                  let oldIsActive = result[0].isActive;
                  if (password === "") {
                    password = oldPassword;
                  } else {
                    password = hash;
                  }
                  if (trimEmail === "") {
                    trimEmail = oldEmail;
                  }
                  let newGroupString = "";
                  let oldGroupArray = "";
                  let newGroupArray = "";
                  if (groupString === "") {
                    groupString = oldGroupName;
                    oldGroupArray = oldGroupName.split(",");
                  } else {
                    oldGroupArray = oldGroupName.split(",");
                    newGroupArray = groupString.split(",");
                  }
                  for (let i = 0; i < newGroupArray.length; i++) {
                    if (!oldGroupArray.includes(newGroupArray[i])) {
                      oldGroupArray.push(newGroupArray[i]);
                    }
                  }
                  // newGroupString contains only unqiue values of groupnames (so wont duplicate)
                  newGroupString = oldGroupArray.toString();
                  if (isActive === "") {
                    isActive = oldIsActive;
                  }
                  // To update database
                  const update_sql_accounts = "UPDATE accounts SET password = ?, email = ?, groupName = ?, isActive = ? WHERE username = ?";
                  con.query(update_sql_accounts, [password, trimEmail, newGroupString, isActive, trimUsername], function (err, result) {
                    if (err) throw err;
                    else {
                      res.send(result);
                      if (groupString === "") {
                        return;
                      } else {
                        let checkGroupArray = newGroupString.split(",");
                        for (let i = 0; i < checkGroupArray.length; i++) {
                          if (checkGroupArray[i] === "") {
                            continue;
                          }
                          let compositeGroup = checkGroupArray[i];
                          const check_sql_usergroup = "SELECT * FROM usergroup WHERE username = ? AND groupName = ?";
                          con.query(check_sql_usergroup, [trimUsername, compositeGroup], function (err, result) {
                            if (err) throw err;
                            else if (result.length == 0) {
                              const insert_sql_usergroup = "INSERT INTO usergroup VALUES (?,?)";
                              con.query(insert_sql_usergroup, [trimUsername, compositeGroup], function (err, result) {
                                if (err) throw err;
                              });
                            }
                          });
                        }
                      }
                    }
                  });
                }
              });
            }
          }
        } else {
          if (trimEmail) {
            const check_email_accounts = "SELECT * FROM accounts WHERE email = ?";
            con.query(check_email_accounts, [trimEmail], function (err, result) {
              if (err) throw err;
              else if (result.length > 0) {
                return next(new ErrorHandler("Email already exists in database. Please try again."));
              } else {
                // Passed: User entered email and email does not exist in database
                const select_sql_accounts = "SELECT * FROM accounts WHERE username = ?";
                con.query(select_sql_accounts, [trimUsername], function (err, result) {
                  if (err) throw err;
                  else {
                    let password = result[0].password;
                    let oldEmail = result[0].email;
                    let oldGroupName = result[0].groupName;
                    let oldIsActive = result[0].isActive;
                    if (trimEmail === "") {
                      trimEmail = oldEmail;
                    }
                    let newGroupString = "";
                    let oldGroupArray = "";
                    let newGroupArray = "";
                    if (groupString === "") {
                      groupString = oldGroupName;
                      oldGroupArray = oldGroupName.split(",");
                    } else {
                      oldGroupArray = oldGroupName.split(",");
                      newGroupArray = groupString.split(",");
                    }
                    for (let i = 0; i < newGroupArray.length; i++) {
                      if (!oldGroupArray.includes(newGroupArray[i])) {
                        oldGroupArray.push(newGroupArray[i]);
                      }
                    }
                    // newGroupString contains only unqiue values of groupnames (so wont duplicate)
                    newGroupString = oldGroupArray.toString();
                    if (isActive === "") {
                      isActive = oldIsActive;
                    }
                    // To update database
                    const update_sql_accounts = "UPDATE accounts SET password = ?, email = ?, groupName = ?, isActive = ? WHERE username = ?";
                    con.query(update_sql_accounts, [password, trimEmail, newGroupString, isActive, trimUsername], function (err, result) {
                      if (err) throw err;
                      else {
                        res.send(result);
                        if (groupString === "") {
                          return;
                        } else {
                          let checkGroupArray = newGroupString.split(",");
                          for (let i = 0; i < checkGroupArray.length; i++) {
                            if (checkGroupArray[i] === "") {
                              continue;
                            }
                            let compositeGroup = checkGroupArray[i];
                            const check_sql_usergroup = "SELECT * FROM usergroup WHERE username = ? AND groupName = ?";
                            con.query(check_sql_usergroup, [trimUsername, compositeGroup], function (err, result) {
                              if (err) throw err;
                              else if (result.length == 0) {
                                const insert_sql_usergroup = "INSERT INTO usergroup VALUES (?,?)";
                                con.query(insert_sql_usergroup, [trimUsername, compositeGroup], function (err, result) {
                                  if (err) throw err;
                                });
                              }
                            });
                          }
                        }
                      }
                    });
                  }
                });
              }
            });
          } else {
            // Passed: User entered email and email does not exist in database
            const select_sql_accounts = "SELECT * FROM accounts WHERE username = ?";
            con.query(select_sql_accounts, [trimUsername], function (err, result) {
              if (err) throw err;
              else {
                let password = result[0].password;
                let oldEmail = result[0].email;
                let oldGroupName = result[0].groupName;
                let oldIsActive = result[0].isActive;
                // if (password === "") {
                //   password = oldPassword;
                // }
                if (trimEmail === "") {
                  trimEmail = oldEmail;
                }
                let newGroupString = "";
                let oldGroupArray = "";
                let newGroupArray = "";
                if (groupString === "") {
                  groupString = oldGroupName;
                  oldGroupArray = oldGroupName.split(",");
                } else {
                  oldGroupArray = oldGroupName.split(",");
                  newGroupArray = groupString.split(",");
                }
                for (let i = 0; i < newGroupArray.length; i++) {
                  if (!oldGroupArray.includes(newGroupArray[i])) {
                    oldGroupArray.push(newGroupArray[i]);
                  }
                }
                // newGroupString contains only unqiue values of groupnames (so wont duplicate)
                newGroupString = oldGroupArray.toString();
                if (isActive === "") {
                  isActive = oldIsActive;
                }
                // To update database
                const update_sql_accounts = "UPDATE accounts SET password = ?, email = ?, groupName = ?, isActive = ? WHERE username = ?";
                con.query(update_sql_accounts, [password, trimEmail, newGroupString, isActive, trimUsername], function (err, result) {
                  if (err) throw err;
                  else {
                    res.send(result);
                    if (groupString === "") {
                      return;
                    } else {
                      let checkGroupArray = newGroupString.split(",");
                      for (let i = 0; i < checkGroupArray.length; i++) {
                        if (checkGroupArray[i] === "") {
                          continue;
                        }
                        let compositeGroup = checkGroupArray[i];
                        const check_sql_usergroup = "SELECT * FROM usergroup WHERE username = ? AND groupName = ?";
                        con.query(check_sql_usergroup, [trimUsername, compositeGroup], function (err, result) {
                          if (err) throw err;
                          else if (result.length == 0) {
                            const insert_sql_usergroup = "INSERT INTO usergroup VALUES (?,?)";
                            con.query(insert_sql_usergroup, [trimUsername, compositeGroup], function (err, result) {
                              if (err) throw err;
                            });
                          }
                        });
                      }
                    }
                  }
                });
              }
            });
          }
        }
      }
    });
  } else {
    return next(new ErrorHandler("Please enter a username!"));
  }
};

const get_group_update = (req, res, next) => {
  check_sql_groups = "SELECT * FROM groupdescription";
  con.query(check_sql_groups, function (err, result) {
    if (err) throw err;
    res.send(result);
  });
};

module.exports = { update_user, get_group_update };
