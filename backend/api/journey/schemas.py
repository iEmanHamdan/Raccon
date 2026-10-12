from pydantic import BaseModel
from typing import Optional, Dict, Any
from api.events.schemas import TagContent

class TagScanRequest(BaseModel):
    tag_hash: str
    injected_user_hash: str

class TagScanResponse(BaseModel):
    status: str
    message: str
    tag_sequence: int
    tag_type: Optional[str] = None
    content: Optional[TagContent] = None