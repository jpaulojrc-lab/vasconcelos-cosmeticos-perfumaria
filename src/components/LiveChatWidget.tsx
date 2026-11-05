import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Clock,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../context/StoreContext';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  quickActions?: { label: string; actionText: string }[];
}

export const LiveChatWidget: React.FC = () => {
  const {
    isChatOpen,
    setIsChatOpen,
    orders,
    cart,
    viewMode,
    isCartOpen,
    isCheckoutOpen,
    isAuthOpen,
    isAccountOpen,
    isProductModalOpen
  } = useStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'bot',
      text: 'Olá, bem-vinda(o) ao Beauty Concierge da VASCONCELOS. Posso auxiliar na escolha de uma fragrância por notas olfativas, consultar cupons ativos ou rastrear seu pedido.',
      timestamp: 'Agora',
      quickActions: [
        { label: 'Perfumes de maior fixação', actionText: 'Qual perfume fixa mais?' },
        { label: 'Cupons disponíveis', actionText: 'Quais cupons estão ativos?' },
        { label: 'Rastrear meu pedido', actionText: 'Quero rastrear meu pedido' },
        { label: 'Política de frete grátis', actionText: 'Como funciona o frete grátis?' }
      ]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Medição dinâmica para adaptar o botão e o chat a qualquer modelo de celular e navegador (Safari, Chrome, Samsung, etc.)
  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  const [mobileBottomOffset, setMobileBottomOffset] = useState<number>(76);
  const [viewportHeight, setViewportHeight] = useState<number>(() =>
    typeof window !== 'undefined'
      ? window.visualViewport?.height || window.innerHeight
      : 700
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateLayoutMetrics = () => {
      const isMob = window.innerWidth < 768;
      setIsMobileViewport(isMob);

      const vv = window.visualViewport;
      const currentVvHeight = vv ? vv.height : window.innerHeight;
      setViewportHeight(currentVvHeight);

      // Diferença causada por barras inferiores dinâmicas do navegador mobile (Safari/Chrome) ou teclado virtual
      const browserBottomBarOffset = vv
        ? Math.max(0, window.innerHeight - (vv.height + vv.offsetTop))
        : 0;

      // Mede a altura real da barra de navegação inferior (#vsc-mobile-bottom-nav ou #vsc-admin-mobile-dock)
      const navEl =
        document.getElementById('vsc-mobile-bottom-nav') ||
        document.getElementById('vsc-admin-mobile-dock');
      const navHeight = navEl ? navEl.getBoundingClientRect().height : 62;

      // Posiciona o botão 12px acima do menu inferior (e da barra da sacola quando ativa)
      setMobileBottomOffset(Math.round(navHeight + browserBottomBarOffset + 12));
    };

    updateLayoutMetrics();

    window.addEventListener('resize', updateLayoutMetrics);
    window.addEventListener('orientationchange', updateLayoutMetrics);
    window.visualViewport?.addEventListener('resize', updateLayoutMetrics);
    window.visualViewport?.addEventListener('scroll', updateLayoutMetrics);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(updateLayoutMetrics);
      const navEl = document.getElementById('vsc-mobile-bottom-nav');
      const adminDockEl = document.getElementById('vsc-admin-mobile-dock');
      if (navEl) resizeObserver.observe(navEl);
      if (adminDockEl) resizeObserver.observe(adminDockEl);
    }

    const timer = setTimeout(updateLayoutMetrics, 150);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateLayoutMetrics);
      window.removeEventListener('orientationchange', updateLayoutMetrics);
      window.visualViewport?.removeEventListener('resize', updateLayoutMetrics);
      window.visualViewport?.removeEventListener('scroll', updateLayoutMetrics);
      resizeObserver?.disconnect();
    };
  }, [cart.length, viewMode, isChatOpen]);

  useEffect(() => {
    if (isChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatOpen]);

  const generateBotReply = (rawInput: string): { text: string; quickActions?: { label: string; actionText: string }[] } => {
    const text = rawInput.toLowerCase().trim();

    const isMorning = text.includes('bom dia');
    const isAfternoon = text.includes('boa tarde');
    const isEvening = text.includes('boa noite');
    const isGenericGreeting = /^(oi|ola|olá|oie|opa|hey|alo|alô|hello|e ai|e aí)/i.test(text) || 
      text.includes('tudo bem') || 
      text.includes('como vai');

    if (isMorning || isAfternoon || isEvening || isGenericGreeting) {
      let saudacao = 'Olá!';
      if (isMorning) saudacao = 'Bom dia!';
      else if (isAfternoon) saudacao = 'Boa tarde!';
      else if (isEvening) saudacao = 'Boa noite!';

      return {
        text: `${saudacao} Como posso auxiliar sua experiência na VASCONCELOS hoje? Posso indicar uma fragrância por família olfativa, informar os cupons vigentes ou verificar o status de um pedido.`,
        quickActions: [
          { label: 'Ver Best-Sellers', actionText: 'Quais os perfumes mais vendidos?' },
          { label: 'Cupons Ativos', actionText: 'Quais cupons estão ativos?' },
          { label: 'Rastrear Pedido', actionText: 'Quero rastrear meu pedido' }
        ]
      };
    }

    if (text.includes('obrigad') || text.includes('valeu') || text.includes('agradeço') || text.includes('perfeito')) {
      return {
        text: 'Disponha! Permanecemos à disposição caso precise de qualquer outra recomendação.',
        quickActions: [
          { label: 'Explorar Catálogo', actionText: 'Ver todos os produtos' }
        ]
      };
    }

    if (text.includes('rastrear') || text.includes('pedido') || text.includes('onde esta') || text.includes('chegar') || text.includes('status')) {
      const lastOrder = orders[0];
      if (lastOrder) {
        return {
          text: `Localizamos seu pedido mais recente (${lastOrder.orderNumber}). Status atual: "${lastOrder.orderStatus.toUpperCase()}" — código de rastreio: ${lastOrder.trackingCode || 'em preparação'}.`,
          quickActions: [
            { label: 'Falar com Atendimento', actionText: 'Falar com atendente humano' }
          ]
        };
      }
      return {
        text: 'Para consultar sua entrega, acesse "Minha Conta > Meus Pedidos" no topo da página ou informe o código do pedido (ex: VSC-98214).',
        quickActions: [
          { label: 'Falar com Especialista', actionText: 'Quero falar com atendente humano' }
        ]
      };
    }

    if (text.includes('cupom') || text.includes('desconto') || text.includes('promo') || text.includes('voucher')) {
      return {
        text: 'Benefícios disponíveis hoje na loja:\n\n• BEMVINDO10 — 10% OFF na primeira compra\n• VASCONCELOS20 — 20% OFF em compras acima de R$ 200\n\nPagamentos via PIX contam ainda com 5% de desconto imediato.',
        quickActions: [
          { label: 'Estojos & Presentes', actionText: 'Quais kits estão em promoção?' }
        ]
      };
    }

    if (text.includes('frete') || text.includes('entrega') || text.includes('prazo') || text.includes('envio')) {
      return {
        text: 'Oferecemos Frete Grátis para todo o Brasil em compras acima de R$ 199. Todos os pedidos são expedidos com código de rastreamento enviado por e-mail e WhatsApp.',
        quickActions: [
          { label: 'Consultar Cupons', actionText: 'Quais cupons estão ativos?' }
        ]
      };
    }

    if (text.includes('fixa') || text.includes('duracao') || text.includes('fixacao') || text.includes('obsession') || text.includes('perfume')) {
      return {
        text: 'Nossa maior concentração de perfumaria é o Obsession Rouge Eau de Parfum (100ml), com mais de 14 horas de fixação na pele. Combina notas de topo de pera caramelizada e pimenta rosa, coração de orquídea negra e fundo de baunilha de Madagascar.',
        quickActions: [
          { label: 'Conhecer Body Splashes', actionText: 'Quero ver os body splashes' },
          { label: 'Linha Skincare', actionText: 'Quero ver os produtos de skincare' }
        ]
      };
    }

    if (text.includes('doce') || text.includes('gourmand') || text.includes('baunilha') || text.includes('splash')) {
      return {
        text: 'Para quem aprecia notas adocicadas e envolventes, indicamos o Body Splash Heaven Pink e o Sweet Sugar Pop, formulados para perfumação generosa ao longo do dia.',
        quickActions: [
          { label: 'Perfumes Intensos', actionText: 'Qual perfume fixa mais?' }
        ]
      };
    }

    if (text.includes('pele') || text.includes('skincare') || text.includes('serum') || text.includes('sérum') || text.includes('hidrat')) {
      return {
        text: 'Nossa linha de Skincare reúne ativos clínicos como Ácido Hialurônico, Niacinamida e Vitamina C Estabilizada para hidratação profunda e uniformização do tom da pele.',
        quickActions: [
          { label: 'Consultar Cupons', actionText: 'Quais cupons estão ativos?' }
        ]
      };
    }

    if (text.includes('humano') || text.includes('atendente') || text.includes('sac') || text.includes('whatsapp')) {
      return {
        text: 'Encaminhamos sua solicitação para nossa equipe de atendimento. Você também pode falar diretamente pelo WhatsApp Concierge: (11) 99876-5432 ou pelo e-mail sandravasconcellossillva@gmail.com.',
        quickActions: [
          { label: 'Rastrear Pedido', actionText: 'Quero rastrear meu pedido' }
        ]
      };
    }

    return {
      text: 'Estou à disposição para auxiliar com recomendações olfativas, skincare, prazos de entrega ou códigos promocionais. Como posso ajudar?',
      quickActions: [
        { label: 'Perfumes de maior fixação', actionText: 'Qual perfume fixa mais?' },
        { label: 'Cupons disponíveis', actionText: 'Quais cupons estão ativos?' },
        { label: 'Rastrear pedido', actionText: 'Quero rastrear meu pedido' },
        { label: 'Falar com Atendimento', actionText: 'Falar com atendente humano' }
      ]
    };
  };

  const handleSend = (textToSend?: string) => {
    const content = textToSend || inputText;
    if (!content.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: content,
      timestamp: 'Agora'
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const reply = generateBotReply(content);

      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: 'bot',
          text: reply.text,
          timestamp: 'Agora',
          quickActions: reply.quickActions
        }
      ]);
      setIsTyping(false);
    }, 500);
  };

  // Oculta o botão flutuante quando algum modal/gaveta estiver aberto ou quando estiver no painel ADM
  const anyOverlayOpen =
    isCartOpen || isCheckoutOpen || isAuthOpen || isAccountOpen || isProductModalOpen;
  if (viewMode === 'admin') {
    return null;
  }

  return (
    <>
      {/* Discrete Prestige Concierge Launcher — Adaptado automaticamente para qualquer celular/navegador e PC */}
      {!isChatOpen && !anyOverlayOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          style={
            isMobileViewport
              ? {
                  bottom: `${mobileBottomOffset}px`,
                  right: 'max(0.75rem, env(safe-area-inset-right, 0.75rem))'
                }
              : undefined
          }
          className="fixed md:bottom-6 md:right-6 z-30 bg-[#111111]/95 hover:bg-[#8B1E3F] text-white px-3 py-2 md:px-4 md:py-3 rounded-full md:rounded-lg shadow-lg flex items-center gap-1.5 md:gap-2.5 transition-all duration-200 border border-white/15 cursor-pointer backdrop-blur-xs"
          aria-label="Abrir Beauty Concierge"
        >
          <MessageSquare className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-400 md:text-white shrink-0" />
          <span className="text-[10px] md:text-xs font-extrabold uppercase tracking-[0.12em]">
            Concierge
          </span>
        </button>
      )}

      {/* Chat Window — Enquadrado dinamicamente conforme a altura visível do navegador e modelo do celular */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2 }}
            style={
              isMobileViewport
                ? {
                    bottom: `${Math.max(68, mobileBottomOffset - 4)}px`,
                    maxHeight: `${Math.max(280, viewportHeight - mobileBottomOffset - 16)}px`
                  }
                : undefined
            }
            className="fixed inset-x-2.5 sm:inset-x-auto sm:bottom-6 sm:right-6 z-50 sm:w-[380px] h-[480px] sm:h-[520px] max-h-[78dvh] sm:max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-neutral-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-[#111111] text-white flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.16em] flex items-center gap-1.5 text-white">
                  VASCONCELOS • Concierge
                  <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
                </h3>
                <span className="text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3 text-emerald-400" />
                  Consultoria Olfativa & Pedidos
                </span>
              </div>

              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                aria-label="Fechar chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Container */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#F7F6F2] text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="max-w-[85%] space-y-2">
                    <div
                      className={`p-3.5 rounded-xl leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-[#111111] text-white rounded-br-none font-medium'
                          : 'bg-white text-neutral-800 border border-neutral-200 rounded-bl-none'
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.text}</p>
                      <span className="block text-[9px] mt-1.5 text-right text-neutral-400">
                        {msg.timestamp}
                      </span>
                    </div>

                    {msg.quickActions && msg.quickActions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {msg.quickActions.map((qa, i) => (
                          <button
                            key={i}
                            onClick={() => handleSend(qa.actionText)}
                            className="text-[10px] bg-white hover:bg-neutral-900 text-neutral-800 hover:text-white border border-neutral-300 px-2.5 py-1 rounded-md transition font-semibold cursor-pointer"
                          >
                            {qa.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="text-neutral-500 text-[11px] italic">
                  Consultora digitando...
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Box */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-white border-t border-neutral-200 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Digite sua dúvida..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-[#F7F6F2] border border-neutral-300 rounded-lg px-3.5 py-2.5 text-xs text-neutral-900 outline-hidden focus:border-neutral-900 focus:bg-white transition"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 rounded-lg bg-[#111111] hover:bg-[#8B1E3F] text-white transition disabled:opacity-40 cursor-pointer"
                aria-label="Enviar mensagem"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
