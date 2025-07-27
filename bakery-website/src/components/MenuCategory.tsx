import React from 'react';
import ProductCard from './ProductCard';
import { Product } from '../services/types';


interface MenuCategoryProps {
  category: string;
  items: Product[];
}

const MenuCategory: React.FC<MenuCategoryProps> = ({ category, items }) => {
  return (
    <div className="menu-category">
      <h2>{category}</h2>
      <div className="products-grid">
        {items.map((product) => (
          <ProductCard key={product.Product_ID} product={product} />
        ))}
      </div>
    </div>
  );
};

export default MenuCategory;