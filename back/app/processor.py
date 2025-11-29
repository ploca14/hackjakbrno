# processor.py - Fixed-Size Semantic Profile for Patient Events

from typing import List, Dict, Tuple
from collections import Counter, defaultdict
from database import PatientEvent
from dto.response.HealthService import HealthServiceType

# --- Configuration ---

CRITICAL_KEYWORDS = [
    "INTENZIVNÍ", "RESUSCITACE", "URGENTNÍ", "TROPONIN", "STATIM",
    "ZÁCHRANNÁ SLUŽBA", "PATOLOGICKÁ", "BIOPSIE", "ONKOLOGIE",
    "CHEMOTERAPIE", "DIALÝZA", "TRANSPLANTACE", "EMBOLIE", "INFARKT",
    "CMP", "STROKE", "SEPSE", "ŠOKOVÁ", "ARO", "JIP", "PALIATIV"
]

IGNORED_TERMS = [
    "REGULAČNÍ POPLATEK", "SIGNÁLNÍ VÝKON", "OD TYPU", "MINIMÁLNÍ KONTAKT",
    "SEPARACE SÉRA", "ODBĚR KRVE", "ZAVEDENÍ KANYLY", "TELEMETRICKÉ SLEDOVÁNÍ",
    "OŠETŘOVACÍ DEN", "BONIFIKAČNÍ VÝKON", "OŠETŘOVATELSKÁ INTERVENCE",
    "(VZP) EPIZODA PÉČE", "zdravotnická dopravní služba", "lékárenská péče",
    "KREVNÍ OBRAZ", "GLUKÓZA"
]

# Department groupings for category summarization
DEPT_CATEGORIES = {
    "CARDIO": ["KARDIOLOGIE", "KARDIO", "SRDEČNÍ"],
    "SURGERY": ["CHIRURGIE", "OPERACE", "OPERAČNÍ"],
    "ONCOLOGY": ["ONKOLOGIE", "NÁDOR", "CHEMO", "RADIOTERAPIE"],
    "NEURO": ["NEUROLOGIE", "NEURO", "MOZK"],
    "INTERNAL": ["INTERNA", "VNITŘNÍ LÉKAŘSTVÍ"],
    "ORTHO": ["ORTOPEDIE", "ORTOPED"],
    "UROLOGY": ["UROLOGIE"],
    "LAB": ["BIOCHEMIE", "HEMATOLOG", "MIKROBIOLOG", "LABORATOŘ"],
    "IMAGING": ["RADIOLOG", "CT ", "MR ", "RTG", "SONO", "UZ "],
    "PALLIATIVE": ["PALIATIV", "HOSPIC"],
    "EMERGENCY": ["URGENTNÍ", "ZÁCHRAN", "AKUTNÍ"],
}

MAX_PROFILE_LENGTH = 900  # Target max chars for embedding


def categorize_department(dept: str) -> str:
    """Map a department name to a category."""
    if not dept:
        return "OTHER"
    dept_upper = dept.upper()
    for category, keywords in DEPT_CATEGORIES.items():
        if any(kw in dept_upper for kw in keywords):
            return category
    return "OTHER"


def extract_critical_markers(events: List[PatientEvent]) -> Dict[str, int]:
    """Count occurrences of critical keywords across all events."""
    markers = Counter()
    for event in events:
        label_upper = event.label.upper()
        for keyword in CRITICAL_KEYWORDS:
            if keyword in label_upper:
                markers[keyword] += 1
    return dict(markers)


def compute_care_intensity(events: List[PatientEvent], span_days: int) -> str:
    """Classify care intensity based on event density."""
    if span_days <= 0:
        return "ACUTE"
    events_per_month = (len(events) / span_days) * 30
    if events_per_month > 50:
        return "INTENSIVE"
    elif events_per_month > 20:
        return "HIGH"
    elif events_per_month > 5:
        return "MODERATE"
    else:
        return "LOW"


def detect_trajectory(events: List[PatientEvent]) -> str:
    """
    Detect care trajectory pattern based on event density over time.
    Split timeline into thirds and compare density.
    """
    if len(events) < 6:
        return "LIMITED_DATA"
    
    n = len(events)
    third = n // 3
    
    # Count events in each third
    early = events[:third]
    middle = events[third:2*third]
    late = events[2*third:]
    
    # Get time spans for each third
    def get_span(evts):
        if len(evts) < 2:
            return 1
        return max(1, evts[-1].date - evts[0].date)
    
    early_density = len(early) / get_span(early)
    late_density = len(late) / get_span(late)
    
    # Check for critical events in late phase
    late_labels = " ".join(e.label for e in late).upper()
    has_palliative = "PALIATIV" in late_labels or "HOSPIC" in late_labels
    has_escalation = any(kw in late_labels for kw in ["INTENZIVNÍ", "JIP", "ARO", "RESUSCIT"])
    
    if has_palliative:
        return "END_OF_LIFE"
    elif has_escalation:
        return "ESCALATING"
    elif late_density > early_density * 1.5:
        return "INTENSIFYING"
    elif late_density < early_density * 0.5:
        return "IMPROVING"
    else:
        return "STABLE"


def get_top_departments(events: List[PatientEvent], top_n: int = 5) -> List[Tuple[str, int]]:
    """Get top department categories by event count."""
    category_counts = Counter()
    for event in events:
        dept = event.detail.get("department", "")
        category = categorize_department(dept)
        category_counts[category] += 1
    return category_counts.most_common(top_n)


def get_recent_significant_events(events: List[PatientEvent], max_events: int = 5) -> List[str]:
    """Get the most recent significant (non-routine) events."""
    significant = []
    for event in reversed(events):
        label = event.label.strip()
        # Skip routine/ignored events
        if any(ign.upper() in label.upper() for ign in IGNORED_TERMS):
            continue
        # Skip medication aggregates
        if event.type == HealthServiceType.MEDICATION:
            continue
        
        dept = event.detail.get("department", "")
        category = categorize_department(dept)
        
        # Truncate long labels
        short_label = label[:40] + "..." if len(label) > 40 else label
        significant.append(f"T{event.date:+d}:{category}:{short_label}")
        
        if len(significant) >= max_events:
            break
    
    return list(reversed(significant))


def linearize_patient_history(events: List[PatientEvent], patient_id: str = None) -> str:
    """
    Creates a fixed-size semantic profile from patient events.
    Guaranteed to fit in embedding model context window.
    
    Output format:
    PID:123 [PROFILE] Events:959 Span:335d Hosp:4 Intensity:HIGH 
    [DEPTS] LAB:420 SURGERY:180 CARDIO:120 
    [CRITICAL] STATIM:12 BIOPSIE:3 
    [TRAJECTORY] STABLE 
    [RECENT] T+10:CARDIO:Vyšetření | T+5:LAB:Biochemie
    """
    if not events:
        return "PROFILE:EMPTY | No recorded history"
    
    # --- Compute Stats ---
    total_events = len(events)
    
    # Time span
    min_date = min(e.date for e in events)
    max_date = max(e.date for e in events)
    span_days = max_date - min_date
    
    # Count by type
    type_counts = Counter(e.type.value for e in events)
    hosp_count = type_counts.get("HOSPITALIZATION", 0)
    
    # Care intensity
    intensity = compute_care_intensity(events, span_days)
    
    # Trajectory
    trajectory = detect_trajectory(events)
    
    # Critical markers
    critical = extract_critical_markers(events)
    
    # Top departments
    top_depts = get_top_departments(events, top_n=4)
    
    # Recent events
    recent = get_recent_significant_events(events, max_events=4)
    
    # --- Build Profile String ---
    parts = []
    
    # Header
    header = f"[PROFILE] Events:{total_events} Span:{span_days}d Hosp:{hosp_count} Intensity:{intensity}"
    if patient_id:
        header = f"PID:{patient_id} " + header
    parts.append(header)
    
    # Department distribution
    if top_depts:
        dept_str = " ".join(f"{cat}:{cnt}" for cat, cnt in top_depts)
        parts.append(f"[DEPTS] {dept_str}")
    
    # Critical markers (top 5 by count)
    if critical:
        top_critical = sorted(critical.items(), key=lambda x: -x[1])[:5]
        crit_str = " ".join(f"{k}:{v}" for k, v in top_critical)
        parts.append(f"[CRITICAL] {crit_str}")
    
    # Trajectory
    parts.append(f"[TRAJECTORY] {trajectory}")
    
    # Recent significant events
    if recent:
        parts.append(f"[RECENT] {' | '.join(recent)}")
    
    profile = " ".join(parts)
    
    # Safety truncation (should rarely trigger)
    if len(profile) > MAX_PROFILE_LENGTH:
        profile = profile[:MAX_PROFILE_LENGTH-3] + "..."
    
    return profile


def linearize_for_query(events: List[PatientEvent]) -> str:
    """
    Query-optimized profile - same as regular but focuses on recent state.
    Uses last 100 events max for trajectory calculation.
    """
    if len(events) > 100:
        events = events[-100:]
    return linearize_patient_history(events)
