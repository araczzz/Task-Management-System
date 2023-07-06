import React, { useState, useEffect, Fragment } from "react";
import Axios from "axios";
import { showError, clearError, clearSuccess } from "../errorDisplay";
import { Button, Form } from "react-bootstrap";

function TeamUserMgmt() {
  useEffect(() => {
    document.title = "Update User | STEngg";
    window.scrollTo(0, 0);
  }, []);

  const username = sessionStorage.getItem("stenggUsername");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      clearError();
      clearSuccess();

      await Axios.post("/api/update-user", { username, password, email });
      showError("update-user-success", "Successfully Updated " + username + " Credentials!");
      setPassword("");
      setEmail("");
    } catch (error) {
      showError("update-user-error", error.response.data.errMessage);
      console.log("Error in Updating User Account");
    }
  }

  return (
    <Fragment>
      <Form onSubmit={handleSubmit} style={{ width: "50%", margin: "auto", marginTop: "5%", border: "1px solid lightgrey", padding: "30px", borderRadius: "10px", background: "lightblue" }}>
        <h3>Update User Account</h3> <br></br>
        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Password:</Form.Label>
          <Form.Control type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} autoFocus />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Email address:</Form.Label>
          <Form.Control type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} />
        </Form.Group>
        <Button variant="primary" type="submit" style={{ width: "50%" }}>
          Update Account
        </Button>
        <small className="success update-user-success"></small>
        <small className="error update-user-error"></small>
      </Form>
    </Fragment>
  );
}

export default TeamUserMgmt;
