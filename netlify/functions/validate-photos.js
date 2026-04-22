exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { photos } = JSON.parse(event.body);
    // photos = [{label: 'Bike de perfil', base64: '...', mediaType: 'image/jpeg'}, ...]

    const LABELS = [
      'Bike de perfil (lado da relação, câmbio e cassete visíveis)',
      'Cockpit (guidão, mesa e manetes de freio)',
      'Câmbio traseiro e cassete',
      'Suspensão dianteira (garfo)',
      'Amortecedor traseiro ou quadro traseiro (hardtail)',
      'Detalhes ou danos',
    ];

    const content = [];

    // Add each photo with its label
    photos.forEach((photo, idx) => {
      content.push({
        type: 'text',
        text: `Foto ${idx + 1} — esperado: ${LABELS[idx] || 'foto adicional'}:`
      });
      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: photo.mediaType || 'image/jpeg',
          data: photo.base64,
        }
      });
    });

    content.push({
      type: 'text',
      text: `Você é um especialista em bicicletas MTB. Analise cada foto acima e verifique se corresponde ao ângulo solicitado.

Para cada foto, responda se está CORRETA ou INCORRETA, com uma explicação curta em português.

Responda APENAS com JSON puro, sem markdown, no formato:
{
  "resultados": [
    {"foto": 1, "ok": true, "motivo": ""},
    {"foto": 2, "ok": false, "motivo": "Parece ser foto do quadro, não do cockpit"},
    ...
  ],
  "aprovado": true
}

"aprovado" deve ser true somente se TODAS as fotos obrigatórias (1 a 5) estiverem corretas.
Seja tolerante — se a foto mostrar o componente solicitado mesmo que não seja perfeita, marque como ok.`
    });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 800,
        messages: [{ role: 'user', content }],
      }),
    });

    const data = await response.json();
    const text = (data.content?.[0]?.text || '').replace(/```json|```/g, '').trim();

    let result;
    try {
      result = JSON.parse(text);
    } catch {
      // If parsing fails, approve (don't block the user)
      result = { resultados: [], aprovado: true };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
    };
  } catch (err) {
    console.error('validate-photos error:', err);
    // On error, approve so user isn't blocked
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resultados: [], aprovado: true }),
    };
  }
};
