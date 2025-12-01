import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Link } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix para iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Icono personalizado para usuario
const userIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Icono personalizado para ferreterías
const storeIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Ubicación por defecto (centro La Serena)
const UBICACION_DEFAULT = { lat: -29.9027, lng: -71.2519 };

// Componente para centrar el mapa
function CenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lng], 13);
    }
  }, [center, map]);
  return null;
}

// Calcular distancia entre dos puntos
function calcularDistancia(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function MapaSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [ubicacion, setUbicacion] = useState(null);
  const [ferreterias, setFerreterias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar ferreterías y ubicación
  useEffect(() => {
    const cargarDatos = () => {
      const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
      const ferres = usuarios.filter((u) => u.rol === "vendedor" && u.lat && u.lng);
      setFerreterias(ferres);

      // Verificar ubicación guardada (prioridad: ubicacionUsuario > usuarioActual)
      const savedLocation = localStorage.getItem("ubicacionUsuario");
      if (savedLocation) {
        const parsed = JSON.parse(savedLocation);
        if (parsed.lat && parsed.lng) {
          setUbicacion(parsed);
          return;
        }
      }
      
      const usuarioActual = JSON.parse(localStorage.getItem("usuarioActual"));
      if (usuarioActual?.lat && usuarioActual?.lng) {
        setUbicacion({ lat: usuarioActual.lat, lng: usuarioActual.lng });
      }
    };

    cargarDatos();

    // Escuchar cambios de ubicación desde el toggle del Navbar
    window.addEventListener("ubicacionCambiada", cargarDatos);
    return () => {
      window.removeEventListener("ubicacionCambiada", cargarDatos);
    };
  }, []);

  // Obtener ubicación del usuario
  const obtenerUbicacion = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Tu navegador no soporta geolocalización");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newUbicacion = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUbicacion(newUbicacion);
        setLoading(false);

        // Guardar ubicación en localStorage (accesible globalmente)
        localStorage.setItem("ubicacionUsuario", JSON.stringify(newUbicacion));
        localStorage.setItem("tipoUbicacion", "real");
        
        // Notificar a otros componentes (Navbar, Home, ProductoDetalle)
        window.dispatchEvent(new Event("ubicacionCambiada"));
        
        // También guardar en usuarioActual si está logueado
        const usuarioActual = JSON.parse(localStorage.getItem("usuarioActual"));
        if (usuarioActual) {
          usuarioActual.lat = newUbicacion.lat;
          usuarioActual.lng = newUbicacion.lng;
          localStorage.setItem("usuarioActual", JSON.stringify(usuarioActual));
        }
      },
      (err) => {
        setError("No se pudo obtener tu ubicación");
        setLoading(false);
        console.error(err);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Ordenar ferreterías por distancia
  const ferreteriasOrdenadas = ubicacion
    ? [...ferreterias]
        .map((f) => ({
          ...f,
          distancia: calcularDistancia(ubicacion.lat, ubicacion.lng, f.lat, f.lng),
        }))
        .sort((a, b) => a.distancia - b.distancia)
    : ferreterias;

  const formatearDistancia = (metros) => {
    if (metros >= 1000) {
      return `${(metros / 1000).toFixed(1)} km`;
    }
    return `${Math.round(metros)} m`;
  };

  const centroMapa = ubicacion || UBICACION_DEFAULT;

  return (
    <>
      {/* Botón flotante del mapa */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: 100,
          right: 24,
          width: 50,
          height: 50,
          borderRadius: "50%",
          background: isOpen ? "#1f2937" : "linear-gradient(135deg, #10b981, #059669)",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(16, 185, 129, 0.4)",
          fontSize: 22,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 999,
          transition: "all 0.3s",
        }}
        title="Ver mapa de ferreterías"
      >
        {isOpen ? "✕" : "🌍"}
      </button>

      {/* Panel lateral del mapa */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: isOpen ? 0 : -420,
          width: 400,
          height: "100vh",
          background: "#fff",
          boxShadow: isOpen ? "-4px 0 30px rgba(0,0,0,0.15)" : "none",
          zIndex: 998,
          transition: "right 0.3s ease",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #1f2937, #374151)",
            color: "#fff",
            padding: 16,
            borderBottom: "3px solid #f97316",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: 18, display: "flex", alignItems: "center", gap: 8 }}>
              🗺️ Ferreterías Cercanas
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "#fff",
                fontSize: 20,
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>

          {/* Botón de ubicación */}
          <button
            onClick={obtenerUbicacion}
            disabled={loading}
            style={{
              marginTop: 12,
              width: "100%",
              padding: "10px 16px",
              borderRadius: 8,
              border: "none",
              background: ubicacion ? "#10b981" : "rgba(255,255,255,0.15)",
              color: "#fff",
              fontWeight: 600,
              cursor: loading ? "wait" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {loading ? "⏳ Obteniendo ubicación..." : ubicacion ? "✅ Ubicación activa" : "📍 Activar mi ubicación"}
          </button>
          {error && <p style={{ color: "#fca5a5", fontSize: 12, margin: "8px 0 0" }}>{error}</p>}
        </div>

        {/* Mapa */}
        <div style={{ height: 250, flexShrink: 0 }}>
          <MapContainer
            center={[centroMapa.lat, centroMapa.lng]}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <CenterMap center={centroMapa} />

            {/* Marcador del usuario */}
            {ubicacion && (
              <Marker position={[ubicacion.lat, ubicacion.lng]} icon={userIcon}>
                <Popup>
                  <strong>📍 Tu ubicación</strong>
                </Popup>
              </Marker>
            )}

            {/* Marcadores de ferreterías */}
            {ferreterias.map((ferre) => (
              <Marker key={ferre.id} position={[ferre.lat, ferre.lng]} icon={storeIcon}>
                <Popup>
                  <strong>🔧 {ferre.nombre}</strong>
                  <br />
                  <small>{ferre.direccion}</small>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Lista de ferreterías */}
        <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
          <h4 style={{ margin: "0 0 12px", color: "#374151", fontSize: 14 }}>
            {ubicacion ? "Ordenadas por cercanía:" : "Ferreterías disponibles:"}
          </h4>

          {ferreteriasOrdenadas.map((ferre, idx) => (
            <Link
              key={ferre.id}
              to={`/tienda/${ferre.id}`}
              onClick={() => setIsOpen(false)}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  background: idx === 0 && ubicacion ? "#fff7ed" : "#f9fafb",
                  border: idx === 0 && ubicacion ? "2px solid #f97316" : "1px solid #e5e7eb",
                  borderRadius: 10,
                  padding: 12,
                  marginBottom: 10,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)")}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {idx === 0 && ubicacion && (
                        <span
                          style={{
                            background: "#f97316",
                            color: "#fff",
                            fontSize: 9,
                            padding: "2px 6px",
                            borderRadius: 4,
                            fontWeight: 700,
                          }}
                        >
                          MÁS CERCANA
                        </span>
                      )}
                      <strong style={{ color: "#1f2937", fontSize: 14 }}>{ferre.nombre}</strong>
                    </div>
                    <p style={{ color: "#6b7280", fontSize: 12, margin: "4px 0 0" }}>{ferre.direccion}</p>
                    {ferre.telefono && (
                      <p style={{ color: "#9ca3af", fontSize: 11, margin: "2px 0 0" }}>📞 {ferre.telefono}</p>
                    )}
                  </div>

                  {ubicacion && ferre.distancia && (
                    <div
                      style={{
                        background: "#10b981",
                        color: "#fff",
                        padding: "4px 8px",
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatearDistancia(ferre.distancia)}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    marginTop: 8,
                    display: "flex",
                    gap: 6,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      background: "#dcfce7",
                      color: "#166534",
                      fontSize: 10,
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    🚚 Retiro hoy
                  </span>
                  <span
                    style={{
                      background: "#fef3c7",
                      color: "#92400e",
                      fontSize: 10,
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    💳 Pago en tienda
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: 12,
            borderTop: "1px solid #e5e7eb",
            background: "#f9fafb",
            textAlign: "center",
          }}
        >
          <small style={{ color: "#9ca3af" }}>
            Haz clic en una ferretería para ver sus productos
          </small>
        </div>
      </div>

      {/* Overlay para cerrar */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 400,
            bottom: 0,
            background: "rgba(0,0,0,0.3)",
            zIndex: 997,
          }}
        />
      )}
    </>
  );
}
