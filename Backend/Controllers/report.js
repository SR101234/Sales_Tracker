const pool = require("../DB/db.js");

const get_report = async (req, res) => {
    try {
        const { month } = req.query;

        let selectedYear, selectedMonth;

        if (month) {
            const [year, mon] = month.split("-");
            selectedYear = parseInt(year, 10);
            selectedMonth = parseInt(mon, 10);
        } else {
            const now = new Date();
            selectedYear = now.getFullYear();
            selectedMonth = now.getMonth() + 1;
        }

        const [rows] = await pool.query(
            `WITH SelectedMonthTransactions AS (
                SELECT 
                    agent_id,

                    -- SIP Aggregations
                    SUM(CASE WHEN mode = 'SIP' AND nature IN ('NEW', 'NEW_SIP') THEN amount ELSE 0 END) AS sip_new,
                    SUM(CASE WHEN mode = 'SIP' AND nature = 'RELOGIN' THEN amount ELSE 0 END) AS sip_relogin,
                    SUM(CASE WHEN mode = 'SIP' AND nature IN ('CLOSED', 'CLOSED_SIP') THEN amount ELSE 0 END) AS sip_closed,
                    SUM(CASE WHEN mode = 'SIP' AND (nature = 'REDEMPTION' OR mode = 'REDEMPTION') THEN amount ELSE 0 END) AS sip_redemption,

                    -- LUMPSUM Aggregations
                    SUM(CASE WHEN mode = 'LUMPSUM' AND nature IN ('NEW', 'NEW_SIP') THEN amount ELSE 0 END) AS ls_new,
                    SUM(CASE WHEN mode = 'LUMPSUM' AND nature = 'RELOGIN' THEN amount ELSE 0 END) AS ls_relogin,
                    SUM(CASE WHEN mode = 'LUMPSUM' AND nature IN ('CLOSED', 'CLOSED_SIP') THEN amount ELSE 0 END) AS ls_closed,
                    SUM(CASE WHEN mode = 'LUMPSUM' AND (nature = 'REDEMPTION' OR mode = 'REDEMPTION') THEN amount ELSE 0 END) AS ls_redemption

                FROM Transaction
                WHERE MONTH(entery_date) = ?
                  AND YEAR(entery_date) = ?
                GROUP BY agent_id
            ),
            SelectedMonthTargets AS (
                SELECT 
                    pan,
                    SUM(sip_target) AS sip_target,
                    SUM(lumpsum_target) AS lumpsum_target
                FROM target
                WHERE MONTH(target_date) = ?
                  AND YEAR(target_date) = ?
                GROUP BY pan
            )

            SELECT 
                a.name AS agent_name,

                -- SIP
                COALESCE(t.sip_new, 0) AS sip_new,
                COALESCE(t.sip_relogin, 0) AS sip_relogin,
                COALESCE(t.sip_closed, 0) AS sip_closed,
                COALESCE(t.sip_redemption, 0) AS sip_redemption,
                COALESCE(tgt.sip_target, 0) AS sip_target,
                (COALESCE(t.sip_new, 0) + COALESCE(t.sip_relogin, 0) - COALESCE(t.sip_closed, 0) - COALESCE(t.sip_redemption, 0)) AS sip_achieved,

                -- LUMPSUM
                COALESCE(t.ls_new, 0) AS ls_new,
                COALESCE(t.ls_relogin, 0) AS ls_relogin,
                COALESCE(t.ls_closed, 0) AS ls_closed,
                COALESCE(t.ls_redemption, 0) AS ls_redemption,
                COALESCE(tgt.lumpsum_target, 0) AS ls_target,
                (COALESCE(t.ls_new, 0) + COALESCE(t.ls_relogin, 0) - COALESCE(t.ls_closed, 0) - COALESCE(t.ls_redemption, 0)) AS ls_achieved

            FROM Agents a
            LEFT JOIN SelectedMonthTransactions t ON a.pan = t.agent_id
            LEFT JOIN SelectedMonthTargets tgt ON a.pan = tgt.pan
            WHERE COALESCE(a.is_deleted, '0') != '1'
            ORDER BY a.name ASC;`,
            [selectedMonth, selectedYear, selectedMonth, selectedYear]
        );

        res.status(200).json({ report: rows });
    } catch (error) {
        console.error("Error fetching report data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = {
    get_report
}