import { Product, BlogPost, Review, Order, Coupon, PushNotification } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Obsession Rouge Eau de Parfum',
    subtitle: 'A fragrância mais desejada do Brasil',
    category: 'perfumaria',
    price: 189.90,
    originalPrice: 289.90,
    discountPercent: 34,
    rating: 4.9,
    reviewCount: 1428,
    images: [
      'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Uma fragrância envolvente e marcante com notas orientais florais, perfeita para mulheres que não passam despercebidas. Fixação superior a 14 horas com projeção sedutora.',
    volume: '100ml',
    benefits: ['Fixação prolongada por até 14h', 'Fragrância oriental gourmand exclusiva', 'Frasco luxo facetado com tampa magnética', 'Cruelty Free e Vegano'],
    notes: {
      topo: 'Pera caramelizada, Bergamota Siciliana e Pimenta Rosa',
      coracao: 'Orquídea Negra, Flor de Laranjeira e Jasmim Sambac',
      fundo: 'Baunilha de Madagascar, Patchouli e Âmbar Cristal'
    },
    stock: 45,
    isFlashSale: true,
    soldPercentage: 88,
    isBestSeller: true,
    isNew: false
  },
  {
    id: 'prod-2',
    name: 'Body Splash Sweet Sugar Pop',
    subtitle: 'Refrescância adocicada e viciante para o dia todo',
    category: 'bodysplash',
    price: 69.90,
    originalPrice: 119.90,
    discountPercent: 42,
    rating: 4.8,
    reviewCount: 980,
    images: [
      'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'O body splash viral que deixa um rastro inesquecível de algodão doce com frutas vermelhas. Pode ser borrifado no corpo inteiro, cabelos e roupas.',
    volume: '200ml',
    benefits: ['Sensação de banho tomado e frescor', 'Não resseca a pele', 'Pode ser usado no corpo e cabelo', 'Ideal para reaplicar ao longo do dia'],
    notes: {
      topo: 'Morango silvestre, Framboesa e Limão Siciliano',
      coracao: 'Marshmallow, Pétalas de Rosa e Peônia',
      fundo: 'Algodão Doce, Baunilha cremosa e Musk'
    },
    stock: 82,
    isFlashSale: true,
    soldPercentage: 74,
    isBestSeller: true,
    isNew: true
  },
  {
    id: 'prod-3',
    name: 'Sérum Facial Ultra Glow Vitamina C 15%',
    subtitle: 'Ilumina, uniformiza e reduz linhas finas',
    category: 'skincare',
    price: 99.90,
    originalPrice: 169.90,
    discountPercent: 41,
    rating: 4.9,
    reviewCount: 654,
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1608248597359-2f22822a136b?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Potente sérum antioxidante formulado com Vitamina C Pura estabilizada a 15%, Ácido Ferúlico e Ácido Hialurônico de múltiplos pesos moleculares.',
    volume: '30ml',
    benefits: ['Clareia manchas solares e marcas de acne', 'Aumenta a síntese natural de colágeno', 'Textura aquosa toque seco de rápida absorção', 'Livre de parabenos e óleos minerais'],
    actives: ['Vitamina C Pura 15%', 'Ácido Ferúlico 0,5%', 'Ácido Hialurônico Triplo', 'Niacinamida 5%'],
    stock: 35,
    isFlashSale: false,
    soldPercentage: 62,
    isBestSeller: true,
    isNew: false
  },
  {
    id: 'prod-4',
    name: 'Kit Triplo Deusa Dourada (Perfume + Splash + Creme)',
    subtitle: 'O combo supremo de perfumação e hidratação',
    category: 'combos',
    price: 249.90,
    originalPrice: 479.70,
    discountPercent: 48,
    rating: 5.0,
    reviewCount: 840,
    images: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Economize quase 50% levando a rotina completa: Perfume Deo Colônia 100ml, Body Splash Iluminador 200ml e Loção Hidratante Desodorante Corporal 250g.',
    volume: 'Kit 3 Peças',
    benefits: ['Perfumação em camadas (layering)', 'Pele hidratada com brilho acetinado', 'Caixa rígida para presente inclusa', 'Frete Grátis garantido'],
    stock: 18,
    isFlashSale: true,
    soldPercentage: 92,
    isBestSeller: true,
    isNew: false
  },
  {
    id: 'prod-5',
    name: 'Gloss Labial Plump Volumoso Pink Glass',
    subtitle: 'Efeito bocão imediato sem agulha com brilho espelhado',
    category: 'maquiagem',
    price: 49.90,
    originalPrice: 89.90,
    discountPercent: 44,
    rating: 4.7,
    reviewCount: 512,
    images: [
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1571875257727-256c39da42af?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Gloss labial com microesferas de Ácido Hialurônico e Pimenta Rosa que ativam a microcirculação dos lábios, proporcionando volume visível em 5 minutos.',
    volume: '5ml',
    benefits: ['Aumento labial visível e comprovado', 'Não gruda nem escorre', 'Hidratação profunda por 12h', 'Aplicador ergonômico jumbo'],
    actives: ['Ácido Hialurônico Vectorizado', 'Extrato de Pimenta Rosa', 'Manteiga de Karité'],
    stock: 110,
    isFlashSale: false,
    soldPercentage: 55,
    isBestSeller: false,
    isNew: true
  },
  {
    id: 'prod-6',
    name: 'Base Líquida Velvet Matte Alta Cobertura',
    subtitle: 'Resistente à água, suor e transferência por 24h',
    category: 'maquiagem',
    price: 89.90,
    originalPrice: 139.90,
    discountPercent: 36,
    rating: 4.8,
    reviewCount: 789,
    images: [
      'https://images.unsplash.com/photo-1631730486784-5456119f69ae?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Base inteligente com acabamento aveludado construível que não marca linhas de expressão. Formulada com ácido hialurônico para tratar enquanto maquia.',
    volume: '35ml',
    benefits: ['Controle de oleosidade 24h', 'Não oxida ao longo do dia', 'Fórmula vegana não comedogênica', 'FPS 30 integrado'],
    actives: ['Niacinamida 3%', 'Ácido Hialurônico', 'Vitamina E'],
    stock: 60,
    isFlashSale: false,
    soldPercentage: 40,
    isBestSeller: true,
    isNew: false
  },
  {
    id: 'prod-7',
    name: 'Midnight Glamour Parfum Unissex',
    subtitle: 'Misterioso, amadeirado e intensamente sofisticado',
    category: 'perfumaria',
    price: 219.90,
    originalPrice: 329.90,
    discountPercent: 33,
    rating: 4.9,
    reviewCount: 310,
    images: [
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Para ocasiões que exigem poder. Uma alquimia nobre de madeiras raras, fava tonka e couro aveludado.',
    volume: '100ml',
    benefits: ['Fragrância unissex compartilhável', 'Alta concentração de óleos essenciais nobres', 'Projeção envolvente', 'Embalagem caixa preta aveludada'],
    notes: {
      topo: 'Cardamomo preto, Canela de Ceilão e Mandarina',
      coracao: 'Íris Florentina, Tabaco Louro e Cedro da Virgínia',
      fundo: 'Oud Real, Fava Tonka e Âmbar Negro'
    },
    stock: 22,
    isFlashSale: true,
    soldPercentage: 81,
    isBestSeller: false,
    isNew: true
  },
  {
    id: 'prod-8',
    name: 'Gel de Limpeza Facial Niacinamida + Zinco',
    subtitle: 'Limpa profundamente sem repuxar a barreira cutânea',
    category: 'skincare',
    price: 54.90,
    originalPrice: 89.90,
    discountPercent: 39,
    rating: 4.8,
    reviewCount: 420,
    images: [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Dermatologicamente testado. Desobstrui poros, reduz cravos e controla a oleosidade excessiva da zona T mantendo a hidratação natural.',
    volume: '150g',
    benefits: ['Reduz 67% da oleosidade no primeiro uso', 'Textura gel refrescante', 'Sem fragrância artificial irritante', 'Ideal para peles mistas e oleosas'],
    actives: ['Niacinamida 4%', 'Zinco PCA', 'Pantenol', 'Extrato de Chá Verde'],
    stock: 58,
    isFlashSale: false,
    soldPercentage: 45,
    isBestSeller: false,
    isNew: false
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    productId: 'prod-1',
    userName: 'Camila Vasconcelos R.',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    title: 'Simplesmente o melhor perfume que já usei!',
    comment: 'Passei às 7h da manhã para ir trabalhar e à noite na academia ainda dava para sentir perfeitamente. Já recebi elogio no elevador e na rua. Comprem sem medo!',
    date: '14 de Outubro de 2026',
    verifiedPurchase: true,
    helpfulCount: 42,
    recommended: true
  },
  {
    id: 'rev-2',
    productId: 'prod-1',
    userName: 'Beatriz Menezes',
    userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    title: 'Idêntico ao perfume de grife importada!',
    comment: 'A fixação desse Obsession Rouge bateu de dez a zero em marcas famosas que custam mil reais. A embalagem vermelha é um luxo à parte na penteadeira.',
    date: '11 de Outubro de 2026',
    verifiedPurchase: true,
    helpfulCount: 29,
    recommended: true
  },
  {
    id: 'rev-3',
    productId: 'prod-2',
    userName: 'Larissa Alencar',
    userAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    title: 'Cheirinho viciante de boneca nova!',
    comment: 'Uso pós-banho e borrifo também nas minhas roupas de cama. Meu marido elogiou na hora. Já vou comprar outro para deixar na bolsa de viagem.',
    date: '08 de Outubro de 2026',
    verifiedPurchase: true,
    helpfulCount: 19,
    recommended: true
  },
  {
    id: 'rev-4',
    productId: 'prod-3',
    userName: 'Dr. Roberto Meireles',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    title: 'Fórmula excelente e estabilidade impecável',
    comment: 'Como dermatologista, fiquei surpreso com a absorção e a ausência de oxidação precoce da vitamina C. Minha pele clareou visivelmente em 2 semanas.',
    date: '02 de Outubro de 2026',
    verifiedPurchase: true,
    helpfulCount: 37,
    recommended: true
  },
  {
    id: 'rev-5',
    productId: 'prod-4',
    userName: 'Fernanda Paiva',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    title: 'Custo benefício surreal!',
    comment: 'Comprei na live promocional e o hidratante é super aveludado, tem um glow dourado sutil maravilhoso. O cheiro gruda na alma.',
    date: '28 de Setembro de 2026',
    verifiedPurchase: true,
    helpfulCount: 15,
    recommended: true
  }
];

export const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    id: 'blog-1',
    title: 'Como fazer o perfume fixar mais de 14 horas na pele: O Segredo do Layering',
    slug: 'segredos-fixacao-perfume-layering',
    summary: 'Aprenda os pontos estratégicos de pulsação, a técnica de hidratação prévia e como combinar body splash com eau de parfum para uma assinatura inesquecível.',
    content: [
      'Você já teve a sensação de aplicar seu perfume favorito e, após duas horas, não sentir mais nada? Não se trata apenas da qualidade da essência, mas de como sua derme interage com as moléculas aromáticas.',
      'A regra de ouro número um é a hidratação: perfume não fixa em pele desidratada. Aplicar uma loção neutra ou da mesma família olfativa cria uma barreira lipídica que retém a evaporação.',
      'Outro truque das perfumarias de luxo é o Layering: borrifar o Body Splash Sweet Sugar Pop por todo o tronco e aplicar o Obsession Rouge nos pontos quentes (pulsos, nuca e atrás dos joelhos). O calor do corpo ativa a fragrância o dia inteiro!'
    ],
    coverImage: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80',
    author: {
      name: 'Sofia Vasconcelos',
      role: 'Perfumista & Especialista de Fragrâncias',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    },
    date: '16 de Outubro de 2026',
    readTime: '4 min de leitura',
    relatedProductIds: ['prod-1', 'prod-2', 'prod-4'],
    tags: ['Perfumaria', 'Dicas de Beleza', 'Guia de Estilo']
  },
  {
    id: 'blog-2',
    title: 'Rotina de Skincare Noturna Minimalista para Acordar com Pele de Porcelana',
    slug: 'rotina-skincare-noturna-glow',
    summary: 'Esqueça os 10 passos exaustivos. Com apenas 3 produtos de alta performance você regenera o viço e combate linhas de expressão enquanto dorme.',
    content: [
      'A noite é o período em que o organismo realiza o reparo celular e a regeneração do colágeno. Por isso, a rotina noturna não precisa ser complexa, mas precisa de ingredientes inteligentes.',
      'Passo 1: Higienização suave com o Gel de Limpeza de Niacinamida para retirar poluição e resíduos sem desestruturar a barreira de ceramidas.',
      'Passo 2: Tratamento intensivo com o Sérum Ultra Glow, que neutraliza radicais livres acumulados durante o dia.',
      'Passo 3: Hidratação oclusiva para selar todos os ativos. O resultado pela manhã é uma cútis descansada e com viço radiante.'
    ],
    coverImage: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80',
    author: {
      name: 'Dra. Marina Torres',
      role: 'Consultora de Cosmiatria',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'
    },
    date: '12 de Outubro de 2026',
    readTime: '5 min de leitura',
    relatedProductIds: ['prod-3', 'prod-8'],
    tags: ['Skincare', 'Anti-idade', 'Rotina Noturna']
  },
  {
    id: 'blog-3',
    title: 'Tendência Boca Glass: Como Conquistar Lábios Volumosos Sem Procedimentos',
    slug: 'tendencia-labios-volumosos-glass',
    summary: 'Descubra a ciência por trás dos glosses plump formulados com pimenta rosa e ácido hialurônico que transformam os lábios instantaneamente.',
    content: [
      'A maquiagem natural e com acabamento suculento (juicy lips) é a maior tendência nos desfiles internacionais e nas redes sociais.',
      'Ao invés de procedimentos invasivos dolorosos, o Gloss Labial Plump Pink Glass utiliza estimuladores seguros de circulação que aumentam o calibre dos vasos labiais de forma temporária e segura.',
      'O segredo é esfoliar os lábios previamente e aplicar uma camada generosa no arco do cupido.'
    ],
    coverImage: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=900&q=80',
    author: {
      name: 'Lucas Valente',
      role: 'Beauty Artist Vasconcelos',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
    },
    date: '05 de Outubro de 2026',
    readTime: '3 min de leitura',
    relatedProductIds: ['prod-5', 'prod-6'],
    tags: ['Maquiagem', 'Tendências', 'Boca Plump']
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    code: 'BEMVINDO10',
    discountType: 'percentage',
    value: 10,
    minOrderValue: 99,
    description: '10% de desconto na sua primeira compra acima de R$ 99'
  },
  {
    code: 'VASCONCELOS20',
    discountType: 'percentage',
    value: 20,
    minOrderValue: 200,
    description: '20% OFF exclusivo para compras acima de R$ 200'
  },
  {
    code: 'FRETEOFF',
    discountType: 'fixed',
    value: 25,
    minOrderValue: 150,
    description: 'R$ 25 de desconto para abater no frete acima de R$ 150'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: 'VSC-98214',
    createdAt: '2026-10-18T14:32:00Z',
    customer: {
      name: 'Mariana Duarte Prado',
      email: 'mariana.prado@email.com',
      phone: '(11) 98844-1234',
      cpf: '321.654.987-00'
    },
    shippingAddress: {
      id: 'addr-1',
      name: 'Casa Principal',
      cep: '01415-000',
      logradouro: 'Rua Bela Cintra',
      numero: '1240',
      complemento: 'Apto 82',
      bairro: 'Consolação',
      localidade: 'São Paulo',
      uf: 'SP'
    },
    shippingMethod: {
      name: 'Vasconcelos Express (Entrega Ninja)',
      price: 14.90,
      days: 1
    },
    items: [
      {
        productId: 'prod-4',
        name: 'Kit Triplo Deusa Dourada (Perfume + Splash + Creme)',
        price: 249.90,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80'
      },
      {
        productId: 'prod-5',
        name: 'Gloss Labial Plump Volumoso Pink Glass',
        price: 49.90,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=400&q=80'
      }
    ],
    subtotal: 299.80,
    discount: 29.98,
    shippingCost: 14.90,
    total: 284.72,
    couponCode: 'BEMVINDO10',
    paymentMethod: 'pix',
    paymentStatus: 'paid',
    orderStatus: 'separacao',
    trackingCode: 'VSC8921BR',
    pixCopiaECola: '00020126580014br.gov.bcb.pix0136vasconcelos-pix@beauty.com.br5204000053039865405284.725802BR5916VASCONCELOS COSM6009SAO PAULO62070503***6304ABCD'
  },
  {
    id: 'ord-1002',
    orderNumber: 'VSC-98215',
    createdAt: '2026-10-17T09:15:00Z',
    customer: {
      name: 'Juliana Costa Silva',
      email: 'ju.costa@gmail.com',
      phone: '(21) 97123-4567',
      cpf: '456.789.123-44'
    },
    shippingAddress: {
      id: 'addr-2',
      name: 'Trabalho',
      cep: '22041-001',
      logradouro: 'Avenida Atlântica',
      numero: '3500',
      bairro: 'Copacabana',
      localidade: 'Rio de Janeiro',
      uf: 'RJ'
    },
    shippingMethod: {
      name: 'Correios SEDEX',
      price: 24.50,
      days: 2
    },
    items: [
      {
        productId: 'prod-1',
        name: 'Obsession Rouge Eau de Parfum',
        price: 189.90,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=400&q=80'
      }
    ],
    subtotal: 379.80,
    discount: 75.96,
    shippingCost: 24.50,
    total: 328.34,
    couponCode: 'VASCONCELOS20',
    paymentMethod: 'credit_card',
    paymentStatus: 'paid',
    orderStatus: 'enviado',
    installments: 6,
    trackingCode: 'NL987654321BR'
  },
  {
    id: 'ord-1003',
    orderNumber: 'VSC-98216',
    createdAt: '2026-10-15T18:40:00Z',
    customer: {
      name: 'Ana Carolina Vasconcelos',
      email: 'anacarol.v@outlook.com',
      phone: '(31) 99876-5544',
      cpf: '789.123.456-88'
    },
    shippingAddress: {
      id: 'addr-3',
      name: 'Residência',
      cep: '30130-100',
      logradouro: 'Avenida Afonso Pena',
      numero: '2100',
      complemento: '1402',
      bairro: 'Funcionários',
      localidade: 'Belo Horizonte',
      uf: 'MG'
    },
    shippingMethod: {
      name: 'Correios PAC',
      price: 18.20,
      days: 5
    },
    items: [
      {
        productId: 'prod-3',
        name: 'Sérum Facial Ultra Glow Vitamina C 15%',
        price: 99.90,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80'
      },
      {
        productId: 'prod-8',
        name: 'Gel de Limpeza Facial Niacinamida + Zinco',
        price: 54.90,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80'
      }
    ],
    subtotal: 154.80,
    discount: 15.48,
    shippingCost: 18.20,
    total: 157.52,
    couponCode: 'BEMVINDO10',
    paymentMethod: 'pix',
    paymentStatus: 'paid',
    orderStatus: 'entregue',
    trackingCode: 'QB123456789BR'
  },
  {
    id: 'ord-1004',
    orderNumber: 'VSC-98217',
    createdAt: '2026-10-22T11:20:00Z',
    customer: {
      name: 'Patrícia Albuquerque',
      email: 'patricia.albuquerque@gmail.com',
      phone: '(11) 99412-8877',
      cpf: '654.321.987-10'
    },
    shippingAddress: {
      id: 'addr-4',
      name: 'Residência',
      cep: '04538-132',
      logradouro: 'Avenida Brigadeiro Faria Lima',
      numero: '3477',
      bairro: 'Itaim Bibi',
      localidade: 'São Paulo',
      uf: 'SP'
    },
    shippingMethod: {
      name: 'Vasconcelos Express',
      price: 0,
      days: 1
    },
    items: [
      {
        productId: 'prod-4',
        name: 'Kit Triplo Deusa Dourada (Perfume + Splash + Creme)',
        price: 249.90,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80'
      }
    ],
    subtotal: 499.80,
    discount: 0,
    shippingCost: 0,
    total: 499.80,
    paymentMethod: 'credit_card',
    paymentStatus: 'paid',
    orderStatus: 'entregue',
    installments: 10,
    trackingCode: 'VSC4410BR'
  },
  {
    id: 'ord-1005',
    orderNumber: 'VSC-98218',
    createdAt: '2026-10-25T16:05:00Z',
    customer: {
      name: 'Renata Figueiredo',
      email: 'renata.fig@hotmail.com',
      phone: '(41) 98811-2233',
      cpf: '112.233.445-66'
    },
    shippingAddress: {
      id: 'addr-5',
      name: 'Casa',
      cep: '80420-090',
      logradouro: 'Rua Vicente Machado',
      numero: '850',
      bairro: 'Batel',
      localidade: 'Curitiba',
      uf: 'PR'
    },
    shippingMethod: {
      name: 'Correios SEDEX',
      price: 24.90,
      days: 2
    },
    items: [
      {
        productId: 'prod-1',
        name: 'Obsession Rouge Eau de Parfum',
        price: 189.90,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=400&q=80'
      }
    ],
    subtotal: 189.90,
    discount: 0,
    shippingCost: 24.90,
    total: 214.80,
    paymentMethod: 'boleto',
    paymentStatus: 'pending',
    orderStatus: 'pendente',
    trackingCode: 'VSC9902BR'
  }
];

export const INITIAL_NOTIFICATIONS: PushNotification[] = [
  {
    id: 'notif-1',
    title: '🚨 OFERTA RELÂMPAGO DA MADRUGADA!',
    message: 'Kit Triplo Deusa Dourada com 48% OFF + Brinde especial nas compras acima de R$ 199. Corre antes que esgote!',
    timestamp: 'Há 10 minutos',
    read: false,
    discountCode: 'VASCONCELOS20',
    badge: 'Urgente'
  },
  {
    id: 'notif-2',
    title: '✨ Lançamento Exclusivo',
    message: 'Novo Body Splash Sweet Sugar Pop já está disponível. Garanta o seu com preço de pré-estreia!',
    timestamp: 'Hoje, 10:30',
    read: false,
    badge: 'Novidade'
  },
  {
    id: 'notif-3',
    title: '🎁 Você ganhou FRETE GRÁTIS',
    message: 'Use o cupom BEMVINDO10 e ganhe 10% de desconto adicional para finalizar sua sacola hoje.',
    timestamp: 'Ontem',
    read: true,
    discountCode: 'BEMVINDO10',
    badge: 'Presente'
  }
];
