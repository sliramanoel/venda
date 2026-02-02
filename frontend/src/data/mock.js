// Mock data for NeuroVita - Natural Supplement Website

export const siteConfig = {
  name: "NeuroVita",
  tagline: "Memória Afiada, Energia Plena",
  description: "Suplemento natural para potencializar sua memória e disposição diária.",
  phone: "(11) 99999-9999",
  email: "contato@neurovita.com.br",
  instagram: "@neurovita",
  paymentLink: "", // Link PIX será configurado posteriormente
};

export const productImages = {
  main: "https://images.unsplash.com/photo-1763668331599-487470fb85b2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTF8MHwxfHNlYXJjaHwzfHxzdXBwbGVtZW50JTIwYm90dGxlfGVufDB8fHx8MTc3MDA3NDk5NXww&ixlib=rb-4.1.0&q=85",
  secondary: "https://images.unsplash.com/photo-1763668444855-401b58dceb20?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTF8MHwxfHNlYXJjaHwyfHxzdXBwbGVtZW50JTIwYm90dGxlfGVufDB8fHx8MTc3MDA3NDk5NXww&ixlib=rb-4.1.0&q=85",
  tertiary: "https://images.unsplash.com/photo-1763668177859-0ed5669a795e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTF8MHwxfHNlYXJjaHwxfHxzdXBwbGVtZW50JTIwYm90dGxlfGVufDB8fHx8MTc3MDA3NDk5NXww&ixlib=rb-4.1.0&q=85",
};

export const benefits = [
  {
    id: 1,
    icon: "Brain",
    title: "Memória Aprimorada",
    description: "Ingredientes naturais que auxiliam na concentração e retenção de informações."
  },
  {
    id: 2,
    icon: "Zap",
    title: "Energia Natural",
    description: "Disposição duradoura sem os efeitos colaterais de estimulantes artificiais."
  },
  {
    id: 3,
    icon: "Shield",
    title: "100% Natural",
    description: "Fórmula desenvolvida com ingredientes naturais e sem aditivos químicos."
  },
  {
    id: 4,
    icon: "Clock",
    title: "Resultados Rápidos",
    description: "Sinta a diferença em poucas semanas de uso contínuo."
  }
];

export const testimonials = [
  {
    id: 1,
    name: "Maria Silva",
    age: 45,
    text: "Depois de começar a tomar NeuroVita, minha concentração no trabalho melhorou muito. Recomendo!",
    rating: 5
  },
  {
    id: 2,
    name: "João Santos",
    age: 52,
    text: "Estava com dificuldades de memória e após 3 semanas já notei diferença significativa.",
    rating: 5
  },
  {
    id: 3,
    name: "Ana Costa",
    age: 38,
    text: "O melhor é que é natural! Me sinto mais disposta o dia todo sem aquela sensação de ansiedade.",
    rating: 5
  }
];

export const faqData = [
  {
    id: "item-1",
    question: "O que é o NeuroVita?",
    answer: "NeuroVita é um suplemento natural desenvolvido para auxiliar na melhora da memória, concentração e disposição. Nossa fórmula exclusiva combina ingredientes naturais cientificamente estudados."
  },
  {
    id: "item-2",
    question: "Como devo tomar o NeuroVita?",
    answer: "Recomendamos tomar 2 cápsulas ao dia, preferencialmente pela manhã, com um copo de água. Para melhores resultados, mantenha o uso contínuo."
  },
  {
    id: "item-3",
    question: "Quanto tempo leva para ver resultados?",
    answer: "Os resultados podem variar de pessoa para pessoa, mas a maioria dos usuários relatam melhorias perceptíveis entre 2 a 4 semanas de uso contínuo."
  },
  {
    id: "item-4",
    question: "O NeuroVita possui contraindicações?",
    answer: "Por ser um produto natural, o NeuroVita é seguro para a maioria das pessoas. No entanto, gestantes, lactantes e pessoas com condições médicas específicas devem consultar um médico antes do uso."
  },
  {
    id: "item-5",
    question: "Como funciona a oferta das amostras grátis?",
    answer: "Você recebe 2 amostras grátis do NeuroVita pagando apenas o frete. É a oportunidade perfeita para experimentar nosso produto sem compromisso."
  },
  {
    id: "item-6",
    question: "Qual a forma de pagamento?",
    answer: "Aceitamos pagamento via PIX, que é instantâneo e seguro. Após a confirmação do pagamento, seu pedido é enviado em até 24 horas úteis."
  },
  {
    id: "item-7",
    question: "Como acompanho meu pedido?",
    answer: "Após o envio, você receberá o código de rastreamento por e-mail ou WhatsApp para acompanhar a entrega em tempo real."
  }
];

export const aboutData = {
  mission: "Nossa missão é proporcionar saúde e bem-estar através de suplementos naturais de alta qualidade, ajudando pessoas a alcançarem seu potencial máximo de memória e disposição.",
  vision: "Ser referência nacional em suplementação natural para saúde cognitiva, reconhecida pela qualidade e eficácia de nossos produtos.",
  values: [
    "Qualidade sem compromisso",
    "Ingredientes 100% naturais",
    "Transparência com nossos clientes",
    "Compromisso com resultados",
    "Atendimento humanizado"
  ],
  history: "A NeuroVita nasceu da busca por soluções naturais para melhorar a qualidade de vida. Fundada por especialistas em nutrição e fitoterapia, nossa empresa se dedica a desenvolver fórmulas que combinam o melhor da natureza com a ciência moderna."
};

export const productData = {
  name: "NeuroVita",
  subtitle: "Suplemento Natural para Memória e Disposição",
  description: "2 Amostras Grátis - Pague apenas o frete!",
  originalPrice: 197.00,
  promoText: "OFERTA ESPECIAL",
  freeText: "GRÁTIS",
  capsules: "60 cápsulas por frasco",
  quantities: [
    { id: 1, amount: 2, label: "2 Amostras", price: 0, shipping: true },
  ]
};

// Simulated shipping rates by region
export const shippingRates = {
  sudeste: { min: 15.90, max: 22.90, days: "3 a 5" },
  sul: { min: 18.90, max: 25.90, days: "4 a 6" },
  nordeste: { min: 22.90, max: 32.90, days: "5 a 8" },
  norte: { min: 25.90, max: 38.90, days: "6 a 10" },
  centroOeste: { min: 19.90, max: 28.90, days: "4 a 7" }
};

export const regionByState = {
  SP: "sudeste", RJ: "sudeste", MG: "sudeste", ES: "sudeste",
  PR: "sul", SC: "sul", RS: "sul",
  BA: "nordeste", SE: "nordeste", AL: "nordeste", PE: "nordeste", 
  PB: "nordeste", RN: "nordeste", CE: "nordeste", PI: "nordeste", MA: "nordeste",
  AM: "norte", PA: "norte", AC: "norte", RO: "norte", RR: "norte", AP: "norte", TO: "norte",
  MT: "centroOeste", MS: "centroOeste", GO: "centroOeste", DF: "centroOeste"
};