// const express = require('express');
// const router = express.Router();
// const { pool } = require('../config/database');

// // Get menu for public website
// router.get('/menu', async (req, res) => {
//   try {
//     // First get all categories
//     const [categories] = await pool.query(
//       `SELECT Category_ID, Category_Name FROM Category ORDER BY Category_Name`
//     );

//     // Then get products for each category
//     const menu = await Promise.all(categories.map(async (category) => {
//       const [products] = await pool.query(`
//         SELECT 
//           p.Product_ID as id,
//           p.Product_Name as name,
//           p.Price,
//           p.Description,
//           p.Image_URL as image,
//           GROUP_CONCAT(DISTINCT a.Description) as allergens
//         FROM Product p
//         LEFT JOIN Product_Allergen_Info pai ON p.Product_ID = pai.Product_ID
//         LEFT JOIN Allergen a ON pai.Allergy_ID = a.Allergy_ID
//         WHERE p.Category_ID = ? AND p.Active = 1
//         GROUP BY p.Product_ID
//         ORDER BY p.Product_Name
//       `, [category.Category_ID]);

//       return {
//         category: category.Category_Name,
//         items: products.map(p => ({
//           ...p,
//           allergens: p.allergens ? p.allergens.split(',') : []
//         }))
//       };
//     }));

//     res.json(menu);
//   } catch (err) {
//     console.error('Menu error:', err.message);
//     res.status(500).json({ error: 'Server Error' });
//   }
// });

// module.exports = router;