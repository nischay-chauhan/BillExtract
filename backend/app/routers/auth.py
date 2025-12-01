from fastapi import APIRouter, HTTPException, status, Depends
from app.models.user import UserCreate, UserLogin, User, Token
from app.services.auth_service import create_user, authenticate_user, get_user_by_email
from app.utils.auth import create_access_token, get_current_user
from app.models.user import TokenData
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/auth",
    tags=["authentication"],
    responses={404: {"description": "Not found"}},
)

@router.post("/register", response_model=User, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate):
    """
    Register a new user.
    
    - **email**: Valid email address
    - **password**: Secure password (minimum 6 characters recommended)
    """
    logger.info(f"Registration attempt for email: {user.email}")
    
    try:
        created_user = await create_user(user)
        logger.info(f"User registered successfully: {user.email}")
        
        # Convert UserInDB to User (exclude hashed_password)
        return User(
            _id=created_user.id,
            email=created_user.email,
            created_at=created_user.created_at,
            updated_at=created_user.updated_at
        )
    except ValueError as e:
        logger.warning(f"Registration failed for {user.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Registration error for {user.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during registration"
        )

@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin):
    """
    Login with email and password to get an access token.
    
    - **email**: Registered email address
    - **password**: User's password
    
    Returns a JWT access token for authenticated requests.
    """
    logger.info(f"Login attempt for email: {user_credentials.email}")
    
    user = await authenticate_user(user_credentials.email, user_credentials.password)
    
    if not user:
        logger.warning(f"Login failed for {user_credentials.email}: Invalid credentials")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": user.email})
    logger.info(f"Login successful for {user_credentials.email}")
    
    return Token(access_token=access_token, token_type="bearer")

@router.get("/me", response_model=User)
async def get_current_user_info(token_data: TokenData = Depends(get_current_user)):
    """
    Get current authenticated user's information.
    
    Requires valid JWT token in Authorization header.
    """
    logger.info(f"Fetching user info for: {token_data.email}")
    
    user = await get_user_by_email(token_data.email)
    
    if not user:
        logger.error(f"User not found: {token_data.email}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return User(
        _id=user.id,
        email=user.email,
        created_at=user.created_at,
        updated_at=user.updated_at
    )
