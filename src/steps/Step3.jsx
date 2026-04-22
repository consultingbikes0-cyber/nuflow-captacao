import React from 'react';
import { Settings } from 'lucide-react';

export default function Step3({ data, onChange }) {
  const set = (field, value) => onChange({ ...data, [field]: value });

  const fields = [
    {
      key: 'suspensao',
      label: 'Suspensão (garfo)',
      placeholder: 'Ex: Fox 36 Factory 160mm',
      hint: 'Marca, modelo e curso',
    },
    {
      key: 'shock',
      label: 'Amortecedor (traseiro)',
      placeholder: 'Ex: Fox Float X2 / N/A se hardtail',
      hint: 'Deixe em branco se for hardtail',
    },
    {
      key: 'freios',
      label: 'Freios',
      placeholder: 'Ex: Shimano XT 4 pistões',
      hint: 'Marca e modelo dos freios',
    },
    {
      key: 'relacao',
      label: 'Transmissão / Relação',
      placeholder: 'Ex: Shimano XT 12v / SRAM GX Eagle',
      hint: 'Câmbio, pedivela, número de marchas',
    },
    {
      key: 'rodas',
      label: 'Rodas',
      placeholder: 'Ex: DT Swiss XM1700 29"',
      hint: 'Marca, modelo e aro das rodas',
    },
    {
      key: 'outrosComponentes',
      label: 'Outros componentes',
      placeholder: 'Ex: Selim retrátil Bikeyoke, mesa Race Face...',
      hint: 'Guidão, mesa, selim, canote — o que mais tiver de destaque',
    },
  ];

  return (
    <div className="step-content">
      <div className="step-header">
        <div className="step-icon"><Settings size={22} /></div>
        <div>
          <h2>Componentes</h2>
          <p>Quanto mais detalhes, mais rápido vendemos</p>
        </div>
      </div>

      {fields.map(f => (
        <div key={f.key} className="field-group">
          <label>{f.label}</label>
          <input
            type="text"
            placeholder={f.placeholder}
            value={data[f.key] || ''}
            onChange={e => set(f.key, e.target.value)}
          />
          <span className="field-hint">{f.hint}</span>
        </div>
      ))}

      <div className="field-group">
        <label>Observações gerais</label>
        <textarea
          rows={3}
          placeholder="Algum amassado, arranhão, revisão recente, acessórios inclusos..."
          value={data.observacoes || ''}
          onChange={e => set('observacoes', e.target.value)}
        />
      </div>
    </div>
  );
}
