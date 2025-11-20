# Core Service - Centralized Authentication and Company Management

Core Service je centrálna mikroslužba pre správu používateľov, spoločností a autentifikácie v ekosystéme Terminar aplikácií.

## 🚀 Funkcie

### Autentifikácia
- **Registrácia/Prihlásenie** používateľov
- **JWT tokens** (access + refresh)
- **Obnova hesla** cez email
- **Multi-device** logout
- **Role-based** prístup

### Správa používateľov
- **CRUD operácie** pre používateľov
- **Profily používateľov** s rozšírenými informáciami
- **Aktivácia/deaktivácia** účtov
- **Správa rolí** a oprávnení

### Správa spoločností
- **CRUD operácie** pre spoločnosti
- **Nastavenia spoločností** (JSON konfigurácia)
- **Logo upload** funkcionalita
- **Štatistiky** spoločností

### API integrácia
- **API keys** pre externé služby
- **Validácia používateľov** pre externé služby
- **Integration logs** pre sledovanie aktivít
- **Flexible auth** (JWT token alebo API key)

## 🏗️ Architektúra

```
core-service/
├── src/
│   ├── controllers/       # Business logika
│   ├── middleware/       # Auth, validácia, error handling
│   ├── models/          # Databázové modely
│   ├── routes/          # API endpoint definície
│   ├── utils/           # Pomocné funkcie
│   └── server.js        # Main server file
├── uploads/             # File uploads
└── package.json
```

## 🔧 Nastavenie

### 1. Environment Variables

Vytvor `.env` súbor podľa `.env.example`:

```bash
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/core_db

# JWT
JWT_SECRET=super_secret_jwt_key_here
JWT_REFRESH_SECRET=super_secret_refresh_key_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:4000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# External Services
VOUCHER_SERVICE_URL=http://localhost:4000
RESERVATION_SERVICE_URL=http://localhost:6000
```

### 2. Spustenie služby

```bash
# Inštalácia závislostí
npm install

# Development mode
npm run dev

# Production mode
npm start
```

### 3. Databáza

Služba automaticky vytvorí potrebné tabuľky pri prvom spustení.

## 📚 API Dokumentácia

### Authentication Endpoints

```bash
# Registrácia
POST /api/auth/register

# Prihlásenie
POST /api/auth/login

# Obnova tokenu
POST /api/auth/refresh

# Odhlásenie
POST /api/auth/logout

# Profil používateľa
GET /api/auth/profile
PUT /api/auth/profile

# Zmena hesla
PUT /api/auth/change-password
```

### User Management

```bash
# Získať používateľov spoločnosti
GET /api/users

# Vytvoriť používateľa
POST /api/users

# Aktualizovať používateľa
PUT /api/users/:id

# Zmazať používateľa
DELETE /api/users/:id

# Aktivovať/deaktivovať
PUT /api/users/:id/activate
PUT /api/users/:id/deactivate
```

### Company Management

```bash
# Získať spoločnosť
GET /api/companies

# Aktualizovať spoločnosť
PUT /api/companies

# Nastavenia spoločnosti
GET /api/companies/settings
PUT /api/companies/settings

# Logo management
POST /api/companies/logo
DELETE /api/companies/logo
```

### API Keys

```bash
# Získať API keys
GET /api/api-keys

# Vytvoriť API key
POST /api/api-keys

# Aktualizovať API key
PUT /api/api-keys/:id

# Zmazať API key
DELETE /api/api-keys/:id
```

### Integration Endpoints

```bash
# Validovať používateľa (pre externé služby)
POST /api/integration/validate-user

# Získať spoločnosť (pre externé služby)
GET /api/integration/company/:companyId

# Logovať aktivitu
POST /api/integration/log

# Health check
GET /api/integration/health
```

## 🔐 Authentication

### JWT Tokens

```javascript
// Access token payload
{
  "userId": 123,
  "companyId": 456,
  "email": "user@example.com",
  "role": "admin",
  "permissions": ["*"],
  "companySlug": "example-company",
  "iat": 1642678800,
  "exp": 1642679700
}
```

### API Key Authentication

API keys sa používajú pre komunikáciu medzi službami:

```bash
# Header
X-API-Key: tk_abcd1234567890...

# Permissions
{
  "permissions": ["users:read", "companies:read", "*"]
}
```

## 🔄 Integrácia s externými službami

### Voucher Service Integration

```javascript
// Validácia používateľa pre voucher service
const response = await fetch('http://localhost:5000/api/integration/validate-user', {
  method: 'POST',
  headers: {
    'X-API-Key': 'your-api-key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userId: 123,
    companyId: 456
  })
});
```

### Reservation Service Integration

```javascript
// Získanie spoločnosti pre reservation service
const response = await fetch('http://localhost:5000/api/integration/company/456', {
  headers: {
    'X-API-Key': 'your-api-key'
  }
});
```

## 📊 Databázová štruktúra

### Hlavné tabuľky

- **companies** - Informácie o spoločnostiach
- **users** - Používateľské účty
- **user_profiles** - Rozšírené profily používateľov
- **refresh_tokens** - JWT refresh tokens
- **api_keys** - API keys pre externé služby
- **integration_logs** - Logy integračných aktivít

## 🔒 Bezpečnosť

- **Helmet** pre HTTP security headers
- **Rate limiting** proti DDoS útokom
- **CORS** konfigurácia
- **Password hashing** s bcrypt
- **JWT token** validation
- **API key** authentication
- **Permission-based** access control

## 📈 Monitoring

Služba loguje:
- HTTP požiadavky a odpovede
- Databázové queries
- Integration aktivity
- Chyby a výnimky

## 🚀 Deployment

```bash
# Build
npm run build

# Start production
NODE_ENV=production npm start

# Health check
curl http://localhost:5000/health
```

## 🤝 Príklad použitia

### 1. Registrácia novej spoločnosti

```javascript
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@newcompany.com',
    password: 'securePassword123',
    firstName: 'John',
    lastName: 'Doe',
    companyName: 'New Company Ltd.',
    companySlug: 'new-company'
  })
});
```

### 2. Vytvírenie API key pre voucher service

```javascript
const response = await fetch('/api/api-keys', {
  method: 'POST',
  headers: { 
    'Authorization': 'Bearer your-jwt-token',
    'Content-Type': 'application/json' 
  },
  body: JSON.stringify({
    name: 'Voucher Service Integration',
    permissions: ['users:read', 'companies:read', 'vouchers:*']
  })
});
```

### 3. Integrácia z voucher service

```javascript
// Vo voucher service
const validateUser = async (userId) => {
  const response = await fetch(`${CORE_SERVICE_URL}/api/integration/validate-user`, {
    method: 'POST',
    headers: {
      'X-API-Key': process.env.CORE_SERVICE_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userId })
  });
  
  return response.json();
};
```