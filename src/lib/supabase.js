import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Upload a single photo to Supabase Storage
export async function uploadPhoto(file, submissionId, index) {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  // Sanitize submissionId - remove accents and special characters
  const safeId = submissionId
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_\-]/g, '_');
  const path = `${safeId}/foto_${index + 1}.${ext}`;
  const { data, error } = await supabase.storage
    .from('bike-photos')
    .upload(path, file, { cacheControl: '3600', upsert: false });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from('bike-photos').getPublicUrl(path);
  return urlData.publicUrl;
}

// Save submission to the database
export async function saveSubmission(formData, photoUrls) {
  const description = generateDescription(formData);
  const payload = {
    nome: formData.nome,
    whatsapp: formData.whatsapp,
    cidade: formData.cidade,
    estado: formData.estado,
    cep: formData.cep,
    bairro: formData.bairro,
    marca: formData.marca,
    modelo: formData.modelo,
    ano: formData.ano,
    tamanho: formData.tamanho,
    tipo: formData.tipo,
    suspensao: formData.suspensao,
    freios: formData.freios,
    relacao: formData.relacao,
    rodas: formData.rodas,
    outros_componentes: formData.outrosComponentes,
    preco_pedido: formData.precoPedido,
    observacoes: formData.observacoes,
    fotos: photoUrls,
    descricao_gerada: description,
    status: 'novo',
    criado_em: new Date().toISOString(),
  };
  const { data, error } = await supabase.from('submissoes').insert([payload]).select().single();
  if (error) throw error;
  return { data, description };
}

export function generateDescription(formData) {
  const marca = (formData.marca || '').toUpperCase();
  const modelo = (formData.modelo || '').toUpperCase();
  const tamanho = formData.tamanho || '';
  const ano = formData.ano || '';
  const preco = formData.precoPedido
    ? 'R$' + Number(formData.precoPedido).toLocaleString('pt-BR')
    : '';

  const titulo = `${marca} ${modelo} ${ano}`.trim();

  const itens = [];
  if (formData.suspensao)        itens.push(`- Suspensão ${formData.suspensao}`);
  if (formData.shock)            itens.push(`- Shock ${formData.shock}`);
  if (formData.freios)           itens.push(`- Freios ${formData.freios}`);
  if (formData.relacao)          itens.push(`- Relação ${formData.relacao}`);
  if (formData.rodas)            itens.push(`- Rodas ${formData.rodas}`);
  if (formData.outrosComponentes) {
    formData.outrosComponentes.split(/[,;\n]+/).forEach(item => {
      const t = item.trim();
      if (t) itens.push(`- ${t}`);
    });
  }
  if (tamanho) itens.push(`- Tamanho ${tamanho}`);

  const componentesHtml = itens.map(i => `${i} <br />`).join('\n');

  return `<p><strong><span style="font-size:18px;">${titulo}</span></strong></p>
<p><span style="font-size:16px;">${componentesHtml}</span></p>
<p><span style="font-size:16px;"><strong>${preco}</strong></span><br />
<br />
<strong><span style="font-size:16px;">COMPRA SOMENTE PELO WHATSAPP - COMPRAS PELO SITE SERÃO CANCELADAS</span></strong><br />
 </p>
<p><span style="font-size:16px;">Na Nuflow, você compra com quem entende do assunto — bikes seminovas selecionadas, avaliadas e com processo 100% transparente.</span></p>
<p><span style="font-size:16px;">🚲 Confie em quem vive o mundo das bikes.</span></p>`;
}
