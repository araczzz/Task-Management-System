import React, { useEffect, useState, Fragment } from "react";
import Axios from "axios";
import { Card, Button, Row, Col, Modal, Form, Accordion } from "react-bootstrap";
import Select from "react-select";
import { Link } from "react-router-dom";

function ApplicationCards(props) {
  const [applicationData, setApplicationData] = useState([]);
  const [show, setShow] = useState(false);
  const [data, setData] = useState([]);
  const [userGroupData, setUserGroupData] = useState([]);

  async function getApplicationInfo() {
    try {
      const response = await Axios.get("/api/send-application-info");
      setApplicationData(response.data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getApplicationInfo();
  }, [props.show]);

  return (
    <Fragment>
      <div className="button-application-parent-div" style={{ marginTop: "1%" }}>
        {applicationData.map(info => {
          return (
            <Card key={info.App_Acronym} style={{ width: "23.5%", marginBottom: "2%", cursor: "pointer", border: "2px solid black" }}>
              <Card.Body>
                <Link to={`/homepage/kanban-board/${info.App_Acronym}`} style={{ textDecoration: "none" }}>
                  <Card.Title style={{ textAlign: "center" }}>{info.App_Acronym}</Card.Title> <hr></hr>
                  <Card.Subtitle style={{ color: "black" }} className="mt-3 mb-3 text-muted">
                    <b>Running No. </b>
                    {info.App_Rnumber} <br></br>
                  </Card.Subtitle>
                  <div style={{ marginBottom: "5%" }}>
                    <Card.Text style={{ color: "black" }} className="line-ellipsis">
                      <b>App Description: </b> {info.App_Description}
                    </Card.Text>
                  </div>
                  <Card.Text style={{ color: "black" }}>
                    <b>Start Date: </b>
                    {info.App_startDate === null ? "" : info.App_startDate.toString().slice(0, 10)}
                  </Card.Text>
                  <Card.Text style={{ color: "black" }}>
                    <b>End Date: </b>
                    {info.App_endDate === null ? "" : info.App_endDate.toString().slice(0, 10)}
                  </Card.Text>
                </Link>
              </Card.Body>
              {/* <Button variant="success" onClick={() => handleShow(info.App_Acronym)}>
                Update Application
              </Button> */}
            </Card>
          );
        })}
      </div>

      {/* <Modal show={show} onHide={handleClose} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Update Application: {props.appAcronym} </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>App Acronym: </Form.Label>
              <Form.Control value={App_Acronym} onChange={e => setApp_Acronym(e.target.value)} type="text" placeholder="App Acronym" style={{ background: "lightgrey" }} autoFocus readOnly />
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
                <Form.Label>App Permit Open: </Form.Label>
                <Select isClearable defaultValue={defaultValueOpen} value={openValue} placeholder="Permit Open" options={optionsGroup} onChange={handleSelectPermitOpen}></Select>
              </Form.Group>
              <Form.Group as={Col} className="mb-3" controlId="exampleForm.ControlInput1">
                <Form.Label>App Permit To-Do List: </Form.Label>
                <Select isClearable defaultValue={defaultValueToDo} value={toDoValue} placeholder="Permit To Do" options={optionsGroup} onChange={handleSelectPermitToDo}></Select>
              </Form.Group>
              <Form.Group as={Col} className="mb-3" controlId="exampleForm.ControlInput1">
                <Form.Label>App Permit Doing: </Form.Label>
                <Select isClearable defaultValue={defaultValueDoing} value={doingValue} placeholder="Permit Doing" options={optionsGroup} onChange={handleSelectPermitDoing}></Select>
              </Form.Group>
              <Form.Group as={Col} className="mb-3" controlId="exampleForm.ControlInput1">
                <Form.Label>App Permit Done: </Form.Label>
                <Select isClearable defaultValue={defaultValueDone} value={doneValue} placeholder="Permit Done" options={optionsGroup} onChange={handleSelectPermitDone}></Select>
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
      </Modal> */}
    </Fragment>
  );
}

export default ApplicationCards;
