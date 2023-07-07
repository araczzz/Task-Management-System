import React, { useEffect, useState } from "react";
import Axios from "axios";

function AdminDatabase() {
  const [data, setData] = useState([]);
  const [username, setUsername] = useState();
  const [groupName, setGroupName] = useState();

  async function handleSubmit(e) {
    e.preventDefault();
  }

  async function unpackData() {
    try {
      const response = await Axios.post("/data-group", { username, groupName });
      if (response.data) {
        setData(response.data);
      }
    } catch (error) {
      console.log("Error retrieving data from mySQL");
    }
  }

  useEffect(() => {
    unpackData();
  }, []);

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <table className="table">
          <thead>
            <tr>
              <th>Username</th>
              <th>User Group</th>
              <th>Edit</th>
            </tr>
          </thead>

          <tbody>
            {data.map(info => {
              return (
                <tr key={info.username}>
                  <td>{info.username}</td>
                  <td>{info.groupName}</td>
                  <td>
                    <button type="submit">Edit</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </form>
  );
}

export default AdminDatabase;
