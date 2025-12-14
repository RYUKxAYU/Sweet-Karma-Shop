from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.user_repository import UserRepository
from app.models.user import User
from app.schemas.user import UserCreate, TokenResponse, UserResponse
from app.security.password import verify_password
from app.security.jwt import create_access_token


class AuthenticationError(Exception):
    """Raised when authentication fails."""
    pass


class UserExistsError(Exception):
    """Raised when trying to register with an existing email."""
    pass


class AuthService:
    """Business logic for authentication."""
    
    def __init__(self, session: AsyncSession):
        self.session = session
        self.user_repo = UserRepository(session)
    
    async def register(self, user_data: UserCreate) -> TokenResponse:
        """Register a new user and return a token."""
        # Check if user already exists
        if await self.user_repo.exists(user_data.email):
            raise UserExistsError("User with this email already exists")
        
        # Create the user
        user = await self.user_repo.create(
            email=user_data.email,
            password=user_data.password
        )
        
        # Generate token
        token = create_access_token({
            "sub": user.email,
            "is_admin": user.is_admin
        })
        
        return TokenResponse(
            access_token=token,
            user=UserResponse(
                id=user.id,
                email=user.email,
                is_admin=user.is_admin,
                has_2fa=user.two_factor_secret is not None
            )
        )
    
    async def login(self, email: str, password: str) -> TokenResponse:
        """Authenticate user and return a token."""
        user = await self.user_repo.get_by_email(email)
        
        if not user:
            raise AuthenticationError("Invalid email or password")
        
        if not verify_password(password, user.hashed_password):
            raise AuthenticationError("Invalid email or password")
        
        # Generate token
        token = create_access_token({
            "sub": user.email,
            "is_admin": user.is_admin
        })
        
        return TokenResponse(
            access_token=token,
            user=UserResponse(
                id=user.id,
                email=user.email,
                is_admin=user.is_admin,
                has_2fa=user.two_factor_secret is not None
            )
        )
    
    async def create_admin(self, email: str, password: str) -> User:
        """Create an admin user (for initial setup)."""
        if await self.user_repo.exists(email):
            raise UserExistsError("User with this email already exists")
        
        return await self.user_repo.create(
            email=email,
            password=password,
            is_admin=True
        )
