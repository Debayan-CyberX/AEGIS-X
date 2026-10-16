from datetime import datetime, timezone
from sqlalchemy import String, ForeignKey, JSON, DateTime, Text, Integer
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

def now(): return datetime.now(timezone.utc)
class Base(DeclarativeBase): pass
class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(80), unique=True)
    password_hash: Mapped[str] = mapped_column(Text)
    role: Mapped[str] = mapped_column(String(20), default="analyst")
class Session(Base):
    __tablename__ = "sessions"
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    expires: Mapped[datetime] = mapped_column(DateTime(timezone=True))
class Asset(Base):
    __tablename__ = "assets"
    id: Mapped[int] = mapped_column(primary_key=True)
    hostname: Mapped[str] = mapped_column(String(100), unique=True)
    ip: Mapped[str] = mapped_column(String(45))
    kind: Mapped[str] = mapped_column(String(40))
    owner: Mapped[str] = mapped_column(String(80), default="AgriShield · fictional enterprise")
class SecurityEvent(Base):
    __tablename__ = "security_events"
    id: Mapped[int] = mapped_column(primary_key=True)
    external_id: Mapped[str] = mapped_column(String(100), unique=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    source: Mapped[str] = mapped_column(String(80))
    source_ip: Mapped[str] = mapped_column(String(45), index=True)
    destination_ip: Mapped[str] = mapped_column(String(45))
    hostname: Mapped[str] = mapped_column(ForeignKey("assets.hostname"), index=True)
    username: Mapped[str] = mapped_column(String(80))
    event_type: Mapped[str] = mapped_column(String(80), index=True)
    outcome: Mapped[str] = mapped_column(String(40))
    payload: Mapped[dict] = mapped_column(JSON)
    synthetic: Mapped[bool] = mapped_column(default=False)
class DetectionRule(Base):
    __tablename__ = "detection_rules"
    id: Mapped[str] = mapped_column(String(30), primary_key=True)
    title: Mapped[str] = mapped_column(String(150))
    severity: Mapped[str] = mapped_column(String(20))
    technique: Mapped[str] = mapped_column(String(30))
    description: Mapped[str] = mapped_column(Text)
class Incident(Base):
    __tablename__ = "incidents"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    severity: Mapped[str] = mapped_column(String(20))
    score: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(30), default="New")
    hostname: Mapped[str] = mapped_column(ForeignKey("assets.hostname"))
    source_ip: Mapped[str] = mapped_column(String(45))
    rule_id: Mapped[str] = mapped_column(ForeignKey("detection_rules.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    assigned_to: Mapped[str] = mapped_column(String(80), default="Unassigned")
    synthetic: Mapped[bool] = mapped_column(default=False)
class IncidentEvent(Base):
    __tablename__ = "incident_events"
    incident_id: Mapped[int] = mapped_column(ForeignKey("incidents.id"), primary_key=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("security_events.id"), primary_key=True)
class Alert(Base):
    __tablename__ = "alerts"
    id: Mapped[int] = mapped_column(primary_key=True)
    incident_id: Mapped[int] = mapped_column(ForeignKey("incidents.id"))
    event_id: Mapped[int] = mapped_column(ForeignKey("security_events.id"))
    rule_id: Mapped[str] = mapped_column(ForeignKey("detection_rules.id"))
class Vulnerability(Base):
    __tablename__ = "vulnerabilities"
    id: Mapped[int] = mapped_column(primary_key=True)
    hostname: Mapped[str] = mapped_column(ForeignKey("assets.hostname"))
    cve: Mapped[str] = mapped_column(String(40))
    cvss: Mapped[float]
    software: Mapped[str] = mapped_column(String(150))
    remediation: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(30), default="Discovered")
    synthetic: Mapped[bool] = mapped_column(default=False)
class ResponsePlaybook(Base):
    __tablename__ = "response_playbooks"
    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    title: Mapped[str] = mapped_column(String(150))
    description: Mapped[str] = mapped_column(Text)
class ResponseExecution(Base):
    __tablename__ = "response_executions"
    id: Mapped[int] = mapped_column(primary_key=True)
    incident_id: Mapped[int] = mapped_column(ForeignKey("incidents.id"))
    playbook_id: Mapped[str] = mapped_column(ForeignKey("response_playbooks.id"))
    actor: Mapped[str] = mapped_column(String(80))
    mode: Mapped[str] = mapped_column(String(30))
    result: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
class InvestigationNote(Base):
    __tablename__ = "investigation_notes"
    id: Mapped[int] = mapped_column(primary_key=True)
    incident_id: Mapped[int] = mapped_column(ForeignKey("incidents.id"))
    actor: Mapped[str] = mapped_column(String(80))
    text: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
class AuditLog(Base):
    __tablename__ = "audit_logs"
    id: Mapped[int] = mapped_column(primary_key=True)
    actor: Mapped[str] = mapped_column(String(80))
    action: Mapped[str] = mapped_column(String(100))
    detail: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
