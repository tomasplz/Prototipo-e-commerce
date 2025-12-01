// API Route para Vercel - Oculta la API key del frontend
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

  const { mensaje, productos } = req.body;
  
  // Convertir mensaje simple a formato messages
  const messages = [{ role: 'user', content: mensaje }];

  // Construir contexto con los productos disponibles
  const productosResumen = productos?.slice(0, 30).map(p => 
    `- ${p.nombre}: $${p.precio?.toLocaleString('es-CL')} en ${p.vendedor?.nombre || 'Tienda'}`
  ).join('\n') || 'No hay productos disponibles';

  const systemPrompt = `Eres un asistente de MiTienda, un marketplace de ferreterías en La Serena, Chile.
Tu objetivo es ayudar a los clientes a encontrar productos de ferretería.

PRODUCTOS DISPONIBLES:
${productosResumen}

INSTRUCCIONES:
- Responde en español chileno, amigable y breve
- Si preguntan por un producto, menciona las opciones disponibles con precios
- Sugiere el más barato o el más cercano según lo que pidan
- Si no encuentras el producto, sugiere alternativas similares
- Puedes recomendar ir a "Ver ferreterías" para comparar precios
- Mantén respuestas cortas (máximo 2-3 oraciones)`;

  // Verificar que tenemos la API key
  if (!process.env.OPENROUTER_API_KEY) {
    console.error('OPENROUTER_API_KEY no está configurada');
    return res.status(500).json({ error: 'API key no configurada', message: 'Error de configuración del servidor' });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://prototipo-e-commerce-seven.vercel.app',
        'X-Title': 'MiTienda Chatbot'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.2-3b-instruct:free',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        max_tokens: 200,
        temperature: 0.7
      })
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      console.error('OpenRouter error:', response.status, responseText);
      return res.status(500).json({ 
        error: 'Error al consultar el modelo',
        details: responseText,
        message: 'Hubo un problema al conectar con el asistente'
      });
    }

    const data = JSON.parse(responseText);
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
