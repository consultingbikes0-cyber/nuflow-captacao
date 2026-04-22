import React from 'react';
import { CheckCircle, MessageCircle, Clock, Search, Megaphone, Lock, DollarSign } from 'lucide-react';

const PROXIMOS_PASSOS = [
  {
    icon: <Search size={16} />,
    title: 'Análise em até 24h',
    desc: 'Nossa equipe analisa sua bike e entra em contato pelo WhatsApp.',
    color: 'var(--blue)',
  },
  {
    icon: <Megaphone size={16} />,
    title: 'Publicação e divulgação',
    desc: 'Se aprovada, publicamos no site e poderemos divulgar no Instagram.',
    color: 'var(--accent)',
  },
  {
    icon: <Lock size={16} />,
    title: 'Nós cuidamos da negociação',
    desc: 'Você fica protegido. Toda comunicação com compradores é feita por nós.',
    color: 'var(--success)',
  },
  {
    icon: <DollarSign size={16} />,
    title: 'Repasse após a venda',
    desc: 'Após venda e período de segurança (até 30 dias), repassamos o valor.',
    color: 'var(--accent2)',
  },
];

export default function SuccessScreen({ formData }) {
  const whatsappMsg = encodeURIComponent(
    `Olá! Acabei de enviar minha bike pelo formulário.\n\n🚲 ${formData.marca || ''} ${formData.modelo || ''} ${formData.ano || ''}\n\nMeu nome: ${formData.nome || ''}\nCidade: ${formData.cidade || ''} - ${formData.estado || ''}`
  );

  return (
    <div className="success-screen">
      <div className="success-icon-wrap">
        <CheckCircle size={56} className="success-icon" />
      </div>

      <h1>Bike enviada!</h1>

      <p className="success-subtitle">
        Recebemos tudo certinho, <strong>{(formData.nome || '').split(' ')[0]}</strong>!
        Agora é com a gente — veja o que acontece a partir de agora:
      </p>

      {/* Próximos passos */}
      <div className="proximos-passos">
        {PROXIMOS_PASSOS.map((p, i) => (
          <div key={i} className="passo-item">
            <div className="passo-num" style={{ background: p.color + '20', color: p.color }}>
              {p.icon}
            </div>
            <div className="passo-content">
              <strong>{p.title}</strong>
              <p>{p.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Comissão lembrete */}
      <div className="comissao-lembrete">
        <span>💰</span>
        <span>Comissão: <strong>10%</strong> sobre o valor da venda · mín. R$800 · máx. R$5.000 · sem taxa de anúncio</span>
      </div>

      <a
        href={`https://wa.me/5531998961990?text=${whatsappMsg}`}
        target="_blank"
        rel="noreferrer"
        className="whatsapp-btn"
      >
        <MessageCircle size={18} />
        Confirmar envio pelo WhatsApp
      </a>

      <p className="success-note">
        Ao confirmar pelo WhatsApp, nossa equipe já fica sabendo que você enviou e agiliza a análise.
      </p>
    </div>
  );
}
