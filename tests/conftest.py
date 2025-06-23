import pytest
from app import create_app
import os
from dotenv import load_dotenv
load_dotenv() 
@pytest.fixture
def app():
    """Create and configure a new app instance for each test."""
    # Set test environment variables
    os.environ['SECRET_KEY'] = 'test-secret-key'
    
    # Create the app with test configuration
    app = create_app()
    app.config['TESTING'] = True
    app.config['WTF_CSRF_ENABLED'] = False
    
    return app

@pytest.fixture
def client(app):
    """A test client for the app."""
    return app.test_client()

@pytest.fixture
def runner(app):
    """A test runner for the app's Click commands."""
    return app.test_cli_runner() 