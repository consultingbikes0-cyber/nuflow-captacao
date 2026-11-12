import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

// Upload a single photo to Supabase Storage
export async function uploadPhoto(file, submissionId, index) {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
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
    shock: formData.shock, // amortecedor: era preenchido no formulário mas não era salvo
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
  // Sem .select(): o formulário público só tem permissão de INSERIR (leitura é só para o painel logado)
  const { error } = await supabase.from('submissoes').insert([payload]);
  if (error) throw error;
  return { description };
}

// Converte o texto digitado pelo vendedor em texto puro antes de montar o HTML.
// Sem isso, alguém poderia colocar código nos campos e ele iria parar no painel e na loja.
function escapeHtml(v) {
  return String(v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function escapeFields(data) {
  const out = {};
  Object.keys(data || {}).forEach(k => {
    const v = data[k];
    out[k] = typeof v === 'string' ? escapeHtml(v) : v;
  });
  return out;
}

export function generateDescription(rawData) {
  const formData = escapeFields(rawData);
  const marca  = (formData.marca  || '').toUpperCase();
  const modelo = (formData.modelo || '').toUpperCase();
  const ano    = formData.ano      || '';
  const tam    = formData.tamanho  || '';
  const tipo   = formData.tipo     || '';
  const preco  = formData.precoPedido
    ? 'R$ ' + Number(formData.precoPedido).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
    : '';

  const titulo = `${marca} ${modelo}${ano ? ' - ' + ano : ''}${tam ? ' - TAMANHO ' + tam.toUpperCase() : ''}`.trim();

  // Badge de modalidade
  const tipoLabel = tipo ? tipo.toUpperCase() : 'MTB';

  // Monta linhas de componentes
  const componentes = [];
  if (formData.suspensao)        componentes.push(['Suspensão',   formData.suspensao]);
  if (formData.shock)            componentes.push(['Amortecedor', formData.shock]);
  if (formData.freios)           componentes.push(['Freios',      formData.freios]);
  if (formData.relacao)          componentes.push(['Transmissão', formData.relacao]);
  if (formData.rodas)            componentes.push(['Rodas',       formData.rodas]);
  if (tam)                       componentes.push(['Tamanho',     tam]);
  if (formData.outrosComponentes) {
    formData.outrosComponentes.split(/[,;\n]+/).forEach(item => {
      const t = item.trim();
      if (t) componentes.push([t, '']);
    });
  }

  const componentesRows = componentes.map(([key, val], i) => `
    <tr${i > 0 ? ' style="border-top:1px solid #eeeeee;"' : ''}>
      <td style="padding:6px 0;color:#888888;width:160px;vertical-align:top;font-size:12px;">${key}</td>
      <td style="padding:6px 0;color:#111111;font-weight:600;">${val}</td>
    </tr>`).join('');

  const condicao = formData.observacoes
    ? `<p style="font-size:13px;color:#333333;line-height:1.6;margin:0;">${formData.observacoes}</p>`
    : `<p style="font-size:13px;color:#333333;line-height:1.6;margin:0;">Bike seminova em bom estado geral, conforme informado pelo vendedor. Estado confirmado no laudo técnico antes da entrega.</p>`;

  return `<!--NUFLOW BIKES - DESCRICAO DE PRODUTO PREMIUM-->
<div style="font-family:Arial,Helvetica,sans-serif;max-width:720px;margin:0 auto;color:#1a1a1a;background:#ffffff;padding:0;">

  <!-- NOME DA BIKE -->
  <p style="font-size:18px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:#111111;margin:0 0 8px 0;padding:20px 20px 0 20px;">${titulo}</p>

  <!-- BADGE -->
  <p style="margin:0 0 16px 0;padding:0 20px;">
    <span style="display:inline-block;background:#202d18;color:#c8ff00;font-size:10px;letter-spacing:2px;text-transform:uppercase;padding:3px 10px;border-radius:2px;">${tipoLabel} · Seminova</span>
  </p>

  <!-- INTRO -->
  <p style="font-size:14px;color:#444444;line-height:1.7;margin:0 0 20px 0;padding:0 20px;">
    Uma das bikes mais desejadas do mercado, selecionada pela curadoria Nuflow. Pronta para trilhas, viagens e pedaladas de alto nível.
  </p>

  <!-- COMPONENTES -->
  <div style="background:#f8f8f8;border:2px solid #111111;margin:0 0 2px 0;padding:12px 20px;">
    <p style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#202d18;margin:0 0 12px 0;">Componentes em Destaque</p>
    <table style="width:100%;border-collapse:collapse;font-size:13px;">
      <tbody>${componentesRows}
      </tbody>
    </table>
  </div>

  <!-- CONDIÇÃO -->
  <div style="background:#fffbf0;border:2px solid #e6a800;margin:2px 0;padding:12px 20px;display:flex;align-items:flex-start;gap:12px;">
    <span style="font-size:22px;flex-shrink:0;margin-top:1px;">⚠️</span>
    <div>
      <p style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#b37800;margin:0 0 6px 0;">Condição da Bike</p>
      ${condicao}
    </div>
  </div>

  <!-- CERTIFICADO NUFLOW -->
  <div style="background:#f0f5ee;border:2px solid #111111;margin:2px 0;padding:14px 20px;display:flex;align-items:flex-start;gap:12px;">
    <span style="font-size:22px;flex-shrink:0;margin-top:1px;">✅</span>
    <div>
      <p style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#202d18;margin:0 0 4px 0;">Laudo técnico antes da entrega</p>
      <p style="font-size:12px;color:#444444;line-height:1.6;margin:0;">Antes de seguir para você, esta bike passa por um laudo técnico completo na Nuflow: quadro, suspensões, freios, transmissão e rodas. Qualquer ajuste necessário é feito nesse momento, pouco antes do envio. Assim ela chega pronta para pedalar, sem o desgaste de ficar parada depois da revisão.</p>
    </div>
  </div>

  <!-- PREÇO E CTA -->
  <div style="background:#f8f8f8;border-top:2px solid #202d18;margin:2px 0 0 0;padding:16px 20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
    <div>
      <p style="font-size:11px;color:#888888;letter-spacing:1px;text-transform:uppercase;margin:0 0 4px 0;">Preço</p>
      <p style="font-size:26px;font-weight:900;color:#202d18;margin:0;font-family:monospace;">${preco}</p>
    </div>
    <div style="background:#202d18;padding:10px 16px;border-radius:3px;">
      <p style="font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#ffffff;margin:0 0 2px 0;">COMPRA SOMENTE PELO WHATSAPP</p>
      <p style="font-size:11px;color:rgba(255,255,255,0.65);margin:0;">Laudo técnico antes da entrega + curadoria Nuflow + entrega nacional</p>
    </div>
  </div>

</div>`;
}
