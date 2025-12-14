# 🍬 Sweet Shop Management System

A full-stack Sweet Shop Management System with **concurrency-safe purchases**, built with FastAPI and React.

## ✨ Features

### 🔐 Authentication & Authorization
- **JWT-based Authentication**: Secure login/registration with bcrypt password hashing
- **Role-Based Access Control**: Admin and customer roles with protected routes
- **Session Management**: Persistent login state with automatic token refresh

### 🛒 Shopping Experience
- **Sweet Catalog**: Browse chocolates, candies, and pastries with rich imagery
- **Advanced Search & Filtering**: Find sweets by name, category, price, and stock
- **Shopping Cart**: Add multiple items, adjust quantities, and batch checkout
- **Real-time Stock Updates**: Live inventory tracking with instant feedback

### 🛡️ Concurrency & Safety
- **Atomic Purchases**: Database transactions prevent race conditions
- **Stock Validation**: Real-time quantity checks during purchase
- **Error Handling**: Graceful failure handling with user feedback

### 👨‍💼 Admin Dashboard
- **Inventory Management**: Full CRUD operations for sweet catalog
- **Real-time Analytics**: Stock levels and sales tracking
- **Bulk Operations**: Efficient management of large inventories

### 🎨 Modern UI/UX
- **Dark Theme**: Elegant glassmorphism design with smooth animations
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Toast Notifications**: Real-time feedback for all user actions
- **Loading States**: Skeleton screens and progress indicators
- **Micro-interactions**: Hover effects and smooth transitions

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Database**: SQLite with aiosqlite (async)
- **ORM**: SQLAlchemy 2.0+
- **Authentication**: PyJWT + bcrypt
- **Testing**: pytest + pytest-asyncio

### Frontend
- **Framework**: React 18 + Vite
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Routing**: React Router DOM

## 📁 Project Structure

```
├── backend/
│   ├── app/
│   │   ├── models/          # SQLAlchemy models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── repositories/    # Data access layer
│   │   ├── services/        # Business logic
│   │   ├── routers/         # API endpoints
│   │   ├── security/        # JWT & password utilities
│   │   └── main.py          # FastAPI application
│   ├── tests/               # Test suite
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── components/      # Reusable components
    │   ├── pages/           # Page components
    │   ├── stores/          # Zustand store
    │   └── services/        # API client
    └── package.json
```

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn

### 1. Environment Setup

```bash
# Run the automated setup script
python setup_env.py

# Or manually copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

**Important**: Update the environment files with your specific values, especially:
- `JWT_SECRET_KEY` in backend/.env
- `DATABASE_URL` for production deployments

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run database migration
python migrate_db.py

# Create admin user (optional)
python create_test_admin.py

# Run the server
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`
- 📚 Swagger docs: `http://localhost:8000/docs`
- 📖 ReDoc: `http://localhost:8000/redoc`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

The app will be available at `http://localhost:5173`

## 🔧 Environment Configuration

### Backend Environment Variables

The backend uses environment variables for configuration. Key variables include:

```bash
# Security (REQUIRED)
JWT_SECRET_KEY=your-super-secure-secret-key-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database
DATABASE_URL=sqlite+aiosqlite:///./sweetshop.db
# For production: postgresql+asyncpg://user:password@localhost/sweetshop

# Application
APP_NAME=Sweet Shop API
DEBUG=true
ENVIRONMENT=development

# CORS & Security
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
ADMIN_IP_WHITELIST=127.0.0.1,::1
ENABLE_IP_WHITELIST=false

# File Upload
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp
UPLOAD_DIR=uploads
```

### Frontend Environment Variables

The frontend uses Vite environment variables (prefixed with `VITE_`):

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api
VITE_API_TIMEOUT=15000

# App Configuration
VITE_APP_NAME=Sweet Shop
VITE_ENVIRONMENT=development

# Feature Flags
VITE_ENABLE_DEBUG=true
VITE_ENABLE_ANALYTICS=false
```

### Security Best Practices

- ✅ **Never commit `.env` files** to version control
- ✅ **Use `.env.example`** files as templates
- ✅ **Generate strong JWT secrets** (64+ characters)
- ✅ **Use HTTPS in production**
- ✅ **Enable IP whitelisting** for admin endpoints in production
- ✅ **Use PostgreSQL** for production databases
- ✅ **Set DEBUG=false** in production

### 3. Default Accounts

After running the setup scripts:
- **Admin**: Use the account created with `create_admin_user.py`
- **Customer**: Register a new account through the UI

## 🎯 Usage Guide

### For Customers
1. **Register/Login**: Create an account or sign in
2. **Browse Catalog**: Use search and filters to find sweets
3. **Add to Cart**: Build your order with multiple items
4. **Checkout**: Complete purchase with real-time stock validation

### For Admins
1. **Login**: Use admin credentials
2. **Manage Inventory**: Add, edit, or remove sweets
3. **Monitor Stock**: Track quantities and sales
4. **Bulk Operations**: Efficiently manage large catalogs

## 🧪 Running Tests

```bash
cd backend

# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest tests/test_concurrency.py -v
```

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |

### Sweets
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/sweets` | List all sweets | Public |
| GET | `/api/sweets/{id}` | Get sweet details | Public |
| POST | `/api/sweets` | Create sweet | Admin |
| PUT | `/api/sweets/{id}` | Update sweet | Admin |
| DELETE | `/api/sweets/{id}` | Delete sweet | Admin |
| POST | `/api/sweets/{id}/purchase` | Purchase sweet | User |

## 🔒 Concurrency Safety

The purchase endpoint uses atomic transactions to prevent race conditions:

1. **Transaction Start**: Begin immediate SQLite transaction
2. **Stock Check**: Verify available quantity
3. **Atomic Decrement**: Decrease quantity
4. **Commit**: Complete transaction

If two users try to buy the last item simultaneously:
- ✅ One succeeds with `200 OK`
- ❌ One fails with `422 Unprocessable Entity`
- 📊 Final quantity = 0 (data integrity preserved)

## 👤 Creating an Admin User

To create an admin user, you can use the Python shell:

```python
import asyncio
from app.database import async_session
from app.services.auth_service import AuthService

async def create_admin():
    async with async_session() as session:
        auth = AuthService(session)
        await auth.create_admin("admin@example.com", "adminpassword123")

asyncio.run(create_admin())
```

## 🎨 UI/UX Improvements

This version includes significant UI/UX enhancements:

### Visual Design
- **Enhanced Glassmorphism**: Improved backdrop blur and transparency effects
- **Smooth Animations**: Micro-interactions and page transitions
- **Modern Color Palette**: Carefully selected gradients and accent colors
- **Typography**: Inter font family for better readability

### User Experience
- **Toast Notifications**: Real-time feedback for all actions
- **Loading Skeletons**: Smooth loading states instead of spinners
- **Search & Filter**: Advanced catalog browsing capabilities
- **Shopping Cart**: Full cart management with quantity controls
- **Responsive Design**: Mobile-optimized layouts

### Performance
- **Lazy Loading**: Optimized image loading
- **State Management**: Efficient Zustand store with persistence
- **Error Boundaries**: Graceful error handling
- **Optimistic Updates**: Instant UI feedback

## 📱 Screenshots

The application features a modern dark theme with:
- Elegant card-based layouts
- Smooth hover effects and transitions
- Intuitive navigation and user flows
- Professional admin dashboard
- Mobile-responsive design

## 📄 License

MIT License - feel free to use this project for learning and development.

---

Built with ❤️ using FastAPI and React
