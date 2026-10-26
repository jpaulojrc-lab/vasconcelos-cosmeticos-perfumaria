# Plano de Implementação: Visual & Efeitos de Alta Perfumaria de Luxo

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevar a experiência visual e de efeitos do e-commerce "vasconcelos Presente" para um padrão internacional de perfumaria de nicho e cosméticos de luxo, implementando microinterações fluidas com `motion`, paleta refinada (champanhe, ouro suave, ônix profundo e veludo), componentes responsivos com feedback tátil e iluminação sutil (shimmer & glow).

**Architecture:** Aprimoramento da camada visual através de design tokens refinados no Tailwind v4 e CSS customizado, integração do `motion/react` para orquestração de transições suaves (fade up, spring physics, hover 3D sutil) no catálogo, hero, categorias e gaveta de compras, sem alterar a lógica de dados ou regras de negócio existentes.

**Tech Stack:** React 19, Tailwind CSS v4, Motion (v12), Lucide React, Canvas Confetti, Vite.

**Spec:** Baseado na solicitação de melhoria visual e efeitos de alto padrão para a loja de alta perfumaria e cosméticos vasconcelos Presente.

## Global Constraints

- Preservar 100% da compatibilidade com o StoreContext e lógica de carrinho/favoritos/modais existentes.
- Garantir 60fps constantes nas animações utilizando aceleração de hardware (`transform`, `opacity`, `backdrop-filter`).
- Manter responsividade total (Mobile First + Desktop imersivo).
- Respeitar preferências de acessibilidade (`prefers-reduced-motion`).

## Review Focus

1. **Desempenho em dispositivos móveis**: Animações de entrada e transições de cards não devem causar travamentos ou jank em conexões móveis.
2. **Importação correta do Motion**: Garantir que as importações utilizem `motion/react` compatível com Motion v12 e React 19.
3. **Legibilidade e Contraste**: Garantir que novos gradientes dourados e fundos escuros do Hero mantenham contraste WCAG AA para textos e preços.
4. **Comportamento da Gaveta de Carrinho (CartDrawer)**: A animação de abertura e fechamento com AnimatePresence deve abrir e fechar limpamente sem flickering.
5. **Feedback tátil de compra**: Ao clicar em favoritar ou adicionar ao carrinho, a microinteração deve fornecer feedback visual instantâneo e prazeroso.

---

### Task 1: Design System & Tokens de Luxo no CSS

**Files:**
- Modify: `src/index.css`
- Modify: `index.html`

**Interfaces:**
- Produces: Classes utilitárias de luxo (`luxury-gradient`, `shimmer-gold`, `glow-champagne`, `glass-luxury`, `border-gold-subtle`) e fontes otimizadas.

- [ ] **Step 1: Adicionar estilos de brilho dourado, glassmorphism de alta perfumaria e transições no `src/index.css`**
  - Implementar classes para `@keyframes shimmer`, glow sutil de frascos de perfume, sombras aveludadas e gradientes metálicos refinados.
- [ ] **Step 2: Verificar renderização e classes no build**
  - Executar checagem de estilo e validação de síntaxe CSS.

---

### Task 2: Hero Banner com Atmosfera Imersiva & Motion

**Files:**
- Modify: `src/components/HeroBanner.tsx`

**Interfaces:**
- Consumes: `useStore()` (categorias, navegação)
- Produces: Hero redesenhado com iluminação ambiente, tipografia refinada, contagem regressiva em glassmorphism dourado e animações de entrada com `motion`.

- [ ] **Step 1: Refatorar HeroBanner com Motion**
  - Adicionar `motion.div` com animações escalonadas (stagger) para o badge de exclusividade, título com serif de alta perfumaria, subtítulo e botões de ação.
  - Adicionar efeito de luz ambiente flutuante (floating ambient glow) simulando a luminosidade de frascos de perfume.
  - Polir o timer de ofertas relâmpago com cartões de vidro escurecido com bordas acetinadas.
- [ ] **Step 2: Testar interatividade dos botões e timer**
  - Verificar se a contagem regressiva continua fluida e o scroll até o catálogo funciona suavemente.

---

### Task 3: Cards de Produto & Catálogo com Microinterações e Shimmer

**Files:**
- Modify: `src/components/ProductCard.tsx`
- Modify: `src/components/ProductCatalog.tsx`

**Interfaces:**
- Consumes: `Product` object, `useStore()`
- Produces: Cards com elevação sutil em hover, revelação de detalhes e botões de ação com feedback de clique e animação no coração de favoritos.

- [ ] **Step 1: Atualizar ProductCard com Motion e acabamento premium**
  - Adicionar animações de entrada com `motion.div` ao entrar no campo de visão (viewport).
  - Adicionar microinteração com mola (`whileTap={{ scale: 0.95 }}`) no botão de compra e coração de wishlist.
  - Implementar etiqueta de desconto e badges ("Best-Seller", "Novo") com brilho dourado acetinado.
- [ ] **Step 2: Adicionar cabeçalho e filtros refinados no ProductCatalog**
  - Polir os seletores de ordenação e visualização com design minimalista de boutique.

---

### Task 4: Navegação de Categorias & Barra de Ofertas Relâmpago

**Files:**
- Modify: `src/components/CategoryNav.tsx`
- Modify: `src/components/FlashOffers.tsx`

**Interfaces:**
- Consumes: `selectedCategory`, `setSelectedCategory`, `products`
- Produces: Pílulas de categoria com indicador ativo animado e vitrine de ofertas relâmpago com badges de urgência elegantes.

- [ ] **Step 1: Melhorar CategoryNav com animação de seleção suave**
  - Adicionar pílulas com visual luxuoso (fundo creme perolado, borda dourada em hover, badge sutil com contagem).
- [ ] **Step 2: Elevar o visual do FlashOffers**
  - Inserir barra de progresso visual de estoque elegante e timer destacado para ofertas relâmpago.

---

### Task 5: Header & Gaveta do Carrinho (CartDrawer)

**Files:**
- Modify: `src/components/Header.tsx`
- Modify: `src/components/CartDrawer.tsx`

**Interfaces:**
- Consumes: `useStore()` (cart, isCartOpen, setIsCartOpen)
- Produces: Header fixo translúcido com efeito de desfoque (blur) no scroll e CartDrawer com transição deslizante suave usando `AnimatePresence`.

- [ ] **Step 1: Aprimorar Header com barra superior rotativa e efeito glassmorphic**
  - Barra de benefícios superior com ícones finos e rotação elegante de vantagens exclusivas.
  - Ícone de sacola com badge saltitante com `motion.span` quando itens são adicionados.
- [ ] **Step 2: CartDrawer com AnimatePresence e transição de mola**
  - Animação de entrada e saída fluida e barra de frete grátis com gradiente dourado animado.

---

### Task 6: Validação Visual e Teste de Navegação no Navegador

**Files:**
- Verify: Todos os componentes modificados

- [ ] **Step 1: Iniciar servidor de desenvolvimento e verificar compilação**
- [ ] **Step 2: Validar visual no navegador garantindo ausência de erros no console**
