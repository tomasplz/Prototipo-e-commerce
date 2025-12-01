# 🔧 FerrePlaza - E-commerce para Ferreterías Locales

**FerrePlaza** es un marketplace de ferreterías locales en La Serena/Coquimbo, Chile. Permite comparar precios entre diferentes ferreterías, ver disponibilidad en tiempo real, y encontrar la tienda más cercana con el producto que necesitas.

> 🎯 **Diferenciador vs AliExpress/Mercado Libre**: Disponibilidad local inmediata, retiro hoy mismo, y mapa interactivo para encontrar ferreterías cercanas.

---

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

---

## 👥 Usuarios de Prueba

### 🏪 Cuentas de Ferreterías (Vendedores)

| Ferretería | Email | Contraseña | Especialidad |
|------------|-------|------------|--------------|
| Ferretería Don Pepe | `donpepe@ferreteria.cl` | `donpepe123` | Herramientas manuales |
| Construmart Vecino | `construmart@ferreteria.cl` | `construmart123` | Materiales construcción |
| Sodimac Express | `sodimac@ferreteria.cl` | `sodimac123` | Pinturas y fittings |
| Ferretería El Maestro | `maestro@ferreteria.cl` | `maestro123` | Herramientas eléctricas |

### 🛒 Crear Cuenta de Comprador

1. Ir a **Registro** en el Navbar
2. Completar: Nombre, Email, Contraseña
3. Seleccionar rol: **Comprador**
4. Ingresar dirección (se geocodifica automáticamente)
5. Click en **Registrarse**

---

## 📍 Sistema de Ubicación

En el **Navbar** hay un toggle de ubicación:

| Modo | Indicador | Descripción |
|------|-----------|-------------|
| 📍 La Serena | 🟠 Naranja | Ubicación ficticia en el centro de La Serena (-29.9027, -71.2519) |
| 📍 Mi ubicación | 🟢 Verde | Tu ubicación real (requiere permiso del navegador) |

> **Tip**: Para demos, usa "La Serena" para que las distancias tengan sentido con las ferreterías de prueba.

---

## ✨ Funcionalidades Principales

### 🗺️ Mapa Interactivo (Botón 🌍)
- Ver todas las ferreterías en el mapa
- Ordenadas por distancia a tu ubicación
- Badge "MÁS CERCANA" en la más próxima
- Click para ver productos de cada tienda

### 💬 Chatbot Asistente
- Botón flotante en esquina inferior derecha
- Búsqueda por categoría: "Busco un taladro"
- Encuentra el **más barato** o el **más cercano**
- Botones rápidos para categorías populares

### 🏷️ Comparación de Precios
- Mismo producto en múltiples ferreterías
- Badge **"MEJOR PRECIO"** en verde
- Badge **"RETIRO HOY"** si hay stock
- Estrellas de valoración (3.5 - 5.0)

### 📦 Gestión de Inventario (Vendedores)
- Agregar/editar/eliminar productos
- Subir productos masivamente por Excel
- Ver estadísticas de la tienda

---

## 📊 Carga de Productos por Excel

### Plantillas Disponibles

El proyecto incluye 4 plantillas Excel listas para usar:

| Archivo | Contenido | Productos |
|---------|-----------|-----------|
| `plantilla_herramientas.xlsx` | Herramientas eléctricas y manuales | 10 |
| `plantilla_materiales.xlsx` | Materiales de construcción | 8 |
| `plantilla_pinturas.xlsx` | Pinturas y acabados | 7 |
| `plantilla_vacia.xlsx` | Solo encabezados (para llenar) | 0 |

### Estructura del Archivo Excel

El archivo debe tener las siguientes columnas:

| Columna | Requerido | Ejemplo | Descripción |
|---------|-----------|---------|-------------|
| `sku` | ✅ Sí | `MARTILLO-001` | Código único del producto |
| `nombre` | ✅ Sí | `Martillo Carpintero` | Nombre del producto |
| `descripcion` | ❌ No | `Mango de fibra...` | Descripción detallada |
| `marca` | ❌ No | `Stanley` | Marca del producto |
| `precio` | ✅ Sí | `9990` | Precio en CLP (sin puntos ni $) |
| `tipoHerramienta` | ❌ No | `Manual` | Categoría: Manual, Eléctrica, Pintura, etc. |
| `tamaño` | ❌ No | `16 oz` | Tamaño o medida |
| `cantidad` | ✅ Sí | `30` | Stock disponible |
| `imagen` | ❌ No | `https://...` | URL de imagen (usa Unsplash si no tienes) |

### Ejemplo de Excel

```
sku,nombre,descripcion,marca,precio,tipoHerramienta,tamaño,cantidad,imagen
MARTILLO-001,Martillo Carpintero,Mango fibra de vidrio,Stanley,9990,Manual,16 oz,30,https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=400
TALADRO-001,Taladro Inalámbrico,20V con 2 baterías,DeWalt,89990,Eléctrica,20V,15,https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400
PINTURA-001,Pintura Látex Blanco,Lavable interior/exterior,Sipa,15990,Pintura,1 galón,40,https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400
```

### Pasos para Cargar

1. **Iniciar sesión** como vendedor (ferretería)
2. Ir a **Inventario** en el Navbar
3. Click en **📤 Subir Excel**
4. Seleccionar archivo `.xlsx` o `.xls`
5. Los productos se agregan automáticamente

> **Nota**: Si el SKU ya existe, el producto se actualiza. Si es nuevo, se crea.

---

## 🏗️ Estructura del Proyecto

```
📁 src/
├── 📁 components/
│   ├── Navbar.jsx          # Navegación + toggle ubicación
│   ├── CardProducto.jsx    # Tarjeta de producto con badges
│   ├── Chatbot.jsx         # Asistente flotante
│   └── MapaSidebar.jsx     # Panel lateral con mapa
├── 📁 pages/
│   ├── Home.jsx            # Página principal + búsqueda
│   ├── Login.jsx           # Inicio de sesión
│   ├── Registro.jsx        # Registro con geocodificación
│   ├── Inventario.jsx      # Gestión de productos (vendedor)
│   ├── TiendaVendedor.jsx  # Productos de una ferretería
│   ├── ProductoDetalle.jsx # Detalle + mapa + comparación
│   └── CarritoPage.jsx     # Carrito de compras
├── 📁 data/
│   └── ferreterias.js      # Coordenadas de ferreterías
├── App.jsx                 # Rutas + datos semilla
└── main.jsx                # Punto de entrada
```

---

## 💾 Almacenamiento (localStorage)

| Clave | Descripción |
|-------|-------------|
| `usuarios` | Lista de todos los usuarios (compradores y vendedores) |
| `usuarioActual` | Usuario actualmente logueado |
| `productos` | Todos los productos de todas las ferreterías |
| `carrito` | Productos en el carrito del usuario |
| `ubicacionUsuario` | Coordenadas de ubicación actual |
| `tipoUbicacion` | `"ficticia"` o `"real"` |

---

## ⚛️ Stack Tecnológico

| Tecnología | Uso |
|------------|-----|
| React 18 | Framework UI |
| Vite | Bundler + HMR |
| React Router | Navegación SPA |
| Leaflet + react-leaflet | Mapas interactivos |
| xlsx | Lectura de archivos Excel |
| Nominatim API | Geocodificación de direcciones |
| localStorage | Persistencia de datos |

---

## 🔧 Scripts Disponibles

```bash
npm run dev      # Servidor de desarrollo (puerto 5173)
npm run build    # Build de producción
npm run preview  # Vista previa del build
npm run lint     # Verificar código con ESLint
```

---

## 📱 Características por Rol

### 👤 Comprador
- ✅ Ver todos los productos
- ✅ Buscar y filtrar productos
- ✅ Comparar precios entre ferreterías
- ✅ Ver mapa de ferreterías cercanas
- ✅ Usar chatbot para encontrar productos
- ✅ Agregar al carrito
- ✅ Toggle ubicación ficticia/real

### 🏪 Vendedor (Ferretería)
- ✅ Todo lo del comprador
- ✅ Gestionar inventario propio
- ✅ Agregar/editar/eliminar productos
- ✅ Subir productos por Excel
- ✅ Ver su tienda como la ven los clientes

---

## 🎨 Diseño Visual

- **Colores principales**: Naranja ferretero (#f97316) + Gris oscuro (#1f2937)
- **Badges**: Verde (mejor precio), Azul (retiro hoy), Amarillo (cercano)
- **Iconos**: Emojis para accesibilidad universal
- **Responsive**: Adaptado para desktop y móvil

---

## 🚀 Próximos Pasos (Ideas)

- [ ] Backend real con PostgreSQL/MongoDB
- [ ] Autenticación con JWT
- [ ] Pagos con Transbank/MercadoPago
- [ ] Notificaciones push
- [ ] App móvil con React Native
- [ ] Sistema de reseñas
- [ ] Historial de compras

---

## 📝 Licencia

Proyecto educativo/prototipo. Libre para uso y modificación.

---

**Desarrollado con 🧡 para ferreterías locales de Chile**

