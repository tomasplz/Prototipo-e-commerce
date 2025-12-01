// Ferreterías en La Serena y Coquimbo, Chile
// Coordenadas reales de la zona

export const FERRETERIAS = [
  {
    id: "ferre-1",
    nombre: "Ferretería Don Pepe",
    direccion: "Av. Francisco de Aguirre 320, La Serena",
    lat: -29.9027,
    lng: -71.2519,
    telefono: "+56 9 1234 5678",
  },
  {
    id: "ferre-2",
    nombre: "Construmart Vecino",
    direccion: "Av. Balmaceda 2650, La Serena",
    lat: -29.9078,
    lng: -71.2567,
    telefono: "+56 9 2345 6789",
  },
  {
    id: "ferre-3",
    nombre: "Sodimac Express",
    direccion: "Ruta 5 Norte 1945, Coquimbo",
    lat: -29.9412,
    lng: -71.2836,
    telefono: "+56 9 3456 7890",
  },
  {
    id: "ferre-4",
    nombre: "Ferretería El Maestro",
    direccion: "Av. Costanera 1520, Coquimbo",
    lat: -29.9534,
    lng: -71.3398,
    telefono: "+56 9 4567 8901",
  },
];

// Ubicación fija del usuario (simulando su casa en La Serena centro)
export const UBICACION_USUARIO = {
  lat: -29.9050,
  lng: -71.2520,
  nombre: "Tu ubicación",
};

// Función para calcular distancia aproximada en metros (fórmula Haversine simplificada)
export function calcularDistancia(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Radio de la tierra en metros
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Genera precios aleatorios para un producto en cada ferretería
// Variación de ±20% respecto al precio base
export function generarPreciosFerreteria(precioBase) {
  return FERRETERIAS.map((ferre) => {
    const variacion = 0.8 + Math.random() * 0.4; // Entre 0.8 y 1.2
    const precioFerre = Math.round(precioBase * variacion * 100) / 100;
    const distancia = calcularDistancia(
      UBICACION_USUARIO.lat,
      UBICACION_USUARIO.lng,
      ferre.lat,
      ferre.lng
    );
    return {
      ...ferre,
      precio: precioFerre,
      distancia,
    };
  });
}
