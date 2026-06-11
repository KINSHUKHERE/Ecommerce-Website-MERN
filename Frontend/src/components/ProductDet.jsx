import React, { useEffect, useState } from "react";
import { getProduct } from "../api/ProductApi";

const ProductDet = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await getProduct();
      console.log(res.data)
      setProducts(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      hello
      {products.map((item) => (
        <div key={item._id}>
          <h2>{item.heading}</h2>
          <p>{item.brandname}</p>
          <p>₹{item.price}</p>
        </div>
      ))}
    </div>
  );
};

export default ProductDet;