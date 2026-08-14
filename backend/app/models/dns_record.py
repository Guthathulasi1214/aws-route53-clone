from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class DnsRecord(Base):
    __tablename__ = "dns_records"

    id = Column(Integer, primary_key=True, index=True)
    hosted_zone_id = Column(
        Integer,
        ForeignKey("hosted_zones.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    name = Column(String(255), nullable=False)
    type = Column(String(10), nullable=False)   
    ttl = Column(Integer, nullable=False, default=300)
    value = Column(Text, nullable=False)
    routing_policy = Column(String(50), nullable=False, default="simple")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    
    hosted_zone = relationship("HostedZone", back_populates="records")
