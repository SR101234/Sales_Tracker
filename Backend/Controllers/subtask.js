const pool = require("../DB/db.js");

const create_subtask = async (req, res) => {
    try {
        console.log("Received request with body:", req.body);
        const {agentId, clientName, panOrFolio, serviceType, amc, date, newInformation, remark, id} = req.body;
        await pool.query(`INSERT INTO subtask (transaction_id, agent_id, client_name, id_or_folio, service_type, amc, entery_date, new_information, remark) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [id, agentId, clientName, panOrFolio, serviceType, amc, date, newInformation, remark]);
        res.status(200).json({ message: "Subtask created successfully" });
    } catch (error) {
        console.error("Error creating subtask:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }   
}

const subtask = async (req, res) => {
    try {

        const [rows] = await pool.query("SELECT * FROM subtask WHERE entery_date >= CURDATE() - INTERVAL 12 MONTH;");
        res.status(200).json({ subtasks: rows });
    } catch (error) {
        console.error("Error fetching subtasks:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const update_subtask = async (req, res) => {
    try {
    
        const {id, agentId, clientName, panOrFolio, serviceType, amc, date, newInformation, remark} = req.body; 
        const formattedDate = date ? String(date).split('T')[0] : null;
        await pool.query(`UPDATE subtask SET agent_id = ?, client_name = ?, id_or_folio = ?, service_type = ?, amc = ?, entery_date = ?, new_information = ?, remark = ? WHERE transaction_id = ?`, [agentId, clientName, panOrFolio, serviceType, amc, formattedDate, newInformation, remark, id]);
        res.status(200).json({ message: "Subtask updated successfully" });
    } catch (error) {
        console.error("Error updating subtask:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const delete_subtask = async (req, res) => {
    try {
        const {id} = req.body;
        await pool.query(`DELETE FROM subtask WHERE transaction_id = ?`, [id]);
        res.status(200).json({ message: "Subtask deleted successfully" });
    } catch (error) {
        console.error("Error deleting subtask:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = {
    create_subtask,
    subtask,
    update_subtask,
    delete_subtask
}
