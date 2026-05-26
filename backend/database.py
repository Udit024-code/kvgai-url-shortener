from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 1. Tell SQLAlchemy to create a local SQLite file named links.db
SQLALCHEMY_DATABASE_URL = "sqlite:///./links.db"

# 2. Create the engine connection (connect_args is only needed for SQLite)
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# 3. Create a Session class which will be our active tool to talk to the DB
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. Base class that our Database Table Model will inherit from
Base = declarative_base()

# 5. Dependency helper function to open/close DB sessions automatically
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()