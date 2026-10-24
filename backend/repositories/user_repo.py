from sqlmodel import Session, select
from models import User


class UserRepository:
    def __init__(self, session: Session):
        self.session = session

    def get_by_username_or_email(self, username: str, email: str) -> User | None:
        return self.session.exec(
            select(User).where((User.username == username) | (User.email == email))
        ).first()

    def get_by_email(self, email: str) -> User | None:
        return self.session.exec(select(User).where((User.email == email))).first()

    def get_by_id(self, user_id: str) -> User | None:
        return self.session.get(User, user_id)

    def add_user(self, new_user: User) -> None:
        self.session.add(new_user)

    def delete_user(self, user: User) -> None:
        self.session.delete(user)
