import React, { useState, useEffect, Fragment } from "react";
import Axios from "axios";
import { showError, clearError, clearSuccess } from "../errorDisplay";
import AdminDatabase from "./AdminDatabaseTable";
import Select from "react-select";
import { Form, Button, Row, Col } from "react-bootstrap";

function AdminAddUpdateUser() {
  useEffect(() => {
    document.title = "User Management | STEngg";
    window.scrollTo(0, 0);
  }, []);

  const [data, setData] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [groupName, setGroupName] = useState("");
  const [isActive, setIsActive] = useState("Active");
  const [group, setGroup] = useState("");

  // Getting all created User Group(s) for UserGroup React-Select
  async function unpackDataGroups() {
    try {
      const response = await Axios.get("/api/get-group");
      setData(response.data);
    } catch (error) {
      console.log(error);
    }
  }

  // Options for UserGroup React-Select
  const optionsGroup = data.map(info => ({
    value: info.groupName,
    label: info.groupName
  }));

  useEffect(() => {
    unpackDataGroups();
  }, []);

  // Retrieving the value/label of the selected option
  const handleSelect = groupName => {
    setGroupName(groupName);
    setGroup(groupName.map(x => x.value));
  };

  // Add User (Posting the relevant data in the input fields)
  async function handleSubmit(event) {
    event.preventDefault();

    try {
      clearError();
      clearSuccess();

      let groupString = group.toString();
      const response = await Axios.post("/api/register", {
        username,
        password,
        email,
        groupString,
        isActive
      });
      if (response.data) {
        showError("created-user-success", "Successfully added user " + username);
        setUsername("");
        setPassword("");
        setEmail("");
        setGroupName("");
        setIsActive("Active");
        setGroup("");
      }
    } catch (error) {
      showError("created-user-error", error.response.data.errMessage);
      console.log("Error in Adding Account");
      console.log(error);
    }
  }

  // Update User (Posting the relevant input fields)
  async function handleUpdate(e) {
    e.preventDefault();

    try {
      clearError();
      clearSuccess();

      let groupString = group.toString();
      const response = await Axios.post("/api/update", {
        username,
        password,
        email,
        groupString,
        isActive
      });
      showError("update-user-success", "User " + username + " was successfully updated!");
      setUsername("");
      setPassword("");
      setEmail("");
      setGroupName("");
      setIsActive("Active");
      setGroup("");
    } catch (error) {
      showError("update-user-error", error.response.data.errMessage);
      console.log("Error in Updating Account");
    }
  }

  return (
    <>
      <Fragment>
        <Form
          onSubmit={handleSubmit}
          style={{
            width: "90%",
            margin: "auto",
            background: "lightblue",
            borderRadius: "10px",
            padding: "30px",
            border: "1px solid lightgrey"
          }}
        >
          <h3>User Management</h3> <br></br>
          <Row>
            <Form.Group as={Col} className="mb-3" controlId="formBasicEmail">
              <Form.Label>Username:</Form.Label>
              <Form.Control type="text" placeholder="Enter username" name="username" value={username} onChange={e => setUsername(e.target.value)} autoFocus />
            </Form.Group>
            <Form.Group as={Col} className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" placeholder="Enter Password" name="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="off" />
            </Form.Group>
            <Form.Group as={Col} className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email:</Form.Label>
              <Form.Control type="email" placeholder="Enter Email" name="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="off" />
            </Form.Group>
            <Form.Group as={Col} className="mb-3" controlId="formBasicEmail">
              <Form.Label>User Group(s):</Form.Label>
              <Select isMulti value={groupName} placeholder="User Group" options={optionsGroup} onChange={handleSelect}></Select>
            </Form.Group>
            <Form.Group as={Col} className="mb-3" controlId="formBasicEmail">
              <Form.Label>isActive:</Form.Label> <br></br>
              <select
                name="isActive"
                value={isActive}
                onChange={e => {
                  setIsActive(e.target.value);
                }}
                style={{ width: "100%", padding: "6px", borderRadius: "5px", border: "lightgrey" }}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </Form.Group>
          </Row>
          <Row></Row>
          <Button type="submit" style={{ width: "18.6%" }}>
            Add User
          </Button>
          <Button variant="success" type="submit" onClick={handleUpdate} style={{ width: "18.6%", marginLeft: "1.7%" }}>
            Update User
          </Button>
          <small className="success created-user-success"></small>
          <small className="error created-user-error"></small>
          <small className="success update-user-success"></small>
          <small className="error update-user-error"></small>
        </Form>
        <div className="divFlex"></div>
      </Fragment>
      <AdminDatabase />
    </>
  );
}

export default AdminAddUpdateUser;
