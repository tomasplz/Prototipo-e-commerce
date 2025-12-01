import { useState, useEffect, createContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home";
import CarritoPage from "./pages/CarritoPage";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import TiendaVendedor from "./pages/TiendaVendedor";
import Inventario from "./pages/Inventario";
import ProductoDetalle from "./pages/ProductoDetalle";
import Chatbot from "./components/Chatbot";
import MapaSidebar from "./components/MapaSidebar";

// 🛒 Contexto del carrito
export const CartContext = createContext({
  addToCart: () => {},
  cartCount: 0,
  setCartCount: () => {},
});

function App() {
  const [usuario, setUsuario] = useState(
    JSON.parse(localStorage.getItem("usuarioActual"))
  );

  // ✅ Cargar productos de ejemplo si no existen o si la versión cambió
  useEffect(() => {
    const PRODUCTOS_VERSION = "v3"; // Cambiar este número para forzar recarga de productos
    const versionActual = localStorage.getItem("productosVersion");
    const existentes = JSON.parse(localStorage.getItem("productos")) || [];
    
    if (existentes.length === 0 || versionActual !== PRODUCTOS_VERSION) {
      // Imágenes reales de productos (Unsplash/Pexels placeholders)
      const IMG = {
        martillo: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=300&h=300&fit=crop",
        taladro: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=300&h=300&fit=crop",
        sierra: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=300&h=300&fit=crop",
        destornillador: "https://images.unsplash.com/photo-1426927308491-6380b6a9936f?w=300&h=300&fit=crop",
        llave: "https://images.unsplash.com/photo-1581147036324-c17ac41f0a65?w=300&h=300&fit=crop",
        lijadora: "https://images.unsplash.com/photo-1580901368919-7738efb0f87e?w=300&h=300&fit=crop",
        cinta: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop",
        pintura: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=300&h=300&fit=crop",
        brocha: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=300&h=300&fit=crop",
        escalera: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=300&h=300&fit=crop",
        nivel: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=300&h=300&fit=crop",
        alicate: "https://images.unsplash.com/photo-1586864387789-628af9feed72?w=300&h=300&fit=crop",
        serrucho: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=300&h=300&fit=crop",
        tornillos: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=300&fit=crop",
        clavos: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=300&fit=crop",
        candado: "https://images.unsplash.com/photo-1558002038-1055907df827?w=300&h=300&fit=crop",
        flexometro: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=300&h=300&fit=crop",
        guantes: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=300&h=300&fit=crop",
        casco: "https://images.unsplash.com/photo-1578874691223-64558a3ca096?w=300&h=300&fit=crop",
        linterna: "https://images.unsplash.com/photo-1567596275753-92607c3ce1ae?w=300&h=300&fit=crop",
      };

      // Productos diferenciados - cada tienda tiene su propio catálogo
      // Algunos productos se comparten para comparar, otros son exclusivos
      const productosEjemplo = [
        // =============================================
        // FERRETERÍA DON PEPE (ferre-1) - Especialista en herramientas manuales
        // =============================================
        { id: 101, sku: "MARTILLO-001", nombre: "Martillo Carpintero", descripcion: "Mango de fibra de vidrio, 16oz.", marca: "Stanley", precio: 9990, tipoHerramienta: "Manual", tamaño: "16 oz", cantidad: 30, imagen: IMG.martillo, vendedor: { nombre: "Ferretería Don Pepe", id: "ferre-1" }, vendedorId: "ferre-1" },
        { id: 102, sku: "ALICATE-001", nombre: "Alicate Universal 8\"", descripcion: "Alicate multiuso acero vanadio.", marca: "Irwin", precio: 8990, tipoHerramienta: "Manual", tamaño: "8 pulgadas", cantidad: 35, imagen: IMG.alicate, vendedor: { nombre: "Ferretería Don Pepe", id: "ferre-1" }, vendedorId: "ferre-1" },
        { id: 103, sku: "LIJADORA-001", nombre: "Lijadora Orbital", descripcion: "Ideal para acabados finos en madera.", marca: "DeWalt", precio: 54990, tipoHerramienta: "Eléctrica", tamaño: "Pequeña", cantidad: 8, imagen: IMG.lijadora, vendedor: { nombre: "Ferretería Don Pepe", id: "ferre-1" }, vendedorId: "ferre-1" },
        { id: 104, sku: "BROCHA-001", nombre: "Brocha Profesional 3\"", descripcion: "Cerdas naturales para acabado fino.", marca: "Atlas", precio: 3990, tipoHerramienta: "Pintura", tamaño: "3 pulgadas", cantidad: 50, imagen: IMG.brocha, vendedor: { nombre: "Ferretería Don Pepe", id: "ferre-1" }, vendedorId: "ferre-1" },
        { id: 105, sku: "LINTERNA-001", nombre: "Linterna LED Recargable", descripcion: "1000 lúmenes con zoom.", marca: "Energizer", precio: 14990, tipoHerramienta: "Iluminación", tamaño: "Mediana", cantidad: 35, imagen: IMG.linterna, vendedor: { nombre: "Ferretería Don Pepe", id: "ferre-1" }, vendedorId: "ferre-1" },
        // Exclusivos Don Pepe
        { id: 106, sku: "SERRUCHO-001", nombre: "Serrucho Profesional 22\"", descripcion: "Hoja de acero templado.", marca: "Tramontina", precio: 18990, tipoHerramienta: "Manual", tamaño: "22 pulgadas", cantidad: 15, imagen: IMG.serrucho, vendedor: { nombre: "Ferretería Don Pepe", id: "ferre-1" }, vendedorId: "ferre-1" },
        { id: 107, sku: "FLEXOMETRO-001", nombre: "Flexómetro 8m Profesional", descripcion: "Cinta métrica autoblocante.", marca: "Stanley", precio: 12990, tipoHerramienta: "Medición", tamaño: "8 metros", cantidad: 40, imagen: IMG.flexometro, vendedor: { nombre: "Ferretería Don Pepe", id: "ferre-1" }, vendedorId: "ferre-1" },
        { id: 108, sku: "MARTILLO-002", nombre: "Martillo de Bola 24oz", descripcion: "Para trabajos de metal y forja.", marca: "Truper", precio: 14990, tipoHerramienta: "Manual", tamaño: "24 oz", cantidad: 12, imagen: IMG.martillo, vendedor: { nombre: "Ferretería Don Pepe", id: "ferre-1" }, vendedorId: "ferre-1" },
        // Compartido para comparar
        { id: 109, sku: "TALADRO-001", nombre: "Taladro Percutor 600W", descripcion: "Taladro potente para concreto y madera.", marca: "Bosch", precio: 89990, tipoHerramienta: "Eléctrica", tamaño: "Estándar", cantidad: 10, imagen: IMG.taladro, vendedor: { nombre: "Ferretería Don Pepe", id: "ferre-1" }, vendedorId: "ferre-1" },

        // =============================================
        // CONSTRUMART VECINO (ferre-2) - Especialista en construcción y escaleras
        // =============================================
        { id: 201, sku: "TALADRO-001", nombre: "Taladro Percutor 600W", descripcion: "Taladro potente para concreto y madera.", marca: "Bosch", precio: 74990, tipoHerramienta: "Eléctrica", tamaño: "Estándar", cantidad: 8, imagen: IMG.taladro, vendedor: { nombre: "Construmart Vecino", id: "ferre-2" }, vendedorId: "ferre-2" },
        { id: 202, sku: "ESCALERA-001", nombre: "Escalera Aluminio 6 Peldaños", descripcion: "Escalera plegable resistente.", marca: "Wurth", precio: 69990, tipoHerramienta: "Acceso", tamaño: "6 peldaños", cantidad: 12, imagen: IMG.escalera, vendedor: { nombre: "Construmart Vecino", id: "ferre-2" }, vendedorId: "ferre-2" },
        { id: 203, sku: "LLAVE-001", nombre: "Llave Inglesa 10\"", descripcion: "Acero cromado de alta resistencia.", marca: "Truper", precio: 11490, tipoHerramienta: "Manual", tamaño: "10 pulgadas", cantidad: 15, imagen: IMG.llave, vendedor: { nombre: "Construmart Vecino", id: "ferre-2" }, vendedorId: "ferre-2" },
        { id: 204, sku: "CANDADO-001", nombre: "Candado Seguridad 50mm", descripcion: "Candado latón anti-ganzúa.", marca: "Yale", precio: 11990, tipoHerramienta: "Seguridad", tamaño: "50mm", cantidad: 25, imagen: IMG.candado, vendedor: { nombre: "Construmart Vecino", id: "ferre-2" }, vendedorId: "ferre-2" },
        // Exclusivos Construmart
        { id: 205, sku: "ESCALERA-002", nombre: "Escalera Telescópica 4m", descripcion: "Escalera extensible compacta.", marca: "Wurth", precio: 129990, tipoHerramienta: "Acceso", tamaño: "4 metros", cantidad: 6, imagen: IMG.escalera, vendedor: { nombre: "Construmart Vecino", id: "ferre-2" }, vendedorId: "ferre-2" },
        { id: 206, sku: "MEZCLADORA-001", nombre: "Mezcladora de Concreto", descripcion: "Mezcladora eléctrica 140L.", marca: "Bauker", precio: 289990, tipoHerramienta: "Eléctrica", tamaño: "140 litros", cantidad: 3, imagen: IMG.taladro, vendedor: { nombre: "Construmart Vecino", id: "ferre-2" }, vendedorId: "ferre-2" },
        { id: 207, sku: "CARRETILLA-001", nombre: "Carretilla de Construcción", descripcion: "Carretilla 90L reforzada.", marca: "Imsa", precio: 45990, tipoHerramienta: "Transporte", tamaño: "90 litros", cantidad: 8, imagen: IMG.nivel, vendedor: { nombre: "Construmart Vecino", id: "ferre-2" }, vendedorId: "ferre-2" },
        { id: 208, sku: "PALA-001", nombre: "Pala Punta Redonda", descripcion: "Pala de acero con mango madera.", marca: "Bellota", precio: 15990, tipoHerramienta: "Manual", tamaño: "Estándar", cantidad: 20, imagen: IMG.nivel, vendedor: { nombre: "Construmart Vecino", id: "ferre-2" }, vendedorId: "ferre-2" },
        { id: 209, sku: "CEMENTO-001", nombre: "Cemento Polpaico 25kg", descripcion: "Cemento portland gris.", marca: "Polpaico", precio: 6990, tipoHerramienta: "Material", tamaño: "25 kg", cantidad: 100, imagen: IMG.tornillos, vendedor: { nombre: "Construmart Vecino", id: "ferre-2" }, vendedorId: "ferre-2" },

        // =============================================
        // SODIMAC EXPRESS (ferre-3) - Especialista en pintura y fijaciones
        // =============================================
        { id: 301, sku: "PINTURA-001", nombre: "Pintura Látex Blanco 4L", descripcion: "Pintura lavable interior/exterior.", marca: "Sipa", precio: 18990, tipoHerramienta: "Pintura", tamaño: "4 litros", cantidad: 40, imagen: IMG.pintura, vendedor: { nombre: "Sodimac Express", id: "ferre-3" }, vendedorId: "ferre-3" },
        { id: 302, sku: "DESTOR-001", nombre: "Juego Destornilladores 10pcs", descripcion: "Set de 10 piezas punta magnética.", marca: "Stanley", precio: 14990, tipoHerramienta: "Manual", tamaño: "Varios", cantidad: 50, imagen: IMG.destornillador, vendedor: { nombre: "Sodimac Express", id: "ferre-3" }, vendedorId: "ferre-3" },
        { id: 303, sku: "TORNILLOS-001", nombre: "Caja Tornillos Madera 200pcs", descripcion: "Tornillos cabeza Phillips varios tamaños.", marca: "Fix", precio: 6990, tipoHerramienta: "Fijación", tamaño: "Surtido", cantidad: 100, imagen: IMG.tornillos, vendedor: { nombre: "Sodimac Express", id: "ferre-3" }, vendedorId: "ferre-3" },
        { id: 304, sku: "CASCO-001", nombre: "Casco de Seguridad", descripcion: "Casco certificado con suspensión.", marca: "MSA", precio: 12990, tipoHerramienta: "Seguridad", tamaño: "Universal", cantidad: 30, imagen: IMG.casco, vendedor: { nombre: "Sodimac Express", id: "ferre-3" }, vendedorId: "ferre-3" },
        { id: 305, sku: "MARTILLO-001", nombre: "Martillo Carpintero", descripcion: "Mango de fibra de vidrio, 16oz.", marca: "Stanley", precio: 12990, tipoHerramienta: "Manual", tamaño: "16 oz", cantidad: 25, imagen: IMG.martillo, vendedor: { nombre: "Sodimac Express", id: "ferre-3" }, vendedorId: "ferre-3" },
        // Exclusivos Sodimac
        { id: 306, sku: "PINTURA-002", nombre: "Pintura Esmalte Sintético 1L", descripcion: "Esmalte brillante multiuso.", marca: "Tricolor", precio: 12990, tipoHerramienta: "Pintura", tamaño: "1 litro", cantidad: 60, imagen: IMG.pintura, vendedor: { nombre: "Sodimac Express", id: "ferre-3" }, vendedorId: "ferre-3" },
        { id: 307, sku: "RODILLO-001", nombre: "Rodillo Antigota 23cm", descripcion: "Rodillo profesional para látex.", marca: "Castor", precio: 8990, tipoHerramienta: "Pintura", tamaño: "23 cm", cantidad: 45, imagen: IMG.brocha, vendedor: { nombre: "Sodimac Express", id: "ferre-3" }, vendedorId: "ferre-3" },
        { id: 308, sku: "CLAVOS-001", nombre: "Clavos Madera 2\" 1kg", descripcion: "Clavos punta diamante.", marca: "Fix", precio: 3990, tipoHerramienta: "Fijación", tamaño: "2 pulgadas", cantidad: 80, imagen: IMG.clavos, vendedor: { nombre: "Sodimac Express", id: "ferre-3" }, vendedorId: "ferre-3" },
        { id: 309, sku: "TARUGO-001", nombre: "Tarugos Plásticos 8mm 100pcs", descripcion: "Tarugos para muro.", marca: "Fischer", precio: 4990, tipoHerramienta: "Fijación", tamaño: "8mm", cantidad: 120, imagen: IMG.tornillos, vendedor: { nombre: "Sodimac Express", id: "ferre-3" }, vendedorId: "ferre-3" },
        { id: 310, sku: "LIJA-001", nombre: "Pack Lijas Surtidas x10", descripcion: "Lijas granos 80 a 220.", marca: "Norton", precio: 5990, tipoHerramienta: "Abrasivo", tamaño: "Surtido", cantidad: 70, imagen: IMG.lijadora, vendedor: { nombre: "Sodimac Express", id: "ferre-3" }, vendedorId: "ferre-3" },

        // =============================================
        // FERRETERÍA EL MAESTRO (ferre-4) - Especialista en herramientas eléctricas
        // =============================================
        { id: 401, sku: "SIERRA-001", nombre: "Sierra Circular 7\"", descripcion: "Cortes precisos en madera y melamina.", marca: "Makita", precio: 109990, tipoHerramienta: "Eléctrica", tamaño: "7 pulgadas", cantidad: 4, imagen: IMG.sierra, vendedor: { nombre: "Ferretería El Maestro", id: "ferre-4" }, vendedorId: "ferre-4" },
        { id: 402, sku: "CINTA-001", nombre: "Cinta Métrica 5m", descripcion: "Cinta con freno y gancho magnético.", marca: "Stanley", precio: 4990, tipoHerramienta: "Manual", tamaño: "5 metros", cantidad: 60, imagen: IMG.cinta, vendedor: { nombre: "Ferretería El Maestro", id: "ferre-4" }, vendedorId: "ferre-4" },
        { id: 403, sku: "NIVEL-001", nombre: "Nivel de Burbuja 60cm", descripcion: "Nivel magnético profesional.", marca: "Stanley", precio: 14990, tipoHerramienta: "Medición", tamaño: "60 cm", cantidad: 30, imagen: IMG.nivel, vendedor: { nombre: "Ferretería El Maestro", id: "ferre-4" }, vendedorId: "ferre-4" },
        { id: 404, sku: "GUANTES-001", nombre: "Guantes de Trabajo Cuero", descripcion: "Guantes reforzados multiuso.", marca: "3M", precio: 6990, tipoHerramienta: "Seguridad", tamaño: "L", cantidad: 70, imagen: IMG.guantes, vendedor: { nombre: "Ferretería El Maestro", id: "ferre-4" }, vendedorId: "ferre-4" },
        { id: 405, sku: "TALADRO-001", nombre: "Taladro Percutor 600W", descripcion: "Taladro potente para concreto y madera.", marca: "Bosch", precio: 91990, tipoHerramienta: "Eléctrica", tamaño: "Estándar", cantidad: 5, imagen: IMG.taladro, vendedor: { nombre: "Ferretería El Maestro", id: "ferre-4" }, vendedorId: "ferre-4" },
        // Exclusivos El Maestro
        { id: 406, sku: "ESMERIL-001", nombre: "Esmeril Angular 4.5\"", descripcion: "Esmeril potente 850W.", marca: "Bosch", precio: 49990, tipoHerramienta: "Eléctrica", tamaño: "4.5 pulgadas", cantidad: 10, imagen: IMG.sierra, vendedor: { nombre: "Ferretería El Maestro", id: "ferre-4" }, vendedorId: "ferre-4" },
        { id: 407, sku: "ROTOMARTILLO-001", nombre: "Rotomartillo SDS Plus", descripcion: "Para concreto y mampostería.", marca: "Makita", precio: 189990, tipoHerramienta: "Eléctrica", tamaño: "26mm", cantidad: 4, imagen: IMG.taladro, vendedor: { nombre: "Ferretería El Maestro", id: "ferre-4" }, vendedorId: "ferre-4" },
        { id: 408, sku: "CALADORA-001", nombre: "Sierra Caladora 500W", descripcion: "Cortes curvos en madera y metal.", marca: "Black+Decker", precio: 44990, tipoHerramienta: "Eléctrica", tamaño: "Estándar", cantidad: 8, imagen: IMG.sierra, vendedor: { nombre: "Ferretería El Maestro", id: "ferre-4" }, vendedorId: "ferre-4" },
        { id: 409, sku: "PISTOLA-001", nombre: "Pistola de Calor 2000W", descripcion: "Para remover pintura y soldadura.", marca: "Steinel", precio: 39990, tipoHerramienta: "Eléctrica", tamaño: "Estándar", cantidad: 6, imagen: IMG.linterna, vendedor: { nombre: "Ferretería El Maestro", id: "ferre-4" }, vendedorId: "ferre-4" },
        { id: 410, sku: "MULTIMETRO-001", nombre: "Multímetro Digital", descripcion: "Medidor eléctrico profesional.", marca: "Fluke", precio: 34990, tipoHerramienta: "Medición", tamaño: "Compacto", cantidad: 15, imagen: IMG.nivel, vendedor: { nombre: "Ferretería El Maestro", id: "ferre-4" }, vendedorId: "ferre-4" },
      ];
      localStorage.setItem("productos", JSON.stringify(productosEjemplo));
      localStorage.setItem("productosVersion", PRODUCTOS_VERSION);
    }
  }, []);

  // ✅ Crear cuentas de ferreterías ficticias si no existen
  useEffect(() => {
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const ferreterias = [
      {
        id: "ferre-1",
        nombre: "Ferretería Don Pepe",
        email: "donpepe@ferreteria.cl",
        password: "donpepe123",
        rol: "vendedor",
        tipoEmpresa: "Ferretería",
        direccion: "Av. Francisco de Aguirre 320, La Serena",
        lat: -29.9027,
        lng: -71.2519,
        telefono: "+56 9 1234 5678",
      },
      {
        id: "ferre-2",
        nombre: "Construmart Vecino",
        email: "construmart@ferreteria.cl",
        password: "construmart123",
        rol: "vendedor",
        tipoEmpresa: "Ferretería",
        direccion: "Av. Balmaceda 2650, La Serena",
        lat: -29.9078,
        lng: -71.2567,
        telefono: "+56 9 2345 6789",
      },
      {
        id: "ferre-3",
        nombre: "Sodimac Express",
        email: "sodimac@ferreteria.cl",
        password: "sodimac123",
        rol: "vendedor",
        tipoEmpresa: "Ferretería",
        direccion: "Ruta 5 Norte 1945, Coquimbo",
        lat: -29.9412,
        lng: -71.2836,
        telefono: "+56 9 3456 7890",
      },
      {
        id: "ferre-4",
        nombre: "Ferretería El Maestro",
        email: "maestro@ferreteria.cl",
        password: "maestro123",
        rol: "vendedor",
        tipoEmpresa: "Ferretería",
        direccion: "Av. Costanera 1520, Coquimbo",
        lat: -29.9534,
        lng: -71.3398,
        telefono: "+56 9 4567 8901",
      },
    ];

    let updated = false;
    ferreterias.forEach((ferre) => {
      const existe = usuarios.some((u) => u.id === ferre.id || u.email === ferre.email);
      if (!existe) {
        usuarios.push(ferre);
        updated = true;
      }
    });

    if (updated) {
      localStorage.setItem("usuarios", JSON.stringify(usuarios));
    }
  }, []);

  // 🧮 Contador del carrito (número total de unidades)
  const [cartCount, setCartCount] = useState(() => {
    const stored = JSON.parse(localStorage.getItem("carrito")) || [];
    return stored.length;
  });

  // ✅ Función para agregar productos al carrito (ahora con todos los detalles)
  const addToCart = (producto) => {
    try {
      const lista = JSON.parse(localStorage.getItem("carrito")) || [];

      const item = {
        id: producto.id ?? Date.now(),
        nombre: producto.nombre || "Sin nombre",
        descripcion: producto.descripcion || "",
        marca: producto.marca || "",
        tipoHerramienta: producto.tipoHerramienta || "",
        tamaño: producto.tamaño || "",
        cantidad: 1, // unidad agregada
        precio: Number(producto.precio) || 0,
        imagen:
          producto.imagen && producto.imagen.trim() !== ""
            ? producto.imagen
            : "https://via.placeholder.com/150?text=Sin+Imagen",
        vendedor: producto.vendedor || null,
        tipoEmpresa: producto.tipoEmpresa || null,

        // Extras dinámicos si existen
        extra1:
          producto.extra1 && producto.extra1.label
            ? producto.extra1
            : producto.extra1
            ? { label: "Extra 1", value: producto.extra1 }
            : null,

        extra2:
          producto.extra2 && producto.extra2.label
            ? producto.extra2
            : producto.extra2
            ? { label: "Extra 2", value: producto.extra2 }
            : null,
      };

      lista.push(item);
      localStorage.setItem("carrito", JSON.stringify(lista));
      setCartCount(lista.length);
      window.dispatchEvent(new Event("carritoActualizado"));
    } catch (e) {
      console.error("❌ Error al agregar al carrito:", e);
    }
  };

  // 🔁 Escuchar cambios de localStorage (otras pestañas)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "carrito") {
        try {
          const stored = JSON.parse(e.newValue) || [];
          setCartCount(stored.length);
        } catch {
          setCartCount(0);
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <CartContext.Provider value={{ addToCart, cartCount, setCartCount }}>
      <Router>
        <Navbar usuario={usuario} setUsuario={setUsuario} cartCount={cartCount} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/carrito" element={<CarritoPage />} />
          <Route path="/login" element={<Login setUsuario={setUsuario} />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/tienda/:sellerKey" element={<TiendaVendedor />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/producto/:id" element={<ProductoDetalle />} />
        </Routes>
        <Chatbot />
        <MapaSidebar />
      </Router>
    </CartContext.Provider>
  );
}

export default App;
