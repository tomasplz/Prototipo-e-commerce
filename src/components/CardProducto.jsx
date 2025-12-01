import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../App";

// Generar rating fake basado en el nombre del producto (consistente)
const generarRating = (nombre) => {
  let hash = 0;
  for (let i = 0; i < (nombre || "").length; i++) {
    hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
  }
  return 3.5 + (Math.abs(hash) % 15) / 10; // Entre 3.5 y 5.0
};

const generarNumReviews = (nombre) => {
  let hash = 0;
  for (let i = 0; i < (nombre || "").length; i++) {
    hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
  }
  return 12 + (Math.abs(hash) % 88); // Entre 12 y 99 reviews
};

export default function CardProducto({ producto = {}, onAgregar = null, esMejorPrecio = false }) {
  const [hover, setHover] = useState(false);
  const { addToCart } = useContext(CartContext) || {};

  const precioNum = Number(producto.precio) || 0;
  const rating = generarRating(producto.nombre);
  const numReviews = generarNumReviews(producto.nombre);
  const vendedorNombre =
    producto.vendedor?.nombre ||
    producto.vendedorNombre ||
    producto.vendedor ||
    producto.tienda ||
    "Vendedor";

  const vendedorKey =
    producto.vendedor?.id ||
    producto.vendedorId ||
    producto.vendedor?.email ||
    producto.email ||
    vendedorNombre;

  const descripcion = producto.descripcion || "Descripción no disponible.";
  const stock = producto.cantidad || producto.stock || "Sin dato";

  // Detectar extras dinámicos
  const extra1Label = producto.extra1?.label || "Extra 1";
  const extra1Value = producto.extra1?.value || "—";
  const extra2Label = producto.extra2?.label || "Extra 2";
  const extra2Value = producto.extra2?.value || "—";

  // Guardar producto en carrito (localStorage)
  const fallbackAddToLocalStorage = (productoToAdd) => {
    try {
      const lista = JSON.parse(localStorage.getItem("carrito")) || [];

      const unidad = {
        nombre: productoToAdd.nombre || "Sin nombre",
        precio: Number(productoToAdd.precio) || 0,
        imagen: productoToAdd.imagen || "https://via.placeholder.com/150",
        id: productoToAdd.id ?? null,
        descripcion: productoToAdd.descripcion || "",
        marca: productoToAdd.marca || "",
        tipoHerramienta: productoToAdd.tipoHerramienta || "",
        tamaño: productoToAdd.tamaño || "",
        extra1: productoToAdd.extra1
          ? productoToAdd.extra1
          : { label: "Extra 1", value: productoToAdd.extra1 || "" },
        extra2: productoToAdd.extra2
          ? productoToAdd.extra2
          : { label: "Extra 2", value: productoToAdd.extra2 || "" },
      };

      lista.push(unidad);
      localStorage.setItem("carrito", JSON.stringify(lista));
      window.dispatchEvent(new Event("carritoActualizado"));
    } catch (e) {
      console.error("Error al actualizar carrito:", e);
    }
  };

  const handleAgregar = () => {
    if (typeof onAgregar === "function") {
      onAgregar(producto);
      window.dispatchEvent(new Event("carritoActualizado"));
      return;
    }
    if (typeof addToCart === "function") {
      addToCart(producto);
      window.dispatchEvent(new Event("carritoActualizado"));
      return;
    }
    fallbackAddToLocalStorage(producto);
  };

  return (
    <article
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 260,
        borderRadius: 14,
        overflow: "hidden",
        background: "#fff",
        boxShadow: hover
          ? "0 14px 40px rgba(10,20,50,0.12)"
          : "0 6px 18px rgba(10,20,50,0.06)",
        transform: hover ? "translateY(-6px)" : "translateY(0)",
        transition: "all 180ms ease",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Imagen - clickeable para ir al detalle */}
      <Link to={`/producto/${producto.id}`} style={{ textDecoration: "none" }}>
        <div style={{ position: "relative", height: 160, background: "#f7f7fb", cursor: "pointer" }}>
          <img
            src={
              producto.imagen ||
              "https://via.placeholder.com/400x300?text=Producto"
            }
            alt={producto.nombre || "Producto"}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          
          {/* Badges superiores */}
          <div style={{ position: "absolute", top: 8, left: 8, display: "flex", flexDirection: "column", gap: 4 }}>
            {(esMejorPrecio || producto.tieneVariantes) && (
              <span style={{
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                color: "#fff",
                padding: "4px 8px",
                borderRadius: 6,
                fontSize: 10,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 3,
                boxShadow: "0 2px 8px rgba(245,158,11,0.4)"
              }}>
                🏆 MEJOR PRECIO
              </span>
            )}
            <span style={{
              background: "linear-gradient(135deg, #10b981, #059669)",
              color: "#fff",
              padding: "4px 8px",
              borderRadius: 6,
              fontSize: 10,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 3,
              boxShadow: "0 2px 8px rgba(16,185,129,0.4)"
            }}>
              🚚 RETIRO HOY
            </span>
          </div>

          <div
            style={{
              position: "absolute",
              bottom: 8,
              right: 8,
              background: "rgba(234, 88, 12, 0.95)",
              color: "#fff",
              padding: "4px 8px",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            📍 Ver ferreterías
          </div>
        </div>
      </Link>

      {/* Información */}
      <div
        style={{
          padding: 14,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          flex: 1,
        }}
      >
        <Link to={`/producto/${producto.id}`} style={{ textDecoration: "none" }}>
          <h3 style={{ margin: 0, fontSize: 16, color: "#101827", cursor: "pointer" }}>
            {producto.nombre || "Producto sin nombre"}
          </h3>
        </Link>

        {/* Estrellas de valoración */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
          <span style={{ color: "#f59e0b", fontSize: 14 }}>
            {"★".repeat(Math.floor(rating))}{rating % 1 >= 0.5 ? "½" : ""}
          </span>
          <span style={{ fontSize: 12, color: "#6b7280" }}>
            {rating.toFixed(1)} ({numReviews})
          </span>
        </div>

        {/* Descripción corta */}
        <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
          {descripcion.length > 80
            ? descripcion.slice(0, 80) + "…"
            : descripcion}
        </p>

        {/* Info adicional */}
        <div style={{ fontSize: 13, color: "#4b5563", marginTop: 6 }}>
          <p style={{ margin: 2 }}>
            <strong>Stock:</strong> {stock}
          </p>

          {/* Nuevos datos desde el Inventario */}
          {producto.marca && (
            <p style={{ margin: 2 }}>
              <strong>Marca:</strong> {producto.marca}
            </p>
          )}
          {producto.tipoHerramienta && (
            <p style={{ margin: 2 }}>
              <strong>Tipo:</strong> {producto.tipoHerramienta}
            </p>
          )}
          {producto.tamaño && (
            <p style={{ margin: 2 }}>
              <strong>Tamaño:</strong> {producto.tamaño}
            </p>
          )}

          {/* Extras antiguos (si existen) */}
          {extra1Value !== "—" && (
            <p style={{ margin: 2 }}>
              <strong>{extra1Label}:</strong> {extra1Value}
            </p>
          )}
          {extra2Value !== "—" && (
            <p style={{ margin: 2 }}>
              <strong>{extra2Label}:</strong> {extra2Value}
            </p>
          )}
        </div>

        {/* Vendedor */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 10,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "#eef2ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#4f46e5",
              fontWeight: "bold",
            }}
          >
            {vendedorNombre[0]?.toUpperCase() || "V"}
          </div>
          <Link
            to={`/tienda/${encodeURIComponent(String(vendedorKey))}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 12, color: "#6b7280" }}>
                Vendido por
              </span>
              <strong style={{ fontSize: 13, color: "#0f172a" }}>
                {vendedorNombre}
              </strong>
            </div>
          </Link>
        </div>

        {/* Precio y botón */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "auto",
          }}
        >
          <div>
            <span style={{ fontSize: 12, color: "#6b7280" }}>
              {producto.tieneVariantes ? "Desde" : "Precio"}
            </span>
            <strong
              style={{
                fontSize: 16,
                color: producto.tieneVariantes ? "#059669" : "#0f172a",
                display: "block",
              }}
            >
              ${precioNum.toLocaleString("es-CL")}
            </strong>
            {producto.tieneVariantes && (
              <span style={{ fontSize: 11, color: "#6b7280" }}>
                Comparar en {">"}1 tienda
              </span>
            )}
          </div>

          <button
            onClick={handleAgregar}
            style={{
              background: "linear-gradient(135deg, #ea580c, #f97316)",
              color: "#fff",
              border: "none",
              padding: "8px 12px",
              borderRadius: 10,
              cursor: "pointer",
              fontWeight: 700,
              boxShadow: "0 2px 8px rgba(234, 88, 12, 0.3)",
            }}
          >
            🛒 Agregar
          </button>
        </div>
      </div>
    </article>
  );
}
