from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, field_validator

VALID_RECORD_TYPES = {"A", "AAAA", "CNAME", "TXT", "MX", "NS", "PTR", "SRV", "CAA"}
VALID_ROUTING_POLICIES = {"simple", "weighted", "latency", "failover", "geolocation", "multivalue"}


class DnsRecordCreate(BaseModel):
    name: str
    type: str
    ttl: int = 300
    value: str
    routing_policy: str = "simple"

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Record name is required")
        return v.strip()

    @field_validator("type")
    @classmethod
    def type_valid(cls, v: str) -> str:
        v_upper = v.upper()
        if v_upper not in VALID_RECORD_TYPES:
            raise ValueError(f"Record type must be one of: {', '.join(sorted(VALID_RECORD_TYPES))}")
        return v_upper

    @field_validator("ttl")
    @classmethod
    def ttl_valid(cls, v: int) -> int:
        if v < 0:
            raise ValueError("TTL must be a non-negative integer")
        if v > 2147483647:
            raise ValueError("TTL is too large")
        return v

    @field_validator("value")
    @classmethod
    def value_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Record value is required")
        return v.strip()

    @field_validator("routing_policy")
    @classmethod
    def routing_policy_valid(cls, v: str) -> str:
        if v not in VALID_ROUTING_POLICIES:
            raise ValueError(f"routing_policy must be one of: {', '.join(sorted(VALID_ROUTING_POLICIES))}")
        return v


class DnsRecordUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    ttl: Optional[int] = None
    value: Optional[str] = None
    routing_policy: Optional[str] = None

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.strip():
            raise ValueError("Record name cannot be empty")
        return v.strip() if v else v

    @field_validator("type")
    @classmethod
    def type_valid(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v_upper = v.upper()
            if v_upper not in VALID_RECORD_TYPES:
                raise ValueError(f"Record type must be one of: {', '.join(sorted(VALID_RECORD_TYPES))}")
            return v_upper
        return v

    @field_validator("ttl")
    @classmethod
    def ttl_valid(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and v < 0:
            raise ValueError("TTL must be a non-negative integer")
        return v

    @field_validator("value")
    @classmethod
    def value_not_empty(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.strip():
            raise ValueError("Record value cannot be empty")
        return v.strip() if v else v

    @field_validator("routing_policy")
    @classmethod
    def routing_policy_valid(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in VALID_ROUTING_POLICIES:
            raise ValueError(f"routing_policy must be one of: {', '.join(sorted(VALID_ROUTING_POLICIES))}")
        return v


class DnsRecordResponse(BaseModel):
    id: int
    hosted_zone_id: int
    name: str
    type: str
    ttl: int
    value: str
    routing_policy: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class DnsRecordListResponse(BaseModel):
    items: List[DnsRecordResponse]
    page: int
    page_size: int
    total: int
