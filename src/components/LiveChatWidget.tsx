import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Sparkles, 
  UserCheck, 
  Bot, 
  ChevronRight,
  Clock,
  ShieldCheck,
  ShoppingBag,
  Gift,
  Tag,
  Truck,
  HelpCircle,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { LisaAvatar } from './LisaAvatar';
import { FloatingHearts, PawBubble } from './LisaDecor';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  quickActions?: { label: string; actionText: string }[];
}

export const LiveChatWidget: React.FC = () => {
  const { isChatOpen, setIsChatOpen, orders, products, coupons, setSelectedCategory, setViewMode } = useStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'bot',
      text: 'Au, olá! 🐾 Sou a Lisa, a cachorrinha consultora de alta perfumaria e beleza da vasconcelos Presente. ✨ Como posso tornar seu dia mais especial?',
      timestamp: 'Agora',
      quickActions: [
        { label: '✨ Qual perfume fixa mais?', actionText: 'Qual perfume fixa mais?' },
        { label: '🎁 Cupons Ativos', actionText: 'Quais cupons estão ativos?' },
        { label: '📦 Rastrear Pedido', actionText: 'Quero rastrear meu pedido' },
        { label: '🚚 Prazo de Frete', actionText: 'Como funciona o frete grátis?' }
      ]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatOpen]);

  // Intelligent intent-based natural response generator
  const generateBotReply = (rawInput: string): { text: string; quickActions?: { label: string; actionText: string }[] } => {
    const text = rawInput.toLowerCase().trim();

    // 1. Saudações (Bom dia, Boa tarde, Boa noite, Olá, Oi, etc.)
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
        text: `${saudacao} É um prazer ter você aqui na vasconcelos Presente! Como posso te encantar hoje? Posso te indicar uma fragrância marcante com mais de 14h de fixação, liberar cupons exclusivos ou te ajudar a acompanhar um pedido. 🐾`,
        quickActions: [
          { label: '🌹 Ver Mais Vendidos', actionText: 'Quais os perfumes mais vendidos?' },
          { label: '🎟️ Cupons de Hoje', actionText: 'Quais cupons estão ativos?' },
          { label: '🔍 Rastrear Encomenda', actionText: 'Quero rastrear meu pedido' }
        ]
      };
    }

    // 2. Agradecimentos & Elogios
    if (text.includes('obrigad') || text.includes('valeu') || text.includes('agradeço') || text.includes('muito bom') || text.includes('maravilha') || text.includes('perfeito')) {
      return {
        text: 'Por nada! Conte sempre comigo e com a vasconcelos Presente para realçar sua essência e marcar presença por onde passar. Se precisar de mais alguma dica, estou por aqui! ✨🐾',
        quickActions: [
          { label: '🛍️ Explorar a Loja', actionText: 'Ver todos os produtos' }
        ]
      };
    }

    // 3. Rastreamento e Pedidos
    if (text.includes('rastrear') || text.includes('pedido') || text.includes('onde esta') || text.includes('chegar') || text.includes('meu pacote') || text.includes('status')) {
      const lastOrder = orders[0];
      if (lastOrder) {
        return {
          text: `Localizei seu pedido mais recente (${lastOrder.orderNumber})! Ele está com status "${lastOrder.orderStatus.toUpperCase()}" com código de rastreio: ${lastOrder.trackingCode || 'em processamento'}. Você também pode acompanhar tudo clicando no menu do seu perfil no topo do site.`,
          quickActions: [
            { label: '📦 Ver Outro Pedido', actionText: 'Quero ver meus pedidos' },
            { label: '💬 Atendente Humano', actionText: 'Falar com atendente humano' }
          ]
        };
      }
      return {
        text: 'Para consultar sua entrega, você pode acessar a aba "Meus Pedidos" no menu do topo do site ou me informar o número do pedido (ex: VSC-98214) para eu consultar para você!',
        quickActions: [
          { label: '💬 Falar com Suporte Humano', actionText: 'Quero falar com atendente humano' }
        ]
      };
    }

    // 4. Cupons e Descontos
    if (text.includes('cupom') || text.includes('desconto') || text.includes('promo') || text.includes('promocao') || text.includes('promocional') || text.includes('voucher')) {
      return {
        text: 'Temos cupons imperdíveis ativos hoje para você aproveitar:\n\n✨ BEMVINDO10 — 10% OFF no seu primeiro pedido\n✨ VASCONCELOS20 — 20% OFF em pedidos acima de R$ 200\n\nAlém disso, pagando no PIX você ganha 5% de desconto extra imediato!',
        quickActions: [
          { label: '🎁 Ver Kits Promocionais', actionText: 'Quais kits estão em promoção?' },
          { label: '🛍️ Ir para o Catálogo', actionText: 'Ver todos os produtos' }
        ]
      };
    }

    // 5. Frete e Prazos
    if (text.includes('frete') || text.includes('entrega') || text.includes('prazo') || text.includes('envio') || text.includes('transportadora')) {
      return {
        text: 'Oferecemos FRETE GRÁTIS para todo o Brasil em compras a partir de R$ 199! 🚚\n\nNossos pedidos são despachados em até 24h úteis com código de rastreamento no WhatsApp e e-mail. Você também pode simular o prazo exato inserindo seu CEP direto na sacola ou no produto.',
        quickActions: [
          { label: '🛍️ Escolher Produtos', actionText: 'Ver todos os produtos' },
          { label: '🎁 Kits com Frete Grátis', actionText: 'Quais kits estão em promoção?' }
        ]
      };
    }

    // 6. Fixação e Perfumes Específicos
    if (text.includes('fixa') || text.includes('duracao') || text.includes('fixacao') || text.includes('proje') || text.includes('obsession') || text.includes('perfume')) {
      return {
        text: 'Nosso grande campeão de fixação é o Obsession Rouge Eau de Parfum! Ele possui fórmula de altíssima concentração com fixação comprovada superior a 14 horas, deixando um rastro sofisticado de pera caramelizada, orquídea negra e baunilha.\n\nPara o dia a dia, nossos Body Splashes (como o Heaven Pink) garantem frescor prolongado e podem ser reaplicados no corpo, roupas e cabelos!',
        quickActions: [
          { label: '🌹 Conhecer Obsession Rouge', actionText: 'Me fale sobre o Obsession Rouge' },
          { label: '🍓 Ver Body Splashes', actionText: 'Quero ver os body splashes' }
        ]
      };
    }

    // 7. Famílias Olfativas (Doce, Floral, Amadeirado, Cítrico/Fresco)
    if (text.includes('doce') || text.includes('gourmand') || text.includes('baunilha') || text.includes('caramelo')) {
      return {
        text: 'Se você ama fragrâncias doces e marcantes, recomendo o Body Splash Heaven Pink e Sweet Sugar Pop! Eles combinam notas de morango silvestre, marshmallow e baunilha pura — viciantes e muito elogiados por onde você passar.',
        quickActions: [
          { label: '💖 Ver Linha Gourmand', actionText: 'Quero ver os body splashes' }
        ]
      };
    }
    if (text.includes('amadeirado') || text.includes('intenso') || text.includes('forte') || text.includes('noite') || text.includes('elegante')) {
      return {
        text: 'Para ocasiões especiais e noites marcantes, o Obsession Rouge e o Golden Noir são escolhas impecáveis. Eles combinam madeiras nobres, âmbar cristal e flores exóticas para uma assinatura de puro poder.',
        quickActions: [
          { label: '✨ Ver Perfumes de Luxo', actionText: 'Qual perfume fixa mais?' }
        ]
      };
    }

    // 8. Skincare e Cuidados Faciais
    if (text.includes('pele') || text.includes('skincare') || text.includes('serum') || text.includes('sérum') || text.includes('rugas') || text.includes('mancha') || text.includes('hidrat')) {
      return {
        text: 'Nossa linha de Skincare Facial de Alta Performance foi formulada com Ácido Hialurônico Puro, Niacinamida e Vitamina C Estabilizada. Proporciona efeito lifting imediato, hidratação profunda sem oleosidade e luminosidade radiante desde a primeira aplicação!',
        quickActions: [
          { label: '✨ Ver Sérum Glow', actionText: 'Quero ver os produtos de skincare' }
        ]
      };
    }

    // 9. Maquiagem e Gloss
    if (text.includes('maquiagem') || text.includes('make') || text.includes('batom') || text.includes('gloss') || text.includes('labio')) {
      return {
        text: 'Nossos Lip Glosses com Ácido Hialurônico proporcionam hidratação intensa, brilho espelhado e efeito volumizador instantâneo sem grudar nos lábios. São perfeitos para levar na bolsa e retocar ao longo do dia!',
        quickActions: [
          { label: '💄 Ver Maquiagens', actionText: 'Quero ver maquiagem' }
        ]
      };
    }

    // 10. Pagamento e Parcelamento
    if (text.includes('pagamento') || text.includes('pagar') || text.includes('cartao') || text.includes('cartão') || text.includes('pix') || text.includes('parcel')) {
      return {
        text: 'Aceitamos PIX com 5% de desconto imediato e cartões de crédito em até 10x sem juros! Todo o processo de checkout é criptografado com certificado SSL de segurança máxima.',
        quickActions: [
          { label: '🛍️ Ir para a Sacola', actionText: 'Quero finalizar meu pedido' }
        ]
      };
    }

    // 11. Trocas, Devoluções e Garantia
    if (text.includes('troca') || text.includes('devolver') || text.includes('garantia') || text.includes('defeito') || text.includes('original')) {
      return {
        text: 'Você tem garantia total de satisfação vasconcelos Presente! Garantimos 100% de autenticidade em todos os frascos. Conforme o Código de Defesa do Consumidor, você tem até 7 dias após o recebimento para solicitar troca ou devolução sem complicações.',
        quickActions: [
          { label: '💬 Atendente do SAC', actionText: 'Falar com atendente humano' }
        ]
      };
    }

    // 12. Atendente Humano
    if (text.includes('humano') || text.includes('atendente') || text.includes('falar com alguem') || text.includes('pessoa') || text.includes('sac') || text.includes('telefone') || text.includes('whatsapp')) {
      return {
        text: 'Com certeza! Você foi inserido(a) na fila prioritária do nosso SAC humanizado 24h. Um de nossos especialistas da vasconcelos Presente assumirá esta conversa ou entrará em contato via WhatsApp/e-mail para te atender de forma exclusiva.',
        quickActions: [
          { label: '🔍 Rastrear Enquanto Aguardo', actionText: 'Quero rastrear meu pedido' }
        ]
      };
    }

    // 13. Fallback inteligente e prestativo
    return {
      text: 'Entendi! Estou pronta para te ajudar com qualquer dúvida sobre nossas fragrâncias de luxo, pedidos ou promoções. Sobre qual assunto você gostaria de saber mais?',
      quickActions: [
        { label: '✨ Melhores Perfumes', actionText: 'Qual perfume fixa mais?' },
        { label: '🎟️ Cupons Ativos', actionText: 'Quais cupons estão ativos?' },
        { label: '📦 Rastrear Encomenda', actionText: 'Quero rastrear meu pedido' },
        { label: '💬 Atendente Humano', actionText: 'Falar com atendente humano' }
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
    }, 600);
  };

  return (
    <>
      {/* Floating launcher badge */}
      {!isChatOpen && (
        <motion.button
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 bg-gradient-to-r from-neutral-900 via-stone-900 to-black hover:from-rose-600 hover:to-rose-700 text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-2xl shadow-neutral-900/40 flex items-center gap-3 transition-colors duration-300 group border border-amber-400/40 cursor-pointer"
          aria-label="Abrir Lisa, consultora virtual"
        >
          <div className="relative">
            <LisaAvatar size={40} breathe tiltOnHover />
            <span className="w-3 h-3 bg-emerald-400 border-2 border-neutral-900 rounded-full absolute -top-1 -right-1 animate-pulse" />
          </div>
          <div className="hidden sm:block text-left">
            <span className="block text-[10px] font-black uppercase tracking-wider text-amber-300">
              Lisa • Consultora 24h
            </span>
            <span className="block text-xs font-bold text-white">
              Tirar Dúvidas & Dicas
            </span>
          </div>
          <PawBubble />
        </motion.button>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-4 sm:bottom-6 right-3 sm:right-6 z-50 w-[94vw] sm:w-[400px] h-[550px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-neutral-200/80 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="relative p-4 bg-gradient-to-r from-neutral-900 via-stone-900 to-black text-white flex items-center justify-between border-b border-amber-500/20">
              <FloatingHearts />
              <div className="flex items-center gap-3">
                <div className="relative">
                  <LisaAvatar size={40} breathe />
                  <span className="w-3 h-3 bg-emerald-400 border-2 border-neutral-900 rounded-full absolute bottom-0 right-0" />
                </div>
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-1.5 text-white">
                    Lisa • Consultora vasconcelos
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                  </h3>
                  <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Online em tempo real
                  </span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsChatOpen(false)}
                className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                aria-label="Fechar chat"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Quick FAQ Chips */}
            <div className="p-2.5 bg-[#FAF8F5] border-b border-neutral-200/60 flex gap-1.5 overflow-x-auto scrollbar-none">
              <button
                onClick={() => handleSend('Qual perfume fixa mais?')}
                className="px-3 py-1 bg-white border border-neutral-200 text-neutral-700 rounded-full text-[11px] font-semibold whitespace-nowrap hover:border-amber-400 hover:text-amber-800 transition shrink-0 cursor-pointer shadow-2xs"
              >
                ✨ Perfume que mais fixa
              </button>
              <button
                onClick={() => handleSend('Quais cupons estão ativos hoje?')}
                className="px-3 py-1 bg-white border border-neutral-200 text-neutral-700 rounded-full text-[11px] font-semibold whitespace-nowrap hover:border-amber-400 hover:text-amber-800 transition shrink-0 cursor-pointer shadow-2xs"
              >
                🎟️ Cupons Ativos
              </button>
              <button
                onClick={() => handleSend('Quero rastrear meu pedido')}
                className="px-3 py-1 bg-white border border-neutral-200 text-neutral-700 rounded-full text-[11px] font-semibold whitespace-nowrap hover:border-amber-400 hover:text-amber-800 transition shrink-0 cursor-pointer shadow-2xs"
              >
                📦 Rastrear Pedido
              </button>
              <button
                onClick={() => handleSend('Quero falar com um atendente humano')}
                className="px-3 py-1 bg-white border border-neutral-200 text-neutral-700 rounded-full text-[11px] font-semibold whitespace-nowrap hover:border-amber-400 hover:text-amber-800 transition shrink-0 cursor-pointer shadow-2xs"
              >
                💬 Falar com Atendente
              </button>
            </div>

            {/* Messages Container */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#FAF9F6] text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'bot' && (
                    <LisaAvatar size={28} hopOnMount />
                  )}

                  <div className="max-w-[85%] space-y-2">
                    <div
                      className={`p-3.5 rounded-2xl leading-relaxed shadow-xs ${
                        msg.sender === 'user'
                          ? 'bg-neutral-900 text-white rounded-br-none font-medium'
                          : 'bg-white text-neutral-800 border border-neutral-200/80 rounded-bl-none font-normal'
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.text}</p>
                      <span className={`block text-[9px] mt-1.5 text-right ${
                        msg.sender === 'user' ? 'text-neutral-400' : 'text-neutral-400'
                      }`}>
                        {msg.timestamp}
                      </span>
                    </div>

                    {/* Quick suggestion action buttons attached to bot reply */}
                    {msg.quickActions && msg.quickActions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {msg.quickActions.map((qa, i) => (
                          <button
                            key={i}
                            onClick={() => handleSend(qa.actionText)}
                            className="text-[10px] bg-white hover:bg-amber-50 text-neutral-700 hover:text-amber-800 border border-neutral-200 hover:border-amber-400 px-2.5 py-1 rounded-full transition font-semibold cursor-pointer shadow-2xs"
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
                <div className="flex items-center gap-2 text-neutral-500 text-xs italic">
                  <LisaAvatar size={28} mood="listening" />
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce delay-100" />
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce delay-200" />
                  <span>Lisa está digitando...</span>
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
                placeholder="Ex: Bom dia, qual perfume fixa mais?"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-[#FAF8F5] border border-neutral-300/80 rounded-full px-4 py-2.5 text-xs text-neutral-900 outline-hidden focus:border-amber-500 focus:bg-white transition"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 rounded-full bg-neutral-900 hover:bg-rose-600 text-white transition disabled:opacity-40 cursor-pointer shadow-xs"
                aria-label="Enviar mensagem"
              >
                <Send className="w-4 h-4" />
              </motion.button>
            </form>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
