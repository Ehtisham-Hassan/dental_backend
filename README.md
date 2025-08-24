# 🏥 Dental Automation Backend API

A robust Express.js backend API for dental practice automation, supporting Easy Dental and Dentemax systems.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **CRUD Operations**: Complete API for practices, patients, claims, alerts, and users
- **Database Integration**: PostgreSQL with Neon serverless database
- **Security**: Helmet, CORS, rate limiting, input validation
- **HIPAA Compliance**: Secure data handling and access controls

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database (Neon recommended)
- npm or yarn

## 🛠️ Installation

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   DATABASE_URL="your-neon-postgresql-url"
   JWT_SECRET="your-super-secret-jwt-key"
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL="http://localhost:3003"
   ```

4. **Database Setup**
   ```bash
   # Test database connection
   npm run test-db
   
   # Run migrations
   npm run migrate
   
   # Seed with sample data
   npm run seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/verify` - Verify JWT token

### Practices
- `GET /api/practices` - Get all practices
- `POST /api/practices` - Create practice
- `GET /api/practices/:id` - Get practice by ID
- `PUT /api/practices/:id` - Update practice
- `DELETE /api/practices/:id` - Delete practice

### Patients
- `GET /api/patients` - Get all patients (with practiceId filter)
- `POST /api/patients` - Create patient
- `GET /api/patients/:id` - Get patient by ID
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Claims
- `GET /api/claims` - Get all claims (with practiceId/status filters)
- `POST /api/claims` - Create claim
- `GET /api/claims/:id` - Get claim by ID
- `PUT /api/claims/:id` - Update claim
- `DELETE /api/claims/:id` - Delete claim

### Alerts
- `GET /api/alerts` - Get all alerts (with practiceId/resolved/priority filters)
- `POST /api/alerts` - Create alert
- `GET /api/alerts/:id` - Get alert by ID
- `PUT /api/alerts/:id` - Update alert
- `DELETE /api/alerts/:id` - Delete alert

### Users
- `GET /api/users` - Get all users (with practiceId filter)
- `POST /api/users` - Create user

### Automation
- `GET /api/automation` - Get automation logs (with practiceId/type filters)
- `POST /api/automation` - Create automation log

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## 🔐 Authentication

All endpoints (except auth endpoints) require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📊 Database Schema

### Tables
- **practices**: Dental practice information
- **patients**: Patient records
- **claims**: Insurance claims
- **alerts**: System alerts and notifications
- **users**: User accounts and authentication
- **automation_logs**: Automation activity tracking

## 🚀 Deployment

### Railway Deployment

1. **Connect to Railway**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login to Railway
   railway login
   
   # Initialize project
   railway init
   ```

2. **Set Environment Variables**
   ```bash
   railway variables set DATABASE_URL="your-neon-url"
   railway variables set JWT_SECRET="your-secret"
   railway variables set NODE_ENV="production"
   railway variables set FRONTEND_URL="your-frontend-url"
   ```

3. **Deploy**
   ```bash
   railway up
   ```

### Other Platforms

The backend can be deployed to any platform supporting Node.js:
- Vercel
- Heroku
- DigitalOcean App Platform
- AWS Elastic Beanstalk

## 🧪 Testing

```bash
# Test database connection
npm run test-db

# Health check
curl http://localhost:5000/health
```

## 📝 Sample Data

After running `npm run seed`, you'll have:

**Test Credentials:**
- Email: `admin@downtowndental.com`
- Password: `password123`
- Email: `admin@uptowndental.com`
- Password: `password123`

**Sample Data:**
- 2 practices (Easy Dental + Dentemax)
- 5 patients with insurance info
- 8 claims (mix of paid, unpaid, underpaid)
- 6 alerts
- 5 automation logs

## 🔧 Development

### Project Structure
```
backend/
├── src/
│   ├── routes/          # API route handlers
│   ├── models/          # Database models and migrations
│   ├── middleware/      # Authentication and validation
│   ├── utils/           # Utility functions
│   └── server.js        # Main server file
├── package.json
├── env.example
└── README.md
```

### Available Scripts
- `npm run dev` - Start development server
- `npm start` - Start production server
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with sample data
- `npm run test-db` - Test database connection

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Input Validation**: Express-validator for request validation
- **Rate Limiting**: Prevents abuse
- **CORS Protection**: Configurable cross-origin requests
- **Helmet**: Security headers
- **SQL Injection Protection**: Parameterized queries

## 📞 Support

For issues or questions:
1. Check the database connection
2. Verify environment variables
3. Review API documentation
4. Check server logs

## 📄 License

MIT License - see LICENSE file for details
