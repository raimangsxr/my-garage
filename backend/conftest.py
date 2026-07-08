import os


# Backend imports require DATABASE_URL even when tests provide their own sessions.
os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")
