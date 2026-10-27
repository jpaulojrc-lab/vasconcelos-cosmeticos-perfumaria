# Lisa, a cachorrinha do assistente virtual — Design (pequeno)

## Intenção e porquê
Trocar a "Sofia" (consultora com avatar "S") pela **Lisa**, a cachorrinha da
ilustração `Lisa.jpeg`: docinha, meiga e com movimentos de cachorro. Objetivo:
dar personalidade e carinho ao atendimento da loja e encantar quem visita.

## Metas / Não-metas / Anti-metas
- **Metas:** Lisa substitui a Sofia (nome, textos, tom) em todo o
  `LiveChatWidget.tsx`; avatar com a foto dela; movimentos fofos.
- **Não-metas:** animar orelhas/rabinho separadamente; gerar novas imagens;
  mudar a lógica de respostas (intenções, cupons, rastreio, frete).
- **Anti-metas:** aparência infantil demais que tire o ar de "alta perfumaria";
  animações que atrapalhem a leitura ou o uso do chat em celular.

## Restrições
- Stack existente: React + Tailwind + `motion/react`. Nenhuma dependência nova.
- Não existe `public/` nem `src/assets`; a imagem hoje está na raiz.
- A foto original tem manta de oncinha e notebook ao redor: o avatar precisa
  enquadrar só o rostinho (recorte circular).
- Respeitar `prefers-reduced-motion`.

## Abordagens consideradas
- **A. Foto recortada + movimentos no avatar inteiro (ESCOLHIDA pelo usuário).**
  Leve, usa a arte original, sem dependências.
- B. Recorte em camadas (orelhas/olhos independentes): risco de ficar estranho
  ao reconstruir partes escondidas; mais trabalho. Descartada.
- C. Quadros gerados por IA: pode fugir do visual original; muitos arquivos.
  Descartada.

## O que foi decidido (pelo usuário)
- Lisa substitui a Sofia por completo.
- Abordagem A.

## Minhas decisões (marcadas como "minha escolha", podem ser ajustadas)
- **Imagem:** copiar `Lisa.jpeg` para `public/lisa.jpeg` e recortar o rosto via
  CSS (`object-fit: cover` + `object-position` no rosto, círculo). Sem editar o
  arquivo original.
- **Onde aparece:** botão flutuante, cabeçalho do chat, avatar de cada mensagem
  do bot e indicador "digitando".
- **Movimentos:**
  - Botão flutuante: respiração suave contínua + pulinho ocasional; inclina a
    cabecinha no hover.
  - Cabeçalho: respiração suave.
  - Nova mensagem do bot: pulinho do avatar.
  - Enquanto "digitando": cabecinha inclinada balançando de leve (ouvindo).
  - Decorações: corações flutuando no abrir do chat; patinha e balãozinho
    "au au!" no botão fechado. Tudo discreto.
- **Tom do texto:** carinhoso, com toques sutis de cachorrinha ("au!", 🐾),
  sem exagero; conteúdo informativo permanece igual.
- **Textos trocados:** "Sofia" → "Lisa", "consultora de alta perfumaria" →
  "cachorrinha consultora" (ajuste fino do copy fica com o construtor), labels
  de aria/botão, mensagem de boas-vindas e "Lisa está digitando...".

## O que fica para o construtor
- Valores exatos do enquadramento (`object-position`/escala) e das animações.
- Redação final dos textos mantendo o tom meigo e elegante.
- Verificar visualmente desktop e celular.
