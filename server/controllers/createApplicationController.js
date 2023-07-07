const con = require("../config/database");
const ErrorHandler = require("../error/errorHandler");

const add_application = (req, res, next) => {
  let { App_Acronym, App_Description, App_Rnumber, App_startDate, App_endDate, App_permit_Create, App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done } = req.body;
  App_Acronym = App_Acronym.trim();

  console.log(App_permit_Create);

  // Check if App Acronym exists
  if (App_Acronym) {
    select_sql_application_Acronym = "SELECT * FROM application WHERE App_Acronym = ?";
    con.query(select_sql_application_Acronym, [App_Acronym], function (err, result) {
      if (err) throw err;
      else if (result.length > 0) {
        return next(new ErrorHandler("This application acronym already exists. Please try again!"));
      } else {
        if (App_Description) {
          if (App_Rnumber) {
            if (App_Rnumber >= 0) {
              // Inserting into Application Table
              if (App_startDate == "") {
                App_startDate = null;
              }
              if (App_endDate == "") {
                App_endDate = null;
              }
              if (App_permit_Create === "") {
                App_permit_Create = null;
              }
              if (App_permit_Open == "") {
                App_permit_Open = null;
              }
              if (App_permit_toDoList == "") {
                App_permit_toDoList = null;
              }
              if (App_permit_Doing == "") {
                App_permit_Doing = null;
              }
              if (App_permit_Done == "") {
                App_permit_Done = null;
              }
              insert_sql_application = "INSERT INTO application VALUES (?,?,?,?,?,?,?,?,?,?,now())";
              con.query(insert_sql_application, [App_Acronym, App_Description, App_Rnumber, App_startDate, App_endDate, App_permit_Create, App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done], function (err, result) {
                if (err) throw err;
                res.send(result);
              });
            } else {
              return next(new ErrorHandler("Running number must be a positive integer. Please try again."));
            }
          } else {
            return next(new ErrorHandler("Please enter a Running Number for your Application!"));
          }
        } else {
          return next(new ErrorHandler("Please enter a Description for your Application!"));
        }
      }
    });
  } else {
    return next(new ErrorHandler("Please enter an App Acronym for your Application!"));
  }
};

const add_application_get_usergroup = (req, res, next) => {
  check_sql_groups = "SELECT * FROM groupdescription";
  con.query(check_sql_groups, function (err, result) {
    if (err) throw err;
    res.send(result);
  });
};

module.exports = { add_application, add_application_get_usergroup };
