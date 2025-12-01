import { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CartContext } from "../App";
import {
  FERRETERIAS,
  UBICACION_USUARIO,
  calcularDistancia,
} from "../data/ferreterias";

// Fix para iconos de Leaflet en Vite/React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Icono personalizado para el usuario
const userIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Icono para ferreterías
const storeIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

export default function ProductoDetalle() {
  const { id } = useParams();
  const { addToCart } = useContext(CartContext);
  const [producto, setProducto] = useState(null);
  const [ferreterias, setFerreterias] = useState([]);
  const [selectedFerre, setSelectedFerre] = useState(null);
  const [ubicacionUsuario, setUbicacionUsuario] = useState(null);
  const [ubicacionCargada, setUbicacionCargada] = useState(false);

  // Obtener ubicación del usuario (prioridad: localStorage > geolocation > default)
  useEffect(() => {
    const obtenerUbicacion = () => {
      // Primero intentar con localStorage (ubicación guardada previamente)
      const ubicacionGuardada = localStorage.getItem("ubicacionUsuario");
      if (ubicacionGuardada) {
        const parsed = JSON.parse(ubicacionGuardada);
        const tipoUbicacion = localStorage.getItem("tipoUbicacion");
        const nombreUbicacion = tipoUbicacion === "ficticia" ? "📍 La Serena (ficticia)" : "📍 Tu ubicación real";
        setUbicacionUsuario({ lat: parsed.lat, lng: parsed.lng, nombre: nombreUbicacion });
        setUbicacionCargada(true);
        return;
      }

      // Verificar usuario logueado
      const usuarioActual = JSON.parse(localStorage.getItem("usuarioActual"));
      if (usuarioActual && usuarioActual.lat && usuarioActual.lng) {
        setUbicacionUsuario({ lat: usuarioActual.lat, lng: usuarioActual.lng, nombre: "📍 Tu ubicación" });
        setUbicacionCargada(true);
        return;
      }

      // Usar ubicación por defecto de La Serena
      setUbicacionUsuario({ ...UBICACION_USUARIO, nombre: "📍 La Serena (ficticia)" });
      setUbicacionCargada(true);
    };

    obtenerUbicacion();

    // Escuchar cambios de ubicación desde el toggle del Navbar
    const handleUbicacionCambiada = () => {
      obtenerUbicacion();
    };
    window.addEventListener("ubicacionCambiada", handleUbicacionCambiada);
    
    return () => {
      window.removeEventListener("ubicacionCambiada", handleUbicacionCambiada);
    };
  }, []);

  useEffect(() => {
    // Esperar a que la ubicación esté cargada
    if (!ubicacionCargada || !ubicacionUsuario) return;

    const productos = JSON.parse(localStorage.getItem("productos")) || [];
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const found = productos.find((p) => String(p.id) === String(id));
    setProducto(found);

    if (found) {
      // Buscar el mismo producto (por SKU o nombre) en todas las ferreterías
      const productosSimilares = productos.filter(
        (p) => p.sku === found.sku || p.nombre.toLowerCase() === found.nombre.toLowerCase()
      );

      // Construir lista de ferreterías con precios REALES
      const ferresConPrecio = [];

      productosSimilares.forEach((prod) => {
        // Buscar info de la ferretería
        const ferreInfo = usuarios.find(
          (u) => u.id === prod.vendedorId || u.id === prod.vendedor?.id
        );

        if (ferreInfo && ferreInfo.lat && ferreInfo.lng) {
          const distancia = calcularDistancia(
            ubicacionUsuario.lat,
            ubicacionUsuario.lng,
            ferreInfo.lat,
            ferreInfo.lng
          );

          ferresConPrecio.push({
            id: ferreInfo.id,
            nombre: ferreInfo.nombre,
            direccion: ferreInfo.direccion,
            telefono: ferreInfo.telefono,
            lat: ferreInfo.lat,
            lng: ferreInfo.lng,
            precio: prod.precio,
            productoId: prod.id,
            stock: prod.cantidad,
            distancia,
          });
        }
      });

      // Ordenar por precio (más barato primero)
      ferresConPrecio.sort((a, b) => a.precio - b.precio);
      setFerreterias(ferresConPrecio);
    }
  }, [id, ubicacionUsuario, ubicacionCargada]);

  if (!ubicacionCargada) {
    return (
      <main style={{ maxWidth: 800, margin: "2rem auto", padding: "1rem", textAlign: "center" }}>
        <p>📍 Obteniendo tu ubicación...</p>
      </main>
    );
  }

  if (!producto) {
    return (
      <main style={{ maxWidth: 800, margin: "2rem auto", padding: "1rem" }}>
        <h2>Producto no encontrado</h2>
        <Link to="/">← Volver al inicio</Link>
      </main>
    );
  }

  const handleAgregarDesde = (ferre) => {
    addToCart({
      ...producto,
      precio: ferre.precio,
      ferreteria: ferre.nombre,
    });
    alert(`Agregado desde ${ferre.nombre} a $${ferre.precio.toLocaleString("es-CL")}`);
  };

  return (
    <main style={{ maxWidth: 1000, margin: "2rem auto", padding: "1rem" }}>
      <Link
        to="/"
        style={{ color: "#4f46e5", textDecoration: "none", marginBottom: 16, display: "inline-block" }}
      >
        ← Volver a productos
      </Link>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginTop: 16 }}>
        {/* Imagen y datos del producto */}
        <div>
          <img
            src={producto.imagen || "https://via.placeholder.com/400?text=Producto"}
            alt={producto.nombre}
            style={{ width: "100%", borderRadius: 12, objectFit: "cover", maxHeight: 350 }}
          />
          <h1 style={{ marginTop: 16, color: "#1e1e1e" }}>{producto.nombre}</h1>
          <p style={{ color: "#666" }}>{producto.descripcion}</p>
          {producto.marca && <p><strong>Marca:</strong> {producto.marca}</p>}
          {producto.tipoHerramienta && <p><strong>Tipo:</strong> {producto.tipoHerramienta}</p>}
          <p style={{ fontSize: 12, color: "#888", marginTop: 16 }}>
            💡 Compara precios en ferreterías cercanas y elige la mejor opción
          </p>
        </div>

        {/* Mapa */}
        <div>
          <h3 style={{ marginBottom: 12, color: "#1e1e1e" }}>📍 Ferreterías cercanas</h3>
          <div style={{ height: 300, borderRadius: 12, overflow: "hidden", border: "1px solid #ddd" }}>
            <MapContainer
              center={[ubicacionUsuario.lat, ubicacionUsuario.lng]}
              zoom={15}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* Círculo de área */}
              <Circle
                center={[ubicacionUsuario.lat, ubicacionUsuario.lng]}
                radius={800}
                pathOptions={{ color: "#4f46e5", fillColor: "#4f46e5", fillOpacity: 0.1 }}
              />

              {/* Marcador del usuario */}
              <Marker position={[ubicacionUsuario.lat, ubicacionUsuario.lng]} icon={userIcon}>
                <Popup>
                  <strong>Tu ubicación</strong>
                </Popup>
              </Marker>

              {/* Marcadores de ferreterías */}
              {ferreterias.map((ferre) => (
                <Marker
                  key={ferre.id}
                  position={[ferre.lat, ferre.lng]}
                  icon={storeIcon}
                  eventHandlers={{
                    click: () => setSelectedFerre(ferre),
                  }}
                >
                  <Popup>
                    <strong>{ferre.nombre}</strong>
                    <br />
                    <span style={{ color: "#16a34a", fontWeight: "bold" }}>
                      ${ferre.precio.toLocaleString("es-CL")}
                    </span>
                    <br />
                    <small>{ferre.distancia}m de distancia</small>
                    <br />
                    <a
                      href={`/tienda/${encodeURIComponent(ferre.id)}`}
                      style={{
                        display: "inline-block",
                        marginTop: 8,
                        padding: "4px 10px",
                        background: "#4f46e5",
                        color: "#fff",
                        borderRadius: 6,
                        textDecoration: "none",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      🏪 Ir a tienda
                    </a>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      </div>

      {/* Tabla comparativa de precios */}
      <section style={{ marginTop: 32 }}>
        <h3 style={{ marginBottom: 16, color: "#1e1e1e" }}>💰 Comparar precios</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 12, overflow: "hidden" }}>
            <thead>
              <tr style={{ background: "#f3f4f6" }}>
                <th style={{ padding: 12, textAlign: "left", color: "#1e1e1e" }}>Ferretería</th>
                <th style={{ padding: 12, textAlign: "left", color: "#1e1e1e" }}>Dirección</th>
                <th style={{ padding: 12, textAlign: "center", color: "#1e1e1e" }}>Distancia</th>
                <th style={{ padding: 12, textAlign: "right", color: "#1e1e1e" }}>Precio</th>
                <th style={{ padding: 12, textAlign: "center", color: "#1e1e1e" }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {ferreterias.map((ferre, idx) => (
                <tr
                  key={ferre.id}
                  style={{
                    background: idx === 0 ? "#ecfdf5" : selectedFerre?.id === ferre.id ? "#eff6ff" : "#fff",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <td style={{ padding: 12 }}>
                    <strong style={{ color: "#1e1e1e" }}>{ferre.nombre}</strong>
                    {idx === 0 && (
                      <span style={{ marginLeft: 8, background: "#16a34a", color: "#fff", padding: "2px 8px", borderRadius: 12, fontSize: 11 }}>
                        Mejor precio
                      </span>
                    )}
                  </td>
                  <td style={{ padding: 12, color: "#666" }}>{ferre.direccion}</td>
                  <td style={{ padding: 12, textAlign: "center", color: "#666" }}>
                    {ferre.distancia >= 1000
                      ? `${(ferre.distancia / 1000).toFixed(1)} km`
                      : `${ferre.distancia} m`}
                  </td>
                  <td style={{ padding: 12, textAlign: "right", fontWeight: "bold", color: idx === 0 ? "#16a34a" : "#1e1e1e", fontSize: 18 }}>
                    ${ferre.precio.toLocaleString("es-CL")}
                  </td>
                  <td style={{ padding: 12, textAlign: "center" }}>
                    <button
                      onClick={() => handleAgregarDesde(ferre)}
                      style={{
                        background: "linear-gradient(90deg, #5b60ff, #8a6bff)",
                        color: "#fff",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: 8,
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      Agregar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
