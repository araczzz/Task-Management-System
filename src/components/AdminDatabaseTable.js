import React, { useEffect, useState, Fragment, Component } from "react";
import Axios from "axios";
import { showError, clearError, clearSuccess } from "../errorDisplay";
import ReadOnlyRow from "./datacomponents/ReadOnlyRow";
import EditableRow from "./datacomponents/EditableRow";
import { Table } from "react-bootstrap";

function AdminDatabaseTable() {
  const [data, setData] = useState([]);
  const [dataGroup, setDataGroup] = useState([]);
  const [username, setUsername] = useState();
  const [password, setPassword] = useState("");
  const [groupName, setGroupName] = useState();
  const [email, setEmail] = useState();
  const [isActive, setIsActive] = useState();
  const [editInfoUsername, setEditInfoUsername] = useState(null);
  const [editFormData, setEditFormData] = useState({
    username: "",
    email: "",
    groupName: "",
    isActive: ""
  });
  const [allGroups, setAllGroups] = useState([]);

  // Retrieving information on MySQL accounts table
  async function unpackData() {
    try {
      const response = await Axios.post("/api/data-controller-accounts", {
        username,
        email,
        groupName,
        isActive
      });
      if (response.data) {
        setData(response.data);
      }
    } catch (error) {
      console.log(error);
      console.log("Error retrieving data from mySQL accounts table");
    }
  }

  useEffect(() => {
    unpackData();
  }, []);

  // Retrieving information on MySQL usergroup table
  async function unpackDataGroup() {
    try {
      const response = await Axios.get("/api/data-controller-groupdes", { groupName });
      setDataGroup(response.data);
    } catch (error) {
      console.log(error);
      console.log("Error retrieving data from MySQL userGroup table");
    }
  }

  useEffect(() => {
    unpackDataGroup();
  }, []);

  // Sending the editable table data back.
  async function sendDataBack() {
    try {
      clearSuccess();
      clearError();

      const response = await Axios.post("/api/data-controller-gettabledata", editFormData);
      showError("success-edited-table", "Users successfully edited!");
    } catch (error) {
      // showError("edit-user-fail-table", error.response.data.errMessage);
      console.log("Error sending data back to mySQL");
    }
  }

  // For editable table: Changes in usergroup will be done via React-Select and stored in an Array.
  const handleSelectChange = selectedOption => {
    setAllGroups(Array.isArray(selectedOption) ? selectedOption.map(x => x.value) : []);
  };

  // Viweing the edited data
  const handleEditFormChange = event => {
    event.preventDefault();

    const fieldName = event.target.getAttribute("name");
    const fieldValue = event.target.value;

    const newFormData = { ...editFormData };
    // newFormData is equivalent to whatever value the user has typed.
    newFormData[fieldName] = fieldValue;
    // newFormData.groupName = allGroupsString;

    setEditFormData(newFormData);
  };

  // Submits the info that is keyed in by user
  const handleEditFormSubmit = event => {
    event.preventDefault();

    const editedData = {
      username: editFormData.username,
      email: editFormData.email,
      groupName: editFormData.groupName,
      isActive: editFormData.isActive
    };

    const newData = [...data];

    // Find the index of the row we are editing
    const index = data.findIndex(info => info.username === editInfoUsername);

    newData[index] = editedData;
    setData(newData);
    setEditInfoUsername(null);
  };

  // Adding an event when user clicks on "edit" button
  // must include "info" as the argument because we want to access info.username to save it into state
  const handleEditClick = (event, info) => {
    event.preventDefault();
    setEditInfoUsername(info.username);

    // taking info and storing it in editFormData.
    // when edit button gets clicked, we want to see these values first
    const formValues = {
      username: info.username,
      // password: info.password,
      email: info.email,
      groupName: info.groupName,
      isActive: info.isActive
    };

    setEditFormData(formValues);
  };

  // Cancel button (editInfoUsername must go back to null)
  const handleCancelClick = () => {
    setEditInfoUsername(null);
  };

  return (
    <div>
      <form onSubmit={handleEditFormSubmit}>
        <Table striped bordered hover variant="primary" style={{ width: "90%" }}>
          <thead>
            <tr>
              <th style={{ color: "black" }}>Username</th>
              <th style={{ color: "black" }}>Email</th>
              <th style={{ color: "black" }}>User Groups</th>
              <th style={{ color: "black" }}>isActive</th>
              <th style={{ color: "black" }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {data.map(info => {
              return (
                // Added React Fragment so that we can have these 2 child components
                // if info.username matches editInfoUsername stored in state, EditableRow rendered
                <Fragment key={info.username}>{editInfoUsername === info.username ? <EditableRow setPassword={setPassword} password={password} handleSelectChange={handleSelectChange} dataGroup={dataGroup} editFormData={editFormData} handleEditFormChange={handleEditFormChange} handleCancelClick={handleCancelClick} sendDataBack={sendDataBack} /> : <ReadOnlyRow info={info} handleEditClick={handleEditClick} />}</Fragment>
              );
            })}
          </tbody>
        </Table>
      </form>
    </div>
  );
}

export default AdminDatabaseTable;
