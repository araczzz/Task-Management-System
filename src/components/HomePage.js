import React, { useEffect, useState, Fragment } from "react";
import Axios from "axios";
import { Button, Form, Modal, Row, Col, Card, Accordion, Table } from "react-bootstrap";
import { clearError, clearSuccess, showError } from "../errorDisplay";
import Select from "react-select";
import { Link, useParams } from "react-router-dom";
import ApplicationCards from "./ApplicationCards";

function HomePage(props) {
  useEffect(() => {
    document.title = "HomePage | STEngg";
    window.scrollTo(0, 0);
  }, []);

  const { appAcronym } = useParams();

  // Create Application Form Values
  const [usernameData, setUsernameData] = useState();
  const [emailData, setEmailData] = useState();
  const [groupData, setGroupData] = useState();
  const [isActiveData, setIsActiveData] = useState();

  // For checkGroup function
  const [isProjectLead, setIsProjectLead] = useState(false);
  const [userGroupData, setUserGroupData] = useState([]);

  // const [applicationData, setApplicationData] = useState([]);
  const [App_Acronym, setApp_Acronym] = useState("");
  const [App_Description, setApp_Description] = useState("");
  const [App_Rnumber, setApp_Rnumber] = useState("");
  const [App_startDate, setApp_startDate] = useState();
  const [App_endDate, setApp_endDate] = useState();
  const [App_permit_Create, setApp_permit_Create] = useState("");
  const [App_permit_Open, setApp_permit_Open] = useState("");
  const [App_permit_toDoList, setApp_permit_toDoList] = useState("");
  const [App_permit_Doing, setApp_permit_Doing] = useState("");
  const [App_permit_Done, setApp_permit_Done] = useState("");

  // For react-select values
  const [createValue, setCreateValue] = useState("");
  const [openValue, setOpenValue] = useState("");
  const [toDoValue, setToDoValue] = useState("");
  const [doingValue, setDoingValue] = useState("");
  const [doneValue, setDoneValue] = useState("");

  // For Modal
  const [show, setShow] = useState(false);

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

  // CheckGroup
  let App_permit_create = "Project Lead";
  async function checkgroup() {
    let username = sessionStorage.getItem("stenggUsername");
    let groupName = App_permit_create;
    try {
      const response = await Axios.post("/api/checkgroup", { username, groupName });
      if (response.data) {
        setIsProjectLead(response.data);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    checkgroup();
  }, []);

  useEffect(() => {
    getUserData();
  }, []);

  function handleShow() {
    setShow(true);
  }

  function handleClose() {
    setShow(false);
    setApp_Acronym("");
    setApp_Description("");
    setApp_Rnumber("");
    setApp_startDate("");
    setApp_endDate("");
    setOpenValue("");
    setToDoValue("");
    setDoingValue("");
    setDoneValue("");
  }

  async function handleCreateApplication() {
    setShow(true);
    try {
      clearError();
      clearSuccess();
      console.log(App_permit_Create);
      const response = await Axios.post("/api/create-application", { App_Acronym, App_Description, App_Rnumber, App_startDate, App_endDate, App_permit_Create, App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done });
      if (response.data) {
        showError("create-application-success", "Successfully created " + App_Acronym + " Application!");

        setApp_Acronym("");
        setApp_Description("");
        setApp_Rnumber("");
        setApp_startDate("");
        setApp_endDate("");
        setOpenValue("");
        setToDoValue("");
        setDoingValue("");
        setDoneValue("");
      }
    } catch (error) {
      showError("create-application-error", error.response.data.errMessage);
      console.log("Error in Creating application!");
    }
  }

  async function unpackDataGroups() {
    try {
      const response = await Axios.get("/api/create-application-get-usergroup");
      setUserGroupData(response.data);
    } catch (error) {
      console.log(error);
    }
  }

  const optionsGroup = userGroupData.map(info => ({
    value: info.groupName,
    label: info.groupName
  }));

  useEffect(() => {
    unpackDataGroups();
  }, []);

  // Permit Actions
  function handleSelectPermitCreate(App_permit_Create) {
    setCreateValue(App_permit_Create);
    setApp_permit_Create(App_permit_Create.value);
  }

  function handleSelectPermitOpen(App_permit_Open) {
    setOpenValue(App_permit_Open);
    setApp_permit_Open(App_permit_Open.value);
  }

  function handleSelectPermitToDo(App_permit_toDoList) {
    setToDoValue(App_permit_toDoList);
    setApp_permit_toDoList(App_permit_toDoList.value);
  }

  function handleSelectPermitDoing(App_permit_Doing) {
    setDoingValue(App_permit_Doing);
    setApp_permit_Doing(App_permit_Doing.value);
  }

  function handleSelectPermitDone(App_permit_Done) {
    setDoneValue(App_permit_Done);
    setApp_permit_Done(App_permit_Done.value);
  }

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

  return (
    <>
      <Fragment>
        <Accordion style={{ width: "90%", margin: "0 auto" }} defaultActiveKey="0">
          <Accordion.Item eventKey="0">
            <Accordion.Header>Welcome Back {usernameData} !</Accordion.Header>
            <Accordion.Body>
              <h5 style={{ marginLeft: "5%" }}>
                User Details of <div style={{ display: "inline", color: "blue" }}>{usernameData}</div> :{" "}
              </h5>
              <Table striped bordered hover variant="primary" style={{ width: "90%" }}>
                <thead>
                  <tr>
                    <th style={{ color: "black" }}>Username</th>
                    <th style={{ color: "black" }}>Email</th>
                    <th style={{ color: "black" }}>User Group(s)</th>
                    <th style={{ color: "black" }}>isActive</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>{usernameData}</td>
                    <td>{emailData}</td>
                    <td>{groupData}</td>
                    <td>{isActiveData}</td>
                  </tr>
                </tbody>
              </Table>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </Fragment>

      {isProjectLead ? (
        <Fragment>
          <Button className="button-application-management" variant="primary" onClick={handleShow}>
            Create Application{" "}
          </Button>
        </Fragment>
      ) : null}

      <ApplicationCards show={show} appAcronym={appAcronym} />

      {/* For Creating/Updating New Application */}
      <Modal show={show} onHide={handleClose} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Create Application</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Form.Group as={Col} className="mb-3" controlId="exampleForm.ControlInput1">
                <Form.Label>App Acronym: </Form.Label>
                <Form.Control value={App_Acronym} onChange={e => setApp_Acronym(e.target.value)} type="text" placeholder="App Acronym" autoFocus />
              </Form.Group>
              <Form.Group as={Col} className="mb-3" controlId="exampleForm.ControlInput1">
                <Form.Label>App Running Number: </Form.Label>
                <Form.Control value={App_Rnumber} onChange={e => setApp_Rnumber(e.target.value)} type="number" />
              </Form.Group>
            </Row>

            <Form.Group as={Col} className="mb-3" controlId="exampleForm.ControlTextarea1">
              <Form.Label>App Description: </Form.Label>
              <Form.Control style={{ width: "100%" }} value={App_Description} onChange={e => setApp_Description(e.target.value)} as="textarea" placeholder="App Description" rows={3} />
            </Form.Group>

            <Row>
              <Form.Group as={Col} className="mb-3" controlId="exampleForm.ControlInput1">
                <Form.Label>App Start Date: </Form.Label>
                <Form.Control value={App_startDate} min={today} max={App_endDate} onChange={e => setApp_startDate(e.target.value)} type="date" placeholder="DD/MM/YYYY" />
              </Form.Group>
              <Form.Group as={Col} className="mb-3" controlId="exampleForm.ControlInput1">
                <Form.Label>App End Date: </Form.Label>
                <Form.Control value={App_endDate} min={today || App_startDate} onChange={e => setApp_endDate(e.target.value)} type="date" placeholder="DD/MM/YYYY" />
              </Form.Group>
            </Row>

            <Row>
              <Form.Group as={Col} className="mb-3" controlId="exampleForm.ControlInput1">
                <Form.Label>App Permit Create: </Form.Label>
                <Select isClearable value={createValue} placeholder="Permit Create" options={optionsGroup} onChange={handleSelectPermitCreate}></Select>
              </Form.Group>
              <Form.Group as={Col} className="mb-3" controlId="exampleForm.ControlInput1">
                <Form.Label>App Permit Open: </Form.Label>
                <Select isClearable value={openValue} placeholder="Permit Open" options={optionsGroup} onChange={handleSelectPermitOpen}></Select>
              </Form.Group>
              <Form.Group as={Col} className="mb-3" controlId="exampleForm.ControlInput1">
                <Form.Label>App Permit To Do: </Form.Label>
                <Select isClearable value={toDoValue} placeholder="Permit To Do" options={optionsGroup} onChange={handleSelectPermitToDo}></Select>
              </Form.Group>
              <Form.Group as={Col} className="mb-3" controlId="exampleForm.ControlInput1">
                <Form.Label>App Permit Doing: </Form.Label>
                <Select isClearable value={doingValue} placeholder="Permit Doing" options={optionsGroup} onChange={handleSelectPermitDoing}></Select>
              </Form.Group>
              <Form.Group as={Col} className="mb-3" controlId="exampleForm.ControlInput1">
                <Form.Label>App Permit Done: </Form.Label>
                <Select isClearable value={doneValue} placeholder="Permit Done" options={optionsGroup} onChange={handleSelectPermitDone}></Select>
              </Form.Group>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button className="justify-flexstart" variant="secondary" onClick={handleClose}>
            Close
          </Button>
          {/* <Button variant="success" onClick={handleUpdateApplication}>
            Update Application
          </Button> */}
          <Button variant="primary" onClick={handleCreateApplication}>
            Create Application
          </Button>
        </Modal.Footer>
        <p className="error create-application-error"></p>
        <p className="success create-application-success"></p>
        <p className="success update-application-success"></p>
        <p className="error update-application-error"></p>
      </Modal>
    </>
  );
}

export default HomePage;
