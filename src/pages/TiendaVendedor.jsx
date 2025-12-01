import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import CardProducto from "../components/CardProducto";

export default function TiendaVendedor() {
  const { sellerKey } = useParams(); // coincide con encodeURIComponent en el link
  const decoded = decodeURIComponent(sellerKey || "");
  const [productos, setProductos] = useState([]);
  const [lista, setLista] = useState([]);
  const [vendedorInfo, setVendedorInfo] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("productos")) || [];
    setProductos(stored);

    // Buscar info del vendedor en usuarios
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const vendedor = usuarios.find(u => 
      u.id === decoded || 
      String(u.id) === decoded ||
      u.email === decoded ||
      u.nombre?.toLowerCase() === decoded.toLowerCase()
    );
    setVendedorInfo(vendedor);
  }, [decoded]);

  useEffect(() => {
    if (!decoded) {
      setLista([]);
      return;
    }

    // filtrar por varias propiedades posibles que guardaste en productos
    const filtrados = productos.filter(p => {
      const keys = [
        p.vendedor?.id,
        p.vendedorId,
        p.sellerId,
        p.vendedor?.email,
        p.email,
        p.vendedor?.nombre,
        p.vendedorNombre,
        p.vendedor,
        p.tienda,
        p.sellerName,
        p.seller
      ].map(k => (k === undefined || k === null) ? "" : String(k));
      return keys.some(k => k.toLowerCase() === decoded.toLowerCase());
    });

    setLista(filtrados);
  }, [decoded, productos]);

  // Obtener nombre para mostrar
  const nombreTienda = vendedorInfo?.nombre || 
    (lista.length > 0 ? (lista[0].vendedor?.nombre || lista[0].vendedorNombre) : null) ||
    "Tienda";

  return (
    <main style={{ maxWidth: 1100, margin: "2rem auto", padding: "0 1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0, color: "#1e1e1e" }}>{nombreTienda}</h2>
          <p style={{ marginTop: 6, color: "#6b7280" }}>{lista.length} producto(s)</p>
          {vendedorInfo?.direccion && (
            <p style={{ marginTop: 4, color: "#6b7280", fontSize: 14 }}>
              📍 {vendedorInfo.direccion}
            </p>
          )}
          {vendedorInfo?.telefono && (
            <p style={{ marginTop: 2, color: "#6b7280", fontSize: 14 }}>
              📞 {vendedorInfo.telefono}
            </p>
          )}
        </div>
        <div>
          <Link to="/" style={{ textDecoration: "none", color: "#4f46e5" }}>← Volver a Productos</Link>
        </div>
      </div>

      {lista.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", background: "#f9fafb", borderRadius: 12 }}>
          <p style={{ fontSize: 48, margin: 0 }}>🏪</p>
          <p style={{ color: "#6b7280", marginTop: 12 }}>Esta tienda aún no tiene productos publicados.</p>
          {vendedorInfo && (
            <p style={{ color: "#9ca3af", fontSize: 14, marginTop: 8 }}>
              Puedes contactarlos al {vendedorInfo.telefono || "teléfono de la tienda"}
            </p>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {lista.map((p, i) => <CardProducto key={i} producto={p} />)}
        </div>
      )}
    </main>
  );
}
