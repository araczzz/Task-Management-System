import React, { useState, Fragment } from "react";
import Axios from "axios";
import { showError, clearError } from "../errorDisplay";
import { Button, Form } from "react-bootstrap";

function LoggedOut(props) {
  const [username, setUsername] = useState();
  const [password, setPassword] = useState();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const response = await Axios.post("/api/login", { username, password });
      clearError();

      if (response.data) {
        console.log(response.data);
        sessionStorage.setItem("stenggUsername", response.data.username);
        sessionStorage.setItem("accessToken", response.data.accessToken);
        props.setLoggedIn(true);
      }
    } catch (error) {
      showError("login-error-message", error.response.data.errMessage);
      console.log("Error in Logging In");
    }
  }

  return (
    <Fragment>
      <Form onSubmit={handleSubmit} style={{ width: "40%", margin: "10% auto", padding: "3%", borderRadius: "2%", background: "#555" }}>
        <h4 style={{ color: "white" }}>Task Management System</h4>

        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label style={{ color: "white" }}>
            Username <div style={{ color: "red", display: "inline" }}>*</div> :
          </Form.Label>
          <Form.Control onChange={e => setUsername(e.target.value)} type="text" placeholder="Enter Username" autoFocus="on" />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label style={{ color: "white" }}>
            Password <div style={{ color: "red", display: "inline" }}>*</div> :
          </Form.Label>
          <Form.Control onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" autoComplete="off" />
        </Form.Group>
        <Button style={{ width: "45%", marginTop: "2%" }} variant="success" type="submit">
          Login
        </Button>
        <small className="error login-error-message"></small>
      </Form>
    </Fragment>
  );
}

export default LoggedOut;
