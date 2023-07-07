const con = require("../config/database");

function Checkgroup(username, groupName) {
  check_sql_accounts = "SELECT * FROM accounts WHERE username = ?";
  con.query(check_sql_accounts, [username], function (err, result) {
    let answer = "";
    if (err) throw err;
    else if (result.length === 0) {
      return false;
      //   return next(new ErrorHandler("Username does not exist. Please try again"));
    } else {
      let groupString = result[0].groupName;
      let groupArray = groupString.split(",");

      if (groupArray.includes(groupName)) {
        answer = "true";
      } else {
        answer = "false";
      }
    }
    return answer;
  });
}

Checkgroup("lowjiewei", "Admin");
