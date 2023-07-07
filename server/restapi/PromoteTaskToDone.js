const express = require("express");
const app = express();
const bcrypt = require("bcryptjs");
const con = require("../config/database");
const nodemailer = require("nodemailer");
require("dotenv").config();

const PromoteTaskToDone = async (req, res, next) => {
  try {
    let dataJSON = req.body;

    // Changing the JSON keys to lowercase (in case the user keys in different capitalized letters in JSON Key)
    let JSON = {};
    for (let key in dataJSON) {
      JSON[key.toLowerCase()] = dataJSON[key];
    }

    const successLogin = await login_user(JSON);
    // login success
    if (successLogin.code === 200) {
      console.log("successLogin");
      try {
        const successPermitDoing = await app_permit_doing(JSON.task_name);
        if (successPermitDoing.code === 200) {
          console.log("successPermitDoing");
          try {
            // App_permit_Doing
            let App_permit_Doing = successPermitDoing.App_permit_Doing;
            const successCheckGroup = await checkgroup(JSON.username, App_permit_Doing);
            if (successCheckGroup.code === 200) {
              console.log("success checkgroup");
              try {
                if (JSON.task_name) {
                  console.log("task name reached");
                  let Task_owner = JSON.username;
                  let Task_state = "Done";
                  const success = await post_change_task_state(JSON.task_name, Task_state, Task_owner);
                  res.send(success);
                }
              } catch (error) {
                res.send(error);
              }
            }
          } catch (error) {
            res.send(error);
          }
        }
      } catch (error) {
        res.send(error);
      }
    }
  } catch (error) {
    // login error
    res.send(error);
  }
};

// checkgroup
const checkgroup = (username, groupName) => {
  return new Promise((resolve, reject) => {
    const check_sql_accounts = `SELECT * FROM accounts WHERE username = ?`;
    con.query(check_sql_accounts, [username], function (err, result) {
      if (err) throw err;
      else {
        let groupString = result[0].groupName;
        let groupArray = groupString.split(",");

        if (groupArray.includes(groupName)) {
          return resolve({ code: 200 });
        } else {
          return reject({ code: 4002 });
        }
      }
    });
  });
};

// Check App_permit_Doing
const app_permit_doing = Task_name => {
  return new Promise((resolve, reject) => {
    if (Task_name) {
      const select_sql_task = `SELECT * FROM task WHERE Task_name=?`;
      con.query(select_sql_task, [Task_name], function (err, result) {
        if (err) return reject({ code: 4005 });
        else if (result.length > 0) {
          let Task_app_Acronym = result[0].Task_app_Acronym;

          const select_sql_application = `SELECT * FROM application WHERE App_Acronym = ?`;
          con.query(select_sql_application, [Task_app_Acronym], function (err, result) {
            if (err) return reject({ code: 4005 });
            else {
              let App_permit_Doing = result[0].App_permit_Doing;
              return resolve({ code: 200, App_permit_Doing });
            }
          });
        } else if (result.length === 0) {
          return reject({ code: 4005 });
        }
      });
    } else {
      return reject({ code: 4006 });
    }
  });
};

// Login User
const login_user = JSON => {
  return new Promise((resolve, reject) => {
    if (!JSON.hasOwnProperty("username") | !JSON.hasOwnProperty("password") | !JSON.hasOwnProperty("task_name")) {
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

// Updating Task_state upon movement of card in Kanban Board
const post_change_task_state = (Task_name, Task_state, Task_owner) => {
  return new Promise((resolve, reject) => {
    let taskName = Task_name;
    let taskState = Task_state;
    if (taskName) {
      const select_sql_task = "SELECT * FROM task WHERE Task_name = ?";
      con.query(select_sql_task, [taskName], function (err, result) {
        if (err) throw err;
        else if (result.length === 0) {
          return reject({ code: 4005 });
        } else {
          let currentTaskState = result[0].Task_state;
          if (currentTaskState !== "Doing") {
            return reject({ code: 4007 });
          } else {
            let oldTaskState = result[0].Task_state;
            let insertNewTaskNotes = "***Moving " + oldTaskState + " to " + taskState + "...***";
            const insert_into_task_notes = `INSERT INTO tasknotes (Task_name, Task_notes, Task_owner, Task_state) VALUES (?,?,?,?)`;
            con.query(insert_into_task_notes, [taskName, insertNewTaskNotes, Task_owner, taskState], function (err, result) {
              if (err) throw err;
              else {
                const select_sql_tasknotes = `SELECT Task_notes, DATE_FORMAT(updated_date, "%d/%m/%Y") as formattedDate, TIME_FORMAT(updated_date, "%H:%i:%s") as formattedTime , Task_owner, Task_state FROM tasknotes WHERE Task_name = ?`;
                con.query(select_sql_tasknotes, [taskName], function (err, result) {
                  if (err) throw err;
                  else if (result.length > 0) {
                    let concatenatedTaskArray = [];
                    let concatenatedTaskString = "";
                    let concatenatedTaskStringSQL = "";
                    for (let i = result.length - 1; i >= 0; i--) {
                      concatenatedTaskString = "[" + result[i].formattedDate + " " + result[i].formattedTime + "] " + result[i].Task_notes + " \n" + "Task State: " + result[i].Task_state + ", Task Owner: " + result[i].Task_owner + "\n";
                      concatenatedTaskArray.push(concatenatedTaskString);
                    }
                    concatenatedTaskStringSQL = concatenatedTaskArray.join("\n");
                    // update latest task notes
                    const update_sql_task = `UPDATE task SET Task_notes = ? WHERE Task_name = ?`;
                    con.query(update_sql_task, [concatenatedTaskStringSQL, taskName], function (err, result) {
                      if (err) throw err;
                      else {
                        // Setting new Task State
                        const update_sql_task_task_state = "UPDATE task SET Task_state = ? WHERE Task_name = ?";
                        con.query(update_sql_task_task_state, [taskState, taskName], function (err, result) {
                          if (err) throw err;
                          else {
                            // Setting new Task Owner
                            const update_sql_task_task_owner = "UPDATE task SET Task_owner = ? WHERE Task_name = ?";
                            con.query(update_sql_task_task_owner, [Task_owner, taskName], function (err, result) {
                              if (err) throw err;
                              const transport = nodemailer.createTransport({
                                host: process.env.MAIL_HOST,
                                port: process.env.MAIL_PORT,
                                auth: {
                                  user: process.env.MAIL_USER,
                                  pass: process.env.MAIL_PASS
                                }
                              });

                              const select_sql_accounts = `SELECT * FROM accounts`;
                              con.query(select_sql_accounts, function (err, result) {
                                if (err) throw err;
                                else {
                                  let PL_email = [];
                                  for (let i = 0; i < result.length; i++) {
                                    if (result[i].groupName.includes("Project Lead")) {
                                      PL_email.push(result[i].email);
                                    }
                                  }

                                  console.log(PL_email);

                                  const select_sql_accounts_email = `SELECT * FROM accounts WHERE username = ?`;
                                  con.query(select_sql_accounts_email, [username], function (err, result) {
                                    if (err) throw err;
                                    else {
                                      let TM_email = result[0].email;

                                      for (let i = 0; i < PL_email.length; i++) {
                                        transport.sendMail({
                                          from: `${TM_email}`,
                                          to: `${PL_email[i]}`,
                                          subject: `Done Task: ${taskName} by ${username}`,
                                          html: `<div><h2>Done Task From <b>${username}</b></h2>
                                              <p>Dear Sir/Madam, </p>
                                              <p>My username is <b>${username}</b></p>
                                              <p>Application: <b>${appAcronym}</b></p>
                                              <p>I have completed the task <b>${taskName}</b> and it is <b>Done</b>. Please check it. Thank you!!</p>
                                              <p>Yours sincerely, <br>${username}</p>
                                              </div>`
                                        });
                                      }
                                    }
                                  });
                                }
                              });
                              return resolve({ code: 200 });
                            });
                          }
                        });
                      }
                    });
                  }
                });
              }
            });
          }
        }
      });
    } else {
      return reject({ code: 4006 });
    }
  });
};

module.exports = { PromoteTaskToDone };
