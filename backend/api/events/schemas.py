import uuid
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class EventCreateRequest(BaseModel):
    pack_id: uuid.UUID
    title: str

class EventResponse(BaseModel):
    id: uuid.UUID
    pack_id: uuid.UUID
    title: str
    status: str

class TagContent(BaseModel):
    hint: Optional[str] = None
    image: Optional[str] = None

class TagConfig(BaseModel):
    tag_id: uuid.UUID
    tag_type: str = "clue"
    content: TagContent

class EventSetupRequest(BaseModel):
    tags_config: List[TagConfig]


class TagScanRequest(BaseModel):
    tag_hash: str
    injected_user_hash: str

class TagScanResponse(BaseModel):
    status: str
    message: str
    tag_sequence: int

class EventTagConfigView(BaseModel):
    sequence_num: int
    tag_id: uuid.UUID
    tag_type: Optional[str] = None
    content: Optional[TagContent] = None
    is_configured: bool

class EventUpdateRequest(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None

class EventDetailResponse(BaseModel):
    id: uuid.UUID
    pack_id: uuid.UUID
    title: str
    status: str
    tags: List[EventTagConfigView]