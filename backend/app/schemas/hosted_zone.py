from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, field_validator


class HostedZoneCreate(BaseModel):
    name: str
    description: Optional[str] = None
    zone_type: str = "public"
    private_zone: bool = False

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Domain name is required")
        return v.strip().lower()

    @field_validator("zone_type")
    @classmethod
    def zone_type_valid(cls, v: str) -> str:
        if v not in ("public", "private"):
            raise ValueError("zone_type must be 'public' or 'private'")
        return v


class HostedZoneUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    zone_type: Optional[str] = None
    private_zone: Optional[bool] = None

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.strip():
            raise ValueError("Domain name cannot be empty")
        return v.strip().lower() if v else v

    @field_validator("zone_type")
    @classmethod
    def zone_type_valid(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in ("public", "private"):
            raise ValueError("zone_type must be 'public' or 'private'")
        return v


class HostedZoneResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    zone_type: str
    private_zone: bool
    record_count: int = 0
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class HostedZoneListResponse(BaseModel):
    items: List[HostedZoneResponse]
    page: int
    page_size: int
    total: int
