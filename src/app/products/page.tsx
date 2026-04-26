import { getProducts } from "@/lib/api/products";

export default async function ProductsPage() {
const products = await getProducts();

return (
<div style={{ padding: "40px" }}> <h1>Products</h1>
  <ul>
    {products.map((product) => (
      <li key={product.id} style={{ marginBottom: "20px" }}>
        <h2>{product.name}</h2>
        <p>Price: ₹{product.price}</p>
        {product.images?.[0] && (
          <img
            src={product.images[0].src}
            alt={product.images[0].alt}
            width={200}
          />
        )}
      </li>
    ))}
  </ul>
</div>
);
}
