"""
DNS Record service — CRUD with search, type filter, and pagination.
"""
from typing import Optional, Tuple, List
from datetime import datetime

from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.dns_record import DnsRecord
from app.models.hosted_zone import HostedZone
from app.schemas.dns_record import DnsRecordCreate, DnsRecordUpdate


def get_records(
    db: Session,
    zone_id: int,
    search: Optional[str] = None,
    record_type: Optional[str] = None,
    page: int = 1,
    page_size: int = 10,
) -> Tuple[List[DnsRecord], int]:
    query = db.query(DnsRecord).filter(DnsRecord.hosted_zone_id == zone_id)
    if search:
        query = query.filter(DnsRecord.name.ilike(f"%{search}%"))
    if record_type:
        query = query.filter(DnsRecord.type == record_type.upper())
    total = query.count()
    items = (
        query.order_by(DnsRecord.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return items, total


def get_record(db: Session, record_id: int) -> Optional[DnsRecord]:
    return db.query(DnsRecord).filter(DnsRecord.id == record_id).first()


def create_record(db: Session, zone_id: int, data: DnsRecordCreate) -> DnsRecord:
    record = DnsRecord(
        hosted_zone_id=zone_id,
        name=data.name,
        type=data.type,
        ttl=data.ttl,
        value=data.value,
        routing_policy=data.routing_policy,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def update_record(
    db: Session, record_id: int, data: DnsRecordUpdate
) -> Optional[DnsRecord]:
    record = get_record(db, record_id)
    if not record:
        return None
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(record, field, value)
    record.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(record)
    return record


def delete_record(db: Session, record_id: int) -> bool:
    record = get_record(db, record_id)
    if not record:
        return False
    db.delete(record)
    db.commit()
    return True
