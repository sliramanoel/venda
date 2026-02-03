from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum

class OrderStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    SHIPPED = "shipped"
    DELIVERED = "delivered"

# ============== SITE SETTINGS ==============

class ProductOption(BaseModel):
    id: int
    name: str
    description: str
    price: float
    isDefault: bool = False

class SiteColors(BaseModel):
    primary: str = "#10b981"  # emerald-500
    secondary: str = "#14b8a6"  # teal-500
    accent: str = "#f59e0b"  # amber-500
    background: str = "#f8fafc"  # slate-50

class HeroSection(BaseModel):
    badge: str = "100% Natural"
    title: str = "Memória Afiada, Energia Plena"
    subtitle: str = "Suplemento natural para potencializar sua memória e disposição diária."
    ctaText: str = "Quero Experimentar Grátis"
    showUrgencyBar: bool = True
    urgencyText: str = "ATENÇÃO: Restam apenas 23 unidades em estoque!"

class BenefitItem(BaseModel):
    icon: str
    title: str
    description: str

class TestimonialItem(BaseModel):
    name: str
    age: int
    text: str
    rating: int = 5

class FAQItem(BaseModel):
    question: str
    answer: str

class SettingsBase(BaseModel):
    # Brand
    siteName: str = "NeuroVita"
    tagline: str = "Memória Afiada, Energia Plena"
    description: str = "Suplemento natural para potencializar sua memória e disposição diária."
    logoUrl: str = ""
    faviconUrl: str = ""
    
    # Theme / Colors
    primaryColor: str = "#059669"  # emerald-600
    primaryColorLight: str = "#d1fae5"  # emerald-100
    primaryColorDark: str = "#047857"  # emerald-700
    secondaryColor: str = "#0d9488"  # teal-600
    accentColor: str = "#f59e0b"  # amber-500
    
    # Contact
    phone: str = "(11) 99999-9999"
    email: str = "contato@neurovita.com.br"
    instagram: str = "@neurovita"
    whatsapp: str = "5511999999999"
    
    # Payment
    paymentLink: str = ""
    
    # Product
    productName: str = "NeuroVita"
    productSubtitle: str = "Suplemento Natural para Memória e Disposição"
    productDescription: str = "60 cápsulas por frasco"
    originalPrice: float = 197.00
    pricePerBottle: float = 197.00
    
    # Product Options
    productOptions: List[ProductOption] = [
        ProductOption(id=1, name="2 Amostras Grátis", description="Pague apenas o frete", price=0, isDefault=True),
        ProductOption(id=2, name="2 Amostras + 1 Frasco", description="60 cápsulas extras", price=197),
        ProductOption(id=3, name="2 Amostras + 2 Frascos", description="120 cápsulas extras", price=394),
    ]
    
    # Hero Section
    hero: HeroSection = HeroSection()
    
    # Colors
    colors: SiteColors = SiteColors()
    
    # Benefits
    benefits: List[BenefitItem] = [
        BenefitItem(icon="Brain", title="Memória Aprimorada", description="Ingredientes naturais que auxiliam na concentração e retenção de informações."),
        BenefitItem(icon="Zap", title="Energia Natural", description="Disposição duradoura sem os efeitos colaterais de estimulantes artificiais."),
        BenefitItem(icon="Shield", title="100% Natural", description="Fórmula desenvolvida com ingredientes naturais e sem aditivos químicos."),
        BenefitItem(icon="Clock", title="Resultados Rápidos", description="Sinta a diferença em poucas semanas de uso contínuo."),
    ]
    
    # Testimonials
    testimonials: List[TestimonialItem] = [
        TestimonialItem(name="Maria Silva", age=45, text="Depois de começar a tomar, minha concentração no trabalho melhorou muito. Recomendo!", rating=5),
        TestimonialItem(name="João Santos", age=52, text="Estava com dificuldades de memória e após 3 semanas já notei diferença significativa.", rating=5),
        TestimonialItem(name="Ana Costa", age=38, text="O melhor é que é natural! Me sinto mais disposta o dia todo.", rating=5),
    ]
    
    # FAQ
    faq: List[FAQItem] = [
        FAQItem(question="O que é este produto?", answer="É um suplemento natural desenvolvido para auxiliar na melhora da memória, concentração e disposição."),
        FAQItem(question="Como devo tomar?", answer="Recomendamos tomar 2 cápsulas ao dia, preferencialmente pela manhã, com um copo de água."),
        FAQItem(question="Quanto tempo leva para ver resultados?", answer="Os resultados podem variar, mas a maioria dos usuários relatam melhorias entre 2 a 4 semanas de uso contínuo."),
        FAQItem(question="Possui contraindicações?", answer="Por ser um produto natural, é seguro para a maioria das pessoas. Gestantes, lactantes e pessoas com condições médicas específicas devem consultar um médico."),
        FAQItem(question="Como funciona a oferta das amostras grátis?", answer="Você recebe 2 amostras grátis pagando apenas o frete. É a oportunidade perfeita para experimentar."),
        FAQItem(question="Qual a forma de pagamento?", answer="Aceitamos pagamento via PIX, que é instantâneo e seguro."),
        FAQItem(question="Como acompanho meu pedido?", answer="Após o envio, você receberá o código de rastreamento por e-mail ou WhatsApp."),
    ]
    
    # About Page
    aboutMission: str = "Nossa missão é proporcionar saúde e bem-estar através de suplementos naturais de alta qualidade."
    aboutVision: str = "Ser referência nacional em suplementação natural, reconhecida pela qualidade e eficácia."
    aboutHistory: str = "Nascemos da busca por soluções naturais para melhorar a qualidade de vida. Fundada por especialistas, nossa empresa se dedica a desenvolver fórmulas que combinam o melhor da natureza com a ciência moderna."
    aboutValues: List[str] = [
        "Qualidade sem compromisso",
        "Ingredientes 100% naturais",
        "Transparência com nossos clientes",
        "Compromisso com resultados",
        "Atendimento humanizado"
    ]
    
    # SEO & Meta Ads
    metaPixelId: str = ""  # Facebook/Meta Pixel ID
    googleAnalyticsId: str = ""  # Google Analytics ID (optional)
    
    # Open Graph / Social Sharing
    ogTitle: str = ""  # Falls back to siteName + tagline if empty
    ogDescription: str = ""  # Falls back to description if empty
    ogImage: str = ""  # Image URL for social sharing
    
    # SEO
    metaTitle: str = ""  # <title> tag - falls back to siteName if empty
    metaDescription: str = ""  # Meta description - falls back to description if empty
    metaKeywords: str = "suplemento natural, memória, concentração, disposição, energia"
    
    # Payment Gateway Configuration
    paymentGateway: str = "orionpay"  # orionpay, mercadopago, pagseguro, etc.
    orionpayApiKey: str = ""  # OrionPay API Key
    orionpayWebhookSecret: str = ""  # OrionPay Webhook Secret (optional)
    paymentTestMode: bool = True  # Enable test mode for payments
    pixExpirationMinutes: int = 30  # PIX expiration time in minutes

class SettingsUpdate(BaseModel):
    siteName: Optional[str] = None
    tagline: Optional[str] = None
    description: Optional[str] = None
    logoUrl: Optional[str] = None
    faviconUrl: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    instagram: Optional[str] = None
    whatsapp: Optional[str] = None
    paymentLink: Optional[str] = None
    productName: Optional[str] = None
    productSubtitle: Optional[str] = None
    productDescription: Optional[str] = None
    originalPrice: Optional[float] = None
    pricePerBottle: Optional[float] = None
    productOptions: Optional[List[ProductOption]] = None
    hero: Optional[HeroSection] = None
    colors: Optional[SiteColors] = None
    benefits: Optional[List[BenefitItem]] = None
    testimonials: Optional[List[TestimonialItem]] = None
    faq: Optional[List[FAQItem]] = None
    aboutMission: Optional[str] = None
    aboutVision: Optional[str] = None
    aboutHistory: Optional[str] = None
    aboutValues: Optional[List[str]] = None
    # SEO & Meta Ads
    metaPixelId: Optional[str] = None
    googleAnalyticsId: Optional[str] = None
    ogTitle: Optional[str] = None
    ogDescription: Optional[str] = None
    ogImage: Optional[str] = None
    metaTitle: Optional[str] = None
    metaDescription: Optional[str] = None
    metaKeywords: Optional[str] = None
    # Payment Gateway
    paymentGateway: Optional[str] = None
    orionpayApiKey: Optional[str] = None
    orionpayWebhookSecret: Optional[str] = None
    paymentTestMode: Optional[bool] = None
    pixExpirationMinutes: Optional[int] = None
    # Theme / Colors
    primaryColor: Optional[str] = None
    primaryColorLight: Optional[str] = None
    primaryColorDark: Optional[str] = None
    secondaryColor: Optional[str] = None
    accentColor: Optional[str] = None

class SettingsResponse(SettingsBase):
    id: str = Field(alias="_id")
    updatedAt: datetime

    class Config:
        populate_by_name = True

# ============== PRODUCT IMAGES ==============

class ProductImagesBase(BaseModel):
    main: str = "https://images.unsplash.com/photo-1763668331599-487470fb85b2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTF8MHwxfHNlYXJjaHwzfHxzdXBwbGVtZW50JTIwYm90dGxlfGVufDB8fHx8MTc3MDA3NDk5NXww&ixlib=rb-4.1.0&q=85"
    secondary: str = "https://images.unsplash.com/photo-1763668444855-401b58dceb20?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTF8MHwxfHNlYXJjaHwyfHxzdXBwbGVtZW50JTIwYm90dGxlfGVufDB8fHx8MTc3MDA3NDk5NXww&ixlib=rb-4.1.0&q=85"
    tertiary: str = "https://images.unsplash.com/photo-1763668177859-0ed5669a795e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTF8MHwxfHNlYXJjaHwxfHxzdXBwbGVtZW50JTIwYm90dGxlfGVufDB8fHx8MTc3MDA3NDk5NXww&ixlib=rb-4.1.0&q=85"
    logo: str = ""
    favicon: str = ""

class ProductImagesUpdate(BaseModel):
    main: Optional[str] = None
    secondary: Optional[str] = None
    tertiary: Optional[str] = None
    logo: Optional[str] = None
    favicon: Optional[str] = None

class ProductImagesResponse(ProductImagesBase):
    id: str = Field(alias="_id")
    updatedAt: datetime

    class Config:
        populate_by_name = True

# ============== ORDERS ==============

class OrderCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    cep: str
    address: str
    number: str
    complement: Optional[str] = ""
    neighborhood: str
    city: str
    state: str
    quantity: int = Field(ge=1, le=3)
    productPrice: float
    shippingPrice: float
    totalPrice: float
    # UTM tracking fields for Meta Ads attribution
    utmSource: Optional[str] = ""
    utmMedium: Optional[str] = ""
    utmCampaign: Optional[str] = ""
    utmTerm: Optional[str] = ""
    utmContent: Optional[str] = ""
    fbclid: Optional[str] = ""

class OrderResponse(BaseModel):
    id: str = Field(alias="_id")
    orderNumber: str
    name: str
    email: str
    phone: str
    cep: str
    address: str
    number: str
    complement: Optional[str] = ""
    neighborhood: str
    city: str
    state: str
    quantity: int
    productPrice: float
    shippingPrice: float
    totalPrice: float
    status: OrderStatus
    createdAt: datetime
    updatedAt: datetime

    class Config:
        populate_by_name = True

class OrderStatusUpdate(BaseModel):
    status: OrderStatus
