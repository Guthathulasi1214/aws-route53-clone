# schemas/__init__.py
from .auth import LoginRequest, TokenResponse, UserResponse
from .hosted_zone import (
    HostedZoneCreate,
    HostedZoneUpdate,
    HostedZoneResponse,
    HostedZoneListResponse,
)
from .dns_record import (
    DnsRecordCreate,
    DnsRecordUpdate,
    DnsRecordResponse,
    DnsRecordListResponse,
)

__all__ = [
    "LoginRequest", "TokenResponse", "UserResponse",
    "HostedZoneCreate", "HostedZoneUpdate", "HostedZoneResponse", "HostedZoneListResponse",
    "DnsRecordCreate", "DnsRecordUpdate", "DnsRecordResponse", "DnsRecordListResponse",
]
