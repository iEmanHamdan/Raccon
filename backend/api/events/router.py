from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from core.database import get_session
from models.user import User
from models.tag import Tag
from api.auth.dependencies import get_current_user
from api.events.schemas import EventBase, EventDetailResponse, EventTagConfigView, EventUpdateRequest, EventCreateRequest, EventResponse, EventSetupRequest
import uuid
from models.pack import Pack
from models.event import Event
from models.event_tag import EventTag
from typing import List

router = APIRouter(prefix="/events", tags=["Events"])

@router.get("/{event_id}", response_model=EventDetailResponse)
def get_event_details(
    event_id: uuid.UUID,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")
        
    pack = session.get(Pack, event.pack_id)
    if not pack or pack.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not own this pack.")
        
    physical_tags = session.exec(
        select(Tag).where(Tag.pack_id == pack.id).order_by(Tag.sequence_num)
    ).all()
    
    event_tags = session.exec(
        select(EventTag).where(EventTag.event_id == event.id)
    ).all()
    
    config_map = {et.tag_id: et for et in event_tags}
    
    tags_view = []
    for tag in physical_tags:
        config = config_map.get(tag.id)
        tags_view.append(EventTagConfigView(
            sequence_num=tag.sequence_num,
            tag_id=tag.id,
            tag_type=config.tag_type if config else None,
            content=config.content if config else None,
            is_configured=bool(config)  
        ))
        
    return EventDetailResponse(
        id=event.id,
        pack_id=event.pack_id,
        title=event.title,
        status=event.status,
        tags=tags_view
    )


@router.put("/{event_id}/setup")
def setup_event_journey(
    event_id: uuid.UUID,
    request: EventSetupRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")
    
    pack = session.get(Pack, event.pack_id)
    if not pack or pack.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not own this pack.")

    has_trap = any(tag.tag_type == "trap" for tag in request.tags_config)
    if has_trap and pack.mode != "open":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Only packs in 'open' mode can have trap tags configured."
        )

    existing_tags = session.exec(select(EventTag).where(EventTag.event_id == event_id)).all()
    for et in existing_tags:
        session.delete(et)
    
    for tag_data in request.tags_config:
        event_tag = EventTag(
            event_id=event.id,
            tag_id=tag_data.tag_id,
            tag_type=tag_data.tag_type,
            content=tag_data.content.model_dump(exclude_none=True)
        )
        session.add(event_tag)

    if event.status == "draft" and len(request.tags_config) > 0:
        event.status = "paused"
        session.add(event)

    session.commit()
    return {"status": "success", "message": "Event journey setup completed."}

@router.patch("/{event_id}", response_model=EventResponse)
def update_event(
    event_id: uuid.UUID,
    request: EventUpdateRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    pack = session.get(Pack, event.pack_id)
    if not pack or pack.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not own this pack.")

    if request.title is not None:
        event.title = request.title
    if request.status is not None:
        event.status = request.status
        
    session.add(event)
    session.commit()
    session.refresh(event)
    
    return event

@router.get("", response_model=List[EventBase])
def list_my_events(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    packs = session.exec(select(Pack).where(Pack.owner_id == current_user.id)).all()
    pack_ids = [p.id for p in packs]
    
    if not pack_ids:
        return []

    events = session.exec(select(Event).where(Event.pack_id.in_(pack_ids))).all()
    return events