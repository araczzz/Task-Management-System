import React, { useEffect, useState, Fragment } from "react";
import { useParams } from "react-router-dom";
import Axios from "axios";
import Select from "react-select";
import { Row, Col, Container, Button, Modal, Form, Accordion } from "react-bootstrap";
import AppPlan from "./datacomponents/AppPlan";
import { showError, clearError, clearSuccess } from "../errorDisplay";

function KanbanBoard() {
  useEffect(() => {
    document.title = `${appAcronym} | STEngg`;
    window.scrollTo(0, 0);
  }, []);

  // States
  const [appData, setAppData] = useState([]);
  const [userGroupData, setUserGroupData] = useState([]);

  const [show, setShow] = useState(false);

  const [App_Acronym, setApp_Acronym] = useState("");
  let [App_Description, setApp_Description] = useState("");
  const [App_Rnumber, setApp_Rnumber] = useState("");
  const [App_startDate, setApp_startDate] = useState();
  const [App_endDate, setApp_endDate] = useState();
  const [App_permit_Create, setApp_permit_Create] = useState();
  const [App_permit_Open, setApp_permit_Open] = useState();
  const [App_permit_toDoList, setApp_permit_toDoList] = useState();
  const [App_permit_Doing, setApp_permit_Doing] = useState();
  const [App_permit_Done, setApp_permit_Done] = useState();

  const [data, setData] = useState([]);
  const [createValue, setCreateValue] = useState(data.App_permit_Create);
  const [openValue, setOpenValue] = useState(data.App_permit_Open);
  const [toDoValue, setToDoValue] = useState(data.App_permit_toDoList);
  const [doingValue, setDoingValue] = useState(data.App_permit_Doing);
  const [doneValue, setDoneValue] = useState(data.App_permit_Done);

  const { appAcronym } = useParams();

  const [isProjectLead, setIsProjectLead] = useState(false);

  let App_permit_create = "Project Lead";
  // CheckGroup
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

  // Retrieving information of Application table in MySQL
  async function getAppInfo() {
    try {
      const response = await Axios.get(`/api/send-kanban-application-info/${appAcronym}`);
      if (response.data) {
        setAppData(response.data);
      }
    } catch (error) {
      console.log(error);
    }
  }

  // Retrieving information from usergroup table in MySQL
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
    fetchData();
  }, [show]);

  useEffect(() => {
    getAppInfo();
  }, [show]);

  // Permit Actions
  function handleSelectPermitCreate(createValue) {
    setCreateValue(createValue);
    const value = createValue.value;
    setApp_permit_Create(value);
  }

  function handleSelectPermitOpen(openValue) {
    setOpenValue(openValue);
    const value = openValue.value;
    setApp_permit_Open(value);
  }

  function handleSelectPermitToDo(toDoValue) {
    setToDoValue(toDoValue);
    const value = toDoValue.value;
    setApp_permit_toDoList(value);
  }

  function handleSelectPermitDoing(doingValue) {
    setDoingValue(doingValue);
    const value = doingValue.value;
    setApp_permit_Doing(value);
  }

  function handleSelectPermitDone(doneValue) {
    setDoneValue(doneValue);
    const value = doneValue.value;
    setApp_permit_Done(value);
  }

  async function handleSubmit() {
    setShow(true);
    clearError();
    clearSuccess();

    try {
      let App_Acronym = appAcronym;
      const response = await Axios.post("/api/update-application", { App_Acronym, App_Description, App_Rnumber, App_startDate, App_endDate, App_permit_Create, App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done });
      if (response.data) {
        showError("update-application-in-kanban-success", "Successfully updated application: " + App_Acronym);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const fetchData = async () => {
    const response = await Axios.post("/api/post-specific-application-info", { appAcronym });
    // console.log(response.data.App_Acronym);
    if (response.data) {
      setData(response.data);
      setApp_Rnumber(response.data.App_Rnumber);
      setApp_Description(response.data.App_Description);
      setApp_startDate(response.data.App_startDate);
      setApp_endDate(response.data.App_endDate);
      // Task State
      setApp_permit_Create(response.data.App_permit_Create);
      setApp_permit_Open(response.data.App_permit_Open);
      setApp_permit_toDoList(response.data.App_permit_toDoList);
      setApp_permit_Doing(response.data.App_permit_Doing);
      setApp_permit_Done(response.data.App_permit_Done);
    }
  };

  // defaultValue in react-select
  const defaultValueCreate = () => {
    const value = data.App_permit_Create;
    return {
      value: value,
      label: value
    };
  };

  const defaultValueOpen = () => {
    const value = data.App_permit_Open;
    return {
      value: value,
      label: value
    };
  };

  const defaultValueToDo = () => {
    const value = data.App_permit_toDoList;
    return {
      value: value,
      label: value
    };
  };
  const defaultValueDoing = () => {
    const value = data.App_permit_Doing;
    return {
      value: value,
      label: value
    };
  };
  const defaultValueDone = () => {
    const value = data.App_permit_Done;
    return {
      value: value,
      label: value
    };
  };

  const handleClose = () => setShow(false);

  const handleOpenUpdateApplication = () => {
    setShow(true);
  };

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
    <Fragment>
      <Fragment>
        <Accordion style={{ width: "90%", margin: "0 auto" }} defaultActiveKey="0">
          <Accordion.Item eventKey="0">
            <Accordion.Header>Application Details: </Accordion.Header>
            <Accordion.Body>
              <Fragment>
                {appData.map(appDatas => {
                  return (
                    <Row key={appDatas.App_Acronym} style={{ marginBottom: "1%" }}>
                      <Col>
                        <h5>
                          {" "}
                          Application Name: <div style={{ display: "inline", color: "mediumseagreen" }}>{appAcronym}</div>
                        </h5>
                      </Col>
                      <Col>
                        {isProjectLead ? (
                          <Fragment>
                            <Button variant="success" onClick={handleOpenUpdateApplication} style={{ width: "65%" }}>
                              Update Application
                            </Button>
                          </Fragment>
                        ) : null}
                      </Col>
                      <Col>
                        <b>App Start Date: </b> {appDatas.startDate}
                      </Col>
                      <Col>
                        <b>App End Date: </b> {appDatas.endDate}
                      </Col>
                    </Row>
                  );
                })}
              </Fragment>

              {appData.map(appDatas => {
                return (
                  <Row key={appDatas.App_Acronym}>
                    <Col>
                      <b>Permit Create:</b> {appDatas.App_permit_Create}
                    </Col>
                    <Col>
                      <b>Permit Open:</b> {appDatas.App_permit_Open}{" "}
                    </Col>
                    <Col>
                      <b>Permit To-Do:</b> {appDatas.App_permit_toDoList}{" "}
                    </Col>
                    <Col>
                      <b>Permit Doing:</b> {appDatas.App_permit_Doing}{" "}
                    </Col>
                    <Col>
                      <b>Permit Done: </b> {appDatas.App_permit_Done}{" "}
                    </Col>
                  </Row>
                );
              })}
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </Fragment>

      <Modal show={show} onHide={handleClose} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Update Application: {appAcronym} </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>App Acronym: </Form.Label>
              <Form.Control value={appAcronym} onChange={e => setApp_Acronym(e.target.value)} type="text" placeholder="App Acronym" style={{ background: "lightgrey" }} autoFocus readOnly />
            </Form.Group>

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
                <Select defaultValue={defaultValueCreate} value={createValue} placeholder="Permit Create" options={optionsGroup} onChange={handleSelectPermitCreate}></Select>
              </Form.Group>
              <Form.Group as={Col} className="mb-3" controlId="exampleForm.ControlInput1">
                <Form.Label>App Permit Open: </Form.Label>
                <Select defaultValue={defaultValueOpen} value={openValue} placeholder="Permit Open" options={optionsGroup} onChange={handleSelectPermitOpen}></Select>
              </Form.Group>
              <Form.Group as={Col} className="mb-3" controlId="exampleForm.ControlInput1">
                <Form.Label>App Permit To Do: </Form.Label>
                <Select defaultValue={defaultValueToDo} value={toDoValue} placeholder="Permit To Do" options={optionsGroup} onChange={handleSelectPermitToDo}></Select>
              </Form.Group>
              <Form.Group as={Col} className="mb-3" controlId="exampleForm.ControlInput1">
                <Form.Label>App Permit Doing: </Form.Label>
                <Select defaultValue={defaultValueDoing} value={doingValue} placeholder="Permit Doing" options={optionsGroup} onChange={handleSelectPermitDoing}></Select>
              </Form.Group>
              <Form.Group as={Col} className="mb-3" controlId="exampleForm.ControlInput1">
                <Form.Label>App Permit Done: </Form.Label>
                <Select defaultValue={defaultValueDone} value={doneValue} placeholder="Permit Done" options={optionsGroup} onChange={handleSelectPermitDone}></Select>
              </Form.Group>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Update Application
          </Button>
        </Modal.Footer>
        <small className="success update-application-in-kanban-success"></small>
      </Modal>
      <div className="button-task-parent-div">
        <AppPlan show={show} appAcronym={appAcronym} isProjectLead={isProjectLead} openValue={openValue} toDoValue={toDoValue} doingValue={doingValue} doneValue={doneValue} />
      </div>
    </Fragment>
  );
}

export default KanbanBoard;
