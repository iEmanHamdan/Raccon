import uuid
import string
import secrets
from sqlmodel import SQLModel, Field

def generate_user_hash() -> str:
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(8))

class User(SQLModel, table=True):
    __tablename__ = "users"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_hash: str = Field(default_factory=generate_user_hash, unique=True, index=True)
    name: str
    username: str = Field(unique=True, index=True)
    email: str = Field(unique=True, index=True)
    phone_number: str
    password: str
    role: str = Field(default="user")