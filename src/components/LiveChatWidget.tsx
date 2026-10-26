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
  ShieldCheck
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'agent' | 'user';
  text: string;
  timestamp: string;
  quickActions?: { label: string; action: () => void }[];
}

export const LiveChatWidget: React.FC = () => {
  const { isChatOpen, setIsChatOpen, orders, products, coupons } = useStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'bot',
      text: 'Olá! Sou a Sofia, assistente virtual 24h da vasconcelos Presente. Como posso te encantar hoje?',
      timestamp: 'Agora'
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

    // AI/Virtual Assistant automated response rules
    setTimeout(() => {
      let botResponse = '';
      const lower = content.toLowerCase();

      if (lower.includes('rastrear') || lower.includes('pedido') || lower.includes('onde esta')) {
        const lastOrder = orders[0];
        if (lastOrder) {
          botResponse = `Localizei seu pedido mais recente (${lastOrder.orderNumber})! Ele está com status "${lastOrder.orderStatus.toUpperCase()}" com código de rastreamento: ${lastOrder.trackingCode || 'em geração'}. Você também pode ver todos os detalhes na aba "Meus Pedidos".`;
        } else {
          botResponse = 'Para rastrear, por favor informe o número do seu pedido (ex: VSC-98214) ou acesse seu perfil no topo do site.';
        }
      } else if (lower.includes('cupom') || lower.includes('desconto') || lower.includes('promo')) {
        botResponse = `Temos cupons imperdíveis ativos hoje! Use BEMVINDO10 para 10% OFF na primeira compra ou VASCONCELOS20 para 20% OFF acima de R$ 200. Ambos são aplicados automaticamente na sua sacola!`;
      } else if (lower.includes('frete') || lower.includes('entrega') || lower.includes('prazo')) {
        botResponse = 'Temos FRETE GRÁTIS para todo o Brasil em compras acima de R$ 199! Para o estado de SP entregamos via Vasconcelos Express em até 24h.';
      } else if (lower.includes('perfume') || lower.includes('fragrancia') || lower.includes('cheiro')) {
        botResponse = 'Nosso perfume mais desejado é o Obsession Rouge Eau de Parfum (fixação 14h com notas de pera caramelizada, orquídea negra e baunilha). Se preferir algo fresco e adocicado para o dia a dia, recomendo o Body Splash Sweet Sugar Pop!';
      } else if (lower.includes('humano') || lower.includes('atendente') || lower.includes('falar')) {
        botResponse = 'Com certeza! Você está na fila prioritária do nosso SAC 24h. Um de nossos especialistas humanos da vasconcelos Presente assumirá o atendimento em instantes.';
      } else {
        botResponse = 'Entendi perfeitamente! Nossas fórmulas são dermatologicamente testadas, veganas e cruelty-free. Se quiser, você pode me perguntar sobre rastreamento de pedidos, cupons ativos ou dicas de skincare e perfumaria!';
      }

      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: 'bot',
          text: botResponse,
          timestamp: 'Agora'
        }
      ]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <>
      {/* Floating launcher badge */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-2xl shadow-pink-600/40 flex items-center gap-3 transition transform hover:scale-105 active:scale-95 group border-2 border-white"
          aria-label="Abrir Suporte 24h"
        >
          <div className="relative">
            <MessageCircle className="w-6 h-6" />
            <span className="w-3 h-3 bg-emerald-400 border-2 border-white rounded-full absolute -top-1 -right-1 animate-pulse" />
          </div>
          <div className="hidden sm:block text-left">
            <span className="block text-[11px] font-black uppercase tracking-wider text-pink-100">
              Suporte 24h Online
            </span>
            <span className="block text-xs font-bold text-white">
              Chat com vasconcelos Presente
            </span>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isChatOpen && (
        <div className="fixed bottom-4 sm:bottom-6 right-3 sm:right-6 z-50 w-[94vw] sm:w-96 h-[520px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-pink-100 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-neutral-900 to-stone-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-pink-600 flex items-center justify-center font-bold text-sm">
                  V
                </div>
                <span className="w-3 h-3 bg-emerald-400 border-2 border-neutral-900 rounded-full absolute bottom-0 right-0" />
              </div>
              <div>
                <h3 className="text-sm font-bold flex items-center gap-1.5">
                  vasconcelos Presente SAC 24h
                  <ShieldCheck className="w-4 h-4 text-pink-400" />
                </h3>
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Atendimento em tempo real
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsChatOpen(false)}
              className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick FAQ Chips */}
          <div className="p-2.5 bg-pink-50/70 border-b border-pink-100 flex gap-1.5 overflow-x-auto scrollbar-none">
            <button
              onClick={() => handleSend('Quero rastrear meu pedido')}
              className="px-2.5 py-1 bg-white border border-pink-200 text-pink-800 rounded-full text-[11px] font-semibold whitespace-nowrap hover:bg-pink-100 transition shrink-0"
            >
              🔍 Rastrear Pedido
            </button>
            <button
              onClick={() => handleSend('Qual o cupom ativo hoje?')}
              className="px-2.5 py-1 bg-white border border-pink-200 text-pink-800 rounded-full text-[11px] font-semibold whitespace-nowrap hover:bg-pink-100 transition shrink-0"
            >
              🎁 Cupons Ativos
            </button>
            <button
              onClick={() => handleSend('Qual perfume fixa mais?')}
              className="px-2.5 py-1 bg-white border border-pink-200 text-pink-800 rounded-full text-[11px] font-semibold whitespace-nowrap hover:bg-pink-100 transition shrink-0"
            >
              ✨ Perfume Ideal
            </button>
            <button
              onClick={() => handleSend('Quero falar com um atendente humano')}
              className="px-2.5 py-1 bg-white border border-pink-200 text-pink-800 rounded-full text-[11px] font-semibold whitespace-nowrap hover:bg-pink-100 transition shrink-0"
            >
              💬 Atendente Humano
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-neutral-50/50 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-full bg-pink-600 text-white flex items-center justify-center shrink-0 font-bold text-[10px]">
                    V
                  </div>
                )}

                <div
                  className={`max-w-[80%] p-3 rounded-2xl leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-neutral-900 text-white rounded-br-none'
                      : 'bg-white text-neutral-800 border border-neutral-200 rounded-bl-none'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className={`block text-[9px] mt-1 text-right ${
                    msg.sender === 'user' ? 'text-neutral-400' : 'text-neutral-400'
                  }`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-neutral-400 text-xs italic">
                <div className="w-2 h-2 rounded-full bg-pink-500 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-pink-500 animate-bounce delay-100" />
                <div className="w-2 h-2 rounded-full bg-pink-500 animate-bounce delay-200" />
                <span>Sofia está digitando...</span>
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
              placeholder="Digite sua dúvida aqui..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-neutral-100 border border-neutral-200 rounded-full px-4 py-2.5 text-xs text-neutral-900 outline-hidden focus:border-pink-500 focus:bg-white"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 rounded-full bg-pink-600 hover:bg-pink-700 text-white transition disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
};
