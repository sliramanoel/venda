# NeuroVita - Sales Website PRD

## Project Overview
A complete whitelabel sales website for supplements, built with React frontend and FastAPI backend. The platform is designed to be fully customizable through an admin panel, making it reusable as a template for different products.

## Original Problem Statement
Build a sales website for a supplement named "NeuroVita" that improves memory and disposition. The site should be modern, responsive (mobile-first), include a shipping calculator, and integrate with PIX payments via OrionPay API.

## User Personas
1. **End Customer**: Mobile users looking to purchase natural supplements
2. **Business Owner/Admin**: Manages product content, images, and orders through admin panel

## Core Requirements (Completed)
- [x] Modern, clean design with mobile-first responsiveness
- [x] Dynamic product options with configurable pricing
- [x] Shipping calculator using ViaCEP API
- [x] PIX payment integration via OrionPay API
- [x] Scarcity features (countdown timer, stock indicator)
- [x] Admin panel for complete content management

## Technology Stack
- **Frontend**: React.js with Tailwind CSS and Shadcn UI
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **APIs**: ViaCEP (shipping), OrionPay (payments)

## Architecture

### Backend Structure
```
/app/backend/
├── server.py          # FastAPI main app
├── models.py          # Pydantic models
├── routers/
│   ├── settings.py    # Site configuration API
│   ├── images.py      # Product images API
│   ├── orders.py      # Order management API
│   ├── payments.py    # PIX payment generation
│   └── webhooks.py    # OrionPay webhook handler
```

### Frontend Structure
```
/app/frontend/src/
├── components/        # Header, Footer, UI components
├── pages/            # Home, Vendas, FAQ, QuemSomos, Admin, Pagamento
└── services/api.js   # API client
```

## Key Features

### 1. Whitelabel CMS (NEW - Dec 2025)
All site content is managed through admin panel:
- **Brand**: Site name, logo, tagline, contact info
- **Product**: Name, subtitle, description, pricing, options
- **Hero Section**: Title, subtitle, CTA text, urgency bar
- **Benefits**: Customizable benefit cards with icons
- **Testimonials**: Customer reviews with ratings
- **FAQ**: Dynamic questions and answers
- **About Page**: Mission, vision, history, values
- **Images**: Product images management

### 2. Sales Flow
1. Customer selects product option
2. Enters shipping address (CEP auto-fills via ViaCEP)
3. Reviews order summary
4. Proceeds to PIX payment page
5. Scans QR code or copies PIX code
6. Payment confirmed via OrionPay webhook

### 3. Admin Panel
- 9 configuration tabs for complete customization
- Order management with status tracking
- All changes persist to MongoDB

## API Endpoints

### Authentication (NEW)
- `POST /api/auth/register` - Register new admin user
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/verify` - Verify JWT token

### Uploads (NEW)
- `POST /api/uploads/image` - Upload image file (multipart/form-data)
- `GET /api/uploads/images/{filename}` - Serve uploaded image
- `GET /api/uploads/list` - List all uploaded images
- `DELETE /api/uploads/images/{filename}` - Delete image

### Webhooks
- `GET /api/webhooks/orionpay/test` - Test webhook endpoint
- `POST /api/webhooks/orionpay` - Receive OrionPay payment notifications
- `POST /api/webhooks/orionpay/simulate-payment` - Simulate payment (for testing)

### Settings
- `GET /api/settings` - Get site configuration
- `PUT /api/settings` - Update configuration
- `POST /api/settings/reset` - Reset to defaults

### Images
- `GET /api/images` - Get product images
- `PUT /api/images` - Update images
- `POST /api/images/reset` - Reset to defaults

### Orders
- `GET /api/orders` - List all orders
- `POST /api/orders` - Create new order
- `GET /api/orders/{id}` - Get order details
- `PATCH /api/orders/{id}/status` - Update order status

### Payments
- `POST /api/payments/pix/generate` - Generate PIX payment
- `GET /api/payments/pix/status/{order_id}` - Check payment status
- `POST /api/webhook/orionpay` - Payment webhook

## Environment Variables

### Backend (.env)
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
CORS_ORIGINS=*
ORIONPAY_API_KEY=opay_xxxxx
```

### Frontend (.env)
```
REACT_APP_BACKEND_URL=https://neurovita-sales.preview.emergentagent.com
```

## Testing Status
- **Backend**: 100% (14 tests passed)
- **Frontend**: 100% (All pages functional)
- **Test Reports**: `/app/test_reports/iteration_1.json`

## What's Implemented (Dec 2025)

### Completed Features
1. ✅ Home page with dynamic content
2. ✅ Sales page with product options
3. ✅ FAQ page with dynamic questions
4. ✅ About page with editable content
5. ✅ Admin panel with 9 configuration tabs
6. ✅ Shipping calculator (ViaCEP)
7. ✅ PIX payment integration (OrionPay)
8. ✅ Mobile-responsive design
9. ✅ Countdown timer & urgency elements
10. ✅ Complete whitelabel/CMS functionality
11. ✅ **Authentication System (JWT)** - Dec 2025
    - User registration with email/password
    - Secure login with JWT tokens
    - Password hashing with bcrypt
    - Protected admin routes
    - Logout functionality
12. ✅ **Payment Webhook & Simulation (P1)** - Dec 2025
    - OrionPay webhook endpoint for payment confirmation
    - Payment simulation endpoint for testing
    - Order status updates (pending → paid)
13. ✅ **Image Upload System (P2)** - Dec 2025
    - File upload endpoint with validation
    - Support for JPG, PNG, GIF, WebP, SVG
    - Max 5MB file size
    - Admin panel with URL/Upload toggle
    - Image serving with caching

## Backlog / Future Enhancements

### P1 (High Priority)
- [x] ~~Test OrionPay webhook end-to-end (payment confirmation flow)~~ ✅ DONE
- [x] ~~Add image upload functionality (instead of URL)~~ ✅ DONE

### P2 (Medium Priority)
- [ ] Order status email notifications
- [ ] Multiple payment methods
- [ ] Order tracking page for customers
- [ ] SEO meta tags configuration
- [ ] Password recovery via email

### P3 (Low Priority)
- [ ] Multi-language support
- [ ] A/B testing for different layouts
- [ ] Analytics dashboard
- [ ] Discount codes system
- [ ] Two-factor authentication (2FA)

## Known Considerations
- Database is MongoDB - data persists across restarts
- OrionPay API key stored in backend .env
- All frontend pages fetch settings on mount (could be optimized with context)

## Last Updated
December 3, 2025
