import React, { useEffect, useState, Fragment } from "react";
import { Card, Button, Modal, Form, Row, Col } from "react-bootstrap";
import Axios from "axios";
import { showError, clearError, clearSuccess } from "../../errorDisplay";
import Select from "react-select";

function AppTask(props) {
  // For sending email
  const [sent, setSent] = useState(false);

  // Create Application Form Values
  const [usernameData, setUsernameData] = useState();
  const [emailData, setEmailData] = useState();
  const [groupData, setGroupData] = useState();
  const [isActiveData, setIsActiveData] = useState();
  const [App_permit_Open, setApp_permit_Open] = useState();
  const [App_permit_toDoList, setApp_permit_toDoList] = useState();
  const [App_permit_Doing, setApp_permit_Doing] = useState();
  const [App_permit_Done, setApp_permit_Done] = useState();

  // Retrieving State Information from MySQL
  let [taskOpenData, setTaskOpenData] = useState([]);
  const [currentTaskNotesData, setCurrentTaskNotesData] = useState([]);

  let appAcronym = props.appAcronym;
  let [Task_name, setTask_name] = useState("");
  const [Task_description, setTask_description] = useState("");
  const [Task_notes, setTask_notes] = useState("");
  const [Task_state, setTask_state] = useState("Open");
  const [Task_plan, setTask_plan] = useState("");
  const [valueTaskPlan, setValueTaskPlan] = useState("");
  const [Task_creator, setTask_creator] = useState("");
  let [Task_owner, setTask_owner] = useState("");

  const [show, setShow] = useState(false);
  let username = sessionStorage.getItem("stenggUsername");

  // This is for the movement of Task Cards (when user clicks 'left' or 'right', the Boolean value changes by setting a new state)
  const [updateTaskBool, setUpdateTaskBool] = useState(false);

  async function getSpecificAppInfo() {
    try {
      const response = await Axios.post("/api/specific-app-info", { appAcronym });
      if (response.data) {
        setApp_permit_Open(response.data.App_permit_Open);
        setApp_permit_toDoList(response.data.App_permit_toDoList);
        setApp_permit_Doing(response.data.App_permit_Doing);
        setApp_permit_Done(response.data.App_permit_Done);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getSpecificAppInfo();
  }, [props.show]);

  // For getting user basic credentials (like the homepage table)
  async function getUserData() {
    let username = sessionStorage.getItem("stenggUsername");
    try {
      const response = await Axios.post("/api/send-user-info", { username });
      if (response.data) {
        setUsernameData(response.data.username);
        setEmailData(response.data.email);
        setGroupData(response.data.groupName);
        setIsActiveData(response.data.isActive);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getUserData();
  }, []);

  // This is the data that is displayed on the Task Cards in Kanban Board
  async function getKanbanTaskInfoOpen() {
    try {
      const response = await Axios.post("/api/send-kanban-task-info-open", { appAcronym });
      if (response.data) {
        setTaskOpenData(response.data);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getKanbanTaskInfoOpen();
  }, [props.showTaskModal, updateTaskBool]);

  function handleClose() {
    setUpdateTaskBool(!updateTaskBool);

    setShow(false);
    setTask_plan("");
    setValueTaskPlan("");
    setTask_notes("");
  }

  function handleOpen(taskName, taskDescription, taskState, taskPlan, taskCreator, taskOwner) {
    setShow(true);
    setReadOnlyBool(false);

    console.log(taskOwner);

    setTask_name(taskName);
    setTask_description(taskDescription);
    setTask_state(taskState);
    setTask_plan(taskPlan);
    setTask_creator(taskCreator);
    setTask_owner(taskOwner);
  }

  // This function will update the current task notes when a user keys in a new task note
  async function handleEditTask() {
    setUpdateTaskBool(true);
    Task_owner = sessionStorage.getItem("stenggUsername");

    try {
      clearError();
      clearSuccess();
      const response = await Axios.post("/api/update-current-task-notes", { Task_name, Task_notes, Task_owner, Task_state, Task_plan, Task_description });
      if (response.data) {
        // getKanbanTaskInfoOpen();

        setShow(true);
        setTask_notes("");
        setValueTaskPlan("");
        setTask_owner(sessionStorage.getItem("stenggUsername"));
        showError("updated-task-notes-success", "Successfully Updated " + Task_name + " !");
        setUpdateTaskBool(false);
      }
    } catch (error) {
      setShow(true);
      showError("updated-task-notes-error", error.response.data.errMessage);
      console.log(error);
    }
  }

  // Retrieve data from tasknotes table in MySQL
  async function unpackCurrentTaskNotesData() {
    try {
      const response = await Axios.post("/api/select-current-task-notes", { Task_name });
      if (response.data) {
        setCurrentTaskNotesData(response.data);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    unpackCurrentTaskNotesData();
  }, [show, updateTaskBool, props.showTaskModal]);

  function handleEditTaskPlan(valueTaskPlan) {
    setValueTaskPlan(valueTaskPlan);
    const value = valueTaskPlan.value;
    setTask_plan(value);
  }

  const [readOnlyBool, setReadOnlyBool] = useState(false);
  function handleOpenReadOnly(taskName, taskDescription, taskState, taskPlan, taskCreator, taskOwner) {
    setShow(true);
    setReadOnlyBool(true);

    setTask_name(taskName);
    setTask_description(taskDescription);
    setTask_state(taskState);
    setTask_plan(taskPlan);
    setTask_creator(taskCreator);
    console.log(taskOwner);
    setTask_owner(taskOwner);
  }
  function handleCloseReadOnly() {
    // setReadOnlyBool(false);
    setShow(false);
  }

  return (
    <Fragment>
      <Card style={{ width: "20%", display: "flex", marginTop: "1%", height: "10%", border: "none" }}>
        <Card.Header style={{ textAlign: "center", background: "#80E2FF", color: "black" }} as="h5">
          Open
        </Card.Header>
        <Fragment>
          {taskOpenData.map(info => {
            return (
              <Fragment key={info.Task_name}>
                {info.Task_state === "Open" ? (
                  <Card.Body style={info.Task_colour === "" ? { borderLeft: `2px solid lightgrey`, borderRight: "2px solid lightgrey", borderBottom: "2px solid lightgrey", borderTop: "2px solid lightgrey", marginBottom: "2%", marginTop: "1%", borderRadius: "5px" } : { borderLeft: `10px solid ${info.Task_colour}`, borderRight: "2px solid lightgrey", borderBottom: "2px solid lightgrey", borderTop: "2px solid lightgrey", marginBottom: "2%", marginTop: "1%", borderRadius: "5px" }}>
                    <Card.Title style={{ marginBottom: "5%" }}>
                      {info.Task_name}{" "}
                      <Button onClick={() => handleOpenReadOnly(info.Task_name, info.Task_description, info.Task_state, info.Task_plan, info.Task_creator, info.Task_owner)} variant="primary" style={{ float: "right", fontSize: "70%", marginTop: "-5%", marginRight: "-5%" }}>
                        <i className="bi bi-eye-fill"></i>
                      </Button>{" "}
                    </Card.Title>

                    <Card.Text className="line-ellipsis">
                      <b>Task Description: </b>
                      {info.Task_description}
                    </Card.Text>
                    <Card.Text>
                      <b>Task Owner: </b>
                      {info.Task_owner}
                    </Card.Text>
                    {groupData.includes(App_permit_Open) && App_permit_Open !== "" ? (
                      <Fragment>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <Button variant="dark" style={{ visibility: "hidden" }}>
                            <i className="bi bi-caret-left-square"></i>
                          </Button>
                          <Button onClick={() => handleOpen(info.Task_name, info.Task_description, info.Task_state, info.Task_plan, info.Task_creator, info.Task_owner)} variant="success" style={{ width: "50%" }}>
                            Edit Task
                          </Button>
                          <Button variant="dark" onClick={() => OpenRightToDo(info.Task_name)} style={{ float: "right" }}>
                            <i className="bi bi-caret-right-square"></i>
                          </Button>
                        </div>
                      </Fragment>
                    ) : null}
                  </Card.Body>
                ) : null}
              </Fragment>
            );
          })}
        </Fragment>
      </Card>

      <Card style={{ width: "20%", display: "flex", marginTop: "1%", height: "40%", border: "none" }}>
        <Card.Header style={{ textAlign: "center", background: "#80E2FF", color: "black" }} as="h5">
          To Do
        </Card.Header>
        <Fragment>
          {taskOpenData.map(info => {
            return (
              <Fragment key={info.Task_name}>
                {info.Task_state === "To Do" ? (
                  <Card.Body style={info.Task_colour === "" ? { borderLeft: `2px solid lightgrey`, borderRight: "2px solid lightgrey", borderBottom: "2px solid lightgrey", borderTop: "2px solid lightgrey", marginBottom: "2%", marginTop: "1%", borderRadius: "5px" } : { borderLeft: `10px solid ${info.Task_colour}`, borderRight: "2px solid lightgrey", borderBottom: "2px solid lightgrey", borderTop: "2px solid lightgrey", marginBottom: "2%", marginTop: "1%", borderRadius: "5px" }}>
                    <Card.Title style={{ marginBottom: "5%" }}>
                      {info.Task_name}{" "}
                      <Button onClick={() => handleOpenReadOnly(info.Task_name, info.Task_description, info.Task_state, info.Task_plan, info.Task_creator, info.Task_owner)} variant="primary" style={{ float: "right", fontSize: "70%", marginTop: "-5%", marginRight: "-5%" }}>
                        <i className="bi bi-eye-fill"></i>
                      </Button>{" "}
                    </Card.Title>

                    <Card.Text className="line-ellipsis">
                      <b>Task Description: </b>
                      {info.Task_description}
                    </Card.Text>
                    <Card.Text>
                      <b>Task Owner: </b>
                      {info.Task_owner}
                    </Card.Text>

                    {/* {groupData === App_permit_Open ? (
                      <Button variant="dark" onClick={() => ToDoLeftOpen(info.Task_name)}>
                        <i class="bi bi-caret-left-square"></i>
                      </Button>
                    ) : null} */}
                    {groupData.includes(App_permit_toDoList) && App_permit_toDoList !== "" ? (
                      <Fragment>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <Button variant="dark" style={{ visibility: "hidden" }}>
                            <i className="bi bi-caret-left-square"></i>
                          </Button>

                          <Button onClick={() => handleOpen(info.Task_name, info.Task_description, info.Task_state, info.Task_plan, info.Task_creator, info.Task_owner)} variant="success" style={{ width: "50%" }}>
                            Edit Task
                          </Button>

                          <Button variant="dark" onClick={() => ToDoRightDoing(info.Task_name)} style={{ float: "right" }}>
                            <i className="bi bi-caret-right-square"></i>
                          </Button>
                        </div>
                      </Fragment>
                    ) : null}
                  </Card.Body>
                ) : null}
              </Fragment>
            );
          })}
        </Fragment>
      </Card>

      <Card style={{ width: "20%", display: "flex", marginTop: "1%", height: "10%", border: "none" }}>
        <Card.Header style={{ textAlign: "center", background: "#80E2FF", color: "black" }} as="h5">
          Doing
        </Card.Header>
        <Fragment>
          {taskOpenData.map(info => {
            return (
              <Fragment key={info.Task_name}>
                {info.Task_state === "Doing" ? (
                  <Card.Body style={info.Task_colour === "" ? { borderLeft: `2px solid lightgrey`, borderRight: "2px solid lightgrey", borderBottom: "2px solid lightgrey", borderTop: "2px solid lightgrey", marginBottom: "2%", marginTop: "1%", borderRadius: "5px" } : { borderLeft: `10px solid ${info.Task_colour}`, borderRight: "2px solid lightgrey", borderBottom: "2px solid lightgrey", borderTop: "2px solid lightgrey", marginBottom: "2%", marginTop: "1%", borderRadius: "5px" }}>
                    <Card.Title style={{ marginBottom: "5%" }}>
                      {info.Task_name}{" "}
                      <Button onClick={() => handleOpenReadOnly(info.Task_name, info.Task_description, info.Task_state, info.Task_plan, info.Task_creator, info.Task_owner)} variant="primary" style={{ float: "right", fontSize: "70%", marginTop: "-5%", marginRight: "-5%" }}>
                        <i className="bi bi-eye-fill"></i>
                      </Button>{" "}
                    </Card.Title>
                    <Card.Text className="line-ellipsis">
                      <b>Task Description: </b>
                      {info.Task_description}
                    </Card.Text>
                    <Card.Text>
                      <b>Task Owner: </b>
                      {info.Task_owner}
                    </Card.Text>

                    {groupData.includes(App_permit_Doing) && App_permit_Doing !== "" ? (
                      <Fragment>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <Button variant="dark" onClick={() => DoingLeftToDo(info.Task_name)} style={{ float: "left" }}>
                            <i className="bi bi-caret-left-square"></i>
                          </Button>

                          <Button onClick={() => handleOpen(info.Task_name, info.Task_description, info.Task_state, info.Task_plan, info.Task_creator, info.Task_owner)} variant="success" style={{ width: "50%" }}>
                            Edit Task
                          </Button>

                          <Button variant="dark" onClick={() => DoingRightDone(info.Task_name)} style={{ float: "right" }}>
                            <i className="bi bi-caret-right-square"></i>
                          </Button>
                        </div>
                      </Fragment>
                    ) : null}
                  </Card.Body>
                ) : null}
              </Fragment>
            );
          })}
        </Fragment>
      </Card>

      <Card style={{ width: "20%", display: "flex", marginTop: "1%", height: "10%", border: "none" }}>
        <Card.Header style={{ textAlign: "center", background: "#80E2FF", color: "black" }} as="h5">
          Done
        </Card.Header>
        <Fragment>
          {taskOpenData.map(info => {
            return (
              <Fragment key={info.Task_name}>
                {info.Task_state === "Done" ? (
                  <Card.Body style={info.Task_colour === "" ? { borderLeft: `2px solid lightgrey`, borderRight: "2px solid lightgrey", borderBottom: "2px solid lightgrey", borderTop: "2px solid lightgrey", marginBottom: "2%", marginTop: "1%", borderRadius: "5px" } : { borderLeft: `10px solid ${info.Task_colour}`, borderRight: "2px solid lightgrey", borderBottom: "2px solid lightgrey", borderTop: "2px solid lightgrey", marginBottom: "2%", marginTop: "1%", borderRadius: "5px" }}>
                    <Card.Title style={{ marginBottom: "5%" }}>
                      {info.Task_name}{" "}
                      <Button onClick={() => handleOpenReadOnly(info.Task_name, info.Task_description, info.Task_state, info.Task_plan, info.Task_creator, info.Task_owner)} variant="primary" style={{ float: "right", fontSize: "70%", marginTop: "-5%", marginRight: "-5%" }}>
                        <i className="bi bi-eye-fill"></i>
                      </Button>{" "}
                    </Card.Title>
                    <Card.Text className="line-ellipsis">
                      <b>Task Description: </b>
                      {info.Task_description}
                    </Card.Text>
                    <Card.Text>
                      <b>Task Owner: </b>
                      {info.Task_owner}
                    </Card.Text>
                    {groupData.includes(App_permit_Done) && App_permit_Done !== "" ? (
                      <Fragment>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <Button variant="dark" onClick={() => DoneLeftDoing(info.Task_name)} style={{ width: "20%", float: "left" }}>
                            <i className="bi bi-caret-left-square"></i>
                          </Button>
                          <Button onClick={() => handleOpen(info.Task_name, info.Task_description, info.Task_state, info.Task_plan, info.Task_creator, info.Task_owner)} variant="success" style={{ width: "50%" }}>
                            Edit Task
                          </Button>
                          <Button variant="dark" onClick={() => DoneRightClose(info.Task_name)} style={{ width: "20%", float: "right" }}>
                            <i className="bi bi-caret-right-square"></i>
                          </Button>
                        </div>
                      </Fragment>
                    ) : null}
                  </Card.Body>
                ) : null}
              </Fragment>
            );
          })}
        </Fragment>
      </Card>

      <Card style={{ width: "20%", display: "flex", marginTop: "1%", height: "10%", border: "none" }}>
        <Card.Header style={{ textAlign: "center", background: "#80E2FF", color: "black" }} as="h5">
          Close
        </Card.Header>
        <Fragment>
          {taskOpenData.map(info => {
            return (
              <Fragment key={info.Task_name}>
                {info.Task_state === "Close" ? (
                  <Card.Body style={info.Task_colour === "" ? { borderLeft: `2px solid lightgrey`, borderRight: "2px solid lightgrey", borderBottom: "2px solid lightgrey", borderTop: "2px solid lightgrey", marginBottom: "2%", marginTop: "1%", borderRadius: "5px" } : { borderLeft: `10px solid ${info.Task_colour}`, borderRight: "2px solid lightgrey", borderBottom: "2px solid lightgrey", borderTop: "2px solid lightgrey", marginBottom: "2%", marginTop: "1%", borderRadius: "5px" }}>
                    <Card.Title style={{ marginBottom: "5%" }}>
                      {info.Task_name}{" "}
                      <Button onClick={() => handleOpenReadOnly(info.Task_name, info.Task_description, info.Task_state, info.Task_plan, info.Task_creator, info.Task_owner)} style={{ float: "right", fontSize: "70%", marginTop: "-5%", marginRight: "-5%" }}>
                        <i className="bi bi-eye-fill"></i>
                      </Button>{" "}
                    </Card.Title>
                    <Card.Text className="line-ellipsis">
                      <b>Task Description: </b>
                      {info.Task_description}
                    </Card.Text>
                    <Card.Text>
                      <b>Task Owner: </b>
                      {info.Task_owner}
                    </Card.Text>

                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <Button variant="success" style={{ visibility: "hidden" }}>
                        <i className="bi bi-caret-right-square"></i>
                      </Button>
                      <Button variant="success" style={{ visibility: "hidden", width: "50%" }}>
                        Edit Task
                      </Button>
                      <Button variant="success" style={{ visibility: "hidden" }}>
                        <i className="bi bi-caret-right-square"></i>
                      </Button>
                    </div>
                  </Card.Body>
                ) : null}
              </Fragment>
            );
          })}
        </Fragment>
      </Card>

      <Modal show={show} onHide={handleClose} size="xl">
        <Modal.Header closeButton>{readOnlyBool ? <Modal.Title>Read Only</Modal.Title> : <Modal.Title>Edit {Task_name}</Modal.Title>}</Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Row as={Col}>
                <Row>
                  <Form.Group as={Col} className="mb-3" controlId="exampleForm.ControlInput1">
                    <Form.Label>Task Name: </Form.Label>
                    <Form.Control style={{ background: "lightgrey" }} value={Task_name} onChange={e => setTask_name(e.target.value)} type="text" placeholder="Task Name" readOnly={readOnlyBool ? true : false} />
                  </Form.Group>
                </Row>
                <Row>
                  {Task_state === "Open" ? (
                    <Form.Group as={Col} className="mb-3" controlId="exampleForm.ControlInput1">
                      <Form.Label>Task Description: </Form.Label>
                      <Form.Control style={readOnlyBool ? { background: "lightgrey" } : { background: "white" }} value={Task_description} onChange={e => setTask_description(e.target.value)} as="textarea" placeholder="Task Description" rows={readOnlyBool ? 8 : 3} readOnly={readOnlyBool ? true : false} />
                    </Form.Group>
                  ) : (
                    <Form.Group as={Col} className="mb-3" controlId="exampleForm.ControlInput1">
                      <Form.Label>Task Description: </Form.Label>
                      <Form.Control style={{ background: "lightgrey" }} value={Task_description} onChange={e => setTask_description(e.target.value)} as="textarea" placeholder="Task Description" rows={readOnlyBool ? 8 : 3} readOnly={true} />
                    </Form.Group>
                  )}
                </Row>
                <Row>
                  <Form.Group as={Col} className="mb-3" controlId="exampleForm.ControlInput1">
                    <Form.Label style={readOnlyBool ? { display: "none" } : null}>Task Notes: </Form.Label>
                    <Form.Control style={readOnlyBool ? { display: "none" } : { background: "white" }} value={Task_notes} onChange={e => setTask_notes(e.target.value)} as="textarea" placeholder="Task Notes" rows={4} autoFocus readOnly={readOnlyBool ? true : false} />
                  </Form.Group>
                </Row>
                <Row>
                  <Form.Group as={Col} className="mb-3" controlId="exampleForm.ControlInput1">
                    <Form.Label>Task State:</Form.Label>
                    <input style={{ background: "lightgrey", width: "100%" }} type="text" className="input-normal" name="Task_state" value={Task_state} onChange={e => setTask_state(e.target.value)} readOnly></input>
                  </Form.Group>
                  {!readOnlyBool ? (
                    <Form.Group as={Col} className="mb-3" controlId="exampleForm.ControlInput1">
                      <Form.Label>Current Task Plan: </Form.Label>
                      <input style={{ width: "100%", background: "lightgrey" }} type="text" className="input-normal" name="Task_state" value={Task_plan} readOnly></input>
                    </Form.Group>
                  ) : null}
                  {!readOnlyBool ? (
                    <Form.Group as={Col} className="mb-3" controlId="exampleForm.ControlInput1">
                      <Form.Label>New Task Plan: </Form.Label>
                      <Select value={valueTaskPlan} options={props.optionsPlan} onChange={handleEditTaskPlan} type="text" placeholder="Task Plan"></Select>
                    </Form.Group>
                  ) : (
                    <Form.Group as={Col} className="mb-3" controlId="exampleForm.ControlInput1">
                      <Form.Label>New Task Plan: </Form.Label>
                      <input style={{ width: "100%", background: "lightgrey" }} type="text" className="input-normal" name="Task_state" value={Task_plan} readOnly></input>
                    </Form.Group>
                  )}
                </Row>
                <Row>
                  <Form.Group as={Col} className="mb-3" controlId="exampleForm.ControlInput1">
                    <Form.Label>Task Creator: </Form.Label>
                    <Form.Control value={Task_creator} style={{ background: "lightgrey" }} type="text" placeholder="Task Creator" readOnly />
                  </Form.Group>
                  <Form.Group as={Col} className="mb-3" controlId="exampleForm.ControlInput1">
                    <Form.Label>Task Owner: </Form.Label>
                    <Form.Control value={Task_owner} style={{ background: "lightgrey" }} type="text" placeholder="Task Owner" readOnly />
                  </Form.Group>
                </Row>
              </Row>

              <Fragment>
                {currentTaskNotesData.map(info => {
                  return (
                    <Fragment key={info.Task_name}>
                      <Form.Group as={Col} className="mb-3" controlId="exampleForm.ControlInput1">
                        <Form.Label>Current Task Notes: </Form.Label>
                        <Form.Control value={info.Task_notes} as="textarea" placeholder="There are currently no task notes." style={{ background: "#FFFDD0" }} rows={20} readOnly />
                      </Form.Group>
                    </Fragment>
                  );
                })}
              </Fragment>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          {readOnlyBool ? (
            <Button variant="secondary" onClick={handleCloseReadOnly}>
              Close
            </Button>
          ) : (
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
          )}
          {readOnlyBool ? null : (
            <Button variant="primary" onClick={handleEditTask}>
              Update Task
            </Button>
          )}
        </Modal.Footer>
        <p className="success updated-task-notes-success"></p>
        <p className="error updated-task-notes-error"></p>
      </Modal>
    </Fragment>
  );

  async function OpenRightToDo(taskName) {
    let taskState = "To Do";
    Task_owner = username;
    try {
      const response = await Axios.post("/api/post-change-task-state", { taskName, taskState, Task_owner });
      if (response.data) {
        getKanbanTaskInfoOpen();
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function ToDoLeftOpen(taskName) {
    let taskState = "Open";
    Task_owner = username;
    try {
      const response = await Axios.post("/api/post-change-task-state", { taskName, taskState, Task_owner });
      if (response.data) {
        getKanbanTaskInfoOpen();
      }
    } catch (error) {
      console.log(error);
    }
  }
  async function ToDoRightDoing(taskName) {
    let taskState = "Doing";
    Task_owner = username;

    try {
      const response = await Axios.post("/api/post-change-task-state", { taskName, taskState, Task_owner });
      if (response.data) {
        getKanbanTaskInfoOpen();
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function DoingLeftToDo(taskName) {
    let taskState = "To Do";
    Task_owner = username;

    try {
      const response = await Axios.post("/api/post-change-task-state", { taskName, taskState, Task_owner });
      if (response.data) {
        getKanbanTaskInfoOpen();
      }
    } catch (error) {
      console.log(error);
    }
  }
  async function DoingRightDone(taskName) {
    let taskState = "Done";
    Task_owner = username;

    try {
      const response = await Axios.post("/api/post-change-task-state", { taskName, taskState, Task_owner });
      if (response.data) {
        getKanbanTaskInfoOpen();
        await Axios.post("/api/send-email-project-lead", { username, taskName, appAcronym });
      }
    } catch (error) {
      console.log(error);
    }
  }
  async function DoneLeftDoing(taskName) {
    let taskState = "Doing";
    Task_owner = username;

    try {
      const response = await Axios.post("/api/post-change-task-state", { taskName, taskState, Task_owner });
      if (response.data) {
        getKanbanTaskInfoOpen();
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function DoneRightClose(taskName) {
    let taskState = "Close";
    Task_owner = username;

    try {
      const response = await Axios.post("/api/post-change-task-state", { taskName, taskState, Task_owner });
      if (response.data) {
        getKanbanTaskInfoOpen();
      }
    } catch (error) {
      console.log(error);
    }
  }
  async function CloseLeftDone(taskName) {
    let taskState = "Done";
    Task_owner = username;

    try {
      const response = await Axios.post("/api/post-change-task-state", { taskName, taskState, Task_owner });
      if (response.data) {
        getKanbanTaskInfoOpen();
      }
    } catch (error) {
      console.log(error);
    }
  }
}

export default AppTask;
