// API Route para Vercel - Oculta la API key del frontend
module.exports = async function handler(req, res) {
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, productos } = req.body;

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

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.VERCEL_URL || 'http://localhost:5173',
        'X-Title': 'MiTienda Chatbot'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.2-3b-instruct:free', // Modelo gratuito
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        max_tokens: 200,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenRouter error:', error);
      return res.status(500).json({ error: 'Error al consultar el modelo' });
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || 'Lo siento, no pude procesar tu consulta.';

    return res.status(200).json({ message: assistantMessage });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
