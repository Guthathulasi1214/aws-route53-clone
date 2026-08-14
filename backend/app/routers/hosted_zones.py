
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.routers.deps import get_current_user
from app.schemas.hosted_zone import (
    HostedZoneCreate,
    HostedZoneUpdate,
    HostedZoneResponse,
    HostedZoneListResponse,
)
from app.services import hosted_zones as svc

router = APIRouter(prefix="/api/hosted-zones", tags=["hosted-zones"])


def _to_response(zone, db: Session) -> HostedZoneResponse:
    
    count = svc.get_record_count(db, zone.id)
    return HostedZoneResponse(
        id=zone.id,
        name=zone.name,
        description=zone.description,
        zone_type=zone.zone_type,
        private_zone=zone.private_zone,
        record_count=count,
        created_at=zone.created_at,
        updated_at=zone.updated_at,
    )


@router.get("", response_model=HostedZoneListResponse)
def list_hosted_zones(
    search: Optional[str] = Query(None, description="Search by name"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    zones, total = svc.get_hosted_zones(db, search=search, page=page, page_size=page_size)
    return HostedZoneListResponse(
        items=[_to_response(z, db) for z in zones],
        page=page,
        page_size=page_size,
        total=total,
    )


@router.post("", response_model=HostedZoneResponse, status_code=status.HTTP_201_CREATED)
def create_hosted_zone(
    body: HostedZoneCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    zone = svc.create_hosted_zone(db, body)
    return _to_response(zone, db)


@router.get("/{zone_id}", response_model=HostedZoneResponse)
def get_hosted_zone(
    zone_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    zone = svc.get_hosted_zone(db, zone_id)
    if not zone:
        raise HTTPException(status_code=404, detail="Hosted zone not found")
    return _to_response(zone, db)


@router.put("/{zone_id}", response_model=HostedZoneResponse)
def update_hosted_zone(
    zone_id: int,
    body: HostedZoneUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    zone = svc.update_hosted_zone(db, zone_id, body)
    if not zone:
        raise HTTPException(status_code=404, detail="Hosted zone not found")
    return _to_response(zone, db)


@router.delete("/{zone_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_hosted_zone(
    zone_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    deleted = svc.delete_hosted_zone(db, zone_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Hosted zone not found")
