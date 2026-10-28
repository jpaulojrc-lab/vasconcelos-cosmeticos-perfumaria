# Lisa, a Cachorrinha do Assistente Virtual — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir a "Sofia" pela Lisa (cachorrinha da ilustração `Lisa.jpeg`) no assistente virtual, com avatar em foto e movimentos fofos de cachorro.

**Architecture:** Um componente novo `LisaAvatar` encapsula o recorte circular da foto e os movimentos (`motion/react`). `LiveChatWidget.tsx` passa a usá-lo no botão flutuante, cabeçalho, mensagens e indicador "digitando", e ganha os textos da Lisa. Decorações (corações, patinha, balão "au au!") ficam em um segundo componente pequeno, `LisaDecor`. A lógica de respostas (`generateBotReply`) não muda.

**Tech Stack:** React 19, Tailwind CSS v4, Motion v12 (`motion/react`), Lucide React, Vite (servido por `server.ts`). Sem dependências novas.

**Spec:** `docs/superpowers/specs/2026-10-27-lisa-assistente-virtual-design.md`

## Global Constraints

- Lisa substitui a Sofia por completo: nome, textos e tom (carinhoso, toques sutis de cachorrinha como "au!" e 🐾, sem perder o ar de alta perfumaria).
- Abordagem A: foto recortada, movimentos no avatar inteiro. Sem camadas, sem imagens geradas.
- Nenhuma dependência nova; usar apenas `motion/react`.
- Copiar `Lisa.jpeg` para `public/lisa.jpeg`; o arquivo original na raiz não é alterado nem apagado.
- Recortar só o rostinho via CSS (`object-fit: cover` + `object-position`, círculo).
- Respeitar `prefers-reduced-motion` (usar `useReducedMotion` de `motion/react`).
- Não alterar `generateBotReply`, intenções, cupons, rastreio ou frete.
- Não mexer nos arquivos do plano visual anterior (`2026-10-26-luxo-e-efeitos-perfumaria.md`).
- Não há framework de testes no projeto e o spec proíbe dependências novas: a verificação é `npm run lint` (tsc), `npm run build` e checagem visual no navegador.

## Review Focus

1. **Foto não carrega:** se `/lisa.jpeg` falhar, o avatar mostra um círculo dourado com a letra "L" em vez de imagem quebrada.
2. **Movimento reduzido:** com `prefers-reduced-motion`, nada se move (sem respiração, pulinho, balanço, corações flutuantes).
3. **Celular:** botão flutuante, balão "au au!" e janela do chat (94vw) não cobrem a barra inferior nem estouram a tela.
4. **Pulinho só em mensagem nova:** re-render do chat não repete o pulinho dos avatares de mensagens antigas.
5. **Custo de animação:** apenas o avatar do cabeçalho e o do botão flutuante têm loop infinito; avatares de mensagens e corações não ficam animando para sempre.

---

### Task 1: Asset e componente `LisaAvatar`

**Files:**
- Create: `public/lisa.jpeg` (cópia de `Lisa.jpeg`)
- Create: `src/components/LisaAvatar.tsx`

**Interfaces:**
- Produces:
  ```ts
  export type LisaMood = 'idle' | 'listening';
  export interface LisaAvatarProps {
    size?: number;            // lado em px, padrão 40
    mood?: LisaMood;          // padrão 'idle'
    hopOnMount?: boolean;     // pulinho único ao montar, padrão false
    breathe?: boolean;        // respiração em loop, padrão false
    tiltOnHover?: boolean;    // inclina a cabecinha no hover, padrão false
    className?: string;       // classes extras no contêiner circular
  }
  export const LisaAvatar: React.FC<LisaAvatarProps>;
  ```

- [ ] **Step 1: Copiar a imagem**

Run: `Copy-Item Lisa.jpeg public/lisa.jpeg` (criar `public/` antes se não existir).
Expected: `public/lisa.jpeg` existe com o mesmo tamanho do original (166787 bytes).

- [ ] **Step 2: Implementar `LisaAvatar` em `src/components/LisaAvatar.tsx`**

Contêiner `motion.div` circular (`rounded-full overflow-hidden`, borda dourada `border-amber-400/60`, `width/height = size`) com um `<img src="/lisa.jpeg" alt="Lisa, a cachorrinha consultora">` dentro, `object-cover`. Ponto de partida do enquadramento (a imagem é 752×1392 e o rosto fica em torno de x 41%, y 42%): `object-position: 40% 33%`, `transform: scale(1.5)`, `transform-origin: 41% 50%`; ajuste olhando o resultado até o rosto ficar centralizado sem manta/notebook visíveis. Movimentos, todos desligados quando `useReducedMotion()` for `true`:
  - `breathe`: `scale` oscilando 1 → 1.04 → 1, `repeat: Infinity`, ~3s, `easeInOut`.
  - `mood="listening"`: `rotate` balançando -6° ↔ 6°, `repeat: Infinity`, ~1.2s.
  - `hopOnMount`: `y` 0 → -8 → 0 uma vez, spring curto.
  - `tiltOnHover`: `whileHover={{ rotate: -8, scale: 1.06 }}`.
Se a `<img>` disparar `onError`, trocar por um `div` com `bg-gradient-to-br from-amber-500 to-rose-600`, letra "L" branca centralizada.

- [ ] **Step 3: Verificar tipos**

Run: `npm run lint`
Expected: sai com código 0, sem erros novos.

- [ ] **Step 4: Commit**

```bash
git add public/lisa.jpeg src/components/LisaAvatar.tsx
git commit -m "feat: avatar LisaAvatar com foto recortada e movimentos"
```

---

### Task 2: Trocar Sofia por Lisa no `LiveChatWidget`

**Files:**
- Modify: `src/components/LiveChatWidget.tsx`

**Interfaces:**
- Consumes: `LisaAvatar` / `LisaAvatarProps` da Task 1.
- Produces: o widget sem nenhuma ocorrência de "Sofia" nem do "S" como avatar.

- [ ] **Step 1: Aplicar o avatar nos quatro lugares**

Importar `LisaAvatar` e substituir:
  - Botão flutuante (`<MessageCircle ... />` dentro do `motion.button`, ~linha 273): `<LisaAvatar size={40} breathe tiltOnHover />`, mantendo a bolinha verde de online.
  - Cabeçalho (`<div ... S </div>`, ~linha 301): `<LisaAvatar size={40} breathe />`, mantendo a bolinha verde.
  - Avatar de cada mensagem do bot (`<div ...> S </div>`, ~linha 365): `<LisaAvatar size={28} hopOnMount />`.
  - Indicador "digitando" (~linha 404): acrescentar `<LisaAvatar size={28} mood="listening" />` antes dos pontinhos.

- [ ] **Step 2: Trocar os textos**

Valores exatos:
  - Mensagem de boas-vindas (`msg-welcome`): `'Au, olá! 🐾 Sou a Lisa, a cachorrinha consultora de alta perfumaria e beleza da vasconcelos Presente. ✨ Como posso tornar seu dia mais especial?'`
  - Botão flutuante: `Lisa • Consultora 24h`; `aria-label="Abrir Lisa, consultora virtual"`.
  - Cabeçalho: `Lisa • Consultora vasconcelos`.
  - Digitando: `Lisa está digitando...`.
  - Em `generateBotReply`, só acrescentar `🐾` ao final do texto da saudação (item 1) e do agradecimento (item 2). Nenhuma outra resposta muda.

- [ ] **Step 3: Verificar**

Run: `npm run lint` e `npm run build`
Expected: ambos terminam com código 0.

Run: `Select-String -Path src/components/LiveChatWidget.tsx -Pattern "Sofia"`
Expected: nenhuma linha encontrada.

- [ ] **Step 4: Verificação visual**

Abrir o site (`npm run dev`), conferir botão, cabeçalho, mensagens e "digitando" com a Lisa; enviar "Bom dia" e ver o pulinho só no avatar da nova resposta; testar no tamanho de celular (largura ~375px).
Expected: rosto da Lisa centralizado e sem manta/notebook visíveis nos quatro lugares; sem pulinho repetido nas mensagens antigas.

- [ ] **Step 5: Commit**

```bash
git add src/components/LiveChatWidget.tsx
git commit -m "feat: Lisa substitui a Sofia no assistente virtual"
```

---

### Task 3: Decorações fofas (`LisaDecor`)

**Files:**
- Create: `src/components/LisaDecor.tsx`
- Modify: `src/components/LiveChatWidget.tsx`

**Interfaces:**
- Produces:
  ```ts
  export const FloatingHearts: React.FC;   // 3 a 5 corações que sobem e somem uma única vez ao montar
  export const PawBubble: React.FC;        // balãozinho "au au! 🐾" que aparece e some sozinho
  ```
- Consumes: `LiveChatWidget` do próprio arquivo (estado `isChatOpen`).

- [ ] **Step 1: Implementar `LisaDecor.tsx`**

`FloatingHearts`: elementos `motion.span` com `Heart` do `lucide-react` (rosa/dourado, `pointer-events-none`), `y` de 0 a -60, `opacity` 1 → 0, ~1.6s, atrasos escalonados, sem loop. `PawBubble`: balão pequeno (fundo branco, borda `border-amber-300`, texto `text-neutral-900` para contraste), com `AnimatePresence`, aparece ~1s após montar, some após ~4s, uma vez por montagem. Ambos retornam `null` se `useReducedMotion()` for `true`.

- [ ] **Step 2: Encaixar no widget**

  - Dentro do botão flutuante fechado, posicionar `PawBubble` acima do botão sem ultrapassar a tela em celular (usar `right-0`/`bottom-full`, `whitespace-nowrap`) e sem capturar cliques.
  - Dentro da janela aberta, renderizar `FloatingHearts` próximo ao avatar do cabeçalho.

- [ ] **Step 3: Verificar**

Run: `npm run lint` e `npm run build`
Expected: ambos terminam com código 0.

- [ ] **Step 4: Verificação visual**

No navegador: o balão "au au!" aparece e some sozinho; ao abrir o chat sobem corações uma vez; no emulador de movimento reduzido (DevTools > Rendering > `prefers-reduced-motion: reduce`) nada se mexe e nenhum balão/coração anima; em largura de celular o balão não corta nas bordas.
Expected: todos os itens acima confirmados.

- [ ] **Step 5: Commit**

```bash
git add src/components/LisaDecor.tsx src/components/LiveChatWidget.tsx
git commit -m "feat: corações e balão au au da Lisa"
```
