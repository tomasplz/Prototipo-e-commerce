// API Route para Vercel - Oculta la API key del frontend

// Usar https nativo de Node.js para compatibilidad
const https = require('https');

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

module.exports = async function handler(req, res) {
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

  const { mensaje, productos } = req.body || {};
  
  if (!mensaje) {
    return res.status(400).json({ error: 'Falta el mensaje', message: 'Por favor escribe un mensaje' });
  }

  // Construir contexto con los productos disponibles
  const productosResumen = (productos || []).slice(0, 20).map(p => 
    `- ${p.nombre}: $${p.precio} en ${p.vendedor?.nombre || 'Tienda'}`
  ).join('\n') || 'No hay productos disponibles';

  const systemPrompt = `Eres un asistente de MiTienda, un marketplace de ferreterías en La Serena, Chile.
Tu objetivo es ayudar a los clientes a encontrar productos de ferretería.

PRODUCTOS DISPONIBLES:
${productosResumen}

INSTRUCCIONES:
- Responde en español chileno, amigable y breve
- Si preguntan por un producto, menciona opciones disponibles con precios
- Sugiere el más barato o el más cercano según lo que pidan
- Mantén respuestas cortas (máximo 2-3 oraciones)`;

  try {
    const requestBody = JSON.stringify({
      model: 'meta-llama/llama-3.2-3b-instruct:free',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: mensaje }
      ],
      max_tokens: 200,
      temperature: 0.7
    });

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
    
    if (response.status !== 200) {
      console.error('OpenRouter error:', response.status, response.data);
      return res.status(500).json({ 
        error: 'Error al consultar el modelo',
        status: response.status,
        message: 'Hubo un problema al conectar con el asistente'
      });
    }

    const data = JSON.parse(response.data);
    const assistantMessage = data.choices?.[0]?.message?.content || 'Lo siento, no pude procesar tu consulta.';

    return res.status(200).json({ message: assistantMessage });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message,
      message: 'Error al procesar tu consulta'
    });
  }
}
