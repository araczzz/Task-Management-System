const ErrorHandler = require("../error/errorHandler");
const con = require("../config/database");

const create_group = (req, res, next) => {
  let groupName = req.body.groupName;
  let groupDescription = req.body.groupDescription;

  if (groupName) {
    groupTrim = groupName.trim();
    const insert_into_groupDes = "INSERT INTO groupdescription VALUES (?,?)";
    con.query(insert_into_groupDes, [groupTrim, groupDescription], function (err, result) {
      if (err) {
        return next(new ErrorHandler(groupTrim + " UserGroup already exists in database!", 404));
      }
      res.send(result);
    });
  } else {
    return next(new ErrorHandler("Please enter a new User Group!"));
  }
};

module.exports = { create_group };
