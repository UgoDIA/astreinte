from flask import Blueprint, render_template, redirect, session, url_for
from ..decorators import *
from db.db_service import *
from sqlalchemy import create_engine, text
import requests
import pandas as pd
from io import StringIO
import logging

main_bp = Blueprint('main', __name__, template_folder='templates', static_folder='static', static_url_path='/main/static')
db_service = DatabaseService()



@main_bp.route('/')
# @login_required
def index():
    return render_template('index.html')
