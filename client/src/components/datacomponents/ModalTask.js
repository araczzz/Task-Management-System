import React, { useEffect, useState } from "react";
import { Modal, Form, Row, Col, Button } from "react-bootstrap";
import Select from "react-select";

function ModalTask() {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <Modal show={show} onHide={handleClose} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>Update Application: </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
            <Form.Label>App Acronym: </Form.Label>
            <Form.Control type="text" placeholder="App Acronym" style={{ background: "lightgrey" }} autoFocus readOnly />
          </Form.Group>

          <Row>
            <Form.Group as={Col} className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>App Start Date: </Form.Label>
              <Form.Control type="date" placeholder="DD/MM/YYYY" />
            </Form.Group>
            <Form.Group as={Col} className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>App End Date: </Form.Label>
              <Form.Control type="date" placeholder="DD/MM/YYYY" />
            </Form.Group>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleClose}>
          Update Application
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalTask;
