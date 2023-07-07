const express = require("express");
const app = express();
const bcrypt = require("bcryptjs");
const con = require("../config/database");

const CreateTaskAPI = async (req, res, next) => {
  try {
    let dataJSON = req.body;

    // Changing the JSON keys to lowercase (in case the user keys in different capitalized letters in JSON Key)
    let JSON = {};
    for (let key in dataJSON) {
      JSON[key.toLowerCase()] = dataJSON[key];
    }

    let { Task_notes, Task_plan } = req.body;

    const successLogin = await login_user(JSON);
    // login success
    if (successLogin.code === 200) {
      try {
        // check App_permit_Create
        const successPermitCreate = await app_permit_create(JSON);
        if (successPermitCreate.code == 200) {
          try {
            // checkgroup success
            let App_permit_Create = successPermitCreate.App_permit_Create;
            const successCheckGroup = await checkgroup(JSON.username, App_permit_Create);
            if (successCheckGroup.code == 200) {
              try {
                // create task success
                if (JSON.task_name || JSON.app_acronym) {
                  let Task_creator = JSON.username;
                  let Task_owner = JSON.username;
                  let Task_state = "Open";
                  const success = await create_task(JSON.task_name, JSON.task_description, Task_notes, Task_plan, JSON.app_acronym, Task_state, Task_creator, Task_owner);
                  res.send(success);
                }
              } catch (error) {
                // create task error
                res.send(error);
              }
            }
          } catch (error) {
            // checkgroup error
            res.send(error);
          }
        }
      } catch (error) {
        // App_permit_Create error
        res.send(error);
      }
    }
  } catch (error) {
    // login error
    res.send(error);
  }
};

// Check App_permit_create
const app_permit_create = JSON => {
  return new Promise((resolve, reject) => {
    let App_Acronym = JSON.app_acronym;
    if (App_Acronym) {
      const check_sql_application = `SELECT * FROM application WHERE App_Acronym = ?`;
      con.query(check_sql_application, [App_Acronym], function (err, result) {
        if (err) return reject({ code: 4005 });
        else if (result.length > 0) {
          let App_permit_Create = result[0].App_permit_Create;
          return resolve({ code: 200, App_permit_Create });
        } else if (result.length === 0) {
          return reject({ code: 4005 });
        }
      });
    } else {
      return reject({ code: 4006 });
    }
  });
};

// checkgroup function (returns a value to indicate if a user is in a group)
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

// Login User
const login_user = JSON => {
  return new Promise((resolve, reject) => {
    if (!JSON.hasOwnProperty("username") | !JSON.hasOwnProperty("password") | !JSON.hasOwnProperty("task_name") | !JSON.hasOwnProperty("app_acronym") | !JSON.hasOwnProperty("task_description")) {
      return reject({ code: 4008 });
    }

    // Checking if both username exists
    let username = JSON.username;
    let password = JSON.password;

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

// Create Task
const create_task = (Task_name, Task_description, Task_notes, Task_plan, App_Acronym, Task_state, Task_creator, Task_owner) => {
  return new Promise((resolve, reject) => {
    let appAcronym = App_Acronym;

    if (!appAcronym) {
      return reject({ code: 4006 });
    }

    // Mandatory field
    if (Task_name) {
      if (appAcronym) {
        const select_sql_application = `SELECT * FROM application WHERE App_Acronym = ?`;
        con.query(select_sql_application, [appAcronym], function (err, result) {
          if (err) throw err;
          else if (result.length === 0) {
            return reject({ code: 4005 });
          } else {
            Task_name = Task_name.trim();
            const select_sql_task = `SELECT * FROM task WHERE Task_name=?`;
            con.query(select_sql_task, [Task_name], function (err, result) {
              if (err) throw err;
              else if (result.length > 0) {
                return reject({ code: 4003 });
              } else {
                // if there is a task description
                if (Task_description) {
                  // if there is a task plan, need to get the colour
                  if (Task_plan) {
                    const select_sql_plan = `SELECT * FROM plan WHERE Plan_MVP_name = ?`;
                    con.query(select_sql_plan, [Task_plan], function (err, result) {
                      if (err) throw err;
                      else {
                        let Task_colour = result[0].Plan_colour;
                        // checking if there any tasks
                        const select_sql_task = `SELECT * FROM task`;
                        con.query(select_sql_task, function (err, result) {
                          if (err) throw err;
                          // There are no tasks, assign the current App_Rnumber
                          else if (result.length === 0) {
                            const select_sql_application = `SELECT * FROM application WHERE App_Acronym = ?`;
                            con.query(select_sql_application, [appAcronym], function (err, result) {
                              if (err) throw err;
                              else {
                                let currentAppRnumber = result[0].App_Rnumber;
                                let Task_id = appAcronym + "_" + currentAppRnumber;

                                // there are task notes
                                if (Task_notes) {
                                  insert_sql_task = `INSERT INTO task (Task_name, Task_description, Task_id, Task_plan, Task_app_Acronym, Task_state, Task_creator, Task_owner, Task_colour) VALUES (?,?,?,?,?,?,?,?,?)`;
                                  con.query(insert_sql_task, [Task_name, Task_description, Task_id, Task_plan, appAcronym, Task_state, Task_creator, Task_owner, Task_colour], function (err, result) {
                                    if (err) throw err;
                                    else {
                                      const select_sql_tasknotes = `SELECT  Task_state,Task_owner,Task_name,DATE_FORMAT(Task_createDate, "%d/%m/%Y") as formattedDate, TIME_FORMAT(Task_createDate, "%H:%i:%s") as formattedTime FROM task WHERE Task_name = ?`;
                                      con.query(select_sql_tasknotes, [Task_name], function (err, result) {
                                        if (err) throw err;
                                        else {
                                          let inserted_task_notes = "[" + result[0].formattedDate + " " + result[0].formattedTime + "] " + Task_notes + " \n" + "Task State: " + result[0].Task_state + ", Task Owner: " + result[0].Task_owner + "\n";
                                          const insert_sql_task = `UPDATE task SET Task_notes = ? WHERE Task_name = ?`;
                                          con.query(insert_sql_task, [inserted_task_notes, Task_name], function (err, result) {
                                            if (err) throw err;
                                            else {
                                              const insert_into_task_notes = `INSERT INTO tasknotes (Task_name, Task_notes, Task_owner, Task_state) VALUES (?,?,?,?)`;
                                              con.query(insert_into_task_notes, [Task_name, Task_notes, Task_owner, Task_state], function (err, result) {
                                                if (err) throw err;
                                                else {
                                                  const select_sql_task = `SELECT * FROM task WHERE Task_name = ?`;
                                                  con.query(select_sql_task, [Task_name], function (err, result) {
                                                    let Task_id = result[0].Task_id;
                                                    return resolve({ code: 200, Task_id });
                                                  });
                                                }
                                              });
                                            }
                                          });
                                        }
                                      });
                                    }
                                  });
                                } else {
                                  // no task notes
                                  Task_notes = Task_owner + " created this task but did not include any notes...";
                                  insert_sql_task = `INSERT INTO task (Task_name, Task_description, Task_id, Task_plan, Task_app_Acronym, Task_state, Task_creator, Task_owner, Task_colour) VALUES (?,?,?,?,?,?,?,?,?)`;
                                  con.query(insert_sql_task, [Task_name, Task_description, Task_id, Task_plan, appAcronym, Task_state, Task_creator, Task_owner, Task_colour], function (err, result) {
                                    if (err) throw err;
                                    else {
                                      const select_sql_tasknotes = `SELECT  Task_state,Task_owner,Task_name,DATE_FORMAT(Task_createDate, "%d/%m/%Y") as formattedDate, TIME_FORMAT(Task_createDate, "%H:%i:%s") as formattedTime FROM task WHERE Task_name = ?`;
                                      con.query(select_sql_tasknotes, [Task_name], function (err, result) {
                                        if (err) throw err;
                                        else {
                                          let inserted_task_notes = "[" + result[0].formattedDate + " " + result[0].formattedTime + "] " + Task_notes + " \n" + "Task State: " + result[0].Task_state + ", Task Owner: " + result[0].Task_owner + "\n";
                                          const insert_sql_task = `UPDATE task SET Task_notes = ? WHERE Task_name = ?`;
                                          con.query(insert_sql_task, [inserted_task_notes, Task_name], function (err, result) {
                                            if (err) throw err;
                                            else {
                                              const insert_into_task_notes = `INSERT INTO tasknotes (Task_name, Task_notes, Task_owner, Task_state) VALUES (?,?,?,?)`;
                                              con.query(insert_into_task_notes, [Task_name, Task_notes, Task_owner, Task_state], function (err, result) {
                                                if (err) throw err;
                                                else {
                                                  const select_sql_task = `SELECT * FROM task WHERE Task_name = ?`;
                                                  con.query(select_sql_task, [Task_name], function (err, result) {
                                                    let Task_id = result[0].Task_id;
                                                    return resolve({ code: 200, Task_id });
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
                            // if there is already a task assigned to an Rnumber (need to + 1)
                            const select_sql_application = `SELECT * FROM application WHERE App_Acronym = ?`;
                            con.query(select_sql_application, [appAcronym], function (err, result) {
                              if (err) throw err;
                              let currentAppRnumber = result[0].App_Rnumber;
                              let newAppRnumber = currentAppRnumber + 1;
                              let Task_id = appAcronym + "_" + newAppRnumber;

                              // update latest Rnumber for App_Rnumber in Application
                              const update_sql_application = `UPDATE application SET App_Rnumber = ? WHERE App_Acronym = ?`;
                              con.query(update_sql_application, [newAppRnumber, appAcronym], function (err, result) {
                                if (err) throw err;
                                else {
                                  // there are task notes
                                  if (Task_notes) {
                                    insert_sql_task = `INSERT INTO task (Task_name, Task_description, Task_id, Task_plan, Task_app_Acronym, Task_state, Task_creator, Task_owner, Task_colour) VALUES (?,?,?,?,?,?,?,?,?)`;
                                    con.query(insert_sql_task, [Task_name, Task_description, Task_id, Task_plan, appAcronym, Task_state, Task_creator, Task_owner, Task_colour], function (err, result) {
                                      if (err) throw err;
                                      else {
                                        const select_sql_tasknotes = `SELECT  Task_state,Task_owner,Task_name,DATE_FORMAT(Task_createDate, "%d/%m/%Y") as formattedDate, TIME_FORMAT(Task_createDate, "%H:%i:%s") as formattedTime FROM task WHERE Task_name = ?`;
                                        con.query(select_sql_tasknotes, [Task_name], function (err, result) {
                                          if (err) throw err;
                                          else {
                                            let inserted_task_notes = "[" + result[0].formattedDate + " " + result[0].formattedTime + "] " + Task_notes + " \n" + "Task State: " + result[0].Task_state + ", Task Owner: " + result[0].Task_owner + "\n";
                                            const insert_sql_task = `UPDATE task SET Task_notes = ? WHERE Task_name = ?`;
                                            con.query(insert_sql_task, [inserted_task_notes, Task_name], function (err, result) {
                                              if (err) throw err;
                                              else {
                                                const insert_into_task_notes = `INSERT INTO tasknotes (Task_name, Task_notes, Task_owner, Task_state) VALUES (?,?,?,?)`;
                                                con.query(insert_into_task_notes, [Task_name, Task_notes, Task_owner, Task_state], function (err, result) {
                                                  if (err) throw err;
                                                  else {
                                                    const select_sql_task = `SELECT * FROM task WHERE Task_name = ?`;
                                                    con.query(select_sql_task, [Task_name], function (err, result) {
                                                      let Task_id = result[0].Task_id;
                                                      return resolve({ code: 200, Task_id });
                                                    });
                                                  }
                                                });
                                              }
                                            });
                                          }
                                        });
                                      }
                                    });
                                  } else {
                                    // no task notes
                                    Task_notes = Task_owner + " created this task but did not include any notes...";
                                    insert_sql_task = `INSERT INTO task (Task_name, Task_description, Task_id, Task_plan, Task_app_Acronym, Task_state, Task_creator, Task_owner, Task_colour) VALUES (?,?,?,?,?,?,?,?,?)`;
                                    con.query(insert_sql_task, [Task_name, Task_description, Task_id, Task_plan, appAcronym, Task_state, Task_creator, Task_owner, Task_colour], function (err, result) {
                                      if (err) throw err;
                                      else {
                                        const select_sql_tasknotes = `SELECT  Task_state,Task_owner,Task_name,DATE_FORMAT(Task_createDate, "%d/%m/%Y") as formattedDate, TIME_FORMAT(Task_createDate, "%H:%i:%s") as formattedTime FROM task WHERE Task_name = ?`;
                                        con.query(select_sql_tasknotes, [Task_name], function (err, result) {
                                          if (err) throw err;
                                          else {
                                            let inserted_task_notes = "[" + result[0].formattedDate + " " + result[0].formattedTime + "] " + Task_notes + " \n" + "Task State: " + result[0].Task_state + ", Task Owner: " + result[0].Task_owner + "\n";
                                            const insert_sql_task = `UPDATE task SET Task_notes = ? WHERE Task_name = ?`;
                                            con.query(insert_sql_task, [inserted_task_notes, Task_name], function (err, result) {
                                              if (err) throw err;
                                              else {
                                                const insert_into_task_notes = `INSERT INTO tasknotes (Task_name, Task_notes, Task_owner, Task_state) VALUES (?,?,?,?)`;
                                                con.query(insert_into_task_notes, [Task_name, Task_notes, Task_owner, Task_state], function (err, result) {
                                                  if (err) throw err;
                                                  else {
                                                    const select_sql_task = `SELECT * FROM task WHERE Task_name = ?`;
                                                    con.query(select_sql_task, [Task_name], function (err, result) {
                                                      let Task_id = result[0].Task_id;
                                                      return resolve({ code: 200, Task_id });
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
                            });
                          }
                        });
                      }
                    });
                  } else {
                    Task_plan = null;
                    let Task_colour = "";
                    const select_sql_task = `SELECT * FROM task`;
                    con.query(select_sql_task, function (err, result) {
                      if (err) throw err;
                      // There are no tasks, assign the current App_Rnumber
                      else if (result.length === 0) {
                        const select_sql_application = `SELECT * FROM application WHERE App_Acronym = ?`;
                        con.query(select_sql_application, [appAcronym], function (err, result) {
                          if (err) throw err;
                          else {
                            let currentAppRnumber = result[0].App_Rnumber;
                            let Task_id = appAcronym + "_" + currentAppRnumber;

                            // there are task notes
                            if (Task_notes) {
                              insert_sql_task = `INSERT INTO task (Task_name, Task_description, Task_id, Task_plan, Task_app_Acronym, Task_state, Task_creator, Task_owner, Task_colour) VALUES (?,?,?,?,?,?,?,?,?)`;
                              con.query(insert_sql_task, [Task_name, Task_description, Task_id, Task_plan, appAcronym, Task_state, Task_creator, Task_owner, Task_colour], function (err, result) {
                                if (err) throw err;
                                else {
                                  const select_sql_tasknotes = `SELECT  Task_state,Task_owner,Task_name,DATE_FORMAT(Task_createDate, "%d/%m/%Y") as formattedDate, TIME_FORMAT(Task_createDate, "%H:%i:%s") as formattedTime FROM task WHERE Task_name = ?`;
                                  con.query(select_sql_tasknotes, [Task_name], function (err, result) {
                                    if (err) throw err;
                                    else {
                                      let inserted_task_notes = "[" + result[0].formattedDate + " " + result[0].formattedTime + "] " + Task_notes + " \n" + "Task State: " + result[0].Task_state + ", Task Owner: " + result[0].Task_owner + "\n";
                                      const insert_sql_task = `UPDATE task SET Task_notes = ? WHERE Task_name = ?`;
                                      con.query(insert_sql_task, [inserted_task_notes, Task_name], function (err, result) {
                                        if (err) throw err;
                                        else {
                                          const insert_into_task_notes = `INSERT INTO tasknotes (Task_name, Task_notes, Task_owner, Task_state) VALUES (?,?,?,?)`;
                                          con.query(insert_into_task_notes, [Task_name, Task_notes, Task_owner, Task_state], function (err, result) {
                                            if (err) throw err;
                                            else {
                                              const select_sql_task = `SELECT * FROM task WHERE Task_name = ?`;
                                              con.query(select_sql_task, [Task_name], function (err, result) {
                                                let Task_id = result[0].Task_id;
                                                return resolve({ code: 200, Task_id });
                                              });
                                            }
                                          });
                                        }
                                      });
                                    }
                                  });
                                }
                              });
                            } else {
                              // no task notes
                              Task_notes = Task_owner + " created this task but did not include any notes...";
                              insert_sql_task = `INSERT INTO task (Task_name, Task_description, Task_id, Task_plan, Task_app_Acronym, Task_state, Task_creator, Task_owner, Task_colour) VALUES (?,?,?,?,?,?,?,?,?)`;
                              con.query(insert_sql_task, [Task_name, Task_description, Task_id, Task_plan, appAcronym, Task_state, Task_creator, Task_owner, Task_colour], function (err, result) {
                                if (err) throw err;
                                else {
                                  const select_sql_tasknotes = `SELECT  Task_state,Task_owner,Task_name,DATE_FORMAT(Task_createDate, "%d/%m/%Y") as formattedDate, TIME_FORMAT(Task_createDate, "%H:%i:%s") as formattedTime FROM task WHERE Task_name = ?`;
                                  con.query(select_sql_tasknotes, [Task_name], function (err, result) {
                                    if (err) throw err;
                                    else {
                                      let inserted_task_notes = "[" + result[0].formattedDate + " " + result[0].formattedTime + "] " + Task_notes + " \n" + "Task State: " + result[0].Task_state + ", Task Owner: " + result[0].Task_owner + "\n";
                                      const insert_sql_task = `UPDATE task SET Task_notes = ? WHERE Task_name = ?`;
                                      con.query(insert_sql_task, [inserted_task_notes, Task_name], function (err, result) {
                                        if (err) throw err;
                                        else {
                                          const insert_into_task_notes = `INSERT INTO tasknotes (Task_name, Task_notes, Task_owner, Task_state) VALUES (?,?,?,?)`;
                                          con.query(insert_into_task_notes, [Task_name, Task_notes, Task_owner, Task_state], function (err, result) {
                                            if (err) throw err;
                                            else {
                                              const select_sql_task = `SELECT * FROM task WHERE Task_name = ?`;
                                              con.query(select_sql_task, [Task_name], function (err, result) {
                                                let Task_id = result[0].Task_id;
                                                return resolve({ code: 200, Task_id });
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
                        // if there is already a task assigned to an Rnumber (need to + 1)
                        const select_sql_application = `SELECT * FROM application WHERE App_Acronym = ?`;
                        con.query(select_sql_application, [appAcronym], function (err, result) {
                          if (err) throw err;
                          let currentAppRnumber = result[0].App_Rnumber;
                          let newAppRnumber = currentAppRnumber + 1;
                          let Task_id = appAcronym + "_" + newAppRnumber;

                          // update latest Rnumber for App_Rnumber in Application
                          const update_sql_application = `UPDATE application SET App_Rnumber = ? WHERE App_Acronym = ?`;
                          con.query(update_sql_application, [newAppRnumber, appAcronym], function (err, result) {
                            if (err) throw err;
                            else {
                              // there are task notes
                              if (Task_notes) {
                                insert_sql_task = `INSERT INTO task (Task_name, Task_description, Task_id, Task_plan, Task_app_Acronym, Task_state, Task_creator, Task_owner, Task_colour) VALUES (?,?,?,?,?,?,?,?,?)`;
                                con.query(insert_sql_task, [Task_name, Task_description, Task_id, Task_plan, appAcronym, Task_state, Task_creator, Task_owner, Task_colour], function (err, result) {
                                  if (err) throw err;
                                  else {
                                    const select_sql_tasknotes = `SELECT  Task_state,Task_owner,Task_name,DATE_FORMAT(Task_createDate, "%d/%m/%Y") as formattedDate, TIME_FORMAT(Task_createDate, "%H:%i:%s") as formattedTime FROM task WHERE Task_name = ?`;
                                    con.query(select_sql_tasknotes, [Task_name], function (err, result) {
                                      if (err) throw err;
                                      else {
                                        let inserted_task_notes = "[" + result[0].formattedDate + " " + result[0].formattedTime + "] " + Task_notes + " \n" + "Task State: " + result[0].Task_state + ", Task Owner: " + result[0].Task_owner + "\n";
                                        const insert_sql_task = `UPDATE task SET Task_notes = ? WHERE Task_name = ?`;
                                        con.query(insert_sql_task, [inserted_task_notes, Task_name], function (err, result) {
                                          if (err) throw err;
                                          else {
                                            const insert_into_task_notes = `INSERT INTO tasknotes (Task_name, Task_notes, Task_owner, Task_state) VALUES (?,?,?,?)`;
                                            con.query(insert_into_task_notes, [Task_name, Task_notes, Task_owner, Task_state], function (err, result) {
                                              if (err) throw err;
                                              else {
                                                const select_sql_task = `SELECT * FROM task WHERE Task_name = ?`;
                                                con.query(select_sql_task, [Task_name], function (err, result) {
                                                  let Task_id = result[0].Task_id;
                                                  return resolve({ code: 200, Task_id });
                                                });
                                              }
                                            });
                                          }
                                        });
                                      }
                                    });
                                  }
                                });
                              } else {
                                // no task notes
                                Task_notes = Task_owner + " created this task but did not include any notes...";
                                insert_sql_task = `INSERT INTO task (Task_name, Task_description, Task_id, Task_plan, Task_app_Acronym, Task_state, Task_creator, Task_owner, Task_colour) VALUES (?,?,?,?,?,?,?,?,?)`;
                                con.query(insert_sql_task, [Task_name, Task_description, Task_id, Task_plan, appAcronym, Task_state, Task_creator, Task_owner, Task_colour], function (err, result) {
                                  if (err) throw err;
                                  else {
                                    const select_sql_tasknotes = `SELECT  Task_state,Task_owner,Task_name,DATE_FORMAT(Task_createDate, "%d/%m/%Y") as formattedDate, TIME_FORMAT(Task_createDate, "%H:%i:%s") as formattedTime FROM task WHERE Task_name = ?`;
                                    con.query(select_sql_tasknotes, [Task_name], function (err, result) {
                                      if (err) throw err;
                                      else {
                                        let inserted_task_notes = "[" + result[0].formattedDate + " " + result[0].formattedTime + "] " + Task_notes + " \n" + "Task State: " + result[0].Task_state + ", Task Owner: " + result[0].Task_owner + "\n";
                                        const insert_sql_task = `UPDATE task SET Task_notes = ? WHERE Task_name = ?`;
                                        con.query(insert_sql_task, [inserted_task_notes, Task_name], function (err, result) {
                                          if (err) throw err;
                                          else {
                                            const insert_into_task_notes = `INSERT INTO tasknotes (Task_name, Task_notes, Task_owner, Task_state) VALUES (?,?,?,?)`;
                                            con.query(insert_into_task_notes, [Task_name, Task_notes, Task_owner, Task_state], function (err, result) {
                                              if (err) throw err;
                                              else {
                                                const select_sql_task = `SELECT * FROM task WHERE Task_name = ?`;
                                                con.query(select_sql_task, [Task_name], function (err, result) {
                                                  let Task_id = result[0].Task_id;
                                                  return resolve({ code: 200, Task_id });
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
                        });
                      }
                    });
                  }
                } else {
                  let Task_description = Task_owner + " did not specify a task description.";
                  if (Task_plan) {
                    const select_sql_plan = `SELECT * FROM plan WHERE Plan_MVP_name = ?`;
                    con.query(select_sql_plan, [Task_plan], function (err, result) {
                      if (err) throw err;
                      else {
                        let Task_colour = result[0].Plan_colour;
                        // checking if there any tasks
                        const select_sql_task = `SELECT * FROM task`;
                        con.query(select_sql_task, function (err, result) {
                          if (err) throw err;
                          // There are no tasks, assign the current App_Rnumber
                          else if (result.length === 0) {
                            const select_sql_application = `SELECT * FROM application WHERE App_Acronym = ?`;
                            con.query(select_sql_application, [appAcronym], function (err, result) {
                              if (err) throw err;
                              else {
                                let currentAppRnumber = result[0].App_Rnumber;
                                let Task_id = appAcronym + "_" + currentAppRnumber;

                                // there are task notes
                                if (Task_notes) {
                                  insert_sql_task = `INSERT INTO task (Task_name, Task_description, Task_id, Task_plan, Task_app_Acronym, Task_state, Task_creator, Task_owner, Task_colour) VALUES (?,?,?,?,?,?,?,?,?)`;
                                  con.query(insert_sql_task, [Task_name, Task_description, Task_id, Task_plan, appAcronym, Task_state, Task_creator, Task_owner, Task_colour], function (err, result) {
                                    if (err) throw err;
                                    else {
                                      const select_sql_tasknotes = `SELECT  Task_state,Task_owner,Task_name,DATE_FORMAT(Task_createDate, "%d/%m/%Y") as formattedDate, TIME_FORMAT(Task_createDate, "%H:%i:%s") as formattedTime FROM task WHERE Task_name = ?`;
                                      con.query(select_sql_tasknotes, [Task_name], function (err, result) {
                                        if (err) throw err;
                                        else {
                                          let inserted_task_notes = "[" + result[0].formattedDate + " " + result[0].formattedTime + "] " + Task_notes + " \n" + "Task State: " + result[0].Task_state + ", Task Owner: " + result[0].Task_owner + "\n";
                                          const insert_sql_task = `UPDATE task SET Task_notes = ? WHERE Task_name = ?`;
                                          con.query(insert_sql_task, [inserted_task_notes, Task_name], function (err, result) {
                                            if (err) throw err;
                                            else {
                                              const insert_into_task_notes = `INSERT INTO tasknotes (Task_name, Task_notes, Task_owner, Task_state) VALUES (?,?,?,?)`;
                                              con.query(insert_into_task_notes, [Task_name, Task_notes, Task_owner, Task_state], function (err, result) {
                                                if (err) throw err;
                                                else {
                                                  const select_sql_task = `SELECT * FROM task WHERE Task_name = ?`;
                                                  con.query(select_sql_task, [Task_name], function (err, result) {
                                                    let Task_id = result[0].Task_id;
                                                    return resolve({ code: 200, Task_id });
                                                  });
                                                }
                                              });
                                            }
                                          });
                                        }
                                      });
                                    }
                                  });
                                } else {
                                  // no task notes
                                  Task_notes = Task_owner + " created this task but did not include any notes...";
                                  insert_sql_task = `INSERT INTO task (Task_name, Task_description, Task_id, Task_plan, Task_app_Acronym, Task_state, Task_creator, Task_owner, Task_colour) VALUES (?,?,?,?,?,?,?,?,?)`;
                                  con.query(insert_sql_task, [Task_name, Task_description, Task_id, Task_plan, appAcronym, Task_state, Task_creator, Task_owner, Task_colour], function (err, result) {
                                    if (err) throw err;
                                    else {
                                      const select_sql_tasknotes = `SELECT  Task_state,Task_owner,Task_name,DATE_FORMAT(Task_createDate, "%d/%m/%Y") as formattedDate, TIME_FORMAT(Task_createDate, "%H:%i:%s") as formattedTime FROM task WHERE Task_name = ?`;
                                      con.query(select_sql_tasknotes, [Task_name], function (err, result) {
                                        if (err) throw err;
                                        else {
                                          let inserted_task_notes = "[" + result[0].formattedDate + " " + result[0].formattedTime + "] " + Task_notes + " \n" + "Task State: " + result[0].Task_state + ", Task Owner: " + result[0].Task_owner + "\n";
                                          const insert_sql_task = `UPDATE task SET Task_notes = ? WHERE Task_name = ?`;
                                          con.query(insert_sql_task, [inserted_task_notes, Task_name], function (err, result) {
                                            if (err) throw err;
                                            else {
                                              const insert_into_task_notes = `INSERT INTO tasknotes (Task_name, Task_notes, Task_owner, Task_state) VALUES (?,?,?,?)`;
                                              con.query(insert_into_task_notes, [Task_name, Task_notes, Task_owner, Task_state], function (err, result) {
                                                if (err) throw err;
                                                else {
                                                  const select_sql_task = `SELECT * FROM task WHERE Task_name = ?`;
                                                  con.query(select_sql_task, [Task_name], function (err, result) {
                                                    let Task_id = result[0].Task_id;
                                                    return resolve({ code: 200, Task_id });
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
                            // if there is already a task assigned to an Rnumber (need to + 1)
                            const select_sql_application = `SELECT * FROM application WHERE App_Acronym = ?`;
                            con.query(select_sql_application, [appAcronym], function (err, result) {
                              if (err) throw err;
                              let currentAppRnumber = result[0].App_Rnumber;
                              let newAppRnumber = currentAppRnumber + 1;
                              let Task_id = appAcronym + "_" + newAppRnumber;

                              // update latest Rnumber for App_Rnumber in Application
                              const update_sql_application = `UPDATE application SET App_Rnumber = ? WHERE App_Acronym = ?`;
                              con.query(update_sql_application, [newAppRnumber, appAcronym], function (err, result) {
                                if (err) throw err;
                                else {
                                  // there are task notes
                                  if (Task_notes) {
                                    insert_sql_task = `INSERT INTO task (Task_name, Task_description, Task_id, Task_plan, Task_app_Acronym, Task_state, Task_creator, Task_owner, Task_colour) VALUES (?,?,?,?,?,?,?,?,?)`;
                                    con.query(insert_sql_task, [Task_name, Task_description, Task_id, Task_plan, appAcronym, Task_state, Task_creator, Task_owner, Task_colour], function (err, result) {
                                      if (err) throw err;
                                      else {
                                        const select_sql_tasknotes = `SELECT  Task_state,Task_owner,Task_name,DATE_FORMAT(Task_createDate, "%d/%m/%Y") as formattedDate, TIME_FORMAT(Task_createDate, "%H:%i:%s") as formattedTime FROM task WHERE Task_name = ?`;
                                        con.query(select_sql_tasknotes, [Task_name], function (err, result) {
                                          if (err) throw err;
                                          else {
                                            let inserted_task_notes = "[" + result[0].formattedDate + " " + result[0].formattedTime + "] " + Task_notes + " \n" + "Task State: " + result[0].Task_state + ", Task Owner: " + result[0].Task_owner + "\n";
                                            const insert_sql_task = `UPDATE task SET Task_notes = ? WHERE Task_name = ?`;
                                            con.query(insert_sql_task, [inserted_task_notes, Task_name], function (err, result) {
                                              if (err) throw err;
                                              else {
                                                const insert_into_task_notes = `INSERT INTO tasknotes (Task_name, Task_notes, Task_owner, Task_state) VALUES (?,?,?,?)`;
                                                con.query(insert_into_task_notes, [Task_name, Task_notes, Task_owner, Task_state], function (err, result) {
                                                  if (err) throw err;
                                                  else {
                                                    const select_sql_task = `SELECT * FROM task WHERE Task_name = ?`;
                                                    con.query(select_sql_task, [Task_name], function (err, result) {
                                                      let Task_id = result[0].Task_id;
                                                      return resolve({ code: 200, Task_id });
                                                    });
                                                  }
                                                });
                                              }
                                            });
                                          }
                                        });
                                      }
                                    });
                                  } else {
                                    // no task notes
                                    Task_notes = Task_owner + " created this task but did not include any notes...";
                                    insert_sql_task = `INSERT INTO task (Task_name, Task_description, Task_id, Task_plan, Task_app_Acronym, Task_state, Task_creator, Task_owner, Task_colour) VALUES (?,?,?,?,?,?,?,?,?)`;
                                    con.query(insert_sql_task, [Task_name, Task_description, Task_id, Task_plan, appAcronym, Task_state, Task_creator, Task_owner, Task_colour], function (err, result) {
                                      if (err) throw err;
                                      else {
                                        const select_sql_tasknotes = `SELECT  Task_state,Task_owner,Task_name,DATE_FORMAT(Task_createDate, "%d/%m/%Y") as formattedDate, TIME_FORMAT(Task_createDate, "%H:%i:%s") as formattedTime FROM task WHERE Task_name = ?`;
                                        con.query(select_sql_tasknotes, [Task_name], function (err, result) {
                                          if (err) throw err;
                                          else {
                                            let inserted_task_notes = "[" + result[0].formattedDate + " " + result[0].formattedTime + "] " + Task_notes + " \n" + "Task State: " + result[0].Task_state + ", Task Owner: " + result[0].Task_owner + "\n";
                                            const insert_sql_task = `UPDATE task SET Task_notes = ? WHERE Task_name = ?`;
                                            con.query(insert_sql_task, [inserted_task_notes, Task_name], function (err, result) {
                                              if (err) throw err;
                                              else {
                                                const insert_into_task_notes = `INSERT INTO tasknotes (Task_name, Task_notes, Task_owner, Task_state) VALUES (?,?,?,?)`;
                                                con.query(insert_into_task_notes, [Task_name, Task_notes, Task_owner, Task_state], function (err, result) {
                                                  if (err) throw err;
                                                  else {
                                                    const select_sql_task = `SELECT * FROM task WHERE Task_name = ?`;
                                                    con.query(select_sql_task, [Task_name], function (err, result) {
                                                      let Task_id = result[0].Task_id;
                                                      return resolve({ code: 200, Task_id });
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
                            });
                          }
                        });
                      }
                    });
                  } else {
                    Task_plan = null;
                    let Task_colour = "";
                    const select_sql_task = `SELECT * FROM task`;
                    con.query(select_sql_task, function (err, result) {
                      if (err) throw err;
                      // There are no tasks, assign the current App_Rnumber
                      else if (result.length === 0) {
                        const select_sql_application = `SELECT * FROM application WHERE App_Acronym = ?`;
                        con.query(select_sql_application, [appAcronym], function (err, result) {
                          if (err) throw err;
                          else {
                            let currentAppRnumber = result[0].App_Rnumber;
                            let Task_id = appAcronym + "_" + currentAppRnumber;

                            // there are task notes
                            if (Task_notes) {
                              insert_sql_task = `INSERT INTO task (Task_name, Task_description, Task_id, Task_plan, Task_app_Acronym, Task_state, Task_creator, Task_owner, Task_colour) VALUES (?,?,?,?,?,?,?,?,?)`;
                              con.query(insert_sql_task, [Task_name, Task_description, Task_id, Task_plan, appAcronym, Task_state, Task_creator, Task_owner, Task_colour], function (err, result) {
                                if (err) throw err;
                                else {
                                  const select_sql_tasknotes = `SELECT  Task_state,Task_owner,Task_name,DATE_FORMAT(Task_createDate, "%d/%m/%Y") as formattedDate, TIME_FORMAT(Task_createDate, "%H:%i:%s") as formattedTime FROM task WHERE Task_name = ?`;
                                  con.query(select_sql_tasknotes, [Task_name], function (err, result) {
                                    if (err) throw err;
                                    else {
                                      let inserted_task_notes = "[" + result[0].formattedDate + " " + result[0].formattedTime + "] " + Task_notes + " \n" + "Task State: " + result[0].Task_state + ", Task Owner: " + result[0].Task_owner + "\n";
                                      const insert_sql_task = `UPDATE task SET Task_notes = ? WHERE Task_name = ?`;
                                      con.query(insert_sql_task, [inserted_task_notes, Task_name], function (err, result) {
                                        if (err) throw err;
                                        else {
                                          const insert_into_task_notes = `INSERT INTO tasknotes (Task_name, Task_notes, Task_owner, Task_state) VALUES (?,?,?,?)`;
                                          con.query(insert_into_task_notes, [Task_name, Task_notes, Task_owner, Task_state], function (err, result) {
                                            if (err) throw err;
                                            else {
                                              const select_sql_task = `SELECT * FROM task WHERE Task_name = ?`;
                                              con.query(select_sql_task, [Task_name], function (err, result) {
                                                let Task_id = result[0].Task_id;
                                                return resolve({ code: 200, Task_id });
                                              });
                                            }
                                          });
                                        }
                                      });
                                    }
                                  });
                                }
                              });
                            } else {
                              // no task notes
                              Task_notes = Task_owner + " created this task but did not include any notes...";
                              insert_sql_task = `INSERT INTO task (Task_name, Task_description, Task_id, Task_plan, Task_app_Acronym, Task_state, Task_creator, Task_owner, Task_colour) VALUES (?,?,?,?,?,?,?,?,?)`;
                              con.query(insert_sql_task, [Task_name, Task_description, Task_id, Task_plan, appAcronym, Task_state, Task_creator, Task_owner, Task_colour], function (err, result) {
                                if (err) throw err;
                                else {
                                  const select_sql_tasknotes = `SELECT  Task_state,Task_owner,Task_name,DATE_FORMAT(Task_createDate, "%d/%m/%Y") as formattedDate, TIME_FORMAT(Task_createDate, "%H:%i:%s") as formattedTime FROM task WHERE Task_name = ?`;
                                  con.query(select_sql_tasknotes, [Task_name], function (err, result) {
                                    if (err) throw err;
                                    else {
                                      let inserted_task_notes = "[" + result[0].formattedDate + " " + result[0].formattedTime + "] " + Task_notes + " \n" + "Task State: " + result[0].Task_state + ", Task Owner: " + result[0].Task_owner + "\n";
                                      const insert_sql_task = `UPDATE task SET Task_notes = ? WHERE Task_name = ?`;
                                      con.query(insert_sql_task, [inserted_task_notes, Task_name], function (err, result) {
                                        if (err) throw err;
                                        else {
                                          const insert_into_task_notes = `INSERT INTO tasknotes (Task_name, Task_notes, Task_owner, Task_state) VALUES (?,?,?,?)`;
                                          con.query(insert_into_task_notes, [Task_name, Task_notes, Task_owner, Task_state], function (err, result) {
                                            if (err) throw err;
                                            else {
                                              const select_sql_task = `SELECT * FROM task WHERE Task_name = ?`;
                                              con.query(select_sql_task, [Task_name], function (err, result) {
                                                let Task_id = result[0].Task_id;
                                                return resolve({ code: 200, Task_id });
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
                        // if there is already a task assigned to an Rnumber (need to + 1)
                        const select_sql_application = `SELECT * FROM application WHERE App_Acronym = ?`;
                        con.query(select_sql_application, [appAcronym], function (err, result) {
                          if (err) throw err;
                          let currentAppRnumber = result[0].App_Rnumber;
                          let newAppRnumber = currentAppRnumber + 1;
                          let Task_id = appAcronym + "_" + newAppRnumber;

                          // update latest Rnumber for App_Rnumber in Application
                          const update_sql_application = `UPDATE application SET App_Rnumber = ? WHERE App_Acronym = ?`;
                          con.query(update_sql_application, [newAppRnumber, appAcronym], function (err, result) {
                            if (err) throw err;
                            else {
                              // there are task notes
                              if (Task_notes) {
                                insert_sql_task = `INSERT INTO task (Task_name, Task_description, Task_id, Task_plan, Task_app_Acronym, Task_state, Task_creator, Task_owner, Task_colour) VALUES (?,?,?,?,?,?,?,?,?)`;
                                con.query(insert_sql_task, [Task_name, Task_description, Task_id, Task_plan, appAcronym, Task_state, Task_creator, Task_owner, Task_colour], function (err, result) {
                                  if (err) throw err;
                                  else {
                                    const select_sql_tasknotes = `SELECT  Task_state,Task_owner,Task_name,DATE_FORMAT(Task_createDate, "%d/%m/%Y") as formattedDate, TIME_FORMAT(Task_createDate, "%H:%i:%s") as formattedTime FROM task WHERE Task_name = ?`;
                                    con.query(select_sql_tasknotes, [Task_name], function (err, result) {
                                      if (err) throw err;
                                      else {
                                        let inserted_task_notes = "[" + result[0].formattedDate + " " + result[0].formattedTime + "] " + Task_notes + " \n" + "Task State: " + result[0].Task_state + ", Task Owner: " + result[0].Task_owner + "\n";
                                        const insert_sql_task = `UPDATE task SET Task_notes = ? WHERE Task_name = ?`;
                                        con.query(insert_sql_task, [inserted_task_notes, Task_name], function (err, result) {
                                          if (err) throw err;
                                          else {
                                            const insert_into_task_notes = `INSERT INTO tasknotes (Task_name, Task_notes, Task_owner, Task_state) VALUES (?,?,?,?)`;
                                            con.query(insert_into_task_notes, [Task_name, Task_notes, Task_owner, Task_state], function (err, result) {
                                              if (err) throw err;
                                              else {
                                                const select_sql_task = `SELECT * FROM task WHERE Task_name = ?`;
                                                con.query(select_sql_task, [Task_name], function (err, result) {
                                                  let Task_id = result[0].Task_id;
                                                  return resolve({ code: 200, Task_id });
                                                });
                                              }
                                            });
                                          }
                                        });
                                      }
                                    });
                                  }
                                });
                              } else {
                                // no task notes
                                Task_notes = Task_owner + " created this task but did not include any notes...";
                                insert_sql_task = `INSERT INTO task (Task_name, Task_description, Task_id, Task_plan, Task_app_Acronym, Task_state, Task_creator, Task_owner, Task_colour) VALUES (?,?,?,?,?,?,?,?,?)`;
                                con.query(insert_sql_task, [Task_name, Task_description, Task_id, Task_plan, appAcronym, Task_state, Task_creator, Task_owner, Task_colour], function (err, result) {
                                  if (err) throw err;
                                  else {
                                    const select_sql_tasknotes = `SELECT  Task_state,Task_owner,Task_name,DATE_FORMAT(Task_createDate, "%d/%m/%Y") as formattedDate, TIME_FORMAT(Task_createDate, "%H:%i:%s") as formattedTime FROM task WHERE Task_name = ?`;
                                    con.query(select_sql_tasknotes, [Task_name], function (err, result) {
                                      if (err) throw err;
                                      else {
                                        let inserted_task_notes = "[" + result[0].formattedDate + " " + result[0].formattedTime + "] " + Task_notes + " \n" + "Task State: " + result[0].Task_state + ", Task Owner: " + result[0].Task_owner + "\n";
                                        const insert_sql_task = `UPDATE task SET Task_notes = ? WHERE Task_name = ?`;
                                        con.query(insert_sql_task, [inserted_task_notes, Task_name], function (err, result) {
                                          if (err) throw err;
                                          else {
                                            const insert_into_task_notes = `INSERT INTO tasknotes (Task_name, Task_notes, Task_owner, Task_state) VALUES (?,?,?,?)`;
                                            con.query(insert_into_task_notes, [Task_name, Task_notes, Task_owner, Task_state], function (err, result) {
                                              if (err) throw err;
                                              else {
                                                const select_sql_task = `SELECT * FROM task WHERE Task_name = ?`;
                                                con.query(select_sql_task, [Task_name], function (err, result) {
                                                  let Task_id = result[0].Task_id;
                                                  return resolve({ code: 200, Task_id });
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
                        });
                      }
                    });
                  }
                }
              }
            });
          }
        });
      }
    } else {
      return reject({ code: 4006 });
    }
  });
};

module.exports = { CreateTaskAPI };
