import React, { useState } from "react";
import Axios from "axios";

async function OpenRightToDo(taskName) {
  let taskState = "To Do";
  try {
    const response = await Axios.post("/api/post-change-task-state", { taskName, taskState });
    console.log(response.data);
  } catch (error) {
    console.log(error);
  }
}

async function ToDoLeftOpen(taskName) {
  let taskState = "Open";
  try {
    const response = await Axios.post("/api/post-change-task-state", { taskName, taskState });
    console.log(response.data);
  } catch (error) {
    console.log(error);
  }
}
async function ToDoRightDoing(taskName) {
  let taskState = "Doing";
  try {
    const response = await Axios.post("/api/post-change-task-state", { taskName, taskState });
    console.log(response.data);
  } catch (error) {
    console.log(error);
  }
}

async function DoingLeftToDo(taskName) {
  let taskState = "To Do";
  try {
    const response = await Axios.post("/api/post-change-task-state", { taskName, taskState });
    console.log(response.data);
  } catch (error) {
    console.log(error);
  }
}
async function DoingRightDone(taskName) {
  let taskState = "Done";
  try {
    const response = await Axios.post("/api/post-change-task-state", { taskName, taskState });
    console.log(response.data);
  } catch (error) {
    console.log(error);
  }
}
async function DoneLeftDoing(taskName) {
  let taskState = "Doing";
  try {
    const response = await Axios.post("/api/post-change-task-state", { taskName, taskState });
    console.log(response.data);
  } catch (error) {
    console.log(error);
  }
}
async function DoneRightClose(taskName) {
  let taskState = "Close";
  try {
    const response = await Axios.post("/api/post-change-task-state", { taskName, taskState });
    console.log(response.data);
  } catch (error) {
    console.log(error);
  }
}
async function CloseLeftDone(taskName) {
  let taskState = "Done";
  try {
    const response = await Axios.post("/api/post-change-task-state", { taskName, taskState });
    console.log(response.data);
  } catch (error) {
    console.log(error);
  }
}

export { OpenRightToDo, ToDoLeftOpen, ToDoRightDoing, DoingLeftToDo, DoingRightDone, DoneLeftDoing, DoneRightClose, CloseLeftDone };
