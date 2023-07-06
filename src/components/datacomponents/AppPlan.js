import React, { useEffect, useState, Fragment, useCallback } from "react";
import { Card, Button, Modal, Form, Row, Col } from "react-bootstrap";
import Axios from "axios";
import { showError, clearError, clearSuccess } from "../../errorDisplay";
import AppTask from "./AppTask";
import Select from "react-select";

function AppPlan(props) {
  const [show, setShow] = useState(false);
  const handleShow = () => setShow(true);

  const [Plan_startDate, setPlan_startDate] = useState();
  const [Plan_endDate, setPlan_endDate] = useState();
  let [Plan_MVP_name, setPlan_MVP_name] = useState("");
  const [planData, setPlanData] = useState([]);

  // States for Task table in MySQL
  let [Task_name, setTask_name] = useState("");
  const [Task_description, setTask_description] = useState("");
  const [Task_notes, setTask_notes] = useState("");
  const [Task_state, setTask_state] = useState("Open");
  const [Task_plan, setTask_plan] = useState("");
  const [taskPlanValue, setTaskPlanValue] = useState("");
  const [allPlanData, setAllPlanData] = useState([]);

  const [planColour, setPlanColour] = useState();
  const [showTaskModal, setShowTaskModal] = useState(false);

  let Task_creator = sessionStorage.getItem("stenggUsername");
  let Task_owner = sessionStorage.getItem("stenggUsername");

  const [isProjectManager, setIsProjectManager] = useState(false);

  let create_plan_permit = "Project Manager";
  // CheckGroup
  async function checkgroup() {
    let username = sessionStorage.getItem("stenggUsername");
    let groupName = create_plan_permit;
    try {
      const response = await Axios.post("/api/checkgroup", { username, groupName });
      if (response.data) {
        setIsProjectManager(response.data);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    checkgroup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    setShow(false);
    setPlan_MVP_name("");
    setPlan_startDate("");
    setPlan_endDate("");
  };

  async function handleCreatePlan(e) {
    e.preventDefault();

    setShow(true);

    try {
      clearError();
      clearSuccess();
      let appAcronym = props.appAcronym;
      Plan_MVP_name = Plan_MVP_name.trim();
      console.log(planColour);
      const response = await Axios.post("/api/create-kanban-plan", { Plan_MVP_name, Plan_startDate, Plan_endDate, appAcronym, planColour });
      if (response.data) {
        showError("created-kanban-plan-success", "Successfully created plan " + Plan_MVP_name);
      }
      setTaskPlanValue("");
      setPlan_MVP_name("");
      setPlan_startDate("");
      setPlan_endDate("");
      let useRandomMathGenerator = (Math.random() * 0xffff * 1000000).toString(16);
      let randomHex = "#" + useRandomMathGenerator.slice(0, 6);
      setPlanColour(randomHex);
    } catch (error) {
      showError("created-kanban-plan-error", error.response.data.errMessage);
      console.log(error);
    }
  }

  // Retrieving information of Plan table in MySQL
  async function getPlanInfo() {
    try {
      const response = await Axios.get(`/api/send-kanban-plan-info/${props.appAcronym}`);
      if (response.data) {
        setPlanData(response.data);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getPlanInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  // Today's date
  let today = new Date();
  let dd = today.getDate();
  let mm = today.getMonth() + 1; //January is 0!
  let yyyy = today.getFullYear();
  if (dd < 10) {
    dd = "0" + dd;
  }
  if (mm < 10) {
    mm = "0" + mm;
  }
  today = yyyy + "-" + mm + "-" + dd;

  // Retrieving specific plan name on click
  function handleShowModal() {
    setShowTaskModal(true);
  }

  // Close Task Modal
  function handleCloseModal() {
    setShowTaskModal(false);
    setTaskPlanValue("");
    setTask_plan("");
    setTask_name("");
    setTask_description("");
    setTask_notes("");
    setTask_state("Open");
    setShowPlanMVPName(false);
    // setValueTaskState();
  }

  // Create Task Modal
  async function handleSubmitCreateTask(e) {
    e.preventDefault();

    setShowTaskModal(true);
    setShowPlanMVPName(false);
    try {
      clearError();
      clearSuccess();
      console.log(Task_plan);
      let appAcronym = props.appAcronym;
      const response = await Axios.post("/api/create-task", { Task_name, Task_description, Task_notes, Task_plan, appAcronym, Task_state, Task_creator, Task_owner });
      setTask_name("");
      setTaskPlanValue("");
      setTask_plan("");
      setTask_description("");
      setTask_notes("");
      setTask_state("Open");
      //   setValueTaskState();
      if (response.data) {
        showError("success-create-task", "Successfully created " + Task_name + " !");
      }
    } catch (error) {
      showError("error-create-task", error.response.data.errMessage);
      console.log(error);
    }
  }

  // Random Hex Color Generator (for tagging plan to task)
  function randomHexGenerator() {
    let useRandomMathGenerator = (Math.random() * 0xffff * 1000000).toString(16);
    let randomHex = "#" + useRandomMathGenerator.slice(0, 6);
    setPlanColour(randomHex);
  }

  useEffect(() => {
    randomHexGenerator();
  }, [show]);

  // For react-select on Task Plan (Create Task Modal)
  function handleSelectTaskPlan(taskPlanValue) {
    setTaskPlanValue(taskPlanValue);
    const value = taskPlanValue.value;
    setTask_plan(value);
  }

  // Getting information on all plans (Purpose: for Create Task Modal react-select dropdown)
  async function unpackDataPlan() {
    let Plan_app_Acronym = props.appAcronym;
    try {
      const response = await Axios.post("/api/get-all-plans", { Plan_app_Acronym });
      if (response.data) {
        setAllPlanData(response.data);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    unpackDataPlan();
  }, [show]);

  const optionsPlan = allPlanData.map(info => ({
    value: info.Plan_MVP_name,
    label: info.Plan_MVP_name
  }));

  const [showPlanMVPName, setShowPlanMVPName] = useState(false);
  function handleShowModalSpecificTaskPlan(taskPlan) {
    setTask_plan(taskPlan);
    setShowTaskModal(true);
    setShowPlanMVPName(true);
  }

  return (
    <>
      <Fragment>
        <Card style={{ width: "20%", marginTop: "1%", border: "solid white" }}>
          <Card.Header style={{ textAlign: "center", background: "lightblue" }}>
            <h5>Plan Management</h5>
          </Card.Header>
          {isProjectManager ? (
            <Fragment>
              <Button variant="primary" onClick={handleShow}>
                <i className="bi bi-plus-square"></i> Create Plan
              </Button>
            </Fragment>
          ) : null}

          {props.isProjectLead ? (
            <Fragment>
              <Button variant="primary" onClick={handleShowModal}>
                <i className="bi bi-plus-square"></i> Create Task
              </Button>
            </Fragment>
          ) : null}

          {planData.map(info => {
            return (
              <Card key={info.Plan_MVP_name} style={{ borderLeft: `10px solid ${info.Plan_colour}`, marginBottom: "2%" }}>
                <Card.Body>
                  <Card.Title style={{ marginBottom: "5%" }}>{info.Plan_MVP_name}</Card.Title>
                  <Card.Text>
                    <b>Start Date:</b> {info.Plan_startDate}
                  </Card.Text>
                  <Card.Text>
                    <b>End Date:</b> {info.Plan_endDate}
                  </Card.Text>
                  {props.isProjectLead ? (
                    <Fragment>
                      <Button variant="primary" onClick={() => handleShowModalSpecificTaskPlan(info.Plan_MVP_name)}>
                        <i className="bi bi-plus-square"></i> Create Task
                      </Button>
                    </Fragment>
                  ) : null}
                </Card.Body>
              </Card>
            );
          })}
        </Card>

        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Create New Plan</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                <Form.Label>Plan App Acronym:</Form.Label>
                <Form.Control value={props.appAcronym} type="text" placeholder="Plan App Acronym" style={{ background: "lightgrey" }} readOnly />
              </Form.Group>

              <Row>
                <Form.Group as={Col} className="mb-3" controlId="exampleForm.ControlInput1">
                  <Form.Label>Plan MVP Name:</Form.Label>
                  <Form.Control value={Plan_MVP_name} onChange={e => setPlan_MVP_name(e.target.value)} type="text" placeholder="Plan MVP name" autoFocus />
                </Form.Group>
                <Form.Group as={Col} className="mb-3" controlId="exampleForm.ControlInput1">
                  <Form.Label>Plan Colour:</Form.Label>
                  <Form.Control type="color" placeholder="Plan Colour" value={planColour} onChange={e => setPlanColour(e.target.value)} style={{ width: "100%" }} />
                </Form.Group>
              </Row>

              <Row>
                <Form.Group as={Col} className="mb-3" controlId="exampleForm.ControlInput1">
                  <Form.Label>Plan Start Date:</Form.Label>
                  <Form.Control value={Plan_startDate} onChange={e => setPlan_startDate(e.target.value)} min={today} max={Plan_endDate} type="date" placeholder="Plan Start Date" />
                </Form.Group>
                <Form.Group as={Col} className="mb-3" controlId="exampleForm.ControlInput1">
                  <Form.Label>Plan End Date:</Form.Label>
                  <Form.Control value={Plan_endDate} onChange={e => setPlan_endDate(e.target.value)} min={today || Plan_startDate} type="date" placeholder="Plan End Date" />
                </Form.Group>
              </Row>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button variant="primary" onClick={handleCreatePlan}>
              <i className="bi bi-plus-square"></i> Create Plan
            </Button>
          </Modal.Footer>
          <p className="success created-kanban-plan-success"></p>
          <p className="error created-kanban-plan-error"></p>
        </Modal>

        {/* Modal Task Form */}
        <Modal show={showTaskModal} onHide={handleCloseModal} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Create Task:</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              {/* <Row> */}
              {/* <Row as={Col}> */}
              <Row>
                <Form.Group as={Col} className="mb-3" controlId="exampleForm.ControlInput1">
                  <Form.Label>Task Name: </Form.Label>
                  <Form.Control value={Task_name} onChange={e => setTask_name(e.target.value)} type="text" placeholder="Task Name" autoFocus />
                </Form.Group>
                {showPlanMVPName ? (
                  <Form.Group as={Col} className="mb-3" controlId="exampleForm.ControlInput1">
                    <Form.Label>Task Plan: </Form.Label>
                    <Form.Control value={Task_plan} style={{ background: "lightgrey" }} readOnly></Form.Control>
                    {/* <Select isClearable options={optionsPlan} value={taskPlanValue} onChange={handleSelectTaskPlan} type="text" placeholder="Plan MVP Name"></Select> */}
                  </Form.Group>
                ) : (
                  <Form.Group as={Col} className="mb-3" controlId="exampleForm.ControlInput1">
                    <Form.Label>Task Plan: </Form.Label>
                    <Select isClearable options={optionsPlan} value={taskPlanValue} onChange={handleSelectTaskPlan} type="text" placeholder="Plan MVP Name"></Select>
                  </Form.Group>
                )}
              </Row>
              <Row>
                <Form.Group as={Col} className="mb-3" controlId="exampleForm.ControlInput1">
                  <Form.Label>Task Description: </Form.Label>
                  <Form.Control value={Task_description} onChange={e => setTask_description(e.target.value)} as="textarea" placeholder="Task Description" rows={3} />
                </Form.Group>
              </Row>
              <Row>
                <Form.Group as={Col} className="mb-3" controlId="exampleForm.ControlInput1">
                  <Form.Label>Task Notes: </Form.Label>
                  <Form.Control value={Task_notes} onChange={e => setTask_notes(e.target.value)} as="textarea" placeholder="Task Notes" rows={4} />
                </Form.Group>
              </Row>

              <Row>
                <Form.Group as={Col} className="mb-3" controlId="exampleForm.ControlInput1">
                  <Form.Label>Default Task State: </Form.Label>
                  <Form.Control value={Task_state} style={{ background: "lightgrey" }} onChange={e => setTask_state(e.target.value)} type="text" placeholder="Task State" rows={4} readOnly />
                </Form.Group>

                <Form.Group as={Col} className="mb-3" controlId="exampleForm.ControlInput1">
                  <Form.Label>Task Creator: </Form.Label>
                  <Form.Control value={Task_creator} style={{ background: "lightgrey" }} type="text" placeholder="Task Creator" readOnly />
                </Form.Group>
                <Form.Group as={Col} className="mb-3" controlId="exampleForm.ControlInput1">
                  <Form.Label>Task Owner: </Form.Label>
                  <Form.Control value={Task_owner} style={{ background: "lightgrey" }} type="text" placeholder="Task Owner" readOnly />
                </Form.Group>
              </Row>
              {/* </Row> */}
              {/* <Row as={Col}>
                  <Form.Group as={Col} className="mb-3" controlId="exampleForm.ControlInput1">
                    <Form.Label>Current Task Notes: </Form.Label>
                    <Form.Control as="textarea" placeholder="There are currently no task notes." style={{ background: "#FFFDD0" }} rows={20} readOnly />
                  </Form.Group>
                </Row> */}
              {/* </Row> */}
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Close
            </Button>
            <Button variant="primary" onClick={handleSubmitCreateTask}>
              Create Task
            </Button>
          </Modal.Footer>
          <p className="success success-create-task"></p>
          <p className="error error-create-task"></p>
        </Modal>
        <AppTask show={props.show} appAcronym={props.appAcronym} showTaskModal={showTaskModal} optionsPlan={optionsPlan} isProjectLead={props.isProjectLead} isProjectManager={isProjectManager} openValue={props.openValue} toDoValue={props.toDoValue} doingValue={props.doingValue} doneValue={props.doneValue} />
      </Fragment>
    </>
  );
}

export default AppPlan;
