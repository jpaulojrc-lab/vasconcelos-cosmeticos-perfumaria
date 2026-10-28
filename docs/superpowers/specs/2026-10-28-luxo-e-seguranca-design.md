# Design Spec: vasconcelos Presente — Haute Parfumerie & Blindagem de Segurança

## 1. Intenção & Porquê
Elevar o e-commerce "vasconcelos Presente" para um patamar de excelência estética e técnica de boutique internacional de alta perfumaria e cosméticos. O objetivo é duplo:
1. **Percepção de Valor Imediata**: Criar uma experiência visual de alto padrão inspirada em marcas consagradas (Chanel, Dior, Jo Malone, Le Labo), com tipografia nobre, iluminação ambiente sutil, paleta aveludada e microinterações táteis.
2. **Confiança & Robustez**: Proteger o cliente e a plataforma através de práticas essenciais de segurança da informação (HTTP security headers, Content Security Policy, sanitização contra XSS e validações rigorosas de checkout).

---

## 2. Metas, Não-Metas & Anti-Metas

### Metas (Goals)
- **Fase 1 — Visual & Estética de Luxo**:
  - Implantação de sistema tipográfico nobre (Playfair Display / Syne / Plus Jakarta Sans) já carregado no `index.html`.
  - Hero Banner imersivo com atmosfera de campanha de alta costura, iluminação flutuante (*ambient glow*), tipografia serifada e contagem regressiva de ofertas em vidro acetinado (*glassmorphism*).
  - Cards de produto com feedback tátil de elevação, microinteração em botões de compra e wishlist com animação elástica (*spring physics*).
  - Header translúcido com desfoque de fundo no scroll (*backdrop-blur*) e gaveta de sacola (*CartDrawer*) com barra de progresso de frete em gradiente dourado e selos de exclusividade.
  - Harmonia contínua com a Lisa no atendimento virtual, integrando-a com sutileza à paleta de luxo.
- **Fase 2 — Segurança & Robustez Técnica**:
  - Implementação de cabeçalhos HTTP defensivos no Express (`server.ts`): `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` e CSP (*Content Security Policy*) compatível com Vite, Google Fonts e imagens do Unsplash.
  - Sanitização de entradas textuais no chat e na busca de produtos para mitigar riscos de injeção de código ou tags HTML maliciosas.
  - Validação estrita de dados no `CheckoutModal`: validação do algoritmo de Luhn para números de cartão de crédito, máscaras seguras e selos visuais de autenticidade (Criptografia SSL 256 bits, Compra Protegida, Satisfação Garantida).
  - Rate limiting simples em rotas de API para evitar abusos no chat de IA ou scraping descontrolado.

### Não-Metas (Non-Goals)
- Não alterar a arquitetura reativa do `StoreContext` ou o formato de dados dos produtos.
- Não descaracterizar a cachorrinha Lisa ou remover suas animações fofas de atendimento.
- Não introduzir frameworks pesados ou ferramentas de build alternativas que quebrem a inicialização rápida com Vite/tsx.

### Anti-Metas (Anti-Goals)
- **Anti-Gold Rush**: Não exagerar no uso de dourados espelhados ou brilhos piscantes que empobreçam o visual com estética "brega" ou amadora. O luxo contemporâneo prima pelo equilíbrio, espaço em branco, tipografia impecável e toques acetinados.
- **Anti-Lockout**: Não configurar CSP excessivamente restritivo que bloqueie o carregamento de fontes do Google, imagens de CDN ou o Hot Module Replacement (HMR) em ambiente de desenvolvimento.

---

## 3. Restrições (Constraints)
- Stack: React 19, TypeScript, Tailwind CSS v4, Motion v12 (`motion/react`), Express no backend (`server.ts`).
- Compatibilidade: 100% responsivo (Mobile First até telas ultrawide 4K).
- Acessibilidade: Respeito obrigatório a `prefers-reduced-motion` e contraste mínimo WCAG AA em textos de preço e botões.

---

## 4. Abordagens Consideradas
- **Opção 1: Design System "Haute Parfumerie" & Blindagem Progressiva (ESCOLHIDA)**:
  - *Abordagem*: Evolução em duas fases coesas — refinamento visual de luxo nos componentes-chave, seguido de hardening de segurança no Express e formulários.
  - *Trade-off*: Exige coordenação entre frontend e backend Express, mas entrega o resultado mais profissional e completo.
- **Opção 2: Dark Luxury Noir Absoluto (Descartada)**:
  - *Trade-off*: O fundo 100% preto cansa o usuário em navegação longa e prejudica o contraste da linha de skincare facial.
- **Opção 3: Minimalismo Clean & Segurança Apenas no Client (Descartada)**:
  - *Trade-off*: Deixa o servidor desprotegido contra clickjacking/MIME-sniffing e perde o calor e a assinatura aromática da marca vasconcelos.

---

## 5. Arquitetura da Solução & Decisões de Design

### 5.1 Design Tokens & Tipografia (`index.html` & `src/index.css`)
- **Títulos & Citações**: `Playfair Display` (serif clássica, elegante) e `Syne` (display contemporânea para destaques de marca).
- **Corpo & Preços**: `Plus Jakarta Sans` (alta legibilidade em telas móveis e microdetalhes).
- **Tokens Visuais**:
  - `bg-luxury-pearl`: `#FAF8F5` (fundo suave perolado).
  - `bg-velvet-noir`: `linear-gradient(145deg, #181514 0%, #0d0c0b 100%)`.
  - `gold-satin`: gradientes metálicos suaves de ouro champagne (`#DFBA73` a `#C5A059`).
  - `glass-luxury`: `rgba(255, 255, 255, 0.78)` com `backdrop-filter: blur(12px)`.

### 5.2 Componentes Visuais de Alto Impacto
- **HeroBanner**: Banner escuro com iluminação âmbar difusa, badge em pílula de alta costura, contagem regressiva em glassmorphism fosco e tipografia de revista de luxo.
- **ProductCard**: Cartões com cantos arredondados generosos (`rounded-2xl`), sobreposição sutil de iluminação em hover, botão de compra com microinteração de mola e badge de desconto dourado.
- **Header & CartDrawer**: Navegação fluida com indicador dinâmico, gaveta com barra dourada de frete grátis e visual limpo com selo de garantia.

### 5.3 Camada de Segurança e Robustez Técnica (`server.ts` e Client)
- **Security Headers no Express**:
  ```ts
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  ```
- **CSP (Content-Security-Policy)**:
  - Permitir `self`, scripts Vite, fontes `fonts.googleapis.com` / `fonts.gstatic.com`, imagens `images.unsplash.com` e dados de imagem em base64.
- **Sanitização de Inputs**:
  - Função utilitária no client para higienizar strings de pesquisa e mensagens de chat, impedindo injeção de `<script>` ou HTML arbitrário.
- **Validação de Cartão no Checkout**:
  - Algoritmo de Luhn para validação matemática de dígitos do cartão antes da submissão fictícia, garantindo sensação e comportamento de e-commerce real.

---

## 6. O que fica a critério do Construtor (Builder)
- Constantes exatas de física de mola (`damping: 20-30`, `stiffness: 250-350`) no Motion.
- Posicionamento específico dos ícones de segurança na barra de benefícios do rodapé e checkout.
