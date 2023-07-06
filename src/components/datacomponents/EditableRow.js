import React from "react";

function EditableRow({ dataGroup, editFormData, handleEditFormChange, handleCancelClick, sendDataBack }) {
  const optionsGroup = dataGroup.map(infoGroup => ({
    value: infoGroup.groupName,
    label: infoGroup.groupName
  }));

  // defaultValue = { previousOptions };

  return (
    <tr>
      <td>
        <input className="input-table-readonly" type="text" placeholder="Username" required="required" name="username" value={editFormData.username} onChange={handleEditFormChange} readOnly></input>
      </td>
      {/* <td>
        <input className="input-table" type="password" placeholder="Password" name="password" value={password} onChange={e => setPassword(e.target.value)}></input>
      </td> */}
      <td>
        <input className="input-table-readonly" type="email" placeholder="Email" required="required" name="email" value={editFormData.email} onChange={handleEditFormChange} readOnly></input>
      </td>
      <td>
        <input className="input-table-readonly" type="text" placeholder="User Group" required="required" name="groupName" value={editFormData.groupName} onChange={handleEditFormChange} readOnly></input>
        {/* <Select defaultValue={previousOptions} options={optionsGroup} onChange={handleSelectChange} isMulti isClearable></Select> */}
        {/* <select name="groupName" value={selectedOption} onChange={handleSelectChange} multiple={true} size="10">
          {dataGroup.map(info => {
            return <option value={info.groupName}>{info.groupName}</option>;
          })}
        </select> */}
      </td>
      <td>
        <select className="input-table" name="isActive" value={editFormData.isActive} onChange={handleEditFormChange}>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </td>
      <td>
        <button className="button-28" type="submit" onClick={sendDataBack}>
          Save
        </button>
        <button className="button-28" type="button" onClick={handleCancelClick}>
          Cancel
        </button>
      </td>
    </tr>
  );
}

export default EditableRow;
