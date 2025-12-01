// API Route para Vercel - Oculta la API key del frontend
// Usando ESM porque package.json tiene "type": "module"

import https from 'https';

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

export default async function handler(req, res) {
  // Headers CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Manejar preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verificar que tenemos la API key
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error('OPENROUTER_API_KEY no está configurada');
    return res.status(500).json({ 
      error: 'API key no configurada', 
      message: 'Error de configuración del servidor' 
    });
  }

  // Modelo configurable via variable de entorno
  const model = process.env.OPENROUTER_MODEL || 'mistralai/mistral-7b-instruct:free';

  const { mensaje, historial, productos, ubicacionUsuario } = req.body || {};
  
  if (!mensaje) {
    return res.status(400).json({ error: 'Falta el mensaje', message: 'Por favor escribe un mensaje' });
  }

  // Determinar estado de la ubicación
  const esUbicacionReal = ubicacionUsuario?.esReal === true;

  // Construir contexto con los productos disponibles (ahora incluye distancias)
  const productosOrdenados = (productos || [])
    .sort((a, b) => (a.distanciaMetros || 999999) - (b.distanciaMetros || 999999))
    .slice(0, 30);
  
  // Agrupar por nombre de producto para análisis
  const productosAgrupados = {};
  productosOrdenados.forEach(p => {
    const key = p.nombre.toLowerCase().trim();
    if (!productosAgrupados[key]) {
      productosAgrupados[key] = [];
    }
    productosAgrupados[key].push(p);
  });

  // Identificar productos exclusivos (solo en 1 tienda) vs compartidos
  const productosExclusivos = [];
  const productosCompartidos = [];
  
  Object.entries(productosAgrupados).forEach(([nombre, ofertas]) => {
    if (ofertas.length === 1) {
      productosExclusivos.push({
        nombre: ofertas[0].nombre,
        tienda: ofertas[0].tienda,
        precio: ofertas[0].precio,
        distancia: ofertas[0].distancia
      });
    } else {
      const ordenadosPorPrecio = [...ofertas].sort((a,b) => a.precio - b.precio);
      const ordenadosPorDistancia = [...ofertas].sort((a,b) => (a.distanciaMetros||999999) - (b.distanciaMetros||999999));
      productosCompartidos.push({
        nombre: ofertas[0].nombre,
        cantidadTiendas: ofertas.length,
        masBarato: { tienda: ordenadosPorPrecio[0].tienda, precio: ordenadosPorPrecio[0].precio },
        masCaro: { tienda: ordenadosPorPrecio[ordenadosPorPrecio.length-1].tienda, precio: ordenadosPorPrecio[ordenadosPorPrecio.length-1].precio },
        masCercano: { tienda: ordenadosPorDistancia[0].tienda, distancia: ordenadosPorDistancia[0].distancia, precio: ordenadosPorDistancia[0].precio }
      });
    }
  });

  // Crear resumen estructurado
  const resumenExclusivos = productosExclusivos.length > 0
    ? productosExclusivos.map(p => `- ${p.nombre}: SOLO en ${p.tienda} a $${p.precio} (${p.distancia})`).join('\n')
    : 'No hay productos exclusivos de una sola tienda';

  const resumenCompartidos = productosCompartidos.map(p => 
    `- ${p.nombre}: En ${p.cantidadTiendas} tiendas. Más barato: ${p.masBarato.tienda} ($${p.masBarato.precio}). Más cercano: ${p.masCercano.tienda} (${p.masCercano.distancia}, $${p.masCercano.precio})`
  ).join('\n');

  // Agrupar por tienda para saber qué vende cada una
  const productosPorTienda = {};
  productosOrdenados.forEach(p => {
    if (!productosPorTienda[p.tienda]) {
      productosPorTienda[p.tienda] = [];
    }
    productosPorTienda[p.tienda].push(`${p.nombre} ($${p.precio})`);
  });
  
  const resumenPorTienda = Object.entries(productosPorTienda)
    .map(([tienda, prods]) => `${tienda}: ${prods.join(', ')}`)
    .join('\n');

  // Extraer lista de tiendas únicas
  const tiendasUnicas = [...new Set(productosOrdenados.map(p => p.tienda))];

  // Contar mensajes del historial
  const cantidadMensajes = (historial || []).length;
  const yaMencionoUbicacion = cantidadMensajes > 2;

  const instruccionUbicacion = !esUbicacionReal 
    ? (yaMencionoUbicacion 
        ? '- El usuario NO tiene ubicación real. Ya se lo mencionaste, NO lo repitas.'
        : '- El usuario NO tiene ubicación real. Menciona UNA VEZ que puede activar "Usar mi ubicación".')
    : '- El usuario TIENE ubicación real activada ✓';

  const systemPrompt = `Eres el asistente de MiTienda, un MARKETPLACE que conecta ${tiendasUnicas.length} ferreterías en La Serena y Coquimbo, Chile: ${tiendasUnicas.join(', ')}.

⚠️ REGLAS CRÍTICAS - DEBES SEGUIR ESTAS REGLAS:
1. SOLO menciona productos que aparecen EXACTAMENTE en la lista de abajo
2. Si no encuentras un producto en la lista, di "No tenemos ese producto en la plataforma"
3. NUNCA inventes información - si no estás seguro, di "déjame verificar" o "no tengo esa información"
4. Los PRODUCTOS EXCLUSIVOS son los que dicen "SOLO en [tienda]" - NO hay otros exclusivos
5. Si te preguntan por exclusivos de una tienda y no hay ninguno listado, di honestamente que no hay

UBICACIÓN: ${esUbicacionReal ? 'REAL ✓' : 'Aproximada'}

═══ PRODUCTOS EXCLUSIVOS (solo en 1 tienda) ═══
${resumenExclusivos}

═══ PRODUCTOS EN MÚLTIPLES TIENDAS (con comparativa) ═══
${resumenCompartidos}

═══ CATÁLOGO POR TIENDA ═══
${resumenPorTienda}

INSTRUCCIONES:
- Responde breve (2-3 oraciones), amigable, en español chileno
- SIEMPRE menciona tienda + precio cuando hables de un producto
- Para comparar: "En X está a $Y, en Z está a $W (más barato/cercano)"
${instruccionUbicacion}
- Si te corrigen o dicen que te equivocaste, discúlpate y corrige basándote SOLO en los datos de arriba
- NUNCA digas "nuestra tienda" - di "en la plataforma" o el nombre de la ferretería`;

  // Construir mensajes con historial
  const mensajesIA = [
    { role: 'system', content: systemPrompt }
  ];
  
  // Agregar historial de conversación si existe
  if (historial && historial.length > 0) {
    mensajesIA.push(...historial);
  }
  
  // Agregar mensaje actual
  mensajesIA.push({ role: 'user', content: mensaje });

  try {
    const requestBody = JSON.stringify({
      model: model,
      messages: mensajesIA,
      max_tokens: 250,
      temperature: 0.7
    });

    console.log('Usando modelo:', model);
    console.log('Mensajes en conversación:', mensajesIA.length);

    const options = {
      hostname: 'openrouter.ai',
      port: 443,
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody),
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://prototipo-e-commerce-seven.vercel.app',
        'X-Title': 'MiTienda Chatbot'
      }
    };

    const response = await makeRequest(options, requestBody);
    
    // Log para debugging
    console.log('OpenRouter response status:', response.status);
    console.log('OpenRouter response data:', response.data.substring(0, 500));
    
    // Manejar rate limit (429)
    if (response.status === 429) {
      console.error('Rate limit alcanzado');
      return res.status(200).json({ 
        message: '⏳ El asistente está ocupado, intenta de nuevo en unos segundos.'
      });
    }
    
    if (response.status !== 200) {
      console.error('OpenRouter error:', response.status, response.data);
      // Devolver el error real para debugging
      return res.status(200).json({ 
        message: `🔧 Error ${response.status}: ${response.data.substring(0, 200)}`
      });
    }

    const data = JSON.parse(response.data);
    const assistantMessage = data.choices?.[0]?.message?.content || 'Lo siento, no pude procesar tu consulta.';

    return res.status(200).json({ message: assistantMessage });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(200).json({ 
      message: `🔧 Error: ${error.message}`
    });
  }
}
