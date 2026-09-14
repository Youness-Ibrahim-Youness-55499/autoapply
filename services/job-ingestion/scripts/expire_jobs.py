import sys
from datetime import datetime, timedelta
from pathlib import Path
from sqlalchemy import select

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from joblab.config import Settings
from joblab.db import SessionLocal, init_db
from joblab.models import Job

init_db(); settings=Settings(); cutoff=datetime.utcnow()-timedelta(days=settings.inactive_after_days)
with SessionLocal() as db:
    jobs=db.scalars(select(Job).where(Job.status=="active",Job.last_seen_at<cutoff)).all()
    for job in jobs: job.status="inactive"
    db.commit(); print(f"Marked {len(jobs)} jobs inactive.")
