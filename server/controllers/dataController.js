const con = require("../config/database");

const send_accounts_info = (req, res, next) => {
  con.query("SELECT * FROM accounts", function (err, result) {
    if (err) throw err;
    res.send(result);
  });
};

const send_group_info = (req, res, next) => {
  con.query("SELECT * FROM groupdescription", function (err, result) {
    if (err) throw err;
    res.send(result);
  });
};

const get_table_data = (req, res, next) => {
  let isActive = req.body.isActive;
  let username = req.body.username;
  let trimUsername = username.trim();
  let groupName = req.body.groupName;
  let email = req.body.email;
  let trimEmail = email.trim();

  insert_into_accounts = "UPDATE accounts SET email = ?, groupName = ?, isActive = ? WHERE username = ?";
  con.query(insert_into_accounts, [trimEmail, groupName, isActive, username], function (err, result) {
    if (err) throw err;
    res.send(result);
  });
};

module.exports = { send_accounts_info, send_group_info, get_table_data };
