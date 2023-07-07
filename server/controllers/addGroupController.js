const con = require("../config/database");
const ErrorHandler = require("../error/errorHandler");

const add_usergroup = (req, res, next) => {
  let username = req.body.username;
  let groupName = req.body.group;

  username = username.trim();

  if (username === "" && groupName.length === 0) {
    return next(new ErrorHandler("Please fill in both input fields."));
  }

  if (username) {
    const select_sql_accounts = `SELECT * FROM accounts WHERE username = ?`;
    con.query(select_sql_accounts, [username], function (err, result) {
      if (err) throw err;
      if (result.length > 0) {
        if (groupName.length > 0) {
          const select_sql_accounts = `SELECT * FROM accounts WHERE username = ?`;
          con.query(select_sql_accounts, [username], function (err, result) {
            if (err) throw err;

            let oldGroupName = result[0].groupName;
            let oldGroupArray = oldGroupName.split(",");

            for (let i = 0; i < groupName.length; i++) {
              if (!oldGroupArray.includes(groupName[i])) {
                oldGroupArray.push(groupName[i]);
              }
            }
            // newGroupString contains only unqiue values of groupnames (so wont duplicate)
            let newGroupString = oldGroupArray.toString();

            const update_sql_accounts = `UPDATE accounts SET groupName = ? WHERE username = ?`;
            con.query(update_sql_accounts, [newGroupString, username], function (err, result) {
              if (err) throw err;
              res.send(result);

              for (let i = 0; i < groupName.length; i++) {
                let newGroupName = groupName[i];
                const select_sql_usergroup = `SELECT * FROM usergroup WHERE groupName = ? AND username = ?`;
                con.query(select_sql_usergroup, [newGroupName, username], function (err, result) {
                  if (err) throw err;

                  if (result.length === 0) {
                    const insert_sql_usergroup = `INSERT INTO usergroup VALUES (?,?)`;
                    con.query(insert_sql_usergroup, [username, newGroupName], function (err, result) {
                      if (err) throw err;
                    });
                  }
                });
              }
            });
          });
        } else {
          return next(new ErrorHandler("Please fill in usergroup(s) to be added."));
        }
      } else {
        return next(new ErrorHandler("Username does not exist. Please try again."));
      }
    });
  } else {
    return next(new ErrorHandler("Please enter a username."));
  }
};

module.exports = { add_usergroup };
