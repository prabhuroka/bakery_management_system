import React from 'react';
import { Product } from '../services/types';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="product-card">
      {product.Image_URL && (
        <div className="product-image">
          <img 
            src={product.Image_URL}
            alt={product.Product_Name}
            loading="lazy"
          />
        </div>
      )}
      <div className="product-info">
        <h3>{product.Product_Name}</h3>
        <p className="price">${Number(product.Price).toFixed(2)}</p>
        {product.Description && <p className="description">{product.Description}</p>}
        {product.allergens && Array.isArray(product.allergens) && product.allergens.length > 0 && (
  <div className="allergens">
    <span>Contains: </span>
    {product.allergens.filter(Boolean).join(', ')}
  </div>
)}
      </div>
    </div>
  );
};

export default ProductCard;