import os
from dotenv import load_dotenv
from flask import Flask
from supabase import create_client, Client

# Load environment variables
load_dotenv()

# Create Flask app
app = Flask(__name__)

# Get Supabase credentials
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_STORAGE_BUCKET = os.getenv("SUPABASE_STORAGE_BUCKET")

# Create Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Import routes AFTER initializing app to avoid circular imports
from app import routes
