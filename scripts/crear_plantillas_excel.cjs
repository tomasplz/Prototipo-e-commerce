// Script para crear plantillas Excel de productos
const XLSX = require('xlsx');
const path = require('path');

// Datos de ejemplo para la plantilla principal
const productosEjemplo = [
  {
    sku: "TALADRO-002",
    nombre: "Taladro Percutor 750W",
    descripcion: "Taladro percutor profesional con velocidad variable y reversa",
    marca: "Bosch",
    precio: 59990,
    tipoHerramienta: "Eléctrica",
    tamaño: "13mm",
    cantidad: 12,
    imagen: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400"
  },
  {
    sku: "AMOLADORA-001",
    nombre: "Amoladora Angular 4 1/2\"",
    descripcion: "Amoladora 850W con disco incluido y protector",
    marca: "DeWalt",
    precio: 45990,
    tipoHerramienta: "Eléctrica",
    tamaño: "4.5 pulgadas",
    cantidad: 18,
    imagen: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400"
  },
  {
    sku: "COMPRESOR-001",
    nombre: "Compresor de Aire 50L",
    descripcion: "Compresor 2HP libre de aceite con tanque de 50 litros",
    marca: "Evans",
    precio: 189990,
    tipoHerramienta: "Neumática",
    tamaño: "50 litros",
    cantidad: 5,
    imagen: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"
  },
  {
    sku: "ROTOMARTILLO-001",
    nombre: "Rotomartillo SDS Plus",
    descripcion: "Rotomartillo 800W con maletín y juego de brocas",
    marca: "Makita",
    precio: 129990,
    tipoHerramienta: "Eléctrica",
    tamaño: "26mm",
    cantidad: 8,
    imagen: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400"
  },
  {
    sku: "SOLDADORA-001",
    nombre: "Soldadora Inverter 200A",
    descripcion: "Soldadora inverter portátil con electrodos incluidos",
    marca: "Lincoln",
    precio: 159990,
    tipoHerramienta: "Soldadura",
    tamaño: "200 Amp",
    cantidad: 6,
    imagen: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400"
  },
  {
    sku: "ESMERIL-001",
    nombre: "Esmeril de Banco 6\"",
    descripcion: "Esmeril de banco con dos piedras y protector ocular",
    marca: "Truper",
    precio: 39990,
    tipoHerramienta: "Eléctrica",
    tamaño: "6 pulgadas",
    cantidad: 10,
    imagen: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400"
  },
  {
    sku: "PISTOLA-CALOR-001",
    nombre: "Pistola de Calor 2000W",
    descripcion: "Pistola de calor con control de temperatura variable",
    marca: "Black+Decker",
    precio: 29990,
    tipoHerramienta: "Eléctrica",
    tamaño: "2000W",
    cantidad: 15,
    imagen: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"
  },
  {
    sku: "SERRUCHO-001",
    nombre: "Serrucho Carpintero 22\"",
    descripcion: "Serrucho profesional con mango ergonómico antideslizante",
    marca: "Stanley",
    precio: 12990,
    tipoHerramienta: "Manual",
    tamaño: "22 pulgadas",
    cantidad: 25,
    imagen: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=400"
  },
  {
    sku: "FORMONES-001",
    nombre: "Set Formones 4 piezas",
    descripcion: "Juego de formones acero al carbono con estuche",
    marca: "Irwin",
    precio: 24990,
    tipoHerramienta: "Manual",
    tamaño: "6-12-18-25mm",
    cantidad: 20,
    imagen: "https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?w=400"
  },
  {
    sku: "CARRETILLA-001",
    nombre: "Carretilla de Construcción",
    descripcion: "Carretilla 90L rueda neumática reforzada",
    marca: "Tramontina",
    precio: 54990,
    tipoHerramienta: "Construcción",
    tamaño: "90 litros",
    cantidad: 8,
    imagen: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400"
  }
];

// Datos para materiales de construcción
const materialesConstruccion = [
  {
    sku: "CEMENTO-001",
    nombre: "Cemento Polpaico 25kg",
    descripcion: "Saco de cemento gris uso general",
    marca: "Polpaico",
    precio: 5990,
    tipoHerramienta: "Construcción",
    tamaño: "25 kg",
    cantidad: 100,
    imagen: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400"
  },
  {
    sku: "ARENA-001",
    nombre: "Arena Gruesa m³",
    descripcion: "Arena gruesa para mezclas de construcción",
    marca: "Áridos Chile",
    precio: 35990,
    tipoHerramienta: "Construcción",
    tamaño: "1 m³",
    cantidad: 50,
    imagen: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"
  },
  {
    sku: "GRAVILLA-001",
    nombre: "Gravilla 3/4\" m³",
    descripcion: "Gravilla chancada para hormigón",
    marca: "Áridos Chile",
    precio: 32990,
    tipoHerramienta: "Construcción",
    tamaño: "1 m³",
    cantidad: 45,
    imagen: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"
  },
  {
    sku: "FIERRO-001",
    nombre: "Fierro Estriado 8mm",
    descripcion: "Barra de fierro estriado 6 metros",
    marca: "CAP",
    precio: 4990,
    tipoHerramienta: "Construcción",
    tamaño: "8mm x 6m",
    cantidad: 200,
    imagen: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400"
  },
  {
    sku: "LADRILLO-001",
    nombre: "Ladrillo Fiscal (100 un)",
    descripcion: "Pack de 100 ladrillos fiscales",
    marca: "Princesa",
    precio: 45990,
    tipoHerramienta: "Construcción",
    tamaño: "24x11x7 cm",
    cantidad: 30,
    imagen: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400"
  },
  {
    sku: "YESO-001",
    nombre: "Yeso Carton 1.2x2.4m",
    descripcion: "Plancha de yeso cartón estándar",
    marca: "Volcanita",
    precio: 8990,
    tipoHerramienta: "Construcción",
    tamaño: "1.2 x 2.4m",
    cantidad: 80,
    imagen: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400"
  },
  {
    sku: "OSB-001",
    nombre: "OSB 9.5mm 1.22x2.44m",
    descripcion: "Tablero OSB estructural",
    marca: "Louisiana Pacific",
    precio: 14990,
    tipoHerramienta: "Construcción",
    tamaño: "1.22 x 2.44m",
    cantidad: 60,
    imagen: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"
  },
  {
    sku: "PERFIL-001",
    nombre: "Perfil C 60x38mm 3m",
    descripcion: "Perfil metálico galvanizado tipo C",
    marca: "Cintac",
    precio: 3990,
    tipoHerramienta: "Construcción",
    tamaño: "60x38mm x 3m",
    cantidad: 150,
    imagen: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400"
  }
];

// Datos para pinturas y acabados
const pinturasAcabados = [
  {
    sku: "LATEX-001",
    nombre: "Pintura Látex Blanco 4L",
    descripcion: "Pintura látex mate interior/exterior lavable",
    marca: "Sipa",
    precio: 18990,
    tipoHerramienta: "Pintura",
    tamaño: "4 litros",
    cantidad: 40,
    imagen: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400"
  },
  {
    sku: "ESMALTE-001",
    nombre: "Esmalte Sintético Negro 1L",
    descripcion: "Esmalte sintético brillante secado rápido",
    marca: "Tricolor",
    precio: 12990,
    tipoHerramienta: "Pintura",
    tamaño: "1 litro",
    cantidad: 35,
    imagen: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400"
  },
  {
    sku: "BARNIZ-001",
    nombre: "Barniz Marino 1L",
    descripcion: "Barniz poliuretano para exterior resistente UV",
    marca: "Ceresita",
    precio: 15990,
    tipoHerramienta: "Pintura",
    tamaño: "1 litro",
    cantidad: 25,
    imagen: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400"
  },
  {
    sku: "RODILLO-001",
    nombre: "Rodillo Antigota 23cm",
    descripcion: "Rodillo profesional con felpa de alta densidad",
    marca: "Atlas",
    precio: 6990,
    tipoHerramienta: "Pintura",
    tamaño: "23 cm",
    cantidad: 50,
    imagen: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"
  },
  {
    sku: "MASKING-001",
    nombre: "Cinta Masking 24mm x 40m",
    descripcion: "Cinta de enmascarar para pintura",
    marca: "3M",
    precio: 2990,
    tipoHerramienta: "Pintura",
    tamaño: "24mm x 40m",
    cantidad: 100,
    imagen: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"
  },
  {
    sku: "ANTICORROSIVO-001",
    nombre: "Anticorrosivo Rojo 1L",
    descripcion: "Base anticorrosiva para metales",
    marca: "Sherwin Williams",
    precio: 9990,
    tipoHerramienta: "Pintura",
    tamaño: "1 litro",
    cantidad: 30,
    imagen: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400"
  },
  {
    sku: "DILUYENTE-001",
    nombre: "Diluyente Sintético 1L",
    descripcion: "Diluyente para esmaltes y barnices",
    marca: "Sipa",
    precio: 4990,
    tipoHerramienta: "Pintura",
    tamaño: "1 litro",
    cantidad: 45,
    imagen: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"
  }
];

// Función para crear archivo Excel
function crearExcel(datos, nombreArchivo, nombreHoja) {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(datos);
  
  // Ajustar anchos de columna
  ws['!cols'] = [
    { wch: 18 },  // sku
    { wch: 30 },  // nombre
    { wch: 50 },  // descripcion
    { wch: 15 },  // marca
    { wch: 10 },  // precio
    { wch: 15 },  // tipoHerramienta
    { wch: 15 },  // tamaño
    { wch: 10 },  // cantidad
    { wch: 60 },  // imagen
  ];
  
  XLSX.utils.book_append_sheet(wb, ws, nombreHoja);
  
  const rutaArchivo = path.join(__dirname, '..', nombreArchivo);
  XLSX.writeFile(wb, rutaArchivo);
  console.log(`✅ Creado: ${nombreArchivo}`);
}

// Crear los archivos Excel
console.log('📦 Creando plantillas Excel...\n');

crearExcel(productosEjemplo, 'plantilla_herramientas.xlsx', 'Herramientas');
crearExcel(materialesConstruccion, 'plantilla_materiales.xlsx', 'Materiales');
crearExcel(pinturasAcabados, 'plantilla_pinturas.xlsx', 'Pinturas');

// Crear plantilla vacía con encabezados
const plantillaVacia = [{
  sku: "",
  nombre: "",
  descripcion: "",
  marca: "",
  precio: "",
  tipoHerramienta: "",
  tamaño: "",
  cantidad: "",
  imagen: ""
}];
crearExcel(plantillaVacia, 'plantilla_vacia.xlsx', 'Productos');

console.log('\n🎉 ¡Plantillas creadas exitosamente!');
console.log('\nArchivos generados:');
console.log('  - plantilla_herramientas.xlsx (10 productos)');
console.log('  - plantilla_materiales.xlsx (8 productos)');
console.log('  - plantilla_pinturas.xlsx (7 productos)');
console.log('  - plantilla_vacia.xlsx (solo encabezados)');
