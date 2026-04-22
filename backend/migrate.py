# migrate_db.py

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from config import Config
from models import db

app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)
migrate = Migrate(app, db)

# Optional: create_all fallback if not using full migrations
with app.app_context():
    db.create_all()
    print("✅ Tables created in SQLite.")
