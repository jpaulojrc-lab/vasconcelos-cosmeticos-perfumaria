# vasconcelos Presente — Plano de Implementação: Alta Perfumaria & Blindagem de Segurança

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar o e-commerce "vasconcelos Presente" em uma boutique de alta perfumaria de nível internacional, elevando a identidade visual com estética de luxo e implementando camadas defensivas de segurança técnica e conformidade de checkout.

**Architecture:** A modernização ocorre em duas etapas integradas: primeiro, aprimoramento do design system (Tailwind v4 e Motion v12) nos componentes visuais-chave (Hero, Cards, Catálogo, Header e CartDrawer); segundo, blindagem técnica com middleware de headers defensivos e CSP no Express (`server.ts`), utilitário de sanitização e validação de cartão de crédito no client (`CheckoutModal.tsx` e `security.ts`), mantendo a Lisa 100% ativa.

**Tech Stack:** React 19, Tailwind CSS v4, Motion v12 (`motion/react`), TypeScript, Lucide React, Express (`server.ts`), Vite.

**Spec:** `docs/superpowers/specs/2026-10-28-luxo-e-seguranca-design.md`

## Global Constraints

- Preservar 100% da reatividade do `StoreContext`, lista de produtos, categorias e carrinho.
- Manter a cachorrinha Lisa integrada com perfeição ao novo design sem alterar seu charme.
- Respeitar estritamente a preferência de acessibilidade `prefers-reduced-motion`.
- Garantir contraste mínimo WCAG AA em textos, botões e valores de produtos.
- O CSP (*Content Security Policy*) no Express deve permitir explicitamente scripts e HMR do Vite, fontes do Google (`fonts.googleapis.com`, `fonts.gstatic.com`) e imagens do Unsplash (`images.unsplash.com`).
- Nenhuma dependência externa nova além das bibliotecas já instaladas.

## Review Focus

1. **CSP sem quebrar Vite/Fontes**: Verificar se o Content-Security-Policy permite o carregamento de fontes e o HMR do Vite sem gerar alertas no console.
2. **Performance de Animações**: Garantir 60fps em dispositivos móveis e desktops, utilizando apenas propriedades aceleradas por GPU (`transform`, `opacity`, `backdrop-filter`).
3. **Validação de Cartão sem Bloqueio Indevido**: A validação de Luhn deve aceitar números válidos de teste e rejeitar sequências incorretas com mensagem amigável e elegante.
4. **Sanitização de XSS**: Strings com caracteres especiais ou tags `<script>` não devem quebrar o chat nem as buscas do catálogo.
5. **Responsividade em Telas Pequenas**: Garantir que os novos elementos de luxo (contagem regressiva do hero, badges e gaveta da sacola) não transbordem em larguras de celular (360px a 420px).

---

### Task 1: Design System & Tokens de Alta Perfumaria no CSS

**Files:**
- Modify: `src/index.css`

**Interfaces:**
- Produces: Classes utilitárias e tokens de luxo (`font-serif-luxury`, `font-display`, `text-gold-gradient`, `bg-gold-gradient`, `shimmer-gold`, `glow-amber-subtle`, `glass-luxury`, `shadow-velvet`).

- [ ] **Step 1: Expandir `src/index.css` com estilos de alta perfumaria**
  - Adicionar `@keyframes shimmer` refinado para reflexos metálicos suaves.
  - Implementar classes para sombra aveludada (`shadow-velvet-lg`), brilho suave de frasco de perfume (`glow-amber-subtle`), gradientes de ouro champagne e bordas acetinadas.
  - Garantir suporte e fallback para tipografia serifada e display.

- [ ] **Step 2: Verificar compilação do CSS e tipagem**
  - Run: `npm run lint`
  - Expected: Código 0, sem erros.

- [ ] **Step 3: Commit**
  ```bash
  git add src/index.css
  git commit -m "style: expandir design tokens e classes de alta perfumaria"
  ```

---

### Task 2: Hero Banner com Atmosfera Imersiva & Ambient Glow

**Files:**
- Modify: `src/components/HeroBanner.tsx`

**Interfaces:**
- Consumes: `useStore()` (categorias, navegação)
- Produces: Hero imersivo com luz ambiente, tipografia serifada, contagem regressiva em glassmorphism dourado e animações escalonadas (`stagger`) com `motion/react`.

- [ ] **Step 1: Refatorar `HeroBanner.tsx`**
  - Adicionar luz ambiente flutuante (*ambient glow*) difusa com gradiente âmbar/ouro simulando a aura de perfumes raros.
  - Aplicar tipografia serifada de alta perfumaria no título principal com acabamento editorial.
  - Refinar o card do temporizador de ofertas relâmpago com vidro fosco escurecido, bordas douradas sutis e números elegantes.
  - Animar os elementos com `motion.div` em entrada escalonada suave.

- [ ] **Step 2: Verificar compilação**
  - Run: `npm run lint` e `npm run build`
  - Expected: Ambos com código 0.

- [ ] **Step 3: Commit**
  ```bash
  git add src/components/HeroBanner.tsx
  git commit -m "feat(hero): atmosfera imersiva de alta perfumaria com ambient glow e motion"
  ```

---

### Task 3: Cards de Produto & Catálogo com Microinterações Táteis

**Files:**
- Modify: `src/components/ProductCard.tsx`
- Modify: `src/components/ProductCatalog.tsx`

**Interfaces:**
- Consumes: `Product` object, `useStore()`
- Produces: Cards com elevação sutil em hover, microinterações elásticas em botões e corações, e seletores de catálogo com estética minimalista de boutique.

- [ ] **Step 1: Aprimorar `ProductCard.tsx` com acabamento de boutique**
  - Adicionar elevação suave no card com borda sutil iluminada em hover.
  - Inserir microinteração tátil de mola no botão de compra rápida (`whileTap={{ scale: 0.95 }}`) e animação de batimento no coração de favoritos.
  - Adicionar badge acetinado de desconto e etiquetas refinadas ("Best-Seller", "Alta Fixação").

- [ ] **Step 2: Polir cabeçalho e seletores no `ProductCatalog.tsx`**
  - Alinhar contadores de produtos, filtros e ordenação com tipografia leve e sofisticada.

- [ ] **Step 3: Verificar integridade**
  - Run: `npm run lint` e `npm run build`
  - Expected: Saída limpa com código 0.

- [ ] **Step 4: Commit**
  ```bash
  git add src/components/ProductCard.tsx src/components/ProductCatalog.tsx
  git commit -m "feat(catalog): cards de produto com microinterações táteis e acabamento premium"
  ```

---

### Task 4: Header Translúcido & Gaveta de Sacola (CartDrawer) de Luxo

**Files:**
- Modify: `src/components/Header.tsx`
- Modify: `src/components/CartDrawer.tsx`

**Interfaces:**
- Consumes: `useStore()` (cart, isCartOpen, setIsCartOpen)
- Produces: Header fixo com desfoque no scroll (*backdrop-blur*) e CartDrawer com barra de frete dinâmico dourado e selos de exclusividade.

- [ ] **Step 1: Elevar o visual do `Header.tsx`**
  - Refinar o efeito de vidro translúcido ao rolar a página.
  - Inserir microinteração suave no badge da sacola quando itens forem adicionados.

- [ ] **Step 2: Refatorar o `CartDrawer.tsx`**
  - Barra de progresso para Frete Grátis com gradiente de ouro champagne e animação fluida.
  - Inserir selo de garantia de satisfação e autenticidade 100% comprovada no rodapé da sacola.

- [ ] **Step 3: Verificar compilação**
  - Run: `npm run lint` e `npm run build`
  - Expected: Ambos com código 0.

- [ ] **Step 4: Commit**
  ```bash
  git add src/components/Header.tsx src/components/CartDrawer.tsx
  git commit -m "feat(cart): header translúcido e sacola de compras com padrão de boutique de luxo"
  ```

---

### Task 5: Utilitário de Segurança (Sanitização XSS & Validação de Luhn)

**Files:**
- Create: `src/utils/security.ts`

**Interfaces:**
- Produces:
  ```ts
  export function sanitizeText(input: string): string;
  export function isValidCreditCardNumber(cardNumber: string): boolean;
  export function maskSensitiveData(input: string, visibleDigits?: number): string;
  ```

- [ ] **Step 1: Implementar `src/utils/security.ts`**
  - `sanitizeText`: Remove tags HTML, caracteres perigosos e sequências de script maliciosas.
  - `isValidCreditCardNumber`: Algoritmo matemático de Luhn para validação de números de cartão (13 a 19 dígitos).
  - `maskSensitiveData`: Mascara números de cartão e documentos deixando visíveis apenas os últimos 4 dígitos.

- [ ] **Step 2: Verificar tipagem**
  - Run: `npm run lint`
  - Expected: Saída sem erros.

- [ ] **Step 3: Commit**
  ```bash
  git add src/utils/security.ts
  git commit -m "feat(security): utilitários de sanitização XSS, validação de Luhn e mascaramento de dados"
  ```

---

### Task 6: Blindagem de Segurança no Servidor Express (`server.ts`)

**Files:**
- Modify: `server.ts`

**Interfaces:**
- Produces: Middleware de Security Headers e política defensiva de Content-Security-Policy (CSP) no Express.

- [ ] **Step 1: Inserir middleware de Security Headers em `server.ts`**
  - Adicionar headers defensivos:
    - `X-Content-Type-Options: nosniff`
    - `X-Frame-Options: DENY`
    - `X-XSS-Protection: 1; mode=block`
    - `Referrer-Policy: strict-origin-when-cross-origin`
    - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
  - Adicionar Content-Security-Policy (CSP) com diretivas adequadas para desenvolvimento e produção (permitindo Vite, scripts inline controlados, Google Fonts, Unsplash e WebSockets HMR).

- [ ] **Step 2: Sanitização de endpoints de API**
  - Aplicar sanitização nos textos recebidos no endpoint do chat de IA (`/api/ai-chat`) e em requisições de consulta.

- [ ] **Step 3: Verificar compilação e execução**
  - Run: `npm run build`
  - Expected: Saída limpa com código 0.

- [ ] **Step 4: Commit**
  ```bash
  git add server.ts
  git commit -m "security(server): implementar security headers, CSP defensivo e sanitização de payloads"
  ```

---

### Task 7: Checkout Seguro com Validação Real e Selos de Confiança

**Files:**
- Modify: `src/components/CheckoutModal.tsx`
- Modify: `src/components/Footer.tsx`

**Interfaces:**
- Consumes: `src/utils/security.ts` (`sanitizeText`, `isValidCreditCardNumber`, `maskSensitiveData`)
- Produces: Checkout blindado com validação em tempo real de cartão de crédito e selos oficiais de garantia no Checkout e Footer.

- [ ] **Step 1: Atualizar `CheckoutModal.tsx`**
  - Integrar sanitização nos campos de texto (nome, endereço, cupom).
  - Integrar validação de cartão via algoritmo de Luhn com feedback visual elegante (borda verde/âmbar e mensagem explicativa).
  - Inserir selos visuais de Criptografia SSL 256 bits, Compra Protegida e Garantia de Autenticidade no resumo de pagamento.

- [ ] **Step 2: Atualizar `Footer.tsx`**
  - Adicionar barra de segurança com badges de certificação SSL, proteção de dados e garantia vasconcelos de procedência 100% original.

- [ ] **Step 3: Verificar integridade**
  - Run: `npm run lint` e `npm run build`
  - Expected: Código 0 em ambos.

- [ ] **Step 4: Commit**
  ```bash
  git add src/components/CheckoutModal.tsx src/components/Footer.tsx
  git commit -m "feat(checkout-footer): validação de Luhn no cartão, sanitização e selos de segurança SSL"
  ```

---

### Task 8: Verificação Completa e Teste Visual Integrado

**Files:**
- Verify: Todos os arquivos modificados

- [ ] **Step 1: Verificação de Tipos e Build de Produção**
  - Run: `npm run lint` e `npm run build`
  - Expected: Sucesso total sem warnings críticos ou erros.

- [ ] **Step 2: Validação Visual no Navegador**
  - Verificar harmonia visual do Hero, Cards, Sacola e a persistência da Lisa com seus movimentos adoráveis.
  - Testar o fluxo de checkout com simulação de cartão de crédito.
