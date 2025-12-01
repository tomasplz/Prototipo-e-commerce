import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

// Ubicación ficticia: Centro de La Serena
const UBICACION_LA_SERENA = { lat: -29.9027, lng: -71.2519 };

export default function Navbar({ usuario, setUsuario }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [ubicacionFicticia, setUbicacionFicticia] = useState(true);
  const [obteniendoUbicacion, setObteniendoUbicacion] = useState(false);

  // Función para actualizar el contador desde localStorage
  const actualizarContador = () => {
    const stored = JSON.parse(localStorage.getItem("carrito")) || [];
    setCount(stored.length);
  };

  // Cargar preferencia de ubicación
  useEffect(() => {
    const tipoUbicacion = localStorage.getItem("tipoUbicacion");
    if (tipoUbicacion === "real") {
      setUbicacionFicticia(false);
    } else {
      // Por defecto usar ubicación ficticia
      setUbicacionFicticia(true);
      localStorage.setItem("tipoUbicacion", "ficticia");
      localStorage.setItem("ubicacionUsuario", JSON.stringify(UBICACION_LA_SERENA));
    }
  }, []);

  useEffect(() => {
    // Actualizar al montar
    actualizarContador();

    // Escuchar evento global que dispare cualquier CardProducto
    window.addEventListener("carritoActualizado", actualizarContador);

    return () => {
      window.removeEventListener("carritoActualizado", actualizarContador);
    };
  }, []);

  // Cambiar tipo de ubicación
  const toggleUbicacion = () => {
    if (ubicacionFicticia) {
      // Cambiar a ubicación real
      setObteniendoUbicacion(true);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const realUbicacion = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            localStorage.setItem("ubicacionUsuario", JSON.stringify(realUbicacion));
            localStorage.setItem("tipoUbicacion", "real");
            setUbicacionFicticia(false);
            setObteniendoUbicacion(false);
            // Notificar cambio
            window.dispatchEvent(new Event("ubicacionCambiada"));
          },
          (error) => {
            alert("No se pudo obtener tu ubicación real. Usando ubicación ficticia.");
            setObteniendoUbicacion(false);
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      } else {
        alert("Tu navegador no soporta geolocalización");
        setObteniendoUbicacion(false);
      }
    } else {
      // Cambiar a ubicación ficticia
      localStorage.setItem("ubicacionUsuario", JSON.stringify(UBICACION_LA_SERENA));
      localStorage.setItem("tipoUbicacion", "ficticia");
      setUbicacionFicticia(true);
      // Notificar cambio
      window.dispatchEvent(new Event("ubicacionCambiada"));
    }
  };

  const role = usuario?.role || usuario?.rol || usuario?.tipo || "";
  const roleLower = String(role).toLowerCase();

  const handleLogout = () => {
    localStorage.removeItem("usuarioActual");
    setUsuario(null);
    navigate("/");
  };

  const handleDeleteAccount = () => {
    if (!usuario) return;
    const ok = confirm("¿Eliminar cuenta? Esta acción no se puede deshacer.");
    if (!ok) return;

    try {
      // Eliminar productos del usuario
      const productos = JSON.parse(localStorage.getItem("productos")) || [];
      const productosRestantes = productos.filter(p => {
        if (p.vendedorId && usuario.id) return p.vendedorId !== usuario.id;
        if (p.vendedor?.id && usuario.id) return p.vendedor.id !== usuario.id;
        return true;
      });
      localStorage.setItem("productos", JSON.stringify(productosRestantes));

      // Eliminar usuario de la lista
      const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
      const filtrados = usuarios.filter(u => {
        if (u.id && usuario.id) return u.id !== usuario.id;
        if (u.email && usuario.email) return u.email !== usuario.email;
        return JSON.stringify(u) !== JSON.stringify(usuario);
      });
      localStorage.setItem("usuarios", JSON.stringify(filtrados));
    } catch (e) {}

    localStorage.removeItem("usuarioActual");
    setUsuario(null);
    navigate("/");
  };

  const showDashboard = roleLower && !roleLower.includes("comprador");

  return (
    <header style={{ background: "linear-gradient(135deg, #1f2937 0%, #374151 100%)", color: "#fff", padding: "0.6rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 4px 20px rgba(0,0,0,0.15)", borderBottom: "3px solid #f97316" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <Link to="/" style={{ textDecoration: "none", color: "#fff", fontWeight: 800, fontSize: 18, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 24 }}>🔧</span>
          <span>FerrePlaza</span>
          <span style={{ background: "#f97316", fontSize: 10, padding: "2px 6px", borderRadius: 4, marginLeft: 4 }}>La Serena</span>
        </Link>
        <nav style={{ display: "flex", gap: 12, marginLeft: 8 }}>
          <Link to="/" style={{ color: "#d1d5db", textDecoration: "none", fontSize: 14 }}>Inicio</Link>
          {showDashboard && <Link to="/inventario" style={{ color: "#d1d5db", textDecoration: "none", fontSize: 14 }}>Inventario</Link>}
        </nav>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem", position: "relative" }}>
        {/* Toggle de ubicación */}
        <button
          onClick={toggleUbicacion}
          disabled={obteniendoUbicacion}
          title={ubicacionFicticia ? "Usando: Centro La Serena (ficticia)" : "Usando: Tu ubicación real"}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: ubicacionFicticia ? "rgba(249, 115, 22, 0.2)" : "rgba(34, 197, 94, 0.2)",
            border: `1px solid ${ubicacionFicticia ? "#f97316" : "#22c55e"}`,
            color: "#fff",
            padding: "4px 10px",
            borderRadius: 20,
            cursor: obteniendoUbicacion ? "wait" : "pointer",
            fontSize: 12,
            transition: "all 0.2s"
          }}
        >
          <span>{obteniendoUbicacion ? "⏳" : "📍"}</span>
          <span>{ubicacionFicticia ? "La Serena" : "Mi ubicación"}</span>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: ubicacionFicticia ? "#f97316" : "#22c55e"
          }}></span>
        </button>

        {usuario ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ textAlign: "right", lineHeight: 1 }}>
              <div style={{ fontWeight: 700 }}>{usuario.nombre || "Usuario"}</div>
              {role && <div style={{ fontSize: 12, color: "#d1d5db" }}>{role}</div>}
            </div>

            <button onClick={() => setOpen(v => !v)} aria-expanded={open} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", padding: "6px 8px", borderRadius: 6, cursor: "pointer" }}>⋯</button>

            {open && (
              <div style={{ position: "absolute", top: "3.4rem", right: "6rem", background: "#fff", color: "#111", borderRadius: 8, boxShadow: "0 6px 20px rgba(0,0,0,0.12)", padding: "8px", minWidth: 160, zIndex: 40 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button onClick={() => { setOpen(false); handleLogout(); }} style={{ textAlign: "left", background: "#fff", border: "none", padding: "6px 8px", cursor: "pointer", color: "#111" }}>Salir</button>
                  <button onClick={() => { setOpen(false); handleDeleteAccount(); }} style={{ textAlign: "left", background: "#fff", border: "none", padding: "6px 8px", cursor: "pointer", color: "#b91c1c" }}>Eliminar cuenta</button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Link to="/login" style={{ color: "#d1d5db", textDecoration: "none", fontSize: 14 }}>Ingresar</Link>
            <Link to="/registro" style={{ color: "#d1d5db", textDecoration: "none", fontSize: 14 }}>Registro</Link>
          </div>
        )}

        <Link to="/carrito" style={{ position: "relative", color: "#fff", textDecoration: "none", display: "inline-block" }}>
          <span style={{ fontSize: 18 }}>🛒</span>
          {count > 0 && (
            <span style={{ position: "absolute", top: -6, right: -10, background: "#ef4444", color: "#fff", borderRadius: 12, padding: "2px 6px", fontSize: 12, fontWeight: 700 }}>
              {count}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
