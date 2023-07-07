const con = require("../config/database");
const ErrorHandler = require("../error/errorHandler");

const update_application = (req, res, next) => {
  let { App_Acronym, App_Description, App_Rnumber, App_startDate, App_endDate, App_permit_Create, App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done } = req.body;

  App_Acronym = App_Acronym.trim();

  // Checking if App_Acronym already exists in database
  if (App_Acronym) {
    const select_sql_application_Acronym = "SELECT * FROM application WHERE App_Acronym = ?";
    con.query(select_sql_application_Acronym, [App_Acronym], function (err, result) {
      if (err) throw err;
      else if (result.length == 0) {
        return next(new ErrorHandler("This application does not exist. Please try again."));
      } else {
        // Handling blank entries in req.body
        const select_sql_application_blank = "SELECT * FROM application WHERE App_Acronym = ?";
        con.query(select_sql_application_blank, [App_Acronym], function (err, result) {
          if (err) throw err;
          else {
            let oldApp_Description = result[0].App_Description;
            let oldApp_Rnumber = result[0].App_Rnumber;
            let oldApp_startDate = result[0].App_startDate;
            let oldApp_endDate = result[0].App_endDate;
            let oldApp_permit_Create = result[0].App_permit_Create;
            let oldApp_permit_Open = result[0].App_permit_Open;
            let oldApp_permit_toDoList = result[0].App_permit_toDoList;
            let oldApp_permit_Doing = result[0].App_permit_Doing;
            let oldApp_permit_Done = result[0].App_permit_Done;
            if (App_Description === "") {
              App_Description = oldApp_Description;
            }
            if (App_Rnumber === "") {
              App_Rnumber = oldApp_Rnumber;
            }
            if (App_startDate === "") {
              App_startDate = oldApp_startDate;
            }
            if (App_endDate === "") {
              App_endDate = oldApp_endDate;
            }
            if (App_permit_Create === "") {
              App_permit_Create = oldApp_permit_Create;
            }
            if (App_permit_Open === "") {
              App_permit_Open = oldApp_permit_Open;
            }
            if (App_permit_toDoList === "") {
              App_permit_toDoList = oldApp_permit_toDoList;
            }
            if (App_permit_Doing === "") {
              App_permit_Doing = oldApp_permit_Doing;
            }
            if (App_permit_Done === "") {
              App_permit_Done = oldApp_permit_Done;
            }

            // Update databse
            const update_sql_application = "UPDATE application SET App_Description = ?,App_Rnumber = ?, App_startDate = ?, App_endDate = ?, App_permit_Create = ?, App_permit_Open = ?, App_permit_toDoList = ?, App_permit_Doing = ?, App_permit_Done = ? WHERE App_Acronym = ?";
            con.query(update_sql_application, [App_Description, App_Rnumber, App_startDate, App_endDate, App_permit_Create, App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done, App_Acronym], function (err, result) {
              if (err) throw err;
              res.send(result);
            });
          }
        });
      }
    });
  } else {
    return next(new ErrorHandler("Please enter an App Acronym for your Application!"));
  }
};

module.exports = { update_application };
