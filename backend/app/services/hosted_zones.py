"""
Hosted Zone service — CRUD operations with search and pagination.
"""
from typing import Optional, Tuple, List
from datetime import datetime

from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.hosted_zone import HostedZone
from app.models.dns_record import DnsRecord
from app.schemas.hosted_zone import HostedZoneCreate, HostedZoneUpdate


def get_hosted_zones(
    db: Session,
    search: Optional[str] = None,
    page: int = 1,
    page_size: int = 10,
) -> Tuple[List[HostedZone], int]:
    query = db.query(HostedZone)
    if search:
        query = query.filter(HostedZone.name.ilike(f"%{search}%"))
    total = query.count()
    items = (
        query.order_by(HostedZone.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return items, total


def get_hosted_zone(db: Session, zone_id: int) -> Optional[HostedZone]:
    return db.query(HostedZone).filter(HostedZone.id == zone_id).first()


def create_hosted_zone(db: Session, data: HostedZoneCreate) -> HostedZone:
    zone = HostedZone(
        name=data.name,
        description=data.description,
        zone_type=data.zone_type,
        private_zone=data.private_zone,
    )
    db.add(zone)
    db.commit()
    db.refresh(zone)
    return zone


def update_hosted_zone(
    db: Session, zone_id: int, data: HostedZoneUpdate
) -> Optional[HostedZone]:
    zone = get_hosted_zone(db, zone_id)
    if not zone:
        return None
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(zone, field, value)
    zone.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(zone)
    return zone


def delete_hosted_zone(db: Session, zone_id: int) -> bool:
    zone = get_hosted_zone(db, zone_id)
    if not zone:
        return False
    db.delete(zone)
    db.commit()
    return True


def get_record_count(db: Session, zone_id: int) -> int:
    return db.query(func.count(DnsRecord.id)).filter(
        DnsRecord.hosted_zone_id == zone_id
    ).scalar() or 0
