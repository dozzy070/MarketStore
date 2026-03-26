import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import AddProduct from './AddProduct';

function EditProduct() {
  const { id } = useParams();
  
  if (!id) {
    return <Navigate to="/vendor/products" replace />;
  }
  
  // Reuse the AddProduct component with the id param
  return <AddProduct />;
}

export default EditProduct;