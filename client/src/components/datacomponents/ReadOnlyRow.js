import React from "react";

function ReadOnlyRow({ info, handleEditClick }) {
  return (
    <tr key={info.username}>
      <td style={{color: "black"}}>{info.username}</td>
      {/* <td className="center">********</td> */}
      <td style={{color: "black"}}>{info.email}</td>
      <td style={{color: "black"}}>{info.groupName}</td>
      <td style={{color: "black"}}>{info.isActive}</td>
      <td>
        <button className="button-28" type="button" onClick={event => handleEditClick(event, info)}>
          Edit
        </button>
      </td>
    </tr>
  );
}

export default ReadOnlyRow;
