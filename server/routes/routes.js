const express = require("express");
const router = express.Router();
const ErrorHandler = require("../error/errorHandler");

// Phase 1 controller methods
const { create_group } = require("../controllers/createGroupController");
const { add_user, get_group } = require("../controllers/addController");
const { update_user, get_group_update } = require("../controllers/updateController");
const { add_usergroup } = require("../controllers/addGroupController");
const { remove_userGroup, get_group_update_removeController } = require("../controllers/removeUserGroupController");
const { checkgroup, send_user_info, send_application_info, post_specific_application_info } = require("../controllers/homePageController");
const { send_accounts_info, send_group_info, get_table_data } = require("../controllers/dataController");
const { login_page } = require("../controllers/loginController");
const { update_user_details } = require("../controllers/updateUserController");

// Phase 2 controller methods
const { add_application, add_application_get_usergroup } = require("../controllers/createApplicationController");
const { update_application } = require("../controllers/updateApplicationController");
const { send_kanban_task_info_open, send_kanban_plan_info, send_kanban_application_info, create_kanban_plan, create_task } = require("../controllers/kanbanController");
const { specific_app_info, get_specific_task, get_all_plans, post_change_task_state, update_current_task_notes, select_current_task_notes } = require("../controllers/kanbanController");
const { send_email_project_lead } = require("../controllers/sendMailController");

// Phase 1 routers
router.route("/create-group").post(create_group);
// loginController
router.route("/login").post(login_page);
// addController
router.route("/register").post(add_user);
router.route("/get-group").get(get_group);
// updateController
router.route("/update").post(update_user);
router.route("/getgroup-update").get(get_group_update);
router.route("/add/usergroup").post(add_usergroup);
router.route("/remove-userGroup").post(remove_userGroup);
router.route("/getgroup-remove").get(get_group_update_removeController);
// homePageController
router.route("/send-user-info").post(send_user_info);
router.route("/send-application-info").get(send_application_info);
router.route("/post-specific-application-info").post(post_specific_application_info);
router.route("/checkgroup").post(checkgroup);
// dataController
router.route("/data-controller-accounts").post(send_accounts_info);
router.route("/data-controller-groupdes").get(send_group_info);
router.route("/data-controller-gettabledata").post(get_table_data);
// updateUserController
router.route("/update-user").post(update_user_details);

// Phase 2 routers
router.route("/create-application").post(add_application);
router.route("/create-application-get-usergroup").get(add_application_get_usergroup);

router.route("/update-application").post(update_application);

// Phase 2 kanban routers
router.route("/send-kanban-plan-info/:appAcronym").get(send_kanban_plan_info);
router.route("/send-kanban-application-info/:appAcronym").get(send_kanban_application_info);
router.route("/create-kanban-plan").post(create_kanban_plan);
router.route("/create-task").post(create_task);
router.route("/send-kanban-task-info-open").post(send_kanban_task_info_open);

router.route("/post-change-task-state").post(post_change_task_state);
router.route("/get-all-plans").post(get_all_plans);
router.route("/get-specific-task").post(get_specific_task);
router.route("/specific-app-info").post(specific_app_info);

router.route("/update-current-task-notes").post(update_current_task_notes);
router.route("/select-current-task-notes").post(select_current_task_notes);

// sendMailController
router.route("/send-email-project-lead").post(send_email_project_lead);

// Importing Rest API Controllers
const { CreateTaskAPI } = require("../restapi/createTaskAPI");
const { GetTaskbyState } = require("../restapi/GetTaskbyState");
const { PromoteTaskToDone } = require("../restapi/PromoteTaskToDone");
// REST APIs
router.route("/create-new-task").post(CreateTaskAPI);
router.route("/get-task-by-state").get(GetTaskbyState);
router.route("/promote-task-to-done").post(PromoteTaskToDone);

module.exports = router;
