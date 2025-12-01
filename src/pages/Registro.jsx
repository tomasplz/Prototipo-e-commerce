import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Registro() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("comprador");
  const [direccion, setDireccion] = useState("");
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [buscandoDireccion, setBuscandoDireccion] = useState(false);
  const navigate = useNavigate();

  // Buscar coordenadas usando Nominatim (OpenStreetMap) - GRATIS
  const buscarCoordenadas = async () => {
    if (!direccion.trim()) {
      alert("Ingresa una dirección primero");
      return;
    }

    setBuscandoDireccion(true);
    try {
      const query = encodeURIComponent(direccion + ", Chile");
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`,
        {
          headers: {
            "User-Agent": "MiTiendaApp/1.0",
          },
        }
      );
      const data = await response.json();

      if (data && data.length > 0) {
        setLat(parseFloat(data[0].lat));
        setLng(parseFloat(data[0].lon));
        alert(`✅ Ubicación encontrada: ${data[0].display_name}`);
      } else {
        alert("No se encontró la dirección. Intenta ser más específico (ej: Av. Libertador 1234, Santiago)");
      }
    } catch (error) {
      console.error("Error al buscar dirección:", error);
      alert("Error al buscar la dirección. Intenta de nuevo.");
    }
    setBuscandoDireccion(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    if (!email || !password) {
      alert("Completa email y contraseña");
      return;
    }

    if (usuarios.some((u) => u.email === email)) {
      alert("Email ya registrado");
      return;
    }

    const usuario = {
      id: Date.now(),
      nombre: nombre || (email.split?.("@")?.[0] ?? "Usuario"),
      email,
      password,
      rol,
      tipoEmpresa: rol === "vendedor" ? "Venta de Herramientas" : null,
      direccion: direccion || null,
      lat: lat,
      lng: lng,
    };

    usuarios.push(usuario);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    localStorage.setItem("usuarioActual", JSON.stringify(usuario));

    // Notificar a otros componentes que se agregó un nuevo usuario/tienda
    window.dispatchEvent(new Event('usuariosActualizados'));

    alert("Registro exitoso. Ahora puedes iniciar sesión.");
    navigate("/login");
  };

  return (
    <main style={{ maxWidth: 700, margin: "2rem auto", padding: "0 1rem", color: "#1e1e1e" }}>
      <h2>Registro</h2>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        {/* Nombre */}
        <label style={{ display: "flex", flexDirection: "column", gap: 6, color: "#1e1e1e" }}>
          Nombre
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Tu nombre"
            style={{
              padding: 8,
              borderRadius: 6,
              border: "1px solid #ccc",
            }}
          />
        </label>

        {/* Email */}
        <label style={{ display: "flex", flexDirection: "column", gap: 6 , color: "#1e1e1e"}}>
          Email
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tucorreo@ejemplo.com"
            style={{
              padding: 8,
              borderRadius: 6,
              border: "1px solid #ccc",
            }}
          />
        </label>

        {/* Contraseña */}
        <label style={{ display: "flex", flexDirection: "column", gap: 6, color: "#1e1e1e" }}>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{
              padding: 8,
              borderRadius: 6,
              border: "1px solid #ccc",
            }}
          />
        </label>

        {/* Rol */}
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          Soy
          <select
            value={rol}
            onChange={(e) => setRol(e.target.value)}
            style={{ padding: 8, borderRadius: 6 , color: "#1e1e1e"}}
          >
            <option value="comprador">Comprador</option>
            <option value="vendedor">Vendedor</option>
          </select>
        </label>

        {/* Tipo de empresa fijo para vendedor */}
        {rol === "vendedor" && (
          <label style={{ display: "flex", flexDirection: "column", gap: 6, color: "#1e1e1e" }}>
            Tipo de empresa
            <input
              value="Venta de Herramientas"
              readOnly
              style={{
                padding: 8,
                borderRadius: 6,
                border: "1px solid #ccc",
                background: "#f3f3f3",
                color: "#555",
              }}
            />
          </label>
        )}

        {/* Dirección con geocodificación */}
        <label style={{ display: "flex", flexDirection: "column", gap: 6, color: "#1e1e1e" }}>
          Dirección (opcional)
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Ej: Av. Libertador 1234, Santiago"
              style={{
                padding: 8,
                borderRadius: 6,
                border: "1px solid #ccc",
                flex: 1,
              }}
            />
            <button
              type="button"
              onClick={buscarCoordenadas}
              disabled={buscandoDireccion}
              style={{
                padding: "8px 12px",
                background: buscandoDireccion ? "#9ca3af" : "#10b981",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                cursor: buscandoDireccion ? "not-allowed" : "pointer",
                fontWeight: 600,
              }}
            >
              {buscandoDireccion ? "Buscando..." : "📍 Ubicar"}
            </button>
          </div>
          {lat && lng && (
            <small style={{ color: "#10b981", marginTop: 4 }}>
              ✅ Coordenadas: {lat.toFixed(4)}, {lng.toFixed(4)}
            </small>
          )}
        </label>

        {/* Botones */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="submit"
            style={{
              padding: "10px 14px",
              background: "#4f46e5",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Registrarse
          </button>

          <button
            type="button"
            onClick={() => navigate("/login")}
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid #ddd",
              color: "#fff",
              background: "#4f46e5",
              cursor: "pointer",
            }}
          >
            Ir a Login
          </button>
        </div>
      </form>
    </main>
  );
}
