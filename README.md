# EMS Logística — website institucional

Site institucional da **EMS Logística**: logística, gestão de fretes e transporte rodoviário de cargas.
Inclui a **jornada logística 2D em preto e branco** (animação SVG + GSAP), formulários de cotação, contato e
currículos com envio real por e-mail, SEO técnico e páginas de privacidade e 404.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · GSAP 3 · Nodemailer/Resend.

---

## Como rodar

```bash
npm install
cp .env.example .env.local   # preencha as variáveis (ver abaixo)
npm run dev                  # http://localhost:3000
```

| Comando             | O que faz                               |
| ------------------- | --------------------------------------- |
| `npm run dev`       | servidor de desenvolvimento             |
| `npm run build`     | build de produção                       |
| `npm start`         | serve o build de produção               |
| `npm run typecheck` | verificação de tipos (TypeScript)       |

Requer Node.js 20.9 ou superior.

---

## Configuração

### Dados da empresa — `src/config/site.ts`

Tudo o que depende de confirmação da EMS fica centralizado nesse arquivo. Campos vazios (`""`) ou `null`
são tratados como **não configurados**: o site oculta o elemento ou mostra uma alternativa honesta, nunca um
dado fictício.

| Campo                         | Efeito quando preenchido                                         |
| ----------------------------- | ---------------------------------------------------------------- |
| `contact.whatsapp`            | ativa o botão flutuante e os atalhos de WhatsApp (formato `5575999999999`) |
| `contact.whatsappDisplay`     | número formatado exibido no rodapé e no contato                  |
| `contact.email`               | e-mail público no rodapé e na página de contato                  |
| `contact.address`             | endereço no rodapé e na página de contato                        |
| `contact.instagram`           | perfil do Instagram da EMS Logística (vazio = links ocultos)    |
| `hero.video` / `hero.image`   | substitui a composição provisória da hero pela mídia final       |
| `showPendingMediaBadges`      | exibe/oculta os selos "Fotografia pendente"                     |

### Envio dos formulários — variáveis de ambiente

Veja `.env.example`. Defina **destino e remetente** e **um** provedor:

- `FORMS_TO_EMAIL`, `FORMS_FROM_EMAIL`
- Opção A: `RESEND_API_KEY` (Resend)
- Opção B: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE`
- `NEXT_PUBLIC_SITE_URL`: domínio público (usado em canonical, sitemap, robots e Open Graph)

Sem provedor configurado, as rotas respondem `503 not_configured` e o formulário informa que **a mensagem não
foi enviada**, oferecendo WhatsApp (se configurado) e Instagram. O site **nunca simula** um envio.

### Mídia da hero

Coloque os arquivos em `public/media/` e preencha `site.hero`:

```ts
hero: {
  video: { mp4: "/media/hero.mp4", webm: "/media/hero.webm", poster: "/media/hero-poster.jpg" },
  image: null,
},
```

Mídia esperada: caminhão-baú **fotorealista** com a marca EMS na lateral, rodovia brasileira ao pôr do sol,
enquadramento lateral-traseiro, vídeo curto sem áudio e em loop, com imagem de fallback.

As imagens das soluções ficam em `src/components/sections/Solutions.tsx` (`image`). Use somente fotografias reais ou autorizadas, sem apresentar modelos de banco de imagens como equipe.

---

## Estrutura

```
src/
  app/                      rotas (home, cotacao, contato, trabalhe-conosco, politica-de-privacidade),
                            API dos formulários, 404, robots, sitemap, ícone e imagem Open Graph
  config/site.ts            dados centrais da empresa
  components/
    brand/                  logo vetorial (monograma, assinatura, versão em string SVG)
    journey/                jornada 2D (ver abaixo)
    scenes/                 cenas guiadas pela rolagem: estrada com a carreta 3D (three.js, carregado
                            sob demanda), o baú cuja porta abre nas Soluções e a assinatura EMS que se
                            monta em "A EMS" (a seta é desenhada primeiro, depois surgem as letras)
    sections/               seções da home e cabeçalhos de páginas internas
    layout/                 Header, Footer, WhatsAppFloat
    forms/                  QuoteForm, ContactForm, CareersForm e utilitários
    ui/                     Reveal, ButtonLink, MediaSlot
  lib/
    validation.ts           regras compartilhadas entre navegador e servidor
    mailer.ts               envio por Resend ou SMTP
    api-guard.ts            limite de tentativas, verificação de origem
```

---

## Jornada logística 2D

Animação vetorial **exclusivamente em preto, branco e cinzas**, com **um único caminhão** sempre em **vista
lateral de 90° apontando para a direita**. A câmera acompanha o caminhão em side-scrolling com parallax.

| Componente        | Papel                                                            |
| ----------------- | ---------------------------------------------------------------- |
| `Truck`           | caminhão mestre (rodas, faróis, luz de freio, logo monocromática) |
| `Road`            | pista, faixas, placas e postes                                   |
| `TollBooth`       | praça de pedágio e cancela                                       |
| `TrafficLight`    | semáforo monocromático (PARE / SIGA, sem cor)                    |
| `Ferry`           | balsa, rampas, rio e ondas                                       |
| `FuelStation`     | posto, bomba, mangueira e indicador de abastecimento             |
| `Warehouse`       | galpões de origem e destino, portões e doca                      |
| `JourneyAnimation`| timeline principal, controles, progresso e acessibilidade        |

**Ajustes:** velocidades, durações, distâncias e enquadramentos ficam em `src/components/journey/config.ts`.
O plano físico (`plan.ts`) calcula a posição de cada cenário a partir das paradas, e a timeline
(`timeline.ts`) anima um único objeto de estado que é desenhado de forma determinística, o que deixa a pausa,
o reinício e o pulo exatos.

**Comportamento:**

- abre com a revelação da marca e uma transição em íris, seguida de seis cenas: partida, pedágio, semáforo,
  travessia, abastecimento e destino (~34 s);
- inicia sozinha na primeira vez que a seção fica ≥ 35% visível; pausa ao sair da tela e retoma ao voltar;
  não reinicia sozinha e não bloqueia a rolagem;
- **Pausar/Continuar**, **Reiniciar** e **Pular animação**; as etapas da barra de progresso são clicáveis;
- as rodas giram só quando o caminhão anda sobre a pista (paradas e travessia na balsa: rodas imóveis);
- com `prefers-reduced-motion: reduce`, exibe quadros estáticos de cada etapa com avanço manual;
- sem áudio; viewBox responsivo (desktop, tablet, celular) mantendo sempre o perfil lateral.

Depuração: `/?jt=12.5` posiciona a animação no segundo 12,5 (pausada).

---

## Segurança e privacidade

- Validação no navegador **e** no servidor (`lib/validation.ts`).
- Honeypot invisível, verificação de origem e limite de 5 envios a cada 10 minutos por IP.
  O limite fica em memória e vale por instância; em hospedagem serverless, prefira Redis/Upstash.
- Currículos: somente PDF até 5 MB, com assinatura `%PDF-` verificada, enviados **apenas como anexo** do e-mail
  interno. Nada é gravado em disco nem exposto em URL pública.
- Consentimento LGPD explícito em todos os formulários e política de privacidade em `/politica-de-privacidade`.
- Cabeçalhos de segurança em `next.config.ts`.

---

## Pendências e itens a validar com a EMS

- [ ] **Hero:** vídeo/foto fotorealista do caminhão com a marca EMS (hoje há uma composição provisória identificada).
- [ ] **Fotografias** das soluções (hoje com selos "Fotografia pendente").
- [ ] **WhatsApp comercial, e-mail e endereço** oficiais.
- [ ] **Instagram:** preencher `contact.instagram` com o perfil próprio da EMS Logística (não usar o da EMS Consultoria, que é outra empresa). Enquanto vazio, os links ficam ocultos.
- [ ] **Assinatura da marca:** a logo é uma reconstrução vetorial do monograma EMS com o descritor "LOGÍSTICA". Validar com a versão oficial.
- [ ] **Textos comerciais** das soluções: revisar afirmações específicas.
- [ ] **Política de privacidade:** preencher os campos `[a confirmar]` (razão social, CNPJ, endereço, encarregado, prazos, provedor de e-mail) e submeter à revisão jurídica.
- [ ] **Domínio** (`NEXT_PUBLIC_SITE_URL`) e **provedor de e-mail** em produção.
