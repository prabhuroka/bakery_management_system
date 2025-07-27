import React, { useState, useEffect } from 'react';
import { getMenu } from '../services/api';
import MenuCategory from '../components/MenuCategory';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import '../styles/main.css';

interface Product {
  Product_ID: number;
  Product_Name: string;
  Description?: string;
  Price: number;
  Image_URL?: string;
  Category_Name: string;
  allergens?: string[];
}

interface MenuCategory {
  category: string;
  items: Product[];
}

const Menu: React.FC = () => {
  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  
useEffect(() => {
  const fetchMenu = async () => {
    try {
      console.log('Fetching menu data...');
      const data = await getMenu();
      
      if (!data || data.length === 0) {
        console.warn('No products received');
        setError('No menu items available. Please check back later.');
        return;
      }

      // Group products by category
      const categories = Array.from(new Set(data.map(product => product.Category_Name)));
      const menuData = categories.map(category => ({
        category,
        items: data.filter(product => product.Category_Name === category)
      }));

      setMenu(menuData);
    } catch (err) {
      console.error('Error fetching menu:', err);
      setError('Failed to load menu. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  fetchMenu();
}, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
  <div className="menu-page">
    <h1>Our Bakery Menu</h1>
    {loading && <div>Loading menu data...</div>}
    {error && <div className="error-message">{error}</div>}
    
    {/* Debug output */}
    <div style={{ display: 'none' }}>
      <h3>Debug Info:</h3>
      <p>Loading: {loading.toString()}</p>
      <p>Error: {error}</p>
      <p>Menu Data: {JSON.stringify(menu)}</p>
    </div>
    
    {!loading && !error && (
      <div className="menu-container">
        {menu.map((category) => (
          <MenuCategory 
            key={category.category}
            category={category.category}
            items={category.items}
          />
        ))}
      </div>
    )}
  </div>
);
};

export default Menu;