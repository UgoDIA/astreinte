from flask import Flask
from .auth.routes import has_droit, redirect, url_for
import os
try:
    import dotenv
except ImportError:
    print("Le package dotenv n'est pas installé.")
else:
    dotenv.load_dotenv()

def create_app():
    app = Flask(__name__, template_folder='../templates',static_folder='../static')

    app.secret_key = os.environ['SECRET_KEY']
    
    from .api.routes import api_bp
    from .auth.routes import auth_bp
    from .main.routes import main_bp
    from .gestion.routes import gestion_bp
    from .planning.routes import planning_bp

    app.register_blueprint(api_bp, url_prefix='/astreinte')
    app.register_blueprint(auth_bp, url_prefix='/astreinte/auth')
    app.register_blueprint(main_bp, url_prefix='/astreinte')
    app.register_blueprint(gestion_bp, url_prefix='/astreinte/gestion')
    app.register_blueprint(planning_bp, url_prefix='/astreinte/planning')

    app.jinja_env.globals['has_droit'] = has_droit

    @app.route('/')
    def redirect_to_main():
        return redirect(url_for('main.index'))
    
    return app

