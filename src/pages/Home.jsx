import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CardProducto from "../components/CardProducto";
import { CartContext } from "../App";

export default function Home() {
  const { addToCart } = useContext(CartContext); // Context para el carrito
  const [productos, setProductos] = useState([]);
  const [filtrados, setFiltrados] = useState([]);
  const [ubicacion, setUbicacion] = useState(null);
  const [ubicacionStatus, setUbicacionStatus] = useState("idle"); // idle, loading, success, error
  const location = useLocation();
  const navigate = useNavigate();

  const [q, setQ] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("q") || "";
  });

  // Cargar productos desde localStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("productos")) || [];
    setProductos(stored);
    
    // Verificar si ya tenemos ubicación guardada
    const usuarioActual = JSON.parse(localStorage.getItem("usuarioActual"));
    if (usuarioActual?.lat && usuarioActual?.lng) {
      setUbicacion({ lat: usuarioActual.lat, lng: usuarioActual.lng });
      setUbicacionStatus("success");
    }
  }, []);

  // Función para obtener ubicación
  const obtenerUbicacion = () => {
    setUbicacionStatus("loading");
    if (!navigator.geolocation) {
      setUbicacionStatus("error");
      alert("Tu navegador no soporta geolocalización");
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newUbicacion = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUbicacion(newUbicacion);
        setUbicacionStatus("success");
        
        // Guardar ubicación globalmente en localStorage
        localStorage.setItem("ubicacionUsuario", JSON.stringify(newUbicacion));
        
        // También guardar en usuarioActual si hay usuario logueado
        const usuarioActual = JSON.parse(localStorage.getItem("usuarioActual"));
        if (usuarioActual) {
          usuarioActual.lat = newUbicacion.lat;
          usuarioActual.lng = newUbicacion.lng;
          localStorage.setItem("usuarioActual", JSON.stringify(usuarioActual));
        }
      },
      (error) => {
        setUbicacionStatus("error");
        console.error("Error obteniendo ubicación:", error);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Sincronizar input con cambios en la URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setQ(params.get("q") || "");
  }, [location.search]);

  // Filtrar y ordenar productos
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const qParam = (params.get("q") || "").trim().toLowerCase();
    const sort = params.get("sort") || "";

    let list = [...productos];

    // Agrupar productos por SKU o nombre para mostrar solo uno (el más barato)
    const grupos = {};
    list.forEach((p) => {
      const key = p.sku || p.nombre.toLowerCase();
      if (!grupos[key] || p.precio < grupos[key].precio) {
        grupos[key] = { ...p, tieneVariantes: !!grupos[key] };
      } else if (grupos[key]) {
        grupos[key].tieneVariantes = true;
      }
    });
    list = Object.values(grupos);

    if (qParam) {
      list = list.filter(p => {
        const nombre = (p.nombre || "").toLowerCase();
        const desc = (p.descripcion || "").toLowerCase();
        return nombre.includes(qParam) || desc.includes(qParam);
      });
    }

    if (sort === "price-desc") list.sort((a,b) => (Number(b.precio) || 0) - (Number(a.precio) || 0));
    else if (sort === "price-asc") list.sort((a,b) => (Number(a.precio) || 0) - (Number(b.precio) || 0));
    else if (sort === "name-asc") list.sort((a,b) => (a.nombre || "").localeCompare(b.nombre || ""));
    else if (sort === "name-desc") list.sort((a,b) => (b.nombre || "").localeCompare(a.nombre || ""));

    setFiltrados(list);
  }, [location.search, productos]);

  const updateSort = (value) => {
    const params = new URLSearchParams(location.search);
    if (value) params.set("sort", value);
    else params.delete("sort");
    const qParam = new URLSearchParams(location.search).get("q");
    if (qParam) params.set("q", qParam);
    navigate({ pathname: "/", search: params.toString() });
  };

  const submitSearch = (e) => {
    e?.preventDefault?.();
    const params = new URLSearchParams(location.search);
    if (q && q.trim() !== "") params.set("q", q.trim());
    else params.delete("q");
    const sortParam = new URLSearchParams(location.search).get("sort");
    if (sortParam) params.set("sort", sortParam);
    navigate({ pathname: "/", search: params.toString() });
  };

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "0 1rem" }}>
      {/* Hero Banner */}
      <div style={{
        background: "linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%)",
        borderRadius: 16,
        padding: "24px 32px",
        marginBottom: 24,
        marginTop: 20,
        color: "#fff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 4px 20px rgba(234, 88, 12, 0.3)"
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>
            🔧 Encuentra herramientas cerca de ti
          </h1>
          <p style={{ margin: "8px 0 0", opacity: 0.9, fontSize: 15 }}>
            Compara precios en ferreterías de La Serena y Coquimbo • Retira hoy mismo
          </p>
        </div>
        
        {/* Botón de ubicación */}
        <button
          onClick={obtenerUbicacion}
          disabled={ubicacionStatus === "loading"}
          style={{
            background: ubicacionStatus === "success" ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.2)",
            color: ubicacionStatus === "success" ? "#059669" : "#fff",
            border: ubicacionStatus === "success" ? "2px solid #10b981" : "2px solid rgba(255,255,255,0.3)",
            padding: "12px 20px",
            borderRadius: 12,
            cursor: ubicacionStatus === "loading" ? "wait" : "pointer",
            fontWeight: 700,
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            gap: 8,
            transition: "all 0.2s",
            minWidth: 200,
            justifyContent: "center"
          }}
        >
          {ubicacionStatus === "loading" && "⏳ Obteniendo..."}
          {ubicacionStatus === "success" && "✅ Ubicación activa"}
          {ubicacionStatus === "error" && "❌ Error - Reintentar"}
          {ubicacionStatus === "idle" && "📍 Usar mi ubicación"}
        </button>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{color: "#1f2937", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 24 }}>🛠️</span> Productos
          <span style={{ 
            background: "#fff7ed", 
            color: "#c2410c", 
            fontSize: 12, 
            padding: "4px 10px", 
            borderRadius: 20,
            fontWeight: 600 
          }}>
            {filtrados.length} disponibles
          </span>
        </h2>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <form onSubmit={submitSearch} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar productos..."
              aria-label="Buscar productos"
              style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e5e7eb", outline: "none", width: 240, fontSize: 14 }}
            />
            <button type="submit" style={{ padding: "8px 14px", borderRadius: 8, cursor: "pointer", border: "none", background: "linear-gradient(135deg, #ea580c, #f97316)", color: "#fff", fontWeight: 600 }}>
              🔍 Buscar
            </button>
          </form>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <label style={{ color: "#6b7280", fontSize: 14 }}>Ordenar:</label>
            <select
              aria-label="Ordenar productos"
              onChange={(e) => updateSort(e.target.value)}
              defaultValue={new URLSearchParams(location.search).get("sort") || ""}
              style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 14 }}
            >
              <option value="">Por defecto</option>
              <option value="price-desc">Precio: mayor a menor</option>
              <option value="price-asc">Precio: menor a mayor</option>
              <option value="name-asc">Nombre: A → Z</option>
              <option value="name-desc">Nombre: Z → A</option>
            </select>
          </div>
        </div>
      </div>

      {filtrados.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "#6b7280" }}>
          <span style={{ fontSize: 48 }}>🔍</span>
          <p style={{ fontSize: 16, marginTop: 12 }}>No hay productos que coincidan.</p>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {filtrados.map((p, i) => (
            <CardProducto key={i} producto={p} onAgregar={addToCart} esMejorPrecio={p.tieneVariantes} />
          ))}
        </div>
      )}
    </main>
  );
}
