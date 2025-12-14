# 🍬 Sweet Shop Management System

A full-stack Sweet Shop Management System with **concurrency-safe purchases**, built with FastAPI and React.

## ✨ Features

- **User Authentication**: JWT-based login/registration with bcrypt password hashing
- **Sweet Catalog**: Browse chocolates, candies, and pastries
- **Atomic Purchases**: Concurrency-safe purchase logic prevents race conditions
- **Admin Dashboard**: Full CRUD operations for inventory management
- **Role-Based Access**: Admin and user roles with protected routes
- **Modern UI**: Dark theme with glassmorphism and smooth animations

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

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`
- Swagger docs: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

The app will be available at `http://localhost:5173`

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

## 📄 License

MIT License - feel free to use this project for learning and development.

---

Built with ❤️ using FastAPI and React
