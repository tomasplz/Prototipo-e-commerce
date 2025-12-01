import { read, utils } from "xlsx";
import { useEffect, useState } from "react";
import "./Inventario.css";

export default function Inventario() {
  const [usuario, setUsuario] = useState(null);
  const [productos, setProductos] = useState([]);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [marca, setMarca] = useState("");
  const [precio, setPrecio] = useState("");
  const [tipoHerramienta, setTipoHerramienta] = useState("");
  const [tamaño, setTamaño] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [imagen, setImagen] = useState("");
  const [preview, setPreview] = useState(null);
  
  // Estado para edición
  const [editandoId, setEditandoId] = useState(null);

  // === Cargar desde Excel ===
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = utils.sheet_to_json(ws);

      if (!usuario) {
        alert("Debes iniciar sesión para cargar productos");
        return;
      }

      const nuevosProductos = data.map((item, index) => ({
        id: Date.now() + index,
        nombre: item.nombre || item.Nombre || "Sin nombre",
        descripcion: item.descripcion || item.Descripcion || "",
        marca: item.marca || item.Marca || "",
        tipoHerramienta: item.tipoHerramienta || item.TipoHerramienta || "Manual",
        tamaño: item.tamaño || item.Tamaño || "Estándar",
        cantidad: Number(item.cantidad || item.Cantidad || 0),
        precio: Number(item.precio || item.Precio || 0),
        total: (Number(item.cantidad || 0) * Number(item.precio || 0)).toFixed(2),
        imagen: item.imagen || item.Imagen || "https://via.placeholder.com/200x200?text=Sin+Imagen",
        vendedor: usuario.nombre || usuario.email,
        vendedorId: usuario.id,
        tipoEmpresa: usuario.tipoEmpresa || null,
        creadoEn: new Date().toISOString(),
      }));

      setProductos((prev) => [...nuevosProductos, ...prev]);
      alert(`Se han cargado ${nuevosProductos.length} productos exitosamente.`);
    };
    reader.readAsBinaryString(file);
  };

  // === Cargar usuario ===
  useEffect(() => {
    const stored = localStorage.getItem("usuarioActual");
    if (stored) setUsuario(JSON.parse(stored));
  }, []);

  // === Cargar productos del usuario ===
  useEffect(() => {
    if (!usuario) return;
    const todos = JSON.parse(localStorage.getItem("productos")) || [];
    const propios = todos.filter((p) => p.vendedorId === usuario.id);
    setProductos(propios);
  }, [usuario]);

  // === Guardar productos al cambiar ===
  useEffect(() => {
    if (!usuario) return;
    const todos = JSON.parse(localStorage.getItem("productos")) || [];
    const otros = todos.filter((p) => p.vendedorId !== usuario.id);
    localStorage.setItem("productos", JSON.stringify([...otros, ...productos]));
    
    // Notificar a otros componentes (chatbot, mapa, etc.) que los productos cambiaron
    window.dispatchEvent(new Event('productosActualizados'));
  }, [productos, usuario]);

  // === Manejar imagen subida ===
  const handleImagen = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagen(reader.result);
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // === Guardar producto (agregar o editar) ===
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!usuario) {
      alert("Debes iniciar sesión para agregar productos");
      return;
    }

    if (
      !tipoHerramienta ||
      !tamaño ||
      !cantidad ||
      !precio ||
      !descripcion ||
      !marca ||
      !nombre
    ) {
      alert("Completa todos los campos");
      return;
    }

    const total = (Number(cantidad) * Number(precio)).toFixed(2);

    if (editandoId) {
      // Modo edición: actualizar producto existente
      const actualizados = productos.map((p) =>
        p.id === editandoId
          ? {
              ...p,
              nombre: nombre.trim(),
              descripcion: descripcion.trim(),
              marca: marca.trim(),
              tipoHerramienta,
              tamaño: tamaño.trim(),
              cantidad: Number(cantidad),
              precio: Number(precio),
              total,
              imagen: imagen || p.imagen,
            }
          : p
      );
      setProductos(actualizados);
      setEditandoId(null);
    } else {
      // Modo agregar: crear nuevo producto
      const nuevoProducto = {
        id: Date.now(),
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        marca: marca.trim(),
        tipoHerramienta,
        tamaño: tamaño.trim(),
        cantidad: Number(cantidad),
        precio: Number(precio),
        total,
        imagen: imagen || "https://via.placeholder.com/200x200?text=Sin+Imagen",
        vendedor: usuario.nombre || usuario.email,
        vendedorId: usuario.id,
        tipoEmpresa: usuario.tipoEmpresa || null,
        creadoEn: new Date().toISOString(),
      };
      setProductos([nuevoProducto, ...productos]);
    }

    // Reset form
    setNombre("");
    setDescripcion("");
    setMarca("");
    setTipoHerramienta("");
    setTamaño("");
    setCantidad("");
    setPrecio("");
    setImagen("");
    setPreview(null);
  };

  // === Editar producto (cargar en formulario) ===
  const handleEditar = (producto) => {
    setEditandoId(producto.id);
    setNombre(producto.nombre);
    setDescripcion(producto.descripcion);
    setMarca(producto.marca);
    setTipoHerramienta(producto.tipoHerramienta);
    setTamaño(producto.tamaño);
    setCantidad(producto.cantidad.toString());
    setPrecio(producto.precio.toString());
    setImagen(producto.imagen);
    setPreview(producto.imagen);
    
    // Scroll al formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEliminar = (id) => {
    const nuevos = productos.filter((p) => p.id !== id);
    setProductos(nuevos);
  };

  if (!usuario) {
    return (
      <main>
        <h2>Debes iniciar sesión para ver tu inventario</h2>
      </main>
    );
  }

  return (
    <div className="inventario-page">
      <main>
        <header>
          <h1>🧰 Inventario - Venta de Herramientas</h1>
          <p>Vendedor: {usuario.nombre}</p>
          {usuario.tipoEmpresa && <p>Tipo de empresa: {usuario.tipoEmpresa}</p>}
        </header>

        {/* === CARGA MASIVA === */}
        <section className="form-section" style={{ marginBottom: "2rem", border: "2px dashed #ccc", padding: "2rem" }}>
          <h2>📂 Carga Masiva (Excel)</h2>
          <p>Sube un archivo Excel (.xlsx, .xls) con las columnas: nombre, descripcion, marca, precio, cantidad, tipoHerramienta, tamaño, imagen.</p>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            style={{ marginTop: "1rem" }}
          />
        </section>

        {/* === FORMULARIO === */}
        <section className="form-section">
          <h2>{editandoId ? '✏️ Editar Herramienta' : 'Agregar Herramienta'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="fila">
              <input
                type="text"
                placeholder="Nombre del producto"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Marca"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                required
              />
            </div>

            <div className="fila">
              <select
                value={tipoHerramienta}
                onChange={(e) => setTipoHerramienta(e.target.value)}
                required
              >
                <option value="">Selecciona tipo de herramienta</option>
                <option value="Manual">Manual</option>
                <option value="Eléctrica">Eléctrica</option>
              </select>
              <input
                type="text"
                placeholder="Tamaño"
                value={tamaño}
                onChange={(e) => setTamaño(e.target.value)}
                required
              />
            </div>

            <div className="fila">
              <input
                type="number"
                placeholder="Cantidad"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                min="0"
                step="1"
                required
              />
              <input
                type="number"
                placeholder="Precio ($)"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                step="0.01"
                min="0"
                required
              />
            </div>

            <textarea
              placeholder="Descripción del producto"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
              required
            />

            {/* === Imagen === */}
            <div className="fila">
              <label
                style={{
                  background: "#4f46e5",
                  color: "#fff",
                  padding: "8px 14px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                📸 Subir Imagen
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImagen}
                  style={{ display: "none" }}
                />
              </label>

              {preview && (
                <img
                  src={preview}
                  alt="Vista previa"
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 8,
                    objectFit: "cover",
                    marginLeft: 10,
                  }}
                />
              )}
            </div>

            <button type="submit">{editandoId ? 'Guardar Cambios' : 'Agregar'}</button>
            {editandoId && (
              <button
                type="button"
                onClick={() => {
                  setEditandoId(null);
                  setNombre('');
                  setDescripcion('');
                  setMarca('');
                  setTipoHerramienta('');
                  setTamaño('');
                  setCantidad('');
                  setPrecio('');
                  setImagen('');
                  setPreview(null);
                }}
                style={{ marginLeft: '10px', background: '#6b7280' }}
              >
                Cancelar
              </button>
            )}
          </form>
        </section>

        {/* === TABLA === */}
        <section className="tabla-section">
          <h2>Inventario Actual</h2>
          {productos.length === 0 ? (
            <p style={{ textAlign: "center", marginTop: 10 }}>
              No tienes herramientas registradas.
            </p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Producto</th>
                  <th>Descripción</th>
                  <th>Marca</th>
                  <th>Tipo</th>
                  <th>Tamaño</th>
                  <th>Cantidad</th>
                  <th>Precio ($)</th>
                  <th>Total</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <img
                        src={p.imagen}
                        alt={p.nombre}
                        style={{
                          width: 60,
                          height: 60,
                          objectFit: "cover",
                          borderRadius: "6px",
                        }}
                      />
                    </td>
                    <td>{p.nombre}</td>
                    <td style={{ maxWidth: 280, whiteSpace: "pre-wrap" }}>
                      {p.descripcion}
                    </td>
                    <td>{p.marca}</td>
                    <td>{p.tipoHerramienta}</td>
                    <td>{p.tamaño}</td>
                    <td>{p.cantidad}</td>
                    <td>${p.precio.toFixed(2)}</td>
                    <td>${p.total}</td>
                    <td>
                      <button
                        onClick={() => handleEditar(p)}
                        style={{
                          background: '#f59e0b',
                          color: '#fff',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          marginRight: '6px',
                        }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(p.id)}
                        className="eliminar"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <footer>
          <p>© 2025 Sistema de Inventario | Venta de Herramientas 🔧</p>
        </footer>
      </main>
    </div>
  );
}
