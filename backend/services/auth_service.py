from sqlmodel import Session
from core.database import get_session
from core.security import hash_password, verify_password, create_access_token, reset_pass_token, decode_reset_pass_token
from core.email import send_password_reset_email
from fastapi import Depends, HTTPException, BackgroundTasks
from repositories.user_repo import UserRepository
from models.user import User
from core.logger import logger
import hmac
import uuid


class AuthService:
    def __init__(self, session: Session = Depends(get_session)):
        self.session = session
        self.users = UserRepository(session)

    def register_user(
        self,
        name: str,
        username: str,
        email: str,
        phone_number: str,
        password: str,
        avatar_id: int,
    ) -> User:
        existing_user = self.users.get_by_username_or_email(username, email)

        if existing_user:
            raise HTTPException(
                status_code=400, detail="Username or Email already exists"
            )

        hashed_pwd = hash_password(password)

        new_user = User(
            name=name,
            username=username,
            email=email,
            phone_number=phone_number,
            password=hashed_pwd,
            avatar_id=avatar_id,
        )
        self.users.add_user(new_user)
        self.session.commit()
        self.session.refresh(new_user)
        logger.info(f"New user registered: {new_user.username} (ID: {new_user.id})")
        return new_user

    def login(self, identifier: str, password: str) -> str:
        registered_user = self.users.get_by_username_or_email(identifier, identifier)

        if not registered_user or not verify_password(
            password, registered_user.password
        ):
            raise HTTPException(status_code=400, detail="Invalid credentials")

        access_token = create_access_token(data={"sub": str(registered_user.id)})
        logger.info(
            f"User logged in: {registered_user.username} (ID: {registered_user.id})"
        )
        return access_token

    def change_password(self, user: User, old_password: str, new_password: str) -> None:
        if not verify_password(old_password, user.password):
            raise HTTPException(status_code=400, detail="Incorrect old password")

        user.password = hash_password(new_password)
        self.users.add_user(user)
        self.session.commit()

    def delete_account(self, user: User) -> None:
        username, user_id = user.username, user.id
        self.users.delete_user(user)
        self.session.commit()
        logger.info(f"User deleted: {username} (ID: {user_id})")

    def forgot_password(self, email: str, background_tasks: BackgroundTasks) -> None:
        user = self.users.get_by_email(email)

        if user:
            pass_reset_token = reset_pass_token(data={"sub": str(user.id), "pwd": user.password[-10:]})
            # send email after returning HTTP response
            background_tasks.add_task(send_password_reset_email, user.email, pass_reset_token)
            logger.info(f"User requested password reset (ID: {user.id})")

    def reset_password(self, token: str, new_password: str) -> None:
        payload = decode_reset_pass_token(token)
        if not payload:
            raise HTTPException(status_code=400, detail="Invalid reset token")

        user = self.users.get_by_id(uuid.UUID(payload["sub"]))
        if not user or not hmac.compare_digest(
            payload.get("pwd", ""), user.password[-10:]
        ):
            raise HTTPException(status_code=400, detail="Invalid reset token")

        user.password = hash_password(new_password)

        self.session.commit()
        logger.info(f"Password reset completed (ID: {user.id})")
