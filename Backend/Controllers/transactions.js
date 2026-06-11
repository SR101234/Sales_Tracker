const { m } = require("framer-motion");
const pool = require("../DB/db.js");

const create_transaction = async (req, res) => {
    try {
       
        const {mode, nature, agent_id, investor_name, id_or_folio, amc_name, scheme_name, amount, entery_date, remark, transaction_id, target_scheme_name, start_date, frequency} = req.body;
        console.log("This is data:\n" + JSON.stringify(req.body));

        await pool.query(`INSERT INTO Transaction (transaction_id, mode, nature, agent_id, investor_name, id_or_folio, amc_name, scheme_name, amount, entery_date, remark, to_scheme, start_date, frequency) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [transaction_id, mode, nature, agent_id, investor_name, id_or_folio, amc_name, scheme_name, amount, entery_date, remark, target_scheme_name, start_dat, frequency]);
         res.status(200).json({ message: "Transaction received successfully" });
 
}
       
    
    catch (error) {
        console.error("Error creating transaction:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const get_transactions = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT transaction_id, agent_id, investor_name, mode, nature, id_or_folio, amc_name, scheme_name, amount, entery_date, remark, flag, arn FROM Transaction WHERE entery_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH) ORDER BY entery_date DESC;");

        res.status(200).json({ transactions: rows });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const update_transaction = async (req, res) => {
    try {
        console.log("Received update request with body:", req.body);
        const { id, mode, nature, agent_id, investor_name, id_or_folio, amc_name, scheme_name, amount, entery_date, remark, flag, arn } = req.body;

        await pool.query(
            `UPDATE Transaction SET mode = ?, nature = ?, agent_id = ?, investor_name = ?, id_or_folio = ?, amc_name = ?, scheme_name = ?, amount = ?, entery_date = ?, remark = ?, flag = ?, arn = ? WHERE transaction_id = ?`,
            [mode, nature, agent_id, investor_name, id_or_folio, amc_name, scheme_name, amount, entery_date, remark, flag, arn, id]
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

const switch_stp = async (req, res) => {
    try {
        const { id, transaction_id, agent_id, mode, switch_type, investor_name, id_or_folio, from_amc, from_scheme, to_scheme, frequency, entery_date, remark, amount, arn } = req.body;
        await pool.query(
            `Insert INTO switch_stp (mode, agent_id, investor_name, id_or_folio, from_amc, from_scheme, to_scheme, entery_date, remark, frequency, transaction_id, switch_type, amount, arn) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [mode, agent_id, investor_name, id_or_folio, from_amc, from_scheme, to_scheme,entery_date, remark, frequency, transaction_id, switch_type, amount, arn]
        );
        res.status(200).json({ message: "Commit Successfully" });
    }
    catch (error) {        
        console.error("Error switching STP:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const update_switch_stp = async (req, res) => {
    try {
        const { mode, agent_id, investor_name, id_or_folio, from_amc, from_scheme, to_scheme, entery_date, remark, frequency, id, switch_type, amount, arn } = req.body;
        console.log("Received update request with body:", req.body);
        await pool.query(
            `UPDATE switch_stp SET mode = ?, agent_id = ?, investor_name = ?, id_or_folio = ?, from_amc = ?, from_scheme = ?, to_scheme = ?, entery_date = ?, remark = ?, frequency = ?, switch_type = ?, amount = ?, arn = ? WHERE transaction_id = ?`,
            [mode, agent_id, investor_name, id_or_folio, from_amc, from_scheme, to_scheme, entery_date, remark, frequency, switch_type, amount, arn, id]
        );
        res.status(200).json({ message: "Switch/STP updated successfully" });
    }

    catch (error) {
        console.error("Error updating switch/STP:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const read_switch_stp = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM switch_stp WHERE entery_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH) ORDER BY entery_date DESC;");    
        res.status(200).json({ switch_stp: rows });
    } catch (error) {
        console.error("Error fetching switch/STP transactions:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const delete_switch_stp = async (req, res) => {
    try {
        const { id } = req.body;    
        await pool.query(`DELETE FROM switch_stp WHERE transaction_id = ?`, [id]);
        res.status(200).json({ message: "Switch/STP transaction deleted successfully" });
    } catch (error) {
        console.error("Error deleting switch/STP transaction:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = {
    create_transaction,
    get_transactions, 
    update_transaction,
    delete_transaction,
    switch_stp,
    update_switch_stp,
    read_switch_stp,
    delete_switch_stp
};