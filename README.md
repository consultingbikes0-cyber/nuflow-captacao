# 🚲 Nuflow Bikes — Sistema de Captação

Formulário mobile-first de 4 etapas para captação de bicicletas seminovas.
Inclui guia de fotos, geração automática de descrição e integração com Supabase.

---

## ⚡ Stack

| Camada     | Tecnologia                          |
|------------|-------------------------------------|
| Frontend   | React 18 + CSS puro (sem Tailwind)  |
| Backend    | Supabase (Postgres + Storage)       |
| Deploy     | Vercel (recomendado) ou Netlify     |

---

## 🗄️ 1. Configurar o Supabase

### 1.1 — Criar o banco de dados

Acesse **SQL Editor** no painel do Supabase e execute:

```sql
-- Tabela principal de submissões
CREATE TABLE submissoes (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome            text NOT NULL,
  whatsapp        text NOT NULL,
  cidade          text,
  estado          text,
  marca           text,
  modelo          text,
  ano             text,
  tamanho         text,
  tipo            text,
  suspensao       text,
  shock           text,
  freios          text,
  relacao         text,
  rodas           text,
  outros_componentes text,
  preco_pedido    numeric,
  observacoes     text,
  fotos           text[],           -- array de URLs públicas
  descricao_gerada text,
  status          text DEFAULT 'novo',  -- novo | em_analise | aprovado | reprovado | vendido
  criado_em       timestamptz DEFAULT now()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE submissoes ENABLE ROW LEVEL SECURITY;

-- Política: qualquer pessoa pode inserir (formulário público)
CREATE POLICY "insert_public" ON submissoes
  FOR INSERT WITH CHECK (true);

-- Política: somente autenticados podem ler
CREATE POLICY "read_authenticated" ON submissoes
  FOR SELECT USING (auth.role() = 'authenticated');
```

### 1.2 — Criar o bucket de fotos

Acesse **Storage** → **New Bucket**:

| Campo        | Valor           |
|--------------|-----------------|
| Nome         | `bike-photos`   |
| Public       | ✅ Sim           |
| Max file size | 10 MB          |
| Allowed types | image/*        |

Depois em **Policies** do bucket, adicione:

```sql
-- Qualquer pessoa pode fazer upload (INSERT)
CREATE POLICY "upload_public" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'bike-photos');

-- Qualquer pessoa pode ler (GET) — para exibir fotos
CREATE POLICY "read_public" ON storage.objects
  FOR SELECT USING (bucket_id = 'bike-photos');
```

---

## 🔑 2. Variáveis de ambiente

Copie `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Preencha com seus dados (Supabase → Settings → API):

```
REACT_APP_SUPABASE_URL=https://xxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJ...
```

---

## 🚀 3. Rodar localmente

```bash
npm install
npm start
# Abre em http://localhost:3000
```

---

## 🌐 4. Deploy na Vercel (recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer deploy
vercel

# Na primeira vez, configure as variáveis de ambiente:
# REACT_APP_SUPABASE_URL
# REACT_APP_SUPABASE_ANON_KEY
```

Ou via interface:
1. Acesse [vercel.com](https://vercel.com) → **Add New Project**
2. Conecte o repositório GitHub
3. Em **Environment Variables**, adicione as duas variáveis
4. Clique em **Deploy**

✅ Sua URL pública estará disponível em `https://seu-projeto.vercel.app`

---

## 📊 5. Exportar para Google Sheets

### Opção A — Manual (mais simples)

No Supabase → **Table Editor** → `submissoes` → **Export CSV** → importe no Google Sheets.

### Opção B — Automático via Google Apps Script

1. Abra uma planilha Google
2. Extensões → **Apps Script**
3. Cole o código abaixo e substitua a URL:

```javascript
const SUPABASE_URL = 'https://SEU_PROJETO.supabase.co';
const SUPABASE_KEY = 'sua_service_role_key'; // use service_role para leitura server-side

function importarSubmissoes() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  const response = UrlFetchApp.fetch(`${SUPABASE_URL}/rest/v1/submissoes?order=criado_em.desc`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    }
  });
  
  const data = JSON.parse(response.getContentText());
  if (!data.length) return;
  
  // Cabeçalhos
  const headers = Object.keys(data[0]);
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Dados
  const rows = data.map(row => headers.map(h => {
    const val = row[h];
    return Array.isArray(val) ? val.join('\n') : (val || '');
  }));
  sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  
  SpreadsheetApp.getActiveSpreadsheet().toast(`${rows.length} registros importados!`);
}
```

4. Salve e execute `importarSubmissoes`
5. Para automatizar: **Gatilhos** → adicionar trigger a cada hora ou dia

---

## 📱 6. Atualizar o número do WhatsApp

Em `src/components/SuccessScreen.jsx`, linha com `wa.me/`:

```jsx
href={`https://wa.me/5531999999999?text=...`}
//                  ↑ substitua pelo seu DDD + número
```

---

## 🗂️ Estrutura do projeto

```
bike-captacao/
├── public/
│   └── index.html
├── src/
│   ├── steps/
│   │   ├── Step1.jsx      # Contato (nome, WhatsApp, cidade)
│   │   ├── Step2.jsx      # Dados da bike (marca, modelo, tipo)
│   │   ├── Step3.jsx      # Componentes (suspensão, freios...)
│   │   └── Step4.jsx      # Upload de fotos + guia visual
│   ├── components/
│   │   └── SuccessScreen.jsx   # Tela final + descrição gerada
│   ├── lib/
│   │   └── supabase.js    # Client, upload, save, generateDescription
│   ├── App.jsx            # Lógica multi-step + submit
│   ├── App.css            # Todo o design
│   └── index.js           # Entry point
├── .env.example
└── package.json
```

---

## ✏️ 7. Personalizar a descrição gerada

Edite a função `generateDescription` em `src/lib/supabase.js`.
O template atual gera:

```
🚲 SCOTT SPARK 960 2023

📐 Quadro: Spark 960 M
🔧 Suspensão: Fox 36 Factory 160mm
🛑 Freios: Shimano XT 4 pistões
⚙️ Relação: Shimano XT 12v
🔵 Rodas: DT Swiss XM1700 29"
➕ Extras: Selim retrátil Bikeyoke

💰 R$ 18000
📍 Belo Horizonte - MG

📩 Interesse? Chama no direct ou no link da bio!
```

---

## 🔒 Segurança

- A `anon_key` é segura para uso no frontend — só permite inserção
- Para leitura/edição, use sempre a `service_role` key apenas server-side
- RLS está habilitado para proteger dados dos clientes
