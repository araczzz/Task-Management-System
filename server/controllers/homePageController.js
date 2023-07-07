const con = require("../config/database");

const send_user_info = (req, res, next) => {
  let username = req.body.username;
  check_sql_accounts = "SELECT * FROM accounts WHERE username = ?";
  con.query(check_sql_accounts, [username], function (err, result) {
    if (err) throw err;
    else {
      let email = result[0].email;
      let isActive = result[0].isActive;
      let groupName = result[0].groupName;

      const jsonData = { username, groupName, email, isActive };
      res.send(JSON.stringify(jsonData));
    }
  });
};

// checkgroup function (returns a value to indicate if a user is in a group)
const checkgroup = (req, res, next) => {
  // From FrontEnd ReactJS
  let username = req.body.username;
  let groupName = req.body.groupName;

  const check_sql_accounts = `SELECT * FROM accounts WHERE username = ?`;
  con.query(check_sql_accounts, [username], function (err, result) {
    if (err) throw err;
    else {
      let groupString = result[0].groupName;
      let groupArray = groupString.split(",");

      if (groupArray.includes(groupName)) {
        res.send(true);
      } else {
        res.send(false);
      }
    }
  });
};

const send_application_info = (req, res, next) => {
  check_sql_application = `SELECT App_Acronym, App_Description, App_Rnumber, DATE_FORMAT(App_startDate, "%d-%m-%Y") as App_startDate, DATE_FORMAT(App_endDate, "%d-%m-%Y") as App_endDate, App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done FROM application`;
  con.query(check_sql_application, function (err, result) {
    if (err) throw err;
    else {
      res.send(result);
    }
  });
};

// Send back current application information
const post_specific_application_info = (req, res, next) => {
  let App_Acronym = req.body.appAcronym;
  const check_sql_application = `SELECT App_Description, App_Rnumber, DATE_FORMAT(App_startDate, "%Y-%m-%d") as startDate, DATE_FORMAT(App_endDate, "%Y-%m-%d") as endDate, App_permit_Create, App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done FROM application WHERE App_Acronym = ?`;
  con.query(check_sql_application, [App_Acronym], function (err, result) {
    if (err) throw err;
    else if (App_Acronym) {
      let App_Description = result[0].App_Description;
      let App_Rnumber = result[0].App_Rnumber;
      let App_startDate = result[0].startDate;
      let App_endDate = result[0].endDate;
      let App_permit_Create = result[0].App_permit_Create;
      let App_permit_Open = result[0].App_permit_Open;
      let App_permit_toDoList = result[0].App_permit_toDoList;
      let App_permit_Doing = result[0].App_permit_Doing;
      let App_permit_Done = result[0].App_permit_Done;
      let created_date = result[0].created_date;
      const jsonData = { App_Description, App_Rnumber, App_startDate, App_endDate, App_permit_Create, App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done, created_date };
      res.send(JSON.stringify(jsonData));
    } else {
      res.end();
    }
  });
};

module.exports = { checkgroup, send_user_info, send_application_info, post_specific_application_info };
