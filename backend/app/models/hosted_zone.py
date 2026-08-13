from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.orm import relationship
from app.database import Base


class HostedZone(Base):
    __tablename__ = "hosted_zones"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    zone_type = Column(String(10), nullable=False, default="public")  # 'public' | 'private'
    private_zone = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship — cascade delete records when zone is deleted
    records = relationship(
        "DnsRecord",
        back_populates="hosted_zone",
        cascade="all, delete-orphan",
        lazy="dynamic"
    )
