from flask import Blueprint, render_template, redirect, session, url_for, request, jsonify, current_app
import requests
import json, os, glob, random

auth_bp = Blueprint('auth', __name__, template_folder='templates', static_folder='static', static_url_path='/auth/static')


try:
    import dotenv
except ImportError:
    print("Le package dotenv n'est pas installé.")
else:
    dotenv.load_dotenv()

sso_validate_url = os.environ['SSO_VALIDATE_URL']
sso_user_info_url = os.environ['SSO_USER_INFO_URL']
sso_logout_url = os.environ['SSO_LOGOUT_URL']

@auth_bp.route('/login/')
def login():
    if 'user' in session:
        return redirect(url_for('main.index'))
    images_path = os.path.join(current_app.static_folder, 'images')
    
    
    image_files = glob.glob(os.path.join(images_path, '*.webp'))
    
    
    image_filenames = [os.path.basename(image) for image in image_files]
    
    if image_filenames:
        
        selected_image = random.choice(image_filenames)
    else:
        
        selected_image = 'default_image.webp' 
    
    return render_template('login.html', selected_image=selected_image)

@auth_bp.route('/login-sso/')
def login_sso():
    token = request.args.get('token')
    if not token:
        print("pas de token")
        return redirect(url_for('main.index'))
    
    # recupère le token et le valide par zentac
    try:    
        validation_response = requests.get(f'{sso_validate_url}{token}')
        validation_response.raise_for_status()
        validation_data = validation_response.json()

        if validation_data.get('validite token') is True:
            # Si le token est valide, récupère les données user
            try:
                user_info_response = requests.get(f'{sso_user_info_url}{token}')
                user_info_response.raise_for_status()
                user_info = user_info_response.json()

                # Vérifie si "nom_profil" n'est pas None
                if user_info['profil'].get('nom_profil') is not None:
                    # enregistre les donnees user et token dans une session
                    session['token'] = token
                    session['user'] = user_info
                    return redirect(url_for('main.index'))
                else:
                    return redirect(url_for('auth.login_fail'))
            except requests.RequestException as e:
                print(f"erreur lors de la récupération des infos: {e}")
                return redirect(url_for('main.index'))
        else:
            print("Token invalide")
            return redirect(url_for('main.index'))
    except requests.RequestException as e:
        print(f"erreur lors de la validation du token: {e}")
        return redirect(url_for('main.index'))

@auth_bp.route('/login-dev/')
def login_dev():
    user_info_string = '''
    {
        "user": {
            "nni": "0000",
            "nom_prenom_agent": "ADMIN- Admin",
            "email_agent": "test@test.fr",
            "gr": 14,
            "nom_gr": "Gr Développement"
        },
        "droit": [
            {
                "code_app": 52,
                "nom_droit": "all_rights"
            },
            {
                "code_app": 52,
                "nom_droit": "delete_affaires"
            },
            {
                "code_app": 52,
                "nom_droit": "export_affaires"
            }
        ],
        "profil": {
            "code_app": "52",
            "nom_profil": "administrateur"
        }
    }
    '''

    user_info = json.loads(user_info_string)
    session['user'] = user_info
    session['token'] = 'fake-dev-token'
    return redirect(url_for('main.index'))

@auth_bp.route('/logout/')
def logout():
    token = session.pop('token', None)
    session.pop('user', None)
    if token:
        return redirect(sso_logout_url)
    return redirect(url_for('main.index'))

@auth_bp.route('/logout-dev/')
def logout_dev():
    print('test')
    session.pop('token', None)
    session.pop('user', None)
    return redirect(url_for('main.index'))

@auth_bp.route('/login/fail')
def login_fail():
    return render_template('login_fail.html')

def has_droit(droit_name):
    if 'droit' in session['user']:
        return any(droit['nom_droit'] == droit_name for droit in session['user']['droit'])
    return False