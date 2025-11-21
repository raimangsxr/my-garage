from typing import Any, List
from fastapi import APIRouter, Body, Depends, HTTPException
from sqlmodel import Session
import base64
import requests

from app.api import deps
from app.models import User, UserRead, UserPasswordUpdate

router = APIRouter()

@router.get("/me", response_model=UserRead)
def read_user_me(
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user.
    """
    user_response = UserRead.model_validate(current_user)
    if current_user.image_binary:
        base64_image = base64.b64encode(current_user.image_binary).decode('utf-8')
        user_response.image_url = f"data:image/png;base64,{base64_image}"
    return user_response

@router.put("/me", response_model=UserRead)
def update_user_me(
    *,
    session: Session = Depends(deps.get_db),
    full_name: str = Body(None),
    image_url: str = Body(None),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update own user.
    """
    if full_name is not None:
        current_user.full_name = full_name
    
    if image_url is not None:
        if image_url.startswith("data:image"):
            # Handle Base64 Data URL
            try:
                header, encoded = image_url.split(",", 1)
                data = base64.b64decode(encoded)
                current_user.image_binary = data
            except Exception:
                pass # Handle error appropriately
        elif image_url.startswith("http"):
            # Handle regular URL (download it)
            try:
                response = requests.get(image_url)
                if response.status_code == 200:
                    current_user.image_binary = response.content
            except Exception:
                pass

    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    
    user_response = UserRead.model_validate(current_user)
    if current_user.image_binary:
        base64_image = base64.b64encode(current_user.image_binary).decode('utf-8')
        user_response.image_url = f"data:image/png;base64,{base64_image}"
    
    return user_response

@router.get("/avatars", response_model=List[str])
def get_avatars(
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get available avatars.
    """
    # In a real app, these might come from a DB or file system scan.
    # For now, we return a static list of URLs.
    return [
        "https://material.angular.io/assets/img/examples/shiba1.jpg",
        "https://material.angular.io/assets/img/examples/shiba2.jpg",
        "https://cdn-icons-png.flaticon.com/512/147/147144.png",
        "https://cdn-icons-png.flaticon.com/512/147/147142.png",
        "https://cdn-icons-png.flaticon.com/512/147/147140.png",
        "https://cdn-icons-png.flaticon.com/512/4333/4333609.png"
    ]

@router.post("/me/password", response_model=Any)
def update_password(
    *,
    session: Session = Depends(deps.get_db),
    body: UserPasswordUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update own password.
    """
    from app.core.security import verify_password, get_password_hash
    
    if not verify_password(body.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect password")
    
    current_user.hashed_password = get_password_hash(body.new_password)
    session.add(current_user)
    session.commit()
    
    return {"message": "Password updated successfully"}
