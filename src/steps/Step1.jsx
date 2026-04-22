import React, { useState } from 'react';
import { User, MapPin, Phone, Loader } from 'lucide-react';

const ESTADOS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS',
  'MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC',
  'SP','SE','TO'
];

export default function Step1({ data, onChange }) {
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState('');

  const set = (field, value) => onChange({ ...data, [field]: value });

  const handleCep = async (e) => {
    const cep = e.target.value.replace(/\D/g, '');
    set('cep', e.target.value);
    setCepError('');

    if (cep.length === 8) {
      setCepLoading(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const json = await res.json();
        if (json.erro) {
          setCepError('CEP não encontrado');
        } else {
          onChange({
            ...data,
            cep: e.target.value,
            cidade: json.localidade,
            estado: json.uf,
            bairro: json.bairro,
            logradouro: json.logradouro,
          });
        }
      } catch {
        setCepError('Erro ao buscar CEP');
      } finally {
        setCepLoading(false);
      }
    }
  };

  return (
    <div className="step-content">
      <div className="step-header">
        <div className="step-icon"><User size={22} /></div>
        <div>
          <h2>Seus dados</h2>
          <p>Para entrarmos em contato sobre sua bike</p>
        </div>
      </div>

      <div className="field-group">
        <label>Nome completo *</label>
        <input
          type="text"
          placeholder="João Silva"
          value={data.nome || ''}
          onChange={e => set('nome', e.target.value)}
          autoComplete="name"
        />
      </div>

      <div className="field-group">
        <label>WhatsApp *</label>
        <div className="input-with-icon">
          <Phone size={16} className="input-icon" />
          <input
            type="tel"
            placeholder="(11) 99999-9999"
            value={data.whatsapp || ''}
            onChange={e => set('whatsapp', e.target.value)}
            autoComplete="tel"
          />
        </div>
        <span className="field-hint">Usaremos apenas para falar sobre a bike</span>
      </div>

      <div className="field-group">
        <label>CEP *</label>
        <div className="input-with-icon">
          <MapPin size={16} className="input-icon" />
          <input
            type="text"
            placeholder="00000-000"
            value={data.cep || ''}
            onChange={handleCep}
            maxLength={9}
            inputMode="numeric"
          />
          {cepLoading && <Loader size={16} className="input-icon-right spin" />}
        </div>
        {cepError && <span className="field-error">{cepError}</span>}
        {data.cidade && !cepError && (
          <span className="field-hint cep-found">
            ✓ {data.cidade} — {data.estado}
            {data.bairro ? ` · ${data.bairro}` : ''}
          </span>
        )}
      </div>

      {/* Fallback manual se CEP não preencher */}
      {(!data.cidade || cepError) && !cepLoading && (
        <div className="field-row">
          <div className="field-group flex-1">
            <label>Cidade *</label>
            <input
              type="text"
              placeholder="Belo Horizonte"
              value={data.cidade || ''}
              onChange={e => set('cidade', e.target.value)}
            />
          </div>
          <div className="field-group estado-field">
            <label>Estado *</label>
            <select value={data.estado || ''} onChange={e => set('estado', e.target.value)}>
              <option value="">UF</option>
              {ESTADOS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
