import React from 'react';
import { Product, Category } from '../types/types';

interface ProductGridProps {
  products: Product[];
  categories: Category[];
  onAddProduct: (product: Product) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, categories, onAddProduct }) => {
  const displayGroups = categories?.length > 0 
    ? categories.map(cat => ({
        ...cat,
        products: products.filter(p => p.Category_ID === cat.Category_ID)
      }))
    : [{
        Category_ID: 0,
        Category_Name: 'All Products',
        products: products
      }];

  const handleProductClick = (product: Product) => {
    if (product.Product_Stock_Level > 0) {
      onAddProduct(product);
    }
  };

  return (
    <div className="product-grid">
      {displayGroups.map(group => (
        group.products.length > 0 && (
          <div key={group.Category_ID} className="category-section">
            <h3>{group.Category_Name}</h3>
            <div className="products">
              {group.products.map(product => (
                <div 
                  key={product.Product_ID}
                  className={`product-card ${product.Product_Stock_Level <= 0 ? 'out-of-stock' : ''}`}
                  onClick={() => handleProductClick(product)}
                >
                  <h4>{product.Product_Name}</h4>
                  <p>${Number(product.Price).toFixed(2)}</p>
                  {product.Product_Stock_Level <= 0 ? (
                    <span className="out-of-stock-label">Out of Stock</span>
                  ) : (
                    <span className="in-stock">{product.Product_Stock_Level} in stock</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      ))}
    </div>
  );
};

export default ProductGrid;