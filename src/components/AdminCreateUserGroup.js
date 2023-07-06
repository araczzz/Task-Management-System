import React, { useEffect, useState } from "react";
import Axios from "axios";
import { showError, clearError, clearSuccess } from "../errorDisplay";
import AdminDatabase from "./AdminDatabaseTable";
import AdminRemoveUserGroup from "./AdminUpdateUserGroup";
import { Form, Button } from "react-bootstrap";

function AdminCreateUserGroup() {
  useEffect(() => {
    document.title = "Group Management | STEngg";
    window.scrollTo(0, 0);
  }, []);

  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");

  // Create UserGroup
  async function handleSubmit(e) {
    e.preventDefault();

    try {
      clearError();
      clearSuccess();
      await Axios.post("/api/create-group", { groupName, groupDescription });
      showError("created-UserGroup-success", "Successfully created a User Group: " + groupName + " !");
      setGroupName("");
      setGroupDescription("");
    } catch (error) {
      console.log(error);
      showError("create-UserGroup-error", error.response.data.errMessage);
    }
  }

  return (
    <>
      <div style={{ display: "flex" }}>
        <Form
          onSubmit={handleSubmit}
          style={{
            width: "45%",
            marginLeft: "5%",
            background: "lightblue",
            borderRadius: "10px",
            padding: "30px",
            border: "1px solid lightgrey"
          }}
        >
          <h3>Create UserGroup</h3>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>User Group:</Form.Label>
            <Form.Control type="text" placeholder="Enter User Group" name="usergroup" value={groupName} onChange={e => setGroupName(e.target.value)} autoFocus />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Group Description:</Form.Label>
            <Form.Control as="textarea" placeholder="Enter Group Description" name="groupdescription" value={groupDescription} onChange={e => setGroupDescription(e.target.value)} />
          </Form.Group>
          <Button variant="primary" type="submit">
            Create Group
          </Button>
          <small className="success created-UserGroup-success"></small>
          <small className="error create-UserGroup-error"></small>
        </Form>
        <AdminRemoveUserGroup />
      </div>
      <AdminDatabase />
    </>
  );
}

export default AdminCreateUserGroup;
