const { query } = require('../config/db');

const listCategories = async () => {
  const { rows } = await query(
    `SELECT * FROM activity_categories ORDER BY name`
  );
  return rows;
};

const listDetails = async (categoryId) => {
  const { rows } = await query(
    `SELECT * FROM activity_details
      WHERE category_id = $1 AND is_active = true
   ORDER BY name`,
    [categoryId]
  );
  return rows;
};

const findDetailById = async (id) => {
  const { rows } = await query(
    `SELECT ad.*, ac.code AS category_code
       FROM activity_details ad
       JOIN activity_categories ac ON ac.id = ad.category_id
      WHERE ad.id = $1`,
    [id]
  );
  return rows[0] || null;
};

module.exports = { listCategories, listDetails, findDetailById };
