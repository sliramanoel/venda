# Contracts - NeuroVita API

## Visão Geral
Backend para gerenciar configurações do site, imagens e pedidos do NeuroVita.

## Endpoints

### 1. Configurações do Site
**GET /api/settings**
- Retorna configurações atuais do site

**PUT /api/settings**
- Atualiza configurações do site
- Body: `{ name, tagline, description, phone, email, instagram, paymentLink }`

### 2. Imagens do Produto
**GET /api/images**
- Retorna URLs das imagens do produto

**PUT /api/images**
- Atualiza URLs das imagens
- Body: `{ main, secondary, tertiary }`

### 3. Pedidos
**POST /api/orders**
- Cria novo pedido
- Body: `{ name, email, phone, cep, address, number, complement, neighborhood, city, state, quantity, productPrice, shippingPrice, totalPrice }`

**GET /api/orders**
- Lista todos os pedidos (admin)

**GET /api/orders/:id**
- Retorna pedido específico

## Modelos MongoDB

### Settings
```
{
  _id: ObjectId,
  name: String,
  tagline: String,
  description: String,
  phone: String,
  email: String,
  instagram: String,
  paymentLink: String,
  updatedAt: DateTime
}
```

### ProductImages
```
{
  _id: ObjectId,
  main: String,
  secondary: String,
  tertiary: String,
  updatedAt: DateTime
}
```

### Order
```
{
  _id: ObjectId,
  orderNumber: String,
  name: String,
  email: String,
  phone: String,
  cep: String,
  address: String,
  number: String,
  complement: String,
  neighborhood: String,
  city: String,
  state: String,
  quantity: Number (1, 2 ou 3),
  productPrice: Number,
  shippingPrice: Number,
  totalPrice: Number,
  status: String (pending, paid, shipped, delivered),
  createdAt: DateTime,
  updatedAt: DateTime
}
```

## Integração Frontend

### Remover do mock.js:
- siteConfig → buscar de /api/settings
- productImages → buscar de /api/images

### Atualizar páginas:
- Vendas.jsx → POST /api/orders ao finalizar
- Admin.jsx → GET/PUT /api/settings e /api/images
