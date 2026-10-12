from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from core.database import get_session
from models.user import User
from models.tag import Tag
from models.event import Event
from models.event_tag import EventTag
from api.auth.dependencies import get_current_user
from api.journey.schemas import TagScanRequest, TagScanResponse

router = APIRouter(prefix="/journey", tags=["Journey"])

@router.post("/scan", response_model=TagScanResponse)
def scan_tag(
    request: TagScanRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if request.injected_user_hash != str(current_user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Security Violation.")
    
    tag = session.exec(select(Tag).where(Tag.static_hash == request.tag_hash)).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Invalid Tag.")

    event = session.exec(
        select(Event).where(Event.pack_id == tag.pack_id).order_by(Event.id.desc())
    ).first()
    
    if not event or event.status != "live":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This event is not live."
        )

    event_tag = session.exec(
        select(EventTag).where(
            (EventTag.event_id == event.id) & 
            (EventTag.tag_id == tag.id)
        )
    ).first()

    return TagScanResponse(
        status="success",
        message=f"Tag {tag.sequence_num} scanned successfully!",
        tag_sequence=tag.sequence_num,
        tag_type=event_tag.tag_type if event_tag else None,
        content=event_tag.content if event_tag else None
    )