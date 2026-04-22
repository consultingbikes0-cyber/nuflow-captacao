import React from 'react';
import { Bike } from 'lucide-react';

const TIPOS = ['MTB Full', 'MTB Hardtail', 'Speed / Road', 'Gravel', 'Enduro / DH', 'E-bike', 'Outro'];
const TAMANHOS = ['XS', 'S', 'M', 'M/L', 'L', 'XL', 'XXL'];
const ANOS = Array.from({ length: 14 }, (_, i) => String(2025 - i));
const MARCAS = ['Scott', 'Trek', 'Specialized', 'Giant', 'Cannondale', 'Santa Cruz', 'Yeti', 'Intense',
  'Norco', 'Rocky Mountain', 'Orbea', 'Merida', 'Sense', 'Soul', 'Caloi', 'Outro'];

export default function Step2({ data, onChange }) {
  const set = (field, value) => onChange({ ...data, [field]: value });

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
        />
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
        <label>Preço pedido (R$) *</label>
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
