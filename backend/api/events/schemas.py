import uuid
from pydantic import BaseModel, model_validator
from typing import List, Dict, Any, Optional, Literal

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
    
    boom: Optional[int] = None
    freeze: Optional[int] = None
    choose: Optional[bool] = None

class TagConfig(BaseModel):
    tag_id: uuid.UUID
    tag_type: Literal["clue", "trap"] = "clue"
    content: TagContent

    @model_validator(mode='after')
    def validate_content_match_type(self) -> 'TagConfig':
        if self.tag_type == "trap":
            if self.content.boom is None and self.content.freeze is None and self.content.choose is None:
                raise ValueError("Invalid tag configuration.")
        return self

class EventSetupRequest(BaseModel):
    tags_config: List[TagConfig]

class EventTagConfigView(BaseModel):
    sequence_num: int
    tag_id: uuid.UUID
    tag_type: Optional[str] = None
    content: Optional[TagContent] = None
    is_configured: bool

class EventUpdateRequest(BaseModel):
    title: Optional[str] = None
    status: Optional[Literal["draft", "paused", "live"]] = None

class EventBase(BaseModel):
    id: uuid.UUID
    pack_id: uuid.UUID
    title: str
    status: str

class EventDetailResponse(EventBase):
    tags: List[EventTagConfigView]