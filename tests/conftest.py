import pytest
from app import create_app
import os
from dotenv import load_dotenv
load_dotenv()


@pytest.fixture
def app():
    """Crée et configure une nouvelle instance d'application pour chaque test."""
    # Définir les variables d'environnement de test
    os.environ['SECRET_KEY'] = 'test-secret-key'

    # Créer l'application avec la configuration de test
    app = create_app()
    app.config['TESTING'] = True
    app.config['WTF_CSRF_ENABLED'] = False

    return app


@pytest.fixture
def client(app):
    """Un client de test pour l'application."""
    return app.test_client()


@pytest.fixture
def runner(app):
    """Un runner de test pour les commandes Click de l'application."""
    return app.test_cli_runner()
