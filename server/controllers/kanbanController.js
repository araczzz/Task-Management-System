const con = require("../config/database");
const ErrorHandler = require("../error/errorHandler");

const send_kanban_plan_info = (req, res, next) => {
  const select_sql_plan = `SELECT Plan_MVP_name, Plan_app_Acronym, Plan_colour, DATE_FORMAT(Plan_startDate, "%d-%m-%Y") as Plan_startDate, DATE_FORMAT(Plan_endDate, "%d-%m-%Y") as Plan_endDate  FROM plan WHERE Plan_app_Acronym = "${req.params.appAcronym}"`;
  con.query(select_sql_plan, function (err, result) {
    if (err) throw err;
    else {
      res.send(result);
    }
  });
};

const send_kanban_application_info = (req, res, next) => {
  // const select_sql_application = `SELECT * FROM application where App_Acronym = "${req.params.appAcronym}"`;
  const select_sql_application = `SELECT App_Description, App_Rnumber, DATE_FORMAT(App_startDate, "%d-%m-%Y") as startDate, DATE_FORMAT(App_endDate, "%d-%m-%Y") as endDate, App_permit_Create, App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done FROM application where App_Acronym = "${req.params.appAcronym}"`;
  con.query(select_sql_application, function (err, result) {
    if (err) throw err;
    else {
      res.send(result);
    }
  });
};

// Create Plan
const create_kanban_plan = (req, res, next) => {
  let { appAcronym, Plan_MVP_name, Plan_startDate, Plan_endDate, planColour } = req.body;
  if (Plan_MVP_name) {
    const check_sql_plan = `SELECT * FROM plan WHERE Plan_MVP_name = ?`;
    con.query(check_sql_plan, [Plan_MVP_name], function (err, result) {
      if (err) throw err;
      else if (result.length > 0) {
        return next(new ErrorHandler("Plan name already exists. Please try again!"));
      } else {
        check_sql_plan_colour = `SELECT * FROM plan WHERE Plan_colour = ?`;
        con.query(check_sql_plan_colour, [planColour], function (err, result) {
          if (err) throw err;
          else if (result.length > 0) {
            return next(new ErrorHandler("Plan colour with HEX " + planColour + " already exist. Please try again."));
          } else {
            if (Plan_startDate) {
              if (Plan_endDate) {
                const insert_sql_plan = `INSERT INTO plan VALUES (?,?,?,?,now(),?)`;
                con.query(insert_sql_plan, [Plan_MVP_name, Plan_startDate, Plan_endDate, appAcronym, planColour], function (err, result) {
                  if (err) throw err;
                  else {
                    res.send(result);
                  }
                });
              } else {
                return next(new ErrorHandler("Please enter a End Date for Plan " + Plan_MVP_name));
              }
            } else {
              return next(new ErrorHandler("Please enter a Start Date for Plan " + Plan_MVP_name));
            }
          }
        });
      }
    });
  } else {
    return next(new ErrorHandler("Please enter a Plan Name!"));
  }
};

// Create Task
const create_task = (req, res, next) => {
  let { Task_name, Task_description, Task_notes, Task_plan, appAcronym, Task_state, Task_creator, Task_owner } = req.body;
  Task_name = Task_name.trim();

  // Mandatory field
  if (Task_name) {
    // if there is a task description
    const select_sql_task = `SELECT * FROM task WHERE Task_name = ?`;
    con.query(select_sql_task, [Task_name], function (err, result) {
      if (err) throw err;
      if (result.length > 0) {
        return next(new ErrorHandler("Task " + Task_name + " already exist. Please try again."));
      } else {
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
                                          res.send(result);
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
                                          res.send(result);
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
                                            res.send(result);
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
                                            res.send(result);
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
                                      res.send(result);
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
                                      res.send(result);
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
                                        res.send(result);
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
                                        res.send(result);
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
            console.log("Reached here 69");

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
                                          res.send(result);
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
                                          res.send(result);
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
                                            res.send(result);
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
                                            res.send(result);
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
                                      res.send(result);
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
                                      res.send(result);
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
                                        res.send(result);
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
                                        res.send(result);
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
  } else {
    return next(new ErrorHandler("Please enter a Task Name!"));
  }
};

// Extract Kanban Created Tasks Results
const send_kanban_task_info_open = (req, res, next) => {
  let Task_app_Acronym = req.body.appAcronym;

  const select_sql_task = `SELECT * FROM task WHERE Task_app_Acronym = ?`;
  con.query(select_sql_task, [Task_app_Acronym], function (err, result) {
    if (err) throw err;
    else {
      res.send(result);
    }
  });
};

// Updating Task Notes to Current Task Notes
const update_current_task_notes = (req, res, next) => {
  let { Task_name, Task_notes, Task_owner, Task_state, Task_plan, Task_description } = req.body;

  // if there are task notes
  if (Task_notes) {
    // Insert new entry into tasknotes
    const insert_into_task_notes = `INSERT INTO tasknotes (Task_name, Task_notes, Task_owner, Task_state) VALUES (?,?,?,?)`;
    con.query(insert_into_task_notes, [Task_name, Task_notes, Task_owner, Task_state], function (err, result) {
      if (err) throw err;
      else {
        const insert_into_task = `UPDATE task SET Task_plan = ? WHERE Task_name = ?`;
        con.query(insert_into_task, [Task_plan, Task_name], function (err, result) {
          if (err) throw err;
          else {
            // combine all the task notes for that specific Task Name
            const select_sql_tasknotes = `SELECT Task_notes, DATE_FORMAT(updated_date, "%d/%m/%Y") as formattedDate, TIME_FORMAT(updated_date, "%H:%i:%s") as formattedTime , Task_owner, Task_state FROM tasknotes WHERE Task_name = ?`;
            con.query(select_sql_tasknotes, [Task_name], function (err, result) {
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

                // Update Task notes
                const update_sql_task = `UPDATE task SET Task_notes = ? WHERE Task_name = ?`;
                con.query(update_sql_task, [concatenatedTaskStringSQL, Task_name], function (err, result) {
                  if (err) throw err;
                  else {
                    // Update Task description
                    const update_sql_task_description = `UPDATE task SET Task_description = ? WHERE Task_name = ?`;
                    con.query(update_sql_task_description, [Task_description, Task_name], function (err, result) {
                      if (err) throw err;
                      else {
                        // Update Task Owner
                        const update_sql_task_owner = `UPDATE task SET Task_owner = ? WHERE Task_name = ?`;
                        con.query(update_sql_task_owner, [Task_owner, Task_name], function (err, result) {
                          if (err) throw err;
                          else {
                            // Check if there is such a plan created.
                            if (Task_plan) {
                              // update new plan colour to task
                              const select_sql_plan = `SELECT * FROM plan WHERE Plan_MVP_name = ?`;
                              con.query(select_sql_plan, [Task_plan], function (err, result) {
                                if (err) throw err;
                                else {
                                  let Task_colour = result[0].Plan_colour;
                                  const update_sql_task = `UPDATE task SET Task_colour = ? WHERE Task_name = ?`;
                                  con.query(update_sql_task, [Task_colour, Task_name], function (err, result) {
                                    if (err) throw err;
                                    else {
                                      res.send(result);
                                    }
                                  });
                                }
                              });
                            } else {
                              res.send(result);
                            }
                          }
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
    });
  } else {
    // Update Task Plan
    const insert_into_task = `UPDATE task SET Task_plan = ? WHERE Task_name = ?`;
    con.query(insert_into_task, [Task_plan, Task_name], function (err, result) {
      if (err) throw err;
      else {
        // Update Task description
        const update_sql_task_description = `UPDATE task SET Task_description = ? WHERE Task_name = ?`;
        con.query(update_sql_task_description, [Task_description, Task_name], function (err, result) {
          if (err) throw err;
          else {
            const update_sql_task_owner = `UPDATE task SET Task_owner = ? WHERE Task_name = ?`;
            con.query(update_sql_task_owner, [Task_owner, Task_name], function (err, result) {
              if (err) throw err;
              else {
                // Update Task Plan (if any)
                if (Task_plan) {
                  // Update new Task Colour by getting Plan Colour
                  const select_sql_plan = `SELECT * FROM plan WHERE Plan_MVP_name = ?`;
                  con.query(select_sql_plan, [Task_plan], function (err, result) {
                    if (err) throw err;
                    else {
                      let Task_colour = result[0].Plan_colour;
                      const update_sql_task = `UPDATE task SET Task_colour = ? WHERE Task_name = ?`;
                      con.query(update_sql_task, [Task_colour, Task_name], function (err, result) {
                        if (err) throw err;
                        else {
                          res.send(result);
                        }
                      });
                    }
                  });
                  // If there is no task plan
                } else {
                  res.send(result);
                }
              }
            });
          }
        });
      }
    });
  }
};

// Sending all Updated Task Notes in tasknotes table to React JS
const select_current_task_notes = (req, res, next) => {
  let Task_name = req.body.Task_name;
  const select_sql_task_notes = `SELECT Task_notes, Task_name FROM task WHERE Task_name = ?`;
  con.query(select_sql_task_notes, [Task_name], function (err, result) {
    if (err) throw err;
    else {
      res.send(result);
    }
  });
};

// Updating Task_state upon movement of card in Kanban Board
const post_change_task_state = (req, res, next) => {
  let { taskName, taskState, Task_owner } = req.body;

  const select_sql_task = "SELECT * FROM task WHERE Task_name = ?";
  con.query(select_sql_task, [taskName], function (err, result) {
    if (err) throw err;
    else {
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
                        else res.send(result);
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
  });
};

const get_all_plans = (req, res, next) => {
  let Plan_app_Acronym = req.body.Plan_app_Acronym;
  const select_sql_plans = `SELECT * FROM plan WHERE Plan_app_Acronym=?`;
  con.query(select_sql_plans, [Plan_app_Acronym], function (err, result) {
    if (err) throw err;
    else {
      res.send(result);
    }
  });
};

const get_specific_task = (req, res, next) => {
  let Task_name = req.body.taskName;
  // let Task_plan = ""
  const select_specific_plan = `SELECT * FROM task WHERE Task_name = ?`;
  con.query(select_specific_plan, [Task_name], function (err, result) {
    if (err) throw err;
    else {
      Task_plan = result[0].Task_plan;
      const jsonData = { Task_plan };
      res.send(JSON.stringify(jsonData));
    }
  });
};

const specific_app_info = (req, res, next) => {
  let App_Acronym = req.body.appAcronym;
  const select_specific_app = `SELECT * FROM application WHERE App_Acronym = ?`;
  con.query(select_specific_app, [App_Acronym], function (err, result) {
    if (err) throw err;
    // if (App_permit_Open == "") {
    //   App_permit_Open = null;
    // }
    // if (App_permit_toDoList == "") {
    //   App_permit_toDoList = null;
    // }
    // if (App_permit_Doing == "") {
    //   App_permit_Doing = null;
    // }
    // if (App_permit_Done == "") {
    //   App_permit_Done = null;
    // }
    let App_permit_Open = result[0].App_permit_Open;
    let App_permit_toDoList = result[0].App_permit_toDoList;
    let App_permit_Doing = result[0].App_permit_Doing;
    let App_permit_Done = result[0].App_permit_Done;
    const jsonData = { App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done };
    res.send(JSON.stringify(jsonData));
  });
};

module.exports = { specific_app_info, get_specific_task, get_all_plans, select_current_task_notes, update_current_task_notes, post_change_task_state, send_kanban_plan_info, send_kanban_application_info, create_kanban_plan, create_task, send_kanban_task_info_open };
