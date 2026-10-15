from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from datetime import datetime, timezone
from core.database import get_session
from models.user import User
from models.tag import Tag
from models.event import Event
from models.event_tag import EventTag
from models.pack import Pack
from models.journey_progress import JourneyProgress
from api.auth.dependencies import get_current_user
from api.journey.schemas import TagScanRequest, TagScanResponse, SetTrapRequest
router = APIRouter(prefix="/journey", tags=["Journey"])

@router.post("/scan", response_model=TagScanResponse)
def scan_tag(
    request: TagScanRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if request.injected_user_hash != current_user.user_hash:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Security Violation: Link sharing detected.")
        
    tag = session.exec(select(Tag).where(Tag.static_hash == request.tag_hash)).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Invalid Tag.")

    event = session.exec(
        select(Event).where(Event.pack_id == tag.pack_id).order_by(Event.id.desc())
    ).first()
        
    if not event or event.status != "live":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This event is not live.")

    pack = session.get(Pack, event.pack_id)
    event_tag = session.exec(
        select(EventTag).where((EventTag.event_id == event.id) & (EventTag.tag_id == tag.id))
    ).first()

    progress = session.exec(
        select(JourneyProgress).where(
            (JourneyProgress.event_id == event.id) & 
            (JourneyProgress.user_hash == current_user.user_hash)
        )
    ).first()

    if not progress:
        progress = JourneyProgress(event_id=event.id, user_hash=current_user.user_hash)
        session.add(progress)

    if progress.status == "completed":
        raise HTTPException(status_code=400, detail="You have already completed this event!")

    if progress.frozen_until and progress.frozen_until > datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="You are currently frozen and cannot scan tags."
        )

    if event_tag and event_tag.tag_type == "trap":
        content = event_tag.content or {}
        
        if tag.sequence_num in progress.visited_sequences:
            raise HTTPException(status_code=400, detail="You already triggered this trap.")

        visited = list(progress.visited_sequences)
        visited.append(tag.sequence_num)
        progress.visited_sequences = visited
        
        if content.get("boom"):
            progress.score = max(0, progress.score - content.get("boom"))
            message = "Boom! You hit a trap and lost points."
            
        elif content.get("freeze"):
            from datetime import timedelta
            freeze_seconds = content.get("freeze")
            progress.frozen_until = datetime.now(timezone.utc) + timedelta(seconds=freeze_seconds)
            message = f"Freeze! You are frozen for {freeze_seconds} seconds."
            
        else:
            message = "You found an empty trap."

        session.add(progress)
        session.commit()
        return TagScanResponse(
            status="trap_triggered",
            message=message,
            tag_sequence=tag.sequence_num,
            tag_type="trap",
            content=content
        )

    if pack.mode == "seq":
        if tag.sequence_num <= progress.current_sequence:
            raise HTTPException(status_code=400, detail="You have already scanned this tag.")
        if tag.sequence_num != progress.current_sequence + 1:
            raise HTTPException(status_code=400, detail=f"Skipped tag! You must scan tag {progress.current_sequence + 1} first.")
        
        progress.current_sequence = tag.sequence_num
        progress.score += 1

    elif pack.mode == "open":
        content = event_tag.content if event_tag and event_tag.content else {}
        
        claimed_by = content.get("claimed_by")
        if claimed_by:
            if claimed_by == current_user.user_hash:
                raise HTTPException(status_code=400, detail="You already claimed this tag.")
            
            claimer = session.exec(select(User).where(User.user_hash == claimed_by)).first()
            claimer_name = claimer.name if claimer else "Another player"
            raise HTTPException(status_code=400, detail=f"Sorry, {claimer_name} claimed this tag before you!")
            
        if tag.sequence_num in progress.visited_sequences:
            raise HTTPException(status_code=400, detail="You already scanned this tag.")

        content["claimed_by"] = current_user.user_hash
        event_tag.content = content
        session.add(event_tag)

        visited = list(progress.visited_sequences)
        visited.append(tag.sequence_num)
        progress.visited_sequences = visited
        progress.score += 1

    if progress.score >= pack.tags_count:
        progress.status = "completed"

    session.add(progress)
    session.commit()

    return TagScanResponse(
        status="success",
        message=f"Tag {tag.sequence_num} scanned successfully!",
        tag_sequence=tag.sequence_num,
        tag_type=event_tag.tag_type if event_tag else None,
        content=event_tag.content if event_tag else None
    )


@router.post("/set-trap")
def set_player_trap(
    request: SetTrapRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if request.injected_user_hash != current_user.user_hash:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Security Violation.")

    tag = session.exec(select(Tag).where(Tag.static_hash == request.tag_hash)).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Invalid Tag.")

    event = session.exec(
        select(Event).where(Event.pack_id == tag.pack_id).order_by(Event.id.desc())
    ).first()
    
    if not event or event.status != "live":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This event is not live.")

    event_tag = session.exec(
        select(EventTag).where((EventTag.event_id == event.id) & (EventTag.tag_id == tag.id))
    ).first()

    if not event_tag or event_tag.tag_type != "trap":
        raise HTTPException(status_code=400, detail="This tag is not a trap.")

    current_content = event_tag.content or {}
    if not current_content.get("choose"):
        raise HTTPException(
            status_code=400, 
            detail="This trap has already been activated or is not available for activation."
        )

    new_content = {
        request.trap_type: request.trap_value,
        "was_choose": True
    }

    event_tag.content = new_content
    session.add(event_tag)
    session.commit()

    return {
        "status": "success", 
        "message": f"Trap {request.trap_type} set successfully on tag {tag.sequence_num}."
    }