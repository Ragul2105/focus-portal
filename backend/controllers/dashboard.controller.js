const { query } = require('../config/db');
const { ok } = require('../utils/response');

async function getStats(req, res, next) {
  try {
    const isAdmin = req.user.roles.some((r) => ['HOD', 'PRINCIPAL', 'INSTITUTION'].includes(r));
    const userId  = isAdmin ? null : req.user.id;

    const userFilter       = userId ? `AND r.user_id = '${userId}'` : '';
    const userFilterGR     = userId ? `AND gr_req.requested_by = '${userId}'` : '';

    const [regStats, grantStats, approvalStats, fundStats] = await Promise.all([
      // Registration counts by status
      query(`
        SELECT status, COUNT(*) AS cnt
          FROM registrations r
         WHERE 1=1 ${userFilter}
         GROUP BY status
      `),
      // Grant ID count
      query(`
        SELECT COUNT(*) AS cnt
          FROM grant_ids g
          JOIN registrations r ON r.id = g.registration_id
         WHERE 1=1 ${userFilter}
      `),
      // Pending approvals
      query(`
        SELECT COUNT(*) AS cnt
          FROM grant_requests gr_req
         WHERE gr_req.status = 'PENDING' ${userFilterGR}
      `),
      // Fund totals
      query(`
        SELECT
          COALESCE(SUM(r.fund_inr), 0)   AS total_applied_inr,
          COALESCE(SUM(g.amount_granted_inr), 0) AS total_granted_inr
          FROM registrations r
     LEFT JOIN grant_ids g ON g.registration_id = r.id
         WHERE 1=1 ${userFilter}
      `),
    ]);

    const statsByStatus = {};
    regStats.rows.forEach(({ status, cnt }) => { statsByStatus[status] = Number(cnt); });

    return ok(res, {
      totalRegistrations:    Object.values(statsByStatus).reduce((a, b) => a + b, 0),
      draftRegistrations:    statsByStatus.DRAFT || 0,
      submittedRegistrations: statsByStatus.SUBMITTED || 0,
      totalGrantIds:         Number(grantStats.rows[0]?.cnt ?? 0),
      pendingApprovals:      Number(approvalStats.rows[0]?.cnt ?? 0),
      totalFundAppliedINR:   Number(fundStats.rows[0]?.total_applied_inr ?? 0),
      totalFundApprovedINR:  Number(fundStats.rows[0]?.total_granted_inr ?? 0),
    });
  } catch (err) { next(err); }
}

async function getRecentActivity(req, res, next) {
  try {
    const userId   = req.user.roles.some((r) => ['HOD', 'PRINCIPAL'].includes(r)) ? null : req.user.id;
    const userFilter = userId ? `AND gr.requested_by = '${userId}'` : '';

    const { rows } = await query(`
      SELECT gr.id, gr.status, gr.created_at,
             g.grant_id,
             ac.name AS category_name,
             ad.name AS detail_name
        FROM grant_requests gr
        JOIN grant_ids g ON g.id = gr.grant_id_id
        JOIN registrations r ON r.id = g.registration_id
   LEFT JOIN activity_categories ac ON ac.id = r.activity_category_id
   LEFT JOIN activity_details    ad ON ad.id = r.activity_detail_id
       WHERE 1=1 ${userFilter}
    ORDER BY gr.created_at DESC
       LIMIT 10
    `);

    return ok(res, rows);
  } catch (err) { next(err); }
}

module.exports = { getStats, getRecentActivity };
