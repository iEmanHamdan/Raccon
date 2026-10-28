from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlmodel import Session, select
from core.database import get_session
from models.user import User
from core.security import hash_password, verify_password, create_access_token, reset_pass_token, decode_reset_pass_token
from api.auth.schemas import UserRegister, UserLogin, Token
from api.auth.dependencies import get_current_user
from fastapi.security import OAuth2PasswordRequestForm
from api.auth.schemas import ChangePassword, ForgotPassword, ResetPassword
from core.logger import logger
from core.email import send_password_reset_email
import hmac
import uuid

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register")
def register_user(user_data: UserRegister, session: Session = Depends(get_session)):
    existing_user = session.exec(
        select(User).where((User.username == user_data.username) | (User.email == user_data.email))
    ).first()
    
    if existing_user:
        raise HTTPException(status_code=400, detail="Username or Email already exists")

    hashed_pwd = hash_password(user_data.password)
    
    new_user = User(
        name=user_data.name,
        username=user_data.username,
        email=user_data.email,
        phone_number=user_data.phone_number,
        password=hashed_pwd,
        avatar_id=user_data.avatar_id
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    logger.info(f"New user registered: {new_user.username} (ID: {new_user.id})")
    return {"message": "User registered successfully", "user_id": new_user.id}

@router.post("/login", response_model=Token)
def login_user(
    user_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session)
):
    user = session.exec(
        select(User).where(
            (User.username == user_data.username) | 
            (User.email == user_data.username)
        )
    ).first()

    if not user or not verify_password(user_data.password, user.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    access_token = create_access_token(data={"sub": str(user.id)})
    logger.info(f"User logged in: {user.username} (ID: {user.id})")
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/logout")
def logout_user(current_user: User = Depends(get_current_user)):
    return {"message": "Successfully logged out."}

@router.post("/change-password")
def change_password(
    request: ChangePassword,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if not verify_password(request.old_password, current_user.password):
        raise HTTPException(status_code=400, detail="Incorrect old password")
    
    current_user.password = hash_password(request.new_password)
    session.add(current_user)
    session.commit()
    return {"message": "Password changed successfully"}

@router.delete("/delete-account")
def delete_account(
    session: Session = Depends(get_session), 
    current_user: User = Depends(get_current_user)
):
    session.delete(current_user)
    session.commit()
    logger.info(f"User deleted: {current_user.username} (ID: {current_user.id})")
    return {"message": "Account deleted successfully"}

@router.post("/forgot-password")
def forgot_password(
    user_data: ForgotPassword,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session)
):
    # Get user from db based on entered email
    user = session.exec(select(User).where((User.email == user_data.email))).first()
        
    if user:
        pass_reset_token = reset_pass_token(data={"sub": str(user.id), "pwd":user.password[-10:]})
        # send email after returning HTTP response
        background_tasks.add_task(send_password_reset_email, user.email, pass_reset_token)
        logger.info(f"User requested password reset (ID: {user.id})")
    
    # Users with and without a registered account get the same conformation message   
    return {"message": "If an account with this email exists, the reset link is sent."}

@router.post("/reset-password")
def reset_password(
    user_data: ResetPassword,
    session: Session = Depends(get_session)
):
    payload = decode_reset_pass_token(user_data.token)
    if not payload:
        raise HTTPException(status_code=400, detail="Invalid reset token")
        
    # to make links single-use only
    user = session.get(User, uuid.UUID(payload["sub"]))
    if not user or not hmac.compare_digest(payload.get("pwd", ""), user.password[-10:]):
        raise HTTPException(status_code=400, detail="Invalid reset token")

    user.password = hash_password(user_data.new_password)
    
    session.add(user)
    session.commit() 
    logger.info(f"Password reset completed (ID: {user.id})")
    return {"message": "Password reset successful."}