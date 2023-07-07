const express = require("express");
const app = express();
const con = require("../config/database");
const bcrypt = require("bcryptjs");

const GetTaskbyState = async (req, res, next) => {
  try {
    let dataJSON = req.body;

    // Changing the JSON keys to lowercase (in case the user keys in different capitalized letters in JSON Key)
    let JSON = {};
    for (let key in dataJSON) {
      JSON[key.toLowerCase()] = dataJSON[key];
    }

    const successLogin = await login_user(JSON);
    // login success
    if ((successLogin.code = 200)) {
      try {
        const success = await get_task_state(JSON.task_state);
        if ((success.code = 200)) {
          res.send(success);
        }
      } catch (error) {
        res.send(error);
      }
    }
  } catch (error) {
    res.send(error);
  }
};

const get_task_state = Task_state => {
  return new Promise((resolve, reject) => {
    // string.charAt(0).toUpperCase() + string.slice(1)
    Task_state = Task_state.trim();
    Task_state = Task_state.charAt(0).toUpperCase() + Task_state.slice(1).toLowerCase();
    if (Task_state) {
      if ((Task_state === "Open") | (Task_state === "To Do") | (Task_state === "Doing") | (Task_state === "Done") | (Task_state === "Close")) {
        const select_sql_task = `SELECT * FROM task WHERE Task_state = ?`;
        con.query(select_sql_task, [Task_state], function (err, result) {
          if (err) throw err;
          else if (result.length === 0) {
            return resolve({ code: 200, data: [] });
          } else {
            return resolve({
              code: 200,
              data: result
            });
          }
        });
      } else {
        return reject({ code: 4005 });
      }
    } else {
      return reject({ code: 4006 });
    }
  });
};

// Login User
const login_user = JSON => {
  return new Promise((resolve, reject) => {
    if (!JSON.hasOwnProperty("username") | !JSON.hasOwnProperty("password") | !JSON.hasOwnProperty("task_state")) {
      return reject({ code: 4008 });
    }

    let username = JSON.username;
    let password = JSON.password;

    // Checking if both username exists
    if (username && password) {
      let regularExpressionUsername = /^\S*$/; //  a string consisting only of non-whitespaces.
      // Checking if username contains white spaces
      if (!regularExpressionUsername.test(username)) {
        return reject({ code: 4005 });
      } else {
        check_sql_accounts = "SELECT * FROM accounts WHERE username = ?";
        con.query(check_sql_accounts, [username], async function (err, result) {
          if (err) return reject({ code: 4005 });
          // Checking if username exists in database
          else if (result.length > 0) {
            const validPass = await bcrypt.compare(password, result[0].password);
            // Checking if password matches
            if (validPass) {
              // Checking if account if Active
              if (result[0].isActive === "Active") {
                return resolve({ code: 200 });
              } else {
                return reject({ code: 4002 });
              }
            } else {
              return reject({ code: 4001 });
            }
          } else {
            return reject({ code: 4001 });
          }
        });
      }
    } else {
      return reject({ code: 4006 });
    }
  });
};

module.exports = { GetTaskbyState };
