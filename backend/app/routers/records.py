
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.routers.deps import get_current_user
from app.schemas.dns_record import (
    DnsRecordCreate,
    DnsRecordUpdate,
    DnsRecordResponse,
    DnsRecordListResponse,
)
from app.services import records as svc
from app.services import hosted_zones as zone_svc

router = APIRouter(tags=["records"])


@router.get("/api/hosted-zones/{zone_id}/records", response_model=DnsRecordListResponse)
def list_records(
    zone_id: int,
    search: Optional[str] = Query(None),
    type: Optional[str] = Query(None, description="Filter by record type"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    zone = zone_svc.get_hosted_zone(db, zone_id)
    if not zone:
        raise HTTPException(status_code=404, detail="Hosted zone not found")
    items, total = svc.get_records(
        db, zone_id=zone_id, search=search, record_type=type, page=page, page_size=page_size
    )
    return DnsRecordListResponse(items=items, page=page, page_size=page_size, total=total)


@router.post(
    "/api/hosted-zones/{zone_id}/records",
    response_model=DnsRecordResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_record(
    zone_id: int,
    body: DnsRecordCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    zone = zone_svc.get_hosted_zone(db, zone_id)
    if not zone:
        raise HTTPException(status_code=404, detail="Hosted zone not found")
    record = svc.create_record(db, zone_id=zone_id, data=body)
    return record


@router.put("/api/records/{record_id}", response_model=DnsRecordResponse)
def update_record(
    record_id: int,
    body: DnsRecordUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    record = svc.update_record(db, record_id=record_id, data=body)
    if not record:
        raise HTTPException(status_code=404, detail="DNS record not found")
    return record


@router.delete("/api/records/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_record(
    record_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    deleted = svc.delete_record(db, record_id=record_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="DNS record not found")
