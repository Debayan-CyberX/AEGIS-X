from datetime import timedelta
from sqlalchemy import select
from .models import SecurityEvent, Incident, IncidentEvent, Alert

RULES = [
 ("AX-001", "Repeated failed authentication", "high", "T1110", "Five authentication failures from one source against one host/user within five minutes."),
 ("AX-002", "Successful login after repeated failures", "critical", "T1078", "Successful authentication after at least five failures in five minutes; investigate potential account compromise."),
 ("AX-003", "Unusual authentication location", "medium", "T1078", "Synthetic authentication location outside the supplied baseline."),
 ("AX-004", "Port scan pattern", "high", "T1046", "Ten distinct destination ports from one source within five minutes."),
 ("AX-005", "Unusual administrative activity", "high", "T1098", "Administrative action marked outside approved change window."),
 ("AX-006", "Suspicious process telemetry", "high", "T1059", "Safe process telemetry contains an encoded command indicator."),
 ("AX-007", "Abnormal network frequency", "medium", "T1071", "Twenty network connections from one source within five minutes."),
 ("AX-008", "Repeated restricted access", "medium", "T1083", "Five denied resource requests within five minutes."),
]

def detect(db, event):
    history = list(db.scalars(select(SecurityEvent).where(SecurityEvent.synthetic == event.synthetic, SecurityEvent.source_ip == event.source_ip, SecurityEvent.hostname == event.hostname, SecurityEvent.timestamp >= event.timestamp-timedelta(minutes=5), SecurityEvent.timestamp <= event.timestamp).order_by(SecurityEvent.timestamp)))
    failures = [e for e in history if e.event_type == "authentication" and e.outcome == "failure" and e.username == event.username]
    connections = [e for e in history if e.event_type == "network_connection"]
    matches = []
    if event.event_type == "authentication":
        if event.outcome == "failure" and len(failures)>=5: matches.append(("AX-001", failures))
        if event.outcome == "success" and len(failures)>=5: matches.append(("AX-002", failures+[event]))
        if event.synthetic and event.payload.get("location") and event.payload.get("baseline_locations") and event.payload["location"] not in event.payload["baseline_locations"]: matches.append(("AX-003", [event]))
    if event.event_type == "network_connection":
        if len({e.payload.get("destination_port") for e in connections if isinstance(e.payload.get("destination_port"), int)})>=10: matches.append(("AX-004", connections))
        if len(connections)>=20: matches.append(("AX-007", connections))
    if event.event_type == "admin_action" and event.payload.get("approved_change") is False: matches.append(("AX-005", [event]))
    if event.event_type == "process" and "-encodedcommand" in str(event.payload.get("command_line", "")).lower(): matches.append(("AX-006", [event]))
    denied = [e for e in history if e.event_type == "resource_access" and e.outcome == "denied"]
    if event.event_type == "resource_access" and len(denied)>=5: matches.append(("AX-008", denied))
    result=[]
    for rule_id, evidence in matches:
        rule = next(r for r in RULES if r[0] == rule_id)
        incident = db.scalar(select(Incident).where(Incident.synthetic==event.synthetic, Incident.rule_id==rule_id, Incident.source_ip==event.source_ip, Incident.hostname==event.hostname, Incident.status!="Resolved", Incident.created_at>=event.timestamp-timedelta(minutes=5)))
        if not incident:
            incident=Incident(title=rule[1], severity=rule[2], score={"critical":95,"high":80,"medium":55}[rule[2]], hostname=event.hostname,source_ip=event.source_ip,rule_id=rule_id,synthetic=event.synthetic,created_at=event.timestamp,updated_at=event.timestamp)
            db.add(incident); db.flush()
        db.add(Alert(incident_id=incident.id,event_id=event.id,rule_id=rule_id))
        for e in evidence:
            if not db.get(IncidentEvent, (incident.id,e.id)): db.add(IncidentEvent(incident_id=incident.id,event_id=e.id))
        db.flush(); result.append(incident)
    return result
