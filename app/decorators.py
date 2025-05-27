from functools import wraps
from flask import session, redirect, url_for
from .auth.routes import has_droit

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user' not in session:
            return redirect(url_for('auth.login'))
        return f(*args, **kwargs)
    return decorated_function


def restrict_access(denied_rights):
    def decorator(func):
        @wraps(func)
        def decorated_function(*args, **kwargs):
            for droit_name in denied_rights:
                if has_droit(droit_name):
                    return redirect(url_for('main.index')) 
            return func(*args, **kwargs)
        return decorated_function
    return decorator