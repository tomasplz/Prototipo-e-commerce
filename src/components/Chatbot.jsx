import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { UBICACION_USUARIO, calcularDistancia } from "../data/ferreterias";

// Configuración de IA (OpenRouter)
const USE_AI = import.meta.env.VITE_USE_AI_CHAT === "true";

const SUGERENCIAS_RAPIDAS = [
  { texto: "🔨 Martillos", query: "martillo" },
  { texto: "🔩 Taladros", query: "taladro" },
  { texto: "🪚 Sierras", query: "sierra" },
  { texto: "🔧 Llaves", query: "llave" },
  { texto: "📍 Ferreterías cercanas", query: "ferreterías cerca" },
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "¡Hola! 👋 Soy tu asistente de ferreterías. Puedo ayudarte a buscar herramientas cerca de ti y encontrar el mejor precio.",
      showSuggestions: true,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const ubicacionRef = useRef({ esReal: null, lat: null, lng: null });
  const mensajeUbicacionEnviado = useRef(false);
  const navigate = useNavigate();

  // Obtener ubicación del usuario y su estado (real o de prueba)
  const getUbicacionUsuario = () => {
    const usuarioActual = JSON.parse(localStorage.getItem("usuarioActual"));
    const ubicacionGuardada = JSON.parse(localStorage.getItem("ubicacionUsuario"));
    const tipoUbicacion = localStorage.getItem("tipoUbicacion");
    const esReal = tipoUbicacion === "real";
    
    // Prioridad: ubicacionUsuario > usuarioActual > default
    if (ubicacionGuardada && ubicacionGuardada.lat && ubicacionGuardada.lng) {
      return { 
        lat: ubicacionGuardada.lat, 
        lng: ubicacionGuardada.lng,
        esReal: esReal,
        ciudad: esReal ? "Tu ubicación actual" : "La Serena (ubicación de prueba)"
      };
    }
    
    if (usuarioActual && usuarioActual.lat && usuarioActual.lng) {
      return { 
        lat: usuarioActual.lat, 
        lng: usuarioActual.lng,
        esReal: esReal,
        ciudad: esReal ? "Tu ubicación actual" : "La Serena (ubicación de prueba)"
      };
    }
    
    return { 
      ...UBICACION_USUARIO, 
      esReal: false,
      ciudad: "La Serena (ubicación de prueba)"
    };
  };

  // Escuchar cambios de ubicación
  useEffect(() => {
    const checkUbicacion = () => {
      const ubicacion = getUbicacionUsuario();
      const prevUbicacion = ubicacionRef.current;
      
      // Solo procesar si hay un cambio real Y el chat está abierto
      const cambioTipo = prevUbicacion.esReal !== null && ubicacion.esReal !== prevUbicacion.esReal;
      const cambioCoords = prevUbicacion.lat !== null && 
                          ubicacion.esReal && prevUbicacion.esReal &&
                          (Math.abs(ubicacion.lat - prevUbicacion.lat) > 0.001 || 
                           Math.abs(ubicacion.lng - prevUbicacion.lng) > 0.001);
      
      if (isOpen && !mensajeUbicacionEnviado.current) {
        if (cambioTipo) {
          mensajeUbicacionEnviado.current = true;
          
          if (ubicacion.esReal && !prevUbicacion.esReal) {
            // Cambió de prueba a real
            setMessages(prev => [...prev, {
              from: "bot",
              text: "📍 ¡Perfecto! Ahora tengo tu ubicación real. Las distancias serán exactas. ¿Qué producto buscas?"
            }]);
          } else if (!ubicacion.esReal && prevUbicacion.esReal) {
            // Cambió de real a prueba
            setMessages(prev => [...prev, {
              from: "bot",
              text: "📍 Ubicación desactivada. Usaré un punto de referencia en La Serena (distancias aproximadas)."
            }]);
          }
          
          // Reset después de un tiempo para permitir futuros cambios
          setTimeout(() => { mensajeUbicacionEnviado.current = false; }, 3000);
        } else if (cambioCoords) {
          mensajeUbicacionEnviado.current = true;
          setMessages(prev => [...prev, {
            from: "bot",
            text: "📍 Ubicación actualizada. Las distancias se recalcularon."
          }]);
          setTimeout(() => { mensajeUbicacionEnviado.current = false; }, 3000);
        }
      }
      
      // Actualizar ref
      ubicacionRef.current = {
        esReal: ubicacion.esReal,
        lat: ubicacion.lat,
        lng: ubicacion.lng
      };
    };

    // Verificar al inicio (sin enviar mensaje)
    const ubicacionInicial = getUbicacionUsuario();
    ubicacionRef.current = {
      esReal: ubicacionInicial.esReal,
      lat: ubicacionInicial.lat,
      lng: ubicacionInicial.lng
    };

    // Escuchar el evento personalizado de cambio de ubicación
    const handleUbicacionCambiada = () => {
      setTimeout(checkUbicacion, 200);
    };

    // Escuchar cambios en localStorage (otras pestañas)
    const handleStorageChange = (e) => {
      if (e.key === "ubicacionUsuario" || e.key === "tipoUbicacion") {
        setTimeout(checkUbicacion, 200);
      }
    };
    
    window.addEventListener("ubicacionCambiada", handleUbicacionCambiada);
    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      window.removeEventListener("ubicacionCambiada", handleUbicacionCambiada);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const buscarProductosConComparativa = (query) => {
    const productos = JSON.parse(localStorage.getItem("productos")) || [];
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const queryLower = query.toLowerCase();
    const ubicacion = getUbicacionUsuario();

    // Buscar productos que coincidan
    const productosMatch = productos.filter((p) => {
      const nombre = (p.nombre || "").toLowerCase();
      const descripcion = (p.descripcion || "").toLowerCase();
      const marca = (p.marca || "").toLowerCase();
      const tipo = (p.tipoHerramienta || "").toLowerCase();

      return (
        nombre.includes(queryLower) ||
        descripcion.includes(queryLower) ||
        marca.includes(queryLower) ||
        tipo.includes(queryLower)
      );
    });

    if (productosMatch.length === 0) return null;

    // Agrupar por SKU o nombre para encontrar el mismo producto en diferentes tiendas
    const grupos = {};
    productosMatch.forEach((p) => {
      const key = p.sku || p.nombre.toLowerCase();
      if (!grupos[key]) {
        grupos[key] = {
          nombre: p.nombre,
          imagen: p.imagen,
          ofertas: [],
        };
      }

      // Buscar info de la ferretería
      const ferreInfo = usuarios.find(
        (u) => u.id === p.vendedorId || u.id === p.vendedor?.id
      );

      if (ferreInfo) {
        const distancia = calcularDistancia(
          ubicacion.lat,
          ubicacion.lng,
          ferreInfo.lat,
          ferreInfo.lng
        );

        grupos[key].ofertas.push({
          productoId: p.id,
          precio: p.precio,
          ferreteria: ferreInfo.nombre,
          ferreteriaId: ferreInfo.id,
          distancia,
          stock: p.cantidad,
        });
      }
    });

    // Procesar cada grupo para encontrar el más barato y el más cercano
    const resultados = Object.values(grupos).map((grupo) => {
      const ofertas = grupo.ofertas;

      // Ordenar por precio
      const masBarato = [...ofertas].sort((a, b) => a.precio - b.precio)[0];
      // Ordenar por distancia
      const masCercano = [...ofertas].sort((a, b) => a.distancia - b.distancia)[0];

      return {
        nombre: grupo.nombre,
        masBarato,
        masCercano,
        totalOfertas: ofertas.length,
      };
    });

    return resultados;
  };

  const procesarMensaje = (texto) => {
    const textoLower = texto.toLowerCase().trim();

    // Saludos
    if (textoLower.match(/^(hola|hey|buenas|buenos|qué tal|que tal|hi)/)) {
      return "¡Hola! 👋 ¿En qué puedo ayudarte hoy? Puedes preguntarme por herramientas como martillos, taladros, sierras, etc. Te diré dónde está más barato y más cerca.";
    }

    // Ayuda
    if (textoLower.match(/(ayuda|help|qué puedes|que puedes|cómo funciona|como funciona)/)) {
      return "Puedo ayudarte a:\n• 🔍 Buscar herramientas específicas\n• 💰 Encontrar el precio más barato\n• 📍 Encontrar la ferretería más cercana\n• 📊 Comparar precios en todas las tiendas\n\nEscribe el nombre de lo que buscas, por ejemplo: \"martillo\" o \"taladro\"";
    }

    // Ferreterías
    if (textoLower.match(/(ferretería|ferreteria|tienda|dónde|donde|cerca)/) && !textoLower.match(/(martillo|taladro|sierra|llave|destornillador|lijadora|cinta)/)) {
      return "🏪 Tenemos 4 ferreterías asociadas en La Serena y Coquimbo:\n\n• Ferretería Don Pepe - Av. Francisco de Aguirre\n• Construmart Vecino - Av. Balmaceda\n• Sodimac Express - Ruta 5 Norte, Coquimbo\n• Ferretería El Maestro - Av. Costanera, Coquimbo\n\nBusca un producto para ver disponibilidad y precios en cada una.";
    }

    // Buscar productos con comparativa
    const resultados = buscarProductosConComparativa(textoLower);

    if (resultados && resultados.length > 0) {
      const resultado = resultados[0]; // Tomar el primer resultado
      const { masBarato, masCercano, totalOfertas, nombre } = resultado;

      let respuesta = `🔍 **${nombre}**\nDisponible en ${totalOfertas} ferretería(s):\n\n`;

      respuesta += `💰 **Más barato:**\n${masBarato.ferreteria}\n$${masBarato.precio.toLocaleString("es-CL")}\n\n`;

      if (masCercano.ferreteriaId !== masBarato.ferreteriaId) {
        respuesta += `📍 **Más cercano:**\n${masCercano.ferreteria} (${masCercano.distancia >= 1000 ? (masCercano.distancia / 1000).toFixed(1) + " km" : masCercano.distancia + " m"})\n$${masCercano.precio.toLocaleString("es-CL")}\n\n`;
      } else {
        respuesta += `✨ ¡El más barato también es el más cercano!\n\n`;
      }

      respuesta += `Haz clic para ver la comparativa completa:`;

      return {
        text: respuesta,
        productos: [
          {
            id: masBarato.productoId,
            nombre: `Ver comparativa de ${nombre}`,
            precio: masBarato.precio,
            tag: "Mejor precio",
          },
        ],
      };
    }

    // Respuesta genérica
    return "🤔 No encontré productos con ese nombre. Prueba con términos como:\n• Martillo\n• Taladro\n• Sierra\n• Destornillador\n• Llave\n• Cinta métrica\n\nO escribe \"ayuda\" para más opciones.";
  };

  // Llamar a la API de IA (OpenRouter via Vercel Serverless)
  const llamarIA = async (mensajeUsuario) => {
    const productos = JSON.parse(localStorage.getItem("productos")) || [];
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const ubicacion = getUbicacionUsuario();
    
    // Preparar historial de conversación (últimos 10 mensajes)
    const historial = messages
      .filter(m => !m.showSuggestions)
      .slice(-10)
      .map(m => ({
        role: m.from === "user" ? "user" : "assistant",
        content: m.text
      }));
    
    // Enriquecer productos con distancias y nombre de tienda
    // Enviar todos los productos (no truncar) para que ninguna ferretería se quede fuera
    const productosConDistancia = productos.map(p => {
      const tienda = usuarios.find(u => u.id === p.vendedorId || u.id === p.vendedor?.id);
      let distancia = null;
      if (tienda && tienda.lat && tienda.lng) {
        distancia = calcularDistancia(ubicacion.lat, ubicacion.lng, tienda.lat, tienda.lng);
      }
      return {
        nombre: p.nombre,
        precio: p.precio,
        tienda: tienda?.nombre || p.vendedor?.nombre || 'Tienda',
        direccion: tienda?.direccion || '',
        distancia: distancia ? (distancia >= 1000 ? `${(distancia/1000).toFixed(1)} km` : `${Math.round(distancia)} m`) : 'desconocida',
        distanciaMetros: distancia || 999999,
        stock: p.cantidad
      };
    });

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          mensaje: mensajeUsuario,
          historial: historial,
          productos: productosConDistancia,
          ubicacionUsuario: {
            lat: ubicacion.lat,
            lng: ubicacion.lng,
            esReal: ubicacion.esReal,
            ciudad: ubicacion.ciudad || "La Serena"
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error llamando a IA:", errorData);
        throw new Error(errorData.message || "Error en la respuesta");
      }

      const data = await response.json();
      return data.message;
    } catch (error) {
      console.error("Error llamando a IA:", error);
      // Fallback al procesamiento local
      return null;
    }
  };

  // Función para enviar mensaje (usada por input y botones de sugerencias)
  const enviarMensaje = async (texto) => {
    if (!texto.trim() || isLoading) return;

    const userMsg = { from: "user", text: texto };
    setMessages((prev) => [...prev, userMsg]);

    // Si está habilitada la IA, intentar usarla
    if (USE_AI) {
      setIsLoading(true);
      const respuestaIA = await llamarIA(texto);
      setIsLoading(false);

      if (respuestaIA) {
        setMessages((prev) => [...prev, { from: "bot", text: respuestaIA }]);
        return;
      }
    }

    // Fallback: procesamiento local
    const respuesta = procesarMensaje(texto);
    
    setTimeout(() => {
      if (typeof respuesta === "string") {
        setMessages((prev) => [...prev, { from: "bot", text: respuesta }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { from: "bot", text: respuesta.text, productos: respuesta.productos },
        ]);
      }
    }, 500);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const texto = input;
    setInput("");
    await enviarMensaje(texto);
  };

  const handleSugerenciaClick = async (query) => {
    if (isLoading) return;
    await enviarMensaje(query);
  };

  const handleProductClick = (productoId) => {
    setIsOpen(false);
    navigate(`/producto/${productoId}`);
  };

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #ea580c, #f97316)",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(234, 88, 12, 0.4)",
          fontSize: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          transition: "transform 0.2s",
        }}
        onMouseEnter={(e) => (e.target.style.transform = "scale(1.1)")}
        onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
      >
        {isOpen ? "✕" : "🔧"}
      </button>

      {/* Ventana de chat */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: 100,
            right: 24,
            width: 360,
            height: 480,
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 999,
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #ea580c, #f97316)",
              color: "#fff",
              padding: 16,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                background: "rgba(255,255,255,0.2)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
              }}
            >
              🔧
            </div>
            <div>
              <strong style={{ display: "block" }}>Asistente MiTienda</strong>
              <small style={{ opacity: 0.8 }}>Encuentra el mejor precio cerca</small>
            </div>
          </div>

          {/* Mensajes */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 12,
              background: "#f9fafb",
            }}
          >
            {messages.map((msg, idx) => (
              <div key={idx}>
                <div
                  style={{
                    maxWidth: "85%",
                    padding: "10px 14px",
                    borderRadius: 12,
                    background: msg.from === "user" ? "#ea580c" : "#fff",
                    color: msg.from === "user" ? "#fff" : "#1e1e1e",
                    marginLeft: msg.from === "user" ? "auto" : 0,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    whiteSpace: "pre-line",
                  }}
                >
                  {msg.text}
                </div>
                {/* Botones de sugerencias rápidas */}
                {msg.showSuggestions && !isLoading && (
                  <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {SUGERENCIAS_RAPIDAS.map((sug, i) => (
                      <button
                        key={i}
                        onClick={() => handleSugerenciaClick(sug.query)}
                        disabled={isLoading}
                        style={{
                          background: "#fff7ed",
                          border: "1px solid #fed7aa",
                          borderRadius: 20,
                          padding: "6px 12px",
                          fontSize: 12,
                          cursor: isLoading ? "not-allowed" : "pointer",
                          color: "#c2410c",
                          fontWeight: 500,
                          transition: "all 0.2s",
                          opacity: isLoading ? 0.5 : 1,
                        }}
                        onMouseEnter={(e) => { if (!isLoading) e.target.style.background = "#ffedd5"; }}
                        onMouseLeave={(e) => { e.target.style.background = "#fff7ed"; }}
                      >
                        {sug.texto}
                      </button>
                    ))}
                  </div>
                )}
                {/* Productos encontrados */}
                {msg.productos && (
                  <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                    {msg.productos.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleProductClick(p.id)}
                        style={{
                          background: "#fff",
                          border: "1px solid #fed7aa",
                          borderRadius: 8,
                          padding: "8px 12px",
                          textAlign: "left",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span style={{ color: "#1e1e1e" }}>{p.nombre}</span>
                        <span style={{ color: "#16a34a", fontWeight: "bold" }}>
                          ${Number(p.precio).toLocaleString("es-CL")}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {/* Indicador de carga */}
            {isLoading && (
              <div style={{
                maxWidth: "85%",
                padding: "10px 14px",
                borderRadius: 12,
                background: "#fff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                display: "flex",
                alignItems: "center",
                gap: 8
              }}>
                <span style={{ animation: "pulse 1s infinite" }}>🤔</span>
                <span style={{ color: "#6b7280", fontSize: 14 }}>Pensando...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: 12,
              borderTop: "1px solid #e5e7eb",
              display: "flex",
              gap: 8,
              background: "#fff",
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Escribe tu pregunta..."
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: 24,
                border: "1px solid #e5e7eb",
                outline: "none",
                fontSize: 14,
              }}
            />
            <button
              onClick={handleSend}
              style={{
                background: "linear-gradient(135deg, #ea580c, #f97316)",
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                width: 40,
                height: 40,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
