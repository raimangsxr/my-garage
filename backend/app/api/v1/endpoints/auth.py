from datetime import timedelta, datetime
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from pydantic import BaseModel

from app.api import deps
from app.core import security
from app.models import User, GoogleAuthToken
from app.database import get_session

from app.core.config import settings

# Importar para validación de tokens de Google
try:
    from google.oauth2 import id_token
    from google.auth.transport import requests as google_requests
    GOOGLE_AUTH_AVAILABLE = True
except ImportError:
    GOOGLE_AUTH_AVAILABLE = False

router = APIRouter()

class GoogleLoginRequest(BaseModel):
    credential: str  # El JWT token de Google

class GoogleLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

@router.post("/login/access-token")
def login_access_token(
    session: Session = Depends(get_session),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = session.query(User).filter(User.email == form_data.username).first()
    
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.email, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/google/login", response_model=GoogleLoginResponse)
def google_login(
    request: GoogleLoginRequest,
    session: Session = Depends(get_session)
) -> Any:
    """
    Login with Google OAuth 2.0 token
    Validates the Google token and creates/updates user and auth token
    """
    if not GOOGLE_AUTH_AVAILABLE:
        raise HTTPException(
            status_code=500,
            detail="Google authentication not available. Install google-auth package."
        )
    
    try:
        # Verificar el token de Google
        # TODO: Agregar GOOGLE_CLIENT_ID a settings
        google_client_id = getattr(settings, 'GOOGLE_CLIENT_ID', None)
        if not google_client_id:
            raise HTTPException(
                status_code=500,
                detail="Google OAuth not configured on server"
            )
        
        idinfo = id_token.verify_oauth2_token(
            request.credential,
            google_requests.Request(),
            google_client_id
        )
        
        # Extraer información del usuario
        google_id = idinfo['sub']
        email = idinfo['email']
        name = idinfo.get('name')
        picture = idinfo.get('picture')
        
        # Buscar o crear usuario
        user = session.query(User).filter(User.email == email).first()
        
        if not user:
            # Crear nuevo usuario
            user = User(
                email=email,
                full_name=name,
                hashed_password=security.get_password_hash(""),  # Sin password para OAuth
                is_active=True,
                is_superuser=False
            )
            session.add(user)
            session.commit()
            session.refresh(user)
        
        # Buscar o crear token de Google
        google_token = session.query(GoogleAuthToken).filter(
            GoogleAuthToken.google_id == google_id
        ).first()
        
        # Token expira en 1 hora (estándar de Google)
        expires_at = datetime.utcnow() + timedelta(hours=1)
        
        if google_token:
            # Actualizar token existente
            google_token.access_token = request.credential
            google_token.email = email
            google_token.name = name
            google_token.picture = picture
            google_token.token_expires_at = expires_at
            google_token.updated_at = datetime.utcnow()
        else:
            # Crear nuevo token
            google_token = GoogleAuthToken(
                user_id=user.id,
                google_id=google_id,
                email=email,
                name=name,
                picture=picture,
                access_token=request.credential,
                token_expires_at=expires_at
            )
            session.add(google_token)
        
        session.commit()
        
        # Generar JWT de la aplicación
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        app_token = security.create_access_token(
            user.email, expires_delta=access_token_expires
        )
        
        return GoogleLoginResponse(
            access_token=app_token,
            token_type="bearer",
            user={
                "id": user.id,
                "email": user.email,
                "name": name,
                "picture": picture
            }
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google token: {str(e)}"
        )

@router.post("/password-recovery/{email}")
def recover_password(email: str, session: Session = Depends(get_session)) -> Any:
    """
    Password Recovery
    """
    user = session.query(User).filter(User.email == email).first()
    
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this email does not exist in the system.",
        )
    
    # TODO: Implement email sending logic
    return {"msg": "Password recovery email sent"}
