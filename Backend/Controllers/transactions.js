const { m } = require("framer-motion");
const pool = require("../DB/db.js");

const create_transaction = async (req, res) => {
    try {
       
        const {mode, type, agentId, clientName, panOrFolio, amcName, schemeName, amount, recordingDate, remark, id} = req.body;

        await pool.query(`INSERT INTO Transaction (transaction_id, mode, nature, agent_id, investor_name, id_or_folio, amc_name, scheme_name, amount, entery_date, remark) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [id, mode, type, agentId, clientName, panOrFolio, amcName, schemeName, amount, recordingDate, remark]);
         res.status(200).json({ message: "Transaction received successfully" });
 
}
       
    
    catch (error) {
        console.error("Error creating transaction:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const get_transactions = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT transaction_id, agent_id, investor_name, mode, nature, id_or_folio, amc_name, scheme_name, amount, entery_date, remark FROM Transaction WHERE entery_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH) ORDER BY entery_date DESC;");

        res.status(200).json({ transactions: rows });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const update_transaction = async (req, res) => {
    try {
        console.log("Received update request with body:", req.body);
        const { id, mode, nature, agent_id, investor_name, id_or_folio, amc_name, scheme_name, amount, entery_date, remark } = req.body;

        await pool.query(
            `UPDATE Transaction SET mode = ?, nature = ?, agent_id = ?, investor_name = ?, id_or_folio = ?, amc_name = ?, scheme_name = ?, amount = ?, entery_date = ?, remark = ? WHERE transaction_id = ?`,
            [mode, nature, agent_id, investor_name, id_or_folio, amc_name, scheme_name, amount, entery_date, remark, id]
        );
        res.status(200).json({ message: "Transaction updated successfully" });
    } catch (error) {
        console.error("Error updating transaction:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const delete_transaction = async (req, res) => {
    try {
        const { id } = req.body;
        await pool.query(`DELETE FROM Transaction WHERE transaction_id = ?`, [id]);
        res.status(200).json({ message: "Transaction deleted successfully" });
    } catch (error) {
        console.error("Error deleting transaction:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = {
    create_transaction,
    get_transactions,
    update_transaction,
    delete_transaction
};