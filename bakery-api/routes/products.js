const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { auth, authorize } = require('../middleware/auth');

// Get all products (public)
// Get product categories for website

router.get('/categories', async (req, res) => {
  try {
    const [categories] = await pool.query(
      'SELECT * FROM Category ORDER BY Category_Name'
    );
    res.json(categories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get products for website (optimized for public access)
router.get('/website', async (req, res) => {
  try {
    const sql = `
      SELECT 
        p.Product_ID,
        p.Product_Name,
        p.Price,
        p.Description,
        p.Image_URL,
        c.Category_Name,
        GROUP_CONCAT(DISTINCT a.Description) as allergens
      FROM Product p
      LEFT JOIN Category c ON p.Category_ID = c.Category_ID
      LEFT JOIN Product_Allergen_Info pai ON p.Product_ID = pai.Product_ID
      LEFT JOIN Allergen a ON pai.Allergy_ID = a.Allergy_ID
      WHERE p.Active = 1
      GROUP BY p.Product_ID
      ORDER BY c.Category_Name, p.Product_Name
    `;
    
    const [products] = await pool.query(sql);
    
    if (!products || products.length === 0) {
      return res.status(404).json({ msg: "Product not found" });
    }
    
    res.json(products);
  } catch (err) {
    console.error("Detailed error:", err);
    res.status(500).json({ 
      error: 'Server Error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});


router.get('/', async (req, res) => {
  try {
    const [products] = await pool.query(`
      SELECT 
        p.*, 
        c.Category_Name,
        GROUP_CONCAT(DISTINCT a.Description) as allergens,
        GROUP_CONCAT(DISTINCT pr.Promotion_ID) as active_promotions,
        GROUP_CONCAT(DISTINCT i.Name) as ingredients
      FROM Product p
      LEFT JOIN Category c ON p.Category_ID = c.Category_ID
      LEFT JOIN Product_Allergen_Info pai ON p.Product_ID = pai.Product_ID
      LEFT JOIN Allergen a ON pai.Allergy_ID = a.Allergy_ID
      LEFT JOIN Product_Promotion pp ON p.Product_ID = pp.Product_ID
      LEFT JOIN Promotion pr ON pp.Promotion_ID = pr.Promotion_ID 
        AND pr.Start_Date <= NOW() AND pr.End_Date >= NOW() AND pr.Active = 1
      LEFT JOIN Product_Ingredient pi ON p.Product_ID = pi.Product_ID
      LEFT JOIN Ingredient i ON pi.Ingredient_ID = i.Ingredient_ID
      WHERE p.Active = 1
      GROUP BY p.Product_ID
      ORDER BY c.Category_Name, p.Product_Name
    `);
    
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get single product with details (public)
router.get('/:id', async (req, res) => {
  try {
    const [product] = await pool.query(`
      SELECT 
        p.*, 
        c.Category_Name,
        GROUP_CONCAT(DISTINCT i.Name) as ingredients,
        GROUP_CONCAT(DISTINCT a.Description) as allergens,
        GROUP_CONCAT(DISTINCT e.Name) as equipment,
        GROUP_CONCAT(DISTINCT pr.Discount_Percentage) as active_discounts
      FROM Product p
      LEFT JOIN Category c ON p.Category_ID = c.Category_ID
      LEFT JOIN Product_Ingredient pi ON p.Product_ID = pi.Product_ID
      LEFT JOIN Ingredient i ON pi.Ingredient_ID = i.Ingredient_ID
      LEFT JOIN Product_Allergen_Info pai ON p.Product_ID = pai.Product_ID
      LEFT JOIN Allergen a ON pai.Allergy_ID = a.Allergy_ID
      LEFT JOIN Product_Equipment pe ON p.Product_ID = pe.Product_ID
      LEFT JOIN Equipment e ON pe.Equipment_ID = e.Equipment_ID
      LEFT JOIN Product_Promotion pp ON p.Product_ID = pp.Product_ID
      LEFT JOIN Promotion pr ON pp.Promotion_ID = pr.Promotion_ID 
        AND pr.Start_Date <= NOW() AND pr.End_Date >= NOW() AND pr.Active = 1
      WHERE p.Product_ID = ? AND p.Active = 1
      GROUP BY p.Product_ID
    `, [req.params.id]);

    if (product.length === 0) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    res.json(product[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.put('/:id', auth, authorize('owner'), async (req, res) => {
  const { 
    Product_Name, 
    Description, 
    Category_ID, 
    Price, 
    Product_Stock_Level,
    Image_URL,
    Active 
  } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE Product SET
        Product_Name = COALESCE(?, Product_Name),
        Description = COALESCE(?, Description),
        Category_ID = COALESCE(?, Category_ID),
        Price = COALESCE(?, Price),
        Product_Stock_Level = COALESCE(?, Product_Stock_Level),
        Image_URL = COALESCE(?, Image_URL),
        Active = COALESCE(?, Active)
       WHERE Product_ID = ?`,
      [
        Product_Name,
        Description,
        Category_ID,
        Price,
        Product_Stock_Level,
        Image_URL,
        Active,
        req.params.id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Get the updated product
    const [product] = await pool.query(
      'SELECT * FROM Product WHERE Product_ID = ?',
      [req.params.id]
    );

    res.json({
      product: product[0],
      message: 'Product updated successfully'
    });
  } catch (err) {
    console.error('Product update error:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Update product price (owner only)
router.put('/:id/price', auth, authorize('owner'), async (req, res) => {
  const { price } = req.body;
  
  if (isNaN(price)) {
    return res.status(400).json({ error: 'Price must be a number' });
  }

  try {
    const [result] = await pool.query(
      `UPDATE Product SET Price = ? WHERE Product_ID = ?`,
      [price, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Price updated successfully' });
  } catch (err) {
    console.error('Price update error:', err);
    res.status(500).json({ error: 'Failed to update price' });
  }
});

// Update product stock (owner only)
router.put('/:id/stock', auth, authorize('owner'), async (req, res) => {
  const { adjustment } = req.body;
  
  if (isNaN(stock) || stock < 0) {
    return res.status(400).json({ error: 'Stock must be a positive number' });
  }

  try {
    const [result] = await pool.query(
      `UPDATE Product 
       SET Product_Stock_Level = ?
       WHERE Product_ID = ?`,
      [stock, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Stock level updated' });
  } catch (err) {
    console.error('Stock update error:', err);
    res.status(500).json({ error: 'Failed to update stock' });
  }
});

// Add new product (owner only)
router.post('/', auth, authorize('owner'), async (req, res) => {
  const { 
    Product_Name, 
    Description, 
    Category_ID, 
    Price, 
    Cost = null, 
    Product_Stock_Level,
    Image_URL,
    Active = true 
  } = req.body;

  if (!Product_Name || !Price) {
    return res.status(400).json({ error: 'Product name and price are required' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO Product 
       (Product_Name, Description, Category_ID, Price, Cost, Product_Stock_Level, Image_URL, Active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [Product_Name, Description, Category_ID, Price, Cost, Product_Stock_Level, Image_URL, Active]
    );
    const [product] = await pool.query(
      'SELECT * FROM Product WHERE Product_ID = ?',
      [result.insertId]
    );
    res.status(201).json({
      product: product[0],
      message: 'Product created successfully'
    });
  } catch (err) {
    console.error('Product creation error:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

router.get('/admin/all', auth, authorize('owner'), async (req, res) => {
  try {
    const [products] = await pool.query(`
      SELECT 
        p.*, 
        c.Category_Name
      FROM Product p
      LEFT JOIN Category c ON p.Category_ID = c.Category_ID
      ORDER BY p.Active DESC, c.Category_Name, p.Product_Name
    `);
    
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});



module.exports = router;