import React, { useState } from 'react';
import Step1 from './steps/Step1';
import Step2 from './steps/Step2';
import Step3 from './steps/Step3';
import Step4 from './steps/Step4';
import SuccessScreen from './components/SuccessScreen';
import { uploadPhoto, saveSubmission } from './lib/supabase';
import { ChevronLeft, ChevronRight, Loader, X, CheckCircle, Shield, Camera, Clock, Star } from 'lucide-react';
import './App.css';

const STEPS = [
  { label: 'Contato', component: Step1 },
  { label: 'Bike', component: Step2 },
  { label: 'Componentes', component: Step3 },
  { label: 'Fotos', component: Step4 },
];

const COMO_FUNCIONA = [
  { num: '1', title: 'Você envia as informações', desc: 'Preenche este formulário com os dados da bike e fotos seguindo nosso padrão de qualidade.', icon: '📋' },
  { num: '2', title: 'Análise e curadoria', desc: 'Nossa equipe analisa, avalia o mercado e faz a precificação estratégica. Você recebe nossa resposta em até 24h.', icon: '🔍' },
  { num: '3', title: 'Publicação e venda', desc: 'Após aprovação, publicamos no site e Instagram. Toda negociação é conduzida por nós — você fica protegido.', icon: '🚀' },
  { num: '4', title: 'Pagamento seguro', desc: 'Após a venda, o valor fica retido por até 30 dias como política antifraude antes do repasse.', icon: '🔒' },
  { num: '5', title: 'Comissão', desc: '10% sobre o valor final da venda. Mínimo R$800 e máximo R$5.000. Sem taxa de anúncio.', icon: '💰' },
  { num: '6', title: 'Sem exclusividade', desc: 'Você pode anunciar em outros lugares. Mas bikes exclusivas ganham vídeos personalizados no Instagram.', icon: '✅' },
];

function ComoFuncionaModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Como funciona</h2>
            <p className="modal-subtitle">Vender sua bike com a Nuflow</p>
          </div>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-steps">
          {COMO_FUNCIONA.map(item => (
            <div key={item.num} className="modal-step">
              <div className="modal-step-icon">{item.icon}</div>
              <div className="modal-step-content">
                <div className="modal-step-title">{item.title}</div>
                <div className="modal-step-desc">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <button className="modal-cta" onClick={onClose}>
          Entendi, quero enviar minha bike
        </button>
      </div>
    </div>
  );
}

function validate(step, data) {
  if (step === 0) return data.nome && data.whatsapp && (data.cidade && data.estado);
  if (step === 1) return data.marca && data.modelo && data.ano && data.tipo && data.tamanho && data.precoPedido;
  if (step === 2) return data.suspensao && data.freios && data.relacao;
  if (step === 3) return (data.photos || []).length >= 5;
  return true;
}

export default function App() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showModal, setShowModal] = useState(true);
  const [validating, setValidating] = useState(false);
  const [photoErrors, setPhotoErrors] = useState([]);

  const StepComponent = STEPS[step].component;
  const canProceed = validate(step, formData);
  const isLastStep = step === STEPS.length - 1;

  const validatePhotos = async (photos) => {
    setValidating(true);
    setPhotoErrors([]);
    try {
      // Convert photos to base64
      const photoData = await Promise.all(
        photos.slice(0, 6).map(async (file) => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              const b64 = reader.result.split(',')[1];
              resolve({ base64: b64, mediaType: file.type || 'image/jpeg' });
            };
            reader.readAsDataURL(file);
          });
        })
      );

      const res = await fetch('/.netlify/functions/validate-photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photos: photoData }),
      });

      const result = await res.json();
      if (!result.aprovado && result.resultados?.length > 0) {
        const erros = result.resultados.filter(r => !r.ok);
        setPhotoErrors(erros);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Photo validation error:', err);
      return true; // Don't block on error
    } finally {
      setValidating(false);
    }
  };

  const handleNext = async () => {
    if (!canProceed) return;
    if (!isLastStep) {
      setStep(s => s + 1);
      window.scrollTo(0, 0);
      return;
    }
    // Validate photos with AI before submitting
    const photosOk = await validatePhotos(formData.photos || []);
    if (!photosOk) return;

    setLoading(true);
    setError('');
    try {
      const submissionId = `${Date.now()}_${(formData.nome || 'bike').replace(/\s+/g, '_')}`;
      const photos = formData.photos || [];
      const photoUrls = await Promise.all(
        photos.map((file, i) => uploadPhoto(file, submissionId, i))
      );
      await saveSubmission(formData, photoUrls);
      setSubmitted(true);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error(err);
      setError('Erro: ' + (err?.message || JSON.stringify(err)));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="app-shell">
        <SuccessScreen formData={formData} />
      </div>
    );
  }

  return (
    <div className="app-shell">
      {showModal && <ComoFuncionaModal onClose={() => setShowModal(false)} />}

      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">N</span>
          <span className="brand-name">Nuflow Bikes</span>
        </div>
        <button className="how-it-works-btn" onClick={() => setShowModal(true)}>
          Como funciona
        </button>
      </header>

      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
      </div>

      <div className="step-tabs">
        {STEPS.map((s, i) => (
          <button
            key={i}
            className={`step-tab ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}
            onClick={() => i < step && setStep(i)}
            disabled={i > step}
          >
            {i < step ? '✓' : i + 1} {s.label}
          </button>
        ))}
      </div>

      <main className="app-main">
        <StepComponent data={formData} onChange={setFormData} />

        {!canProceed && (
          <p className="validation-hint">
            {step === 3 ? 'Adicione pelo menos 5 fotos para continuar' : 'Preencha todos os campos obrigatórios'}
          </p>
        )}

        {photoErrors.length > 0 && (
          <div className="photo-validation-errors">
            <div className="photo-val-title">📸 Corrija as fotos antes de enviar:</div>
            {photoErrors.map((e, i) => (
              <div key={i} className="photo-val-item">
                <span className="photo-val-num">Foto {e.foto}</span>
                <span className="photo-val-msg">{e.motivo}</span>
              </div>
            ))}
          </div>
        )}

        {error && <p className="error-msg">{error}</p>}

        <div className="nav-buttons">
          {step > 0 && (
            <button className="btn-back" onClick={() => { setStep(s => s - 1); window.scrollTo(0, 0); }} disabled={loading}>
              <ChevronLeft size={18} /> Voltar
            </button>
          )}
          <button
            className={`btn-next ${!canProceed || validating ? 'disabled' : ''}`}
            onClick={handleNext}
            disabled={!canProceed || loading || validating}
          >
            {validating ? (
              <><Loader size={18} className="spin" /> Verificando fotos...</>
            ) : loading ? (
              <><Loader size={18} className="spin" /> Enviando...</>
            ) : isLastStep ? (
              'Enviar bike 🚲'
            ) : (
              <>Continuar <ChevronRight size={18} /></>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
