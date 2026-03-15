const pool = require("../DB/db.js");

const dashboard = async (req, res) => {
    try {
        const [net_growth] = await pool.query(`SELECT 
(
    SUM(CASE 
        WHEN mode IN ('SIP','LUMPSUM') 
        THEN amount 
        ELSE 0 
    END)
    -
    SUM(CASE 
        WHEN mode = 'REDEMPTION' 
        THEN amount 
        ELSE 0 
    END)
) AS net_business_growth

FROM Transaction

WHERE 
MONTH(entery_date) = MONTH(CURDATE())
AND YEAR(entery_date) = YEAR(CURDATE());`);
        const [cards] = await pool.query(`SELECT 

      SUM(
          CASE 
              WHEN mode = 'SIP' AND nature = 'NEW'
              THEN amount 
              ELSE 0 
          END
      ) AS new_sips,

      SUM(
          CASE 
              WHEN mode = 'LUMPSUM' 
                   OR (mode = 'SIP' AND nature = 'Purchase')
              THEN amount 
              ELSE 0 
          END
      ) AS lumpsum,

      SUM(
          CASE 
              WHEN nature = 'RELOGIN' 
              THEN amount 
              ELSE 0 
          END
      ) AS relogins,

      SUM(
          CASE 
              WHEN nature = 'CLOSED_SIP' 
              THEN amount 
              ELSE 0 
          END
      ) AS closed,

      SUM(
          CASE 
              WHEN mode = 'REDEMPTION' 
              THEN amount 
              ELSE 0 
          END
      ) AS redemptions,

      SUM(
          CASE 
              WHEN mode IN ('SIP','LUMPSUM') 
              THEN amount
              WHEN mode = 'REDEMPTION' 
              THEN -amount
              ELSE 0
          END
      ) AS net_gain

  FROM Transaction

  WHERE 
  MONTH(entery_date) = MONTH(CURDATE())
  AND YEAR(entery_date) = YEAR(CURDATE());`);
        const [chart] = await pool.query(`SELECT DATE_FORMAT(entery_date,'%Y-%m') AS month, SUM(CASE WHEN nature IN ('Purchase','SIP','Lumpsum') THEN amount ELSE 0 END) AS new_business, SUM(CASE WHEN nature = 'Relogin' THEN amount ELSE 0 END) AS relogin FROM Transaction WHERE entery_date >= DATE_SUB(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 5 MONTH) GROUP BY month ORDER BY month;`);
        const [table] = await pool.query(`SELECT 
    a.pan AS agent_id,
    a.name,

    SUM(
        CASE
            -- ADDITIONS (SIP & LUMPSUM): Catch 'NEW', 'RELOGIN', 'PURCHASE', and legacy 'NEW_SIP'
            WHEN UPPER(t.mode) IN ('SIP', 'LUMPSUM') AND UPPER(t.nature) IN ('NEW', 'NEW_SIP', 'RELOGIN', 'PURCHASE') THEN t.amount
            
            -- DEDUCTIONS: Closed SIPs
            WHEN UPPER(t.mode) = 'SIP' AND UPPER(t.nature) = 'CLOSED_SIP' THEN -t.amount
            
            -- DEDUCTIONS: All Redemptions
            WHEN UPPER(t.mode) = 'REDEMPTION' THEN -t.amount
            
            ELSE 0
        END
    ) AS net_growth

FROM Transaction t
JOIN Agents a ON t.agent_id = a.pan

WHERE 
    MONTH(t.entery_date) = MONTH(CURDATE())
    AND YEAR(t.entery_date) = YEAR(CURDATE())
    AND (a.is_deleted <> '1' OR a.is_deleted IS NULL)

GROUP BY a.pan, a.name
ORDER BY net_growth DESC
LIMIT 5;`);
       console.log(cards);
        res.json({ net_growth: net_growth[0], cards: cards[0], chart: chart, table: table });

    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const agent_create = async (req, res) => {

    try {
        const { name, email, annualTarget, pan, sip_target, lumpsum_target } = req.body;
        const [result] = await pool.query(`INSERT INTO Agents (name, pan, email) VALUES (?, ?, ?)`, [name, pan, email]);
        await pool.query(`INSERT INTO target (pan, sip_target, lumpsum_target, target_date) VALUES (?, ?, ?, CURDATE())`, [pan, sip_target, lumpsum_target]);
        res.json({ message: "Agent created successfully", agentId: result.insertId });
    } catch (error) {
        console.error("Error creating agent:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const agent = async (req, res) => {

    try {
        const [result] = await pool.query(`SELECT 
    a.id,
    a.pan,
    a.name,
    a.email,
    COALESCE(t.sip_target, 0) AS sip_target,
    COALESCE(t.lumpsum_target, 0) AS lumpsum_target
FROM Agents a
LEFT JOIN target t 
    ON a.pan = t.pan
    AND EXTRACT(MONTH FROM t.target_date) = EXTRACT(MONTH FROM CURRENT_DATE)
    AND EXTRACT(YEAR FROM t.target_date) = EXTRACT(YEAR FROM CURRENT_DATE) 
    WHERE a.is_deleted <> '1' OR a.is_deleted IS NULL;`);

        const [transactions] = await pool.query(`
SELECT 
    agent_id,
    SUM(CASE WHEN mode = 'SIP' THEN amount ELSE 0 END) AS total_sip_amount,
    SUM(CASE WHEN mode = 'LUMPSUM' THEN amount ELSE 0 END) AS total_lumpsum_amount,
    SUM(CASE WHEN nature = 'RELOGIN' THEN amount ELSE 0 END) AS total_relogin_amount,
    SUM(CASE WHEN nature = 'REDEMPTION' THEN amount ELSE 0 END) AS total_redemption_amount,
    (
        SUM(CASE WHEN mode IN ('SIP','LUMPSUM') THEN amount ELSE 0 END)
        + SUM(CASE WHEN nature = 'RELOGIN' THEN amount ELSE 0 END)
        - SUM(CASE WHEN nature = 'REDEMPTION' THEN amount ELSE 0 END)
    ) AS net_business
FROM Transaction
WHERE entery_date >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
AND entery_date < DATE_FORMAT(CURDATE() + INTERVAL 1 MONTH, '%Y-%m-01')
GROUP BY agent_id
`);

        const agentsWithBusiness = result.map(agent => {
            const agentTransactions = transactions.find(t => t.agent_id === agent.pan);

            return {
                ...agent,
                total_sip_amount: agentTransactions ? agentTransactions.total_sip_amount : 0,
                total_lumpsum_amount: agentTransactions ? agentTransactions.total_lumpsum_amount : 0,
                total_relogin_amount: agentTransactions ? agentTransactions.total_relogin_amount : 0,
                total_redemption_amount: agentTransactions ? agentTransactions.total_redemption_amount : 0,
                net_business: agentTransactions ? agentTransactions.net_business : 0
            };
        });

        res.status(200).json(agentsWithBusiness);
    }
    catch (error) {
        console.error("Error fetching agents:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const agent_update = async (req, res) => {

    try {

        const { name, email, new_pan, pan, id } = req.body;
        console.log(req.body);
        await pool.query(`UPDATE Agents SET name = ?, email = ?, pan = ? WHERE id = ?`, [name, email, new_pan, id]);
        await pool.query(`UPDATE target SET pan = ? WHERE pan = ?`, [new_pan, pan]);
        await pool.query(`UPDATE \`Transaction\` SET agent_id = ? WHERE agent_id = ?`, [new_pan, pan]);
        await pool.query(`UPDATE subtask SET agent_id = ? WHERE agent_id = ?`, [new_pan, pan]);

        res.json({ message: "Agent updated successfully" });
    } catch (error) {
        console.error("Error updating agent:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const agent_target_update = async (req, res) => {

    try {
        const { pan, sip_target, lumpsum_target } = req.body;
        console.log(req.body);
        await pool.query(`UPDATE target SET sip_target = ?, lumpsum_target = ?, target_date = CURDATE() WHERE pan = ?`, [sip_target, lumpsum_target, pan]);
        res.json({ message: "Agent targets updated successfully" });
    } catch (error) {
        console.error("Error updating agent targets:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const agent_delete = async (req, res) => {
    try {
        const { pan } = req.body;
       
        await pool.query(`UPDATE Agents SET is_deleted = 1 WHERE pan = ?`, [pan]);
        res.json({ message: "Agent deleted successfully" });
    } catch (error) {
        console.error("Error deleting agent:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}


module.exports = {
    dashboard,
    agent_create,
    agent,
    agent_update,
    agent_target_update,
    agent_delete
}
