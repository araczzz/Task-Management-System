const con = require("../config/database");
const ErrorHandler = require("../error/errorHandler");

const remove_userGroup = (req, res, next) => {
  let username = req.body.username;
  let groupName = req.body.group;

  // Checking if username exists in database (MySQL)
  if (username) {
    const regularExpressionUsername = /^\S*$/; //  a string consisting only of non-whitespaces.
    if (!regularExpressionUsername.test(username)) {
      return next(new ErrorHandler("Username contains white spaces."));
    } else {
      const check_sql_accounts = "SELECT groupName FROM accounts WHERE username = ?";
      con.query(check_sql_accounts, [username], function (err, result) {
        if (err) throw err;
        else if (result.length === 0) {
          return next(new ErrorHandler("Username does not exist. Please try again."));
        } else {
          // Checking if user group was entered
          if (groupName.length > 0) {
            const check_sql_accounts_again = "SELECT * FROM accounts WHERE username = ?";
            con.query(check_sql_accounts_again, [username], function (err, result) {
              if (err) throw err;
              else {
                let oldGroupString = result[0].groupName;
                oldGroupArray = oldGroupString.split(",");
                let removeGroupArray = groupName;
                let newGroupArray = [];
                for (let i = 0; i < oldGroupArray.length; i++) {
                  if (!removeGroupArray.includes(oldGroupArray[i])) {
                    newGroupArray.push(oldGroupArray[i]);
                  }
                }
                let newGroupString = newGroupArray.toString();
                const update_sql_accounts = "UPDATE accounts SET groupName = ? WHERE username = ?";
                con.query(update_sql_accounts, [newGroupString, username], function (err, result) {
                  if (err) throw err;
                  else {
                    res.send(result);
                  }
                });
              }
            });
          } else {
            return next(new ErrorHandler("Please enter a user group"));
          }
        }
      });
    }
  } else {
    return next(new ErrorHandler("Please enter a username."));
  }
};

const get_group_update_removeController = (req, res, next) => {
  check_sql_groups = "SELECT * FROM groupdescription";
  con.query(check_sql_groups, function (err, result) {
    if (err) throw err;
    res.send(result);
  });
};

module.exports = { remove_userGroup, get_group_update_removeController };
