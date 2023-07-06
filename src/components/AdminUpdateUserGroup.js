import React, { useState, useEffect, Fragment } from "react";
import Axios from "axios";
import { showError, clearError, clearSuccess } from "../errorDisplay";
import Select from "react-select";
import { Form, Button, Row, Col } from "react-bootstrap";

function AdminUpdateUserGroup() {
  const [username, setUsername] = useState("");
  const [groupName, setGroupName] = useState([]);
  const [groupData, setGroupData] = useState([]);
  const [group, setGroup] = useState([]);

  // Getting all created User Group(s) for UserGroup React-Select
  async function unpackDataUserGroup() {
    try {
      const response = await Axios.get("/api/getgroup-remove");
      setGroupData(response.data);
    } catch (error) {
      console.log(error);
    }
  }

  // Options for UserGroup React-Select
  const optionsGroup = groupData.map(info => ({
    value: info.groupName,
    label: info.groupName
  }));

  useEffect(() => {
    unpackDataUserGroup();
  }, []);

  // Retrieving the value/label of the selected option
  const handleSelect = groupName => {
    setGroupName(groupName);
    setGroup(groupName.map(x => x.value));
  };

  // Posting the usergroup(s) of the specific username to be removed from usergroup
  async function handleRemoveUserGroup(e) {
    e.preventDefault();
    try {
      clearError();
      clearSuccess();

      const response = await Axios.post("/api/remove-userGroup", { username, group });
      showError("remove-UserGroup-success", "Removed " + username + " from " + group);
      setUsername("");
      setGroupName([]);
      setGroup([]);
    } catch (error) {
      showError("remove-UserGroup-error", error.response.data.errMessage);
      console.log(error);
    }
  }

  // Posting the usergroup(s) of the specific username to be added into usergroup
  async function handleAddGroup(e) {
    e.preventDefault();

    try {
      clearError();
      clearSuccess();

      const response = await Axios.post("/api/add/usergroup", { username, group });
      if (response.data) {
        showError("added-UserGroup-success", "Added " + username + " into " + group);
        setUsername("");
        setGroupName([]);
        setGroup([]);
      }
    } catch (error) {
      showError("added-UserGroup-error", error.response.data.errMessage);
      console.log("There was an error");
    }
  }

  return (
    <Fragment>
      <Form
        method="post"
        style={{
          width: "45%",
          marginLeft: "5%",
          marginRight: "5%",
          background: "lightblue",
          borderRadius: "10px",
          padding: "30px",
          border: "1px solid lightgrey"
        }}
      >
        <h4>Add/Remove User From UserGroup(s)</h4>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Username: </Form.Label>
          <Form.Control type="text" placeholder="Enter Username" name="username" value={username} onChange={e => setUsername(e.target.value)} />
        </Form.Group>
        <Fragment className="input-normal">
          <Form.Label>User Group:</Form.Label>
          <Select isMulti value={groupName} placeholder="Add User Group" options={optionsGroup} onChange={handleSelect}></Select>
        </Fragment>
        <Fragment>
          <Button type="submit" onClick={handleAddGroup} variant="warning" style={{ marginTop: "4%", width: "30%" }}>
            Add Group
          </Button>
          <Button type="submit" onClick={handleRemoveUserGroup} variant="danger" style={{ marginLeft: "3%", marginTop: "4%", width: "30%" }}>
            Remove
          </Button>
        </Fragment>
        <small className="success remove-UserGroup-success"></small>
        <small className="error remove-UserGroup-error"></small>
        <small className="success added-UserGroup-success"></small>
        <small className="error added-UserGroup-error"></small>
      </Form>
    </Fragment>
  );
}

export default AdminUpdateUserGroup;
