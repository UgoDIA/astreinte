from flask import Blueprint, request, abort
from db.db_service import *
from ..decorators import *
from datetime import datetime

api_bp = Blueprint('api', __name__)
db_service = DatabaseService()


# route pour récupérer toutes les lignes d'une table
@api_bp.route(f'/api/<string:table_name>/', methods=['GET'])
def get_any(table_name):
    # recup valeur order et order by
    order_by = request.args.get('order_by')
    order = request.args.get('order', 'asc')

    # valide la valeur de order 
    if order.lower() not in ['asc', 'desc']:
        return jsonify({'error': "valeur invalide pour 'order', doit être 'asc' ou 'desc'."}), 400

    # recup les autres param de l'url
    filters = {key: value for key, value in request.args.items() if key not in ['order_by', 'order','_']}
    
    # execute la fonction pour recup les donnees
    items, description = db_service.fetch_all(table_name, order_by, order, filters)
    
    # serialize les donnees
    items_list = [db_service.serialize_row(row, description) for row in items]

    return jsonify(items_list)

# route pour récupérer une ligne par son ID
@api_bp.route(f'/api/<string:table_name>/<int:item_id>/', methods=['GET'])
def get_any_id(table_name, item_id):
    item, description = db_service.fetch_by_id(table_name, item_id)
    if item:
        item_dict = db_service.serialize_row(item, description)
        
        return jsonify(item_dict)
    return jsonify({'error': 'Objet introuvable'}), 404

# route pour créer une nouvelle ligne
@api_bp.route(f'/api/<string:table_name>/', methods=['POST'])
def create(table_name):
    data = request.json
    if not data:
        columns = []
        values = []  
    else:
        columns = list(data.keys())
        values = list(data.values())
    try:
        new_id = db_service.create_item(table_name, columns, values)
        return jsonify({'id': new_id}), 201
    except Exception as e:
        print(f"Erreur creation nouvel item  {table_name}: {e}")
        abort(500, description="Erreur creation nouvel item")

# route pour mettre à jour une ligne existante
@api_bp.route(f'/api/<string:table_name>/<int:item_id>/', methods=['PUT'])
def update(table_name, item_id):
    data = request.json
    columns = list(data.keys())
    values = list(data.values())
    db_service.update_item(table_name, item_id, columns, values)
    return jsonify({'status': 'ligne mise à jour'}), 200

# route pour supprimer une ligne
@api_bp.route(f'/api/<string:table_name>/<int:item_id>/', methods=['DELETE'])
def delete(table_name, item_id):
    db_service.delete_item(table_name, item_id)
    return jsonify({'status': 'ligne supprimé'}), 200


@api_bp.route('/api/agents/', methods=['GET'])
def get_agents():
    #nettoie le dictionnaire en enlevant les param vides
    filters = {key: value for key, value in request.args.items() if value}

    nom_requete = 'get_all_agents'
    items, description = db_service.execute_custom_query(nom_requete, filters)
    items_list = [db_service.serialize_row(row, description) for row in items]
    return jsonify(items_list)

# @api_bp.route('/api/<string:query_name>/<int:item_id>/', methods=['GET'])
# def get_item_by_query(query_name, item_id):
#     try:
#         item, description = db_service.fetch_by_id_join(query_name, (item_id,))
#         if item:
#             item_dict = db_service.serialize_row(item, description)
#             return jsonify(item_dict)
#         return jsonify({'erreur': 'Objet introuvable'}), 404
#     except ValueError as e:
#         return jsonify({'erreur': str(e)}), 500

@api_bp.route('/api/query/<string:query_name>/', methods=['GET'])
def execute_custom_query(query_name):
    filters = request.args.to_dict(flat=False)
    
    # execute la requête dynamique
    try:
        items, description = db_service.execute_custom_query(query_name, filters)
        items_list = [db_service.serialize_row(row, description) for row in items]
        return jsonify(items_list), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        print(f"Erreur lors de l'exécution de la requête: {e}")
        abort(500, description="Erreur d'exécution de la requête")
