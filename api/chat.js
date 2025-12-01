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
    .slice(0, 25);
  
  const productosResumen = productosOrdenados.map(p => 
    `- ${p.nombre}: $${p.precio?.toLocaleString?.('es-CL') || p.precio} en ${p.tienda} (${p.distancia})`
  ).join('\n') || 'No hay productos disponibles';

  // Agrupar por producto para mostrar comparativas
  const productosAgrupados = {};
  productosOrdenados.forEach(p => {
    const key = p.nombre.toLowerCase();
    if (!productosAgrupados[key]) {
      productosAgrupados[key] = [];
    }
    productosAgrupados[key].push(p);
  });

  const comparativaResumen = Object.entries(productosAgrupados)
    .filter(([_, ofertas]) => ofertas.length > 1)
    .map(([nombre, ofertas]) => {
      const masBarato = ofertas.sort((a,b) => a.precio - b.precio)[0];
      const masCercano = ofertas.sort((a,b) => (a.distanciaMetros||999999) - (b.distanciaMetros||999999))[0];
      return `${nombre}: Más barato en ${masBarato.tienda} ($${masBarato.precio}), Más cercano en ${masCercano.tienda} (${masCercano.distancia})`;
    }).join('\n');

  // Contar mensajes del historial para saber si ya mencionamos la ubicación
  const cantidadMensajes = (historial || []).length;
  const yaMencionoUbicacion = cantidadMensajes > 2;

  const instruccionUbicacion = !esUbicacionReal 
    ? (yaMencionoUbicacion 
        ? '- El usuario NO tiene ubicación real. Ya le mencionaste esto antes, NO lo repitas a menos que pregunte específicamente sobre ubicación o distancias.'
        : '- El usuario NO tiene ubicación real activada. Menciona UNA VEZ que puede activar "Usar mi ubicación" para distancias exactas, pero no insistas.')
    : '- El usuario TIENE ubicación real activada. Las distancias son exactas.';

  const systemPrompt = `Eres un asistente de MiTienda, un marketplace de ferreterías en La Serena y Coquimbo, Chile.
Tu objetivo es ayudar a los clientes a encontrar productos de ferretería al mejor precio y más cercano.

ESTADO DE UBICACIÓN: ${esUbicacionReal ? 'UBICACIÓN REAL ACTIVADA ✓' : 'Ubicación de prueba (aproximada)'}

PRODUCTOS DISPONIBLES (ordenados por cercanía):
${productosResumen}

COMPARATIVAS DE PRECIOS:
${comparativaResumen || 'Sin comparativas disponibles'}

INSTRUCCIONES:
- Responde en español chileno, amigable y breve (2-3 oraciones máximo)
- Menciona precios y distancias cuando hables de productos específicos
- Si preguntan por un producto, di cuál es el MÁS BARATO y cuál el MÁS CERCANO
${instruccionUbicacion}
- NO repitas información que ya dijiste en mensajes anteriores
- Si el usuario dice "si" o responde brevemente, continúa la conversación naturalmente
- Cuando pregunten por varios productos, sugiere la tienda donde puedan comprar más cosas juntas
- NUNCA pidas dirección manualmente`;

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
