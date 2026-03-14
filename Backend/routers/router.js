const express = require("express");
const router = express.Router();
const controller = require("../Controllers/controller.js");



router.route("/").get(controller.dashboard);
router.route("/agent").get(controller.agent)
router.route("/agent_create").post(controller.agent_create);
router.route("/agent_update").post(controller.agent_update);
router.route("/agent_target").post(controller.agent_target_update);
router.route("/agent_delete").post(controller.agent_delete);
router.route("/transaction_create").post(require("../Controllers/transactions.js").create_transaction);
router.route("/transactions").get(require("../Controllers/transactions.js").get_transactions);
router.route("/transaction_update").post(require("../Controllers/transactions.js").update_transaction);
router.route("/transaction_delete").post(require("../Controllers/transactions.js").delete_transaction);
router.route("/subtask_create").post(require("../Controllers/subtask.js").create_subtask);
router.route("/subtasks").get(require("../Controllers/subtask.js").subtask);
router.route("/subtask_update").put(require("../Controllers/subtask.js").update_subtask);
router.route("/subtask_delete").delete(require("../Controllers/subtask.js").delete_subtask);
router.route("/report").get(require("../Controllers/report.js").get_report);



module.exports = router;