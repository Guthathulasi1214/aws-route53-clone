
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import engine, SessionLocal, Base
from app.models import User, HostedZone, DnsRecord
from app.routers import auth, hosted_zones, records
from app.services.auth import hash_password


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Route53 Clone API",
    description="A mock AWS Route53 clone API built with FastAPI and SQLite",
    version="1.0.0",
)


_frontend_url = os.getenv("FRONTEND_URL", "")
_allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
if _frontend_url:
    _allowed_origins.append(_frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,  
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router)
app.include_router(hosted_zones.router)
app.include_router(records.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "route53-clone-api"}


def seed_database(db: Session) -> None:
    
    
    if db.query(User).first():
        return

    print("[SEED] Seeding demo data...")

    
    demo_user = User(
        name="Admin User",
        email="admin@route53.local",
        password_hash=hash_password("admin123"),
    )
    db.add(demo_user)
    db.flush()

    
    zone1 = HostedZone(
        name="example.com",
        description="Primary public hosted zone for example.com",
        zone_type="public",
        private_zone=False,
    )
    zone2 = HostedZone(
        name="internal.corp",
        description="Internal corporate DNS zone",
        zone_type="private",
        private_zone=True,
    )
    zone3 = HostedZone(
        name="api.myapp.io",
        description="API subdomain hosted zone",
        zone_type="public",
        private_zone=False,
    )
    db.add_all([zone1, zone2, zone3])
    db.flush()

    
    records_zone1 = [
        DnsRecord(hosted_zone_id=zone1.id, name="example.com", type="A",     ttl=300,  value="93.184.216.34",               routing_policy="simple"),
        DnsRecord(hosted_zone_id=zone1.id, name="www.example.com", type="CNAME", ttl=300, value="example.com",              routing_policy="simple"),
        DnsRecord(hosted_zone_id=zone1.id, name="mail.example.com", type="MX",   ttl=3600, value="10 mail.example.com.",     routing_policy="simple"),
        DnsRecord(hosted_zone_id=zone1.id, name="example.com", type="NS",   ttl=172800, value="ns1.example.com.",           routing_policy="simple"),
        DnsRecord(hosted_zone_id=zone1.id, name="example.com", type="TXT",  ttl=300,  value='"v=spf1 include:_spf.google.com ~all"', routing_policy="simple"),
    ]
    
    records_zone2 = [
        DnsRecord(hosted_zone_id=zone2.id, name="db.internal.corp",    type="A",     ttl=60,   value="10.0.1.100",          routing_policy="simple"),
        DnsRecord(hosted_zone_id=zone2.id, name="cache.internal.corp", type="A",     ttl=60,   value="10.0.1.200",          routing_policy="simple"),
        DnsRecord(hosted_zone_id=zone2.id, name="internal.corp",       type="TXT",   ttl=300,  value='"internal-domain=true"', routing_policy="simple"),
    ]
    
    records_zone3 = [
        DnsRecord(hosted_zone_id=zone3.id, name="api.myapp.io",  type="A",     ttl=60,   value="54.239.28.85",            routing_policy="simple"),
        DnsRecord(hosted_zone_id=zone3.id, name="api.myapp.io",  type="AAAA",  ttl=60,   value="2606:2800:220:1:248:1893:25c8:1946", routing_policy="simple"),
    ]

    db.add_all(records_zone1 + records_zone2 + records_zone3)
    db.commit()
    print("[SEED] Demo data seeded successfully.")
    print("   Login: admin@route53.local / admin123")


@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
