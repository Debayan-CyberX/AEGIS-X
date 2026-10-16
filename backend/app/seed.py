import os
from argon2 import PasswordHasher
from sqlalchemy import select
from .models import *
from .detection import RULES

def seed(db):
    for rid,title,severity,technique,description in RULES:
        if not db.get(DetectionRule,rid): db.add(DetectionRule(id=rid,title=title,severity=severity,technique=technique,description=description))
    names=[("workstation-01","10.20.0.10","Workstation"),("auth-server","10.20.0.20","Identity"),("warehouse-inventory","10.20.0.30","Warehouse"),("app-server","10.20.0.40","Application"),("database-01","10.20.0.50","Database"),("monitor-01","10.20.0.60","Monitoring")]
    for host,ip,kind in names:
        if not db.scalar(select(Asset).where(Asset.hostname==host)): db.add(Asset(hostname=host,ip=ip,kind=kind))
    for pid,title in [("escalate","Escalate critical incident"),("task","Create investigation task"),("flag_ip","Flag suspicious IP"),("block_ip","Simulate temporary IP block"),("isolate","Simulate endpoint isolation"),("report","Generate incident report"),("notify","Notify analyst in-app")]:
        if not db.get(ResponsePlaybook,pid): db.add(ResponsePlaybook(id=pid,title=title,description="Audited local workflow. Containment affects simulation records only."))
    password=os.getenv("DEMO_PASSWORD")
    username=os.getenv("DEMO_USERNAME","analyst")
    if password and not db.scalar(select(User).where(User.username==username)):
        if len(password)<12: raise RuntimeError("DEMO_PASSWORD must contain at least 12 characters")
        db.add(User(username=username,password_hash=PasswordHasher().hash(password),role="administrator"))
    db.commit()
