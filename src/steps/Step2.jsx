import React, { useEffect, useState } from 'react';
import { Bike } from 'lucide-react';
import { buscarPrecoSugerido, buscarModelosReferencia } from '../lib/supabase';

const TIPOS = ['MTB Full', 'MTB Hardtail', 'Speed / Road', 'Gravel', 'Enduro / DH', 'E-bike', 'Outro'];
const TAMANHOS = ['XS', 'S', 'M', 'M/L', 'L', 'XL', 'XXL', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6'];
const ANOS = Array.from({ length: 16 }, (_, i) => String(2027 - i));
const MARCAS = ['Scott', 'Trek', 'Specialized', 'Giant', 'Cannondale', 'Santa Cruz', 'Yeti', 'Intense',
  'Norco', 'Rocky Mountain', 'Orbea', 'Merida', 'Sense', 'Soul', 'Caloi', 'Outro'];
const MATERIAIS = ['Carbono', 'Alumínio', 'Titânio', 'Aço'];

export default function Step2({ data, onChange }) {
  const set = (field, value) => onChange({ ...data, [field]: value });

  // Modelos que a Nuflow já vendeu desta marca (aparecem como sugestão no campo Modelo)
  const [modelos, setModelos] = useState([]);
  useEffect(() => {
    let vivo = true;
    setModelos([]);
    buscarModelosReferencia(data.marca).then(lista => { if (vivo) setModelos(lista); });
    return () => { vivo = false; };
  }, [data.marca]);

  // Preço sugerido: consulta o histórico de vendas da Nuflow quando marca, modelo e ano estão preenchidos
  const [sugestao, setSugestao] = useState(null);
  useEffect(() => {
    let vivo = true;
    setSugestao(null);
    if (!data.marca || !data.modelo || !data.ano) return undefined;
    const t = setTimeout(() => {
      buscarPrecoSugerido(data.marca, data.modelo, data.ano).then(r => { if (vivo) setSugestao(r); });
    }, 500); // espera a pessoa parar de digitar
    return () => { vivo = false; clearTimeout(t); };
  }, [data.marca, data.modelo, data.ano]);

  const fmt = v => 'R$ ' + Math.round(v).toLocaleString('pt-BR');
  const nomeRef = sugestao ? [sugestao.marca, sugestao.modelo, sugestao.ano].filter(Boolean).join(' ') : '';

  return (
    <div className="step-content">
      <div className="step-header">
        <div className="step-icon"><Bike size={22} /></div>
        <div>
          <h2>Sobre a bike</h2>
          <p>Informações principais da bicicleta</p>
        </div>
      </div>

      <div className="field-row">
        <div className="field-group flex-1">
          <label>Marca *</label>
          <select value={data.marca || ''} onChange={e => set('marca', e.target.value)}>
            <option value="">Selecione</option>
            {MARCAS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="field-group flex-1">
          <label>Ano *</label>
          <select value={data.ano || ''} onChange={e => set('ano', e.target.value)}>
            <option value="">Ano</option>
            {ANOS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      <div className="field-group">
        <label>Modelo *</label>
        <input
          type="text"
          placeholder="Ex: Spark 960, Stumpjumper Comp..."
          value={data.modelo || ''}
          onChange={e => set('modelo', e.target.value)}
          list="modelos-nuflow"
          autoComplete="off"
        />
        <datalist id="modelos-nuflow">
          {modelos.map(m => <option key={m} value={m} />)}
        </datalist>
      </div>

      <div className="field-group">
        <label>Tipo de bike *</label>
        <div className="pill-group">
          {TIPOS.map(t => (
            <button
              key={t}
              type="button"
              className={`pill ${data.tipo === t ? 'active' : ''}`}
              onClick={() => set('tipo', t)}
            >{t}</button>
          ))}
        </div>
      </div>

      <div className="field-group">
        <label>Tamanho do quadro *</label>
        <div className="pill-group">
          {TAMANHOS.map(s => (
            <button
              key={s}
              type="button"
              className={`pill ${data.tamanho === s ? 'active' : ''}`}
              onClick={() => set('tamanho', s)}
            >{s}</button>
          ))}
        </div>
      </div>

      <div className="field-group">
        <label>Material do quadro *</label>
        <div className="pill-group">
          {MATERIAIS.map(m => (
            <button
              key={m}
              type="button"
              className={`pill ${data.material === m ? 'active' : ''}`}
              onClick={() => set('material', m)}
            >{m}</button>
          ))}
        </div>
      </div>

      <div className="field-group">
        <label>Preço pedido (R$) *</label>
        {sugestao && sugestao.mesmoAno && (
          <div className="preco-sugerido">
            <div className="preco-sugerido-topo">
              <span className="preco-sugerido-rotulo">Preço sugerido pela Nuflow</span>
              <span className="preco-sugerido-valor">{fmt(sugestao.preco)}</span>
            </div>
            <p className="preco-sugerido-texto">
              Baseado em {sugestao.vendas === 1 ? '1 venda real' : `${sugestao.vendas} vendas reais`} de {nomeRef} na Nuflow.
              O valor final depende do estado e dos componentes da sua bike.
            </p>
            <button type="button" className="preco-sugerido-btn" onClick={() => set('precoPedido', String(sugestao.preco))}>
              Usar este valor
            </button>
          </div>
        )}
        {sugestao && !sugestao.mesmoAno && (
          <div className="preco-sugerido referencia">
            <div className="preco-sugerido-topo">
              <span className="preco-sugerido-rotulo">Referência da Nuflow</span>
              <span className="preco-sugerido-valor">{fmt(sugestao.preco)}</span>
            </div>
            <p className="preco-sugerido-texto">
              Já vendemos {nomeRef} por esse valor{sugestao.vendas > 1 ? ` (média de ${sugestao.vendas} vendas)` : ''}.
              {sugestao.ano ? ` Não temos venda do ano ${data.ano}: ajuste para o ano e o estado da sua bike.` : ' Ajuste para o ano e o estado da sua bike.'}
            </p>
          </div>
        )}
        <input
          type="number"
          placeholder="Ex: 18000"
          value={data.precoPedido || ''}
          onChange={e => set('precoPedido', e.target.value)}
          inputMode="numeric"
        />
        <span className="field-hint">Você pode negociar depois — coloque o valor que quer receber</span>
      </div>
    </div>
  );
}
