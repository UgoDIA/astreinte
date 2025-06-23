import pytest
import json
from unittest.mock import patch, MagicMock

class TestAPIEndpoints:
    """Test cases for API endpoints."""
    
    def test_execute_custom_query_planning_success(self, client):
        """Test the planning query endpoint with valid parameters."""
        # Mock the database service to return test data
        mock_items = [
            {
                'annee': 2025,
                'id_agent': 1,
                'id_equipe': 1,
                'id_equipe_agent_fonction': 1,
                'id_planning_agent': 1,
                'nom_agent': 'Durand',
                'nom_equipe': 'STER',
                'nom_fonction': 'Chef équipe',
                'num_astreinte_agent': '0692111111',
                'num_pro_agent': '0693111111',
                'prenom_agent': 'Alice',
                'semaine': 25
            }
        ]
        
        mock_description = [
            ('annee',), ('id_agent',), ('id_equipe',), ('id_equipe_agent_fonction',),
            ('id_planning_agent',), ('nom_agent',), ('nom_equipe',), ('nom_fonction',),
            ('num_astreinte_agent',), ('num_pro_agent',), ('prenom_agent',), ('semaine',)
        ]
        
        with patch('app.api.routes.db_service') as mock_db_service:
            # Configure the mock
            mock_db_service.execute_custom_query.return_value = (mock_items, mock_description)
            mock_db_service.serialize_row.return_value = mock_items[0]
            
            # Make the API request
            response = client.get('/astreinte/api/query/planning/?a.statut_agent=true&pa.semaine=25&pa.annee=2025')
            
            # Assertions
            assert response.status_code == 200
            data = json.loads(response.data)
            assert isinstance(data, list)
            assert len(data) == 1
            assert data[0]['nom_agent'] == 'Durand'
            assert data[0]['nom_equipe'] == 'STER'
            assert data[0]['semaine'] == 25
            assert data[0]['annee'] == 2025
            
            # Verify the database service was called correctly
            mock_db_service.execute_custom_query.assert_called_once()
            call_args = mock_db_service.execute_custom_query.call_args
            assert call_args[0][0] == 'planning'  # query_name
            assert 'a.statut_agent' in call_args[0][1]  # filters
            assert 'pa.semaine' in call_args[0][1]  # filters
            assert 'pa.annee' in call_args[0][1]  # filters
    
    def test_execute_custom_query_invalid_query(self, client):
        """Test the custom query endpoint with an invalid query name."""
        with patch('app.api.routes.db_service') as mock_db_service:
            # Configure the mock to raise ValueError for invalid query
            mock_db_service.execute_custom_query.side_effect = ValueError("Query 'invalid_query' not found")
            
            # Make the API request
            response = client.get('/astreinte/api/query/invalid_query/')
            
            # Assertions
            assert response.status_code == 404
            data = json.loads(response.data)
            assert 'error' in data
            assert 'Query' in data['error']
    
    def test_execute_custom_query_database_error(self, client):
        """Test the custom query endpoint when database service raises an exception."""
        with patch('app.api.routes.db_service') as mock_db_service:
            # Configure the mock to raise a general exception
            mock_db_service.execute_custom_query.side_effect = Exception("Database connection error")
            
            # Make the API request
            response = client.get('/astreinte/api/query/planning/')
            
            # Assertions
            assert response.status_code == 500
    
    def test_get_any_table_success(self, client):
        """Test the generic table endpoint with valid parameters."""
        mock_items = [
            {'id': 1, 'name': 'Test Item 1'},
            {'id': 2, 'name': 'Test Item 2'}
        ]
        mock_description = [('id',), ('name',)]
        
        with patch('app.api.routes.db_service') as mock_db_service:
            # Configure the mock
            mock_db_service.fetch_all.return_value = (mock_items, mock_description)
            mock_db_service.serialize_row.side_effect = lambda row, desc: row
            
            # Make the API request
            response = client.get('/astreinte/api/equipe/')
            
            # Assertions
            assert response.status_code == 200
            data = json.loads(response.data)
            assert isinstance(data, list)
            assert len(data) == 2
            assert data[0]['id'] == 1
            assert data[1]['id'] == 2
    
    def test_get_any_table_invalid_order(self, client):
        """Test the generic table endpoint with invalid order parameter."""
        response = client.get('/astreinte/api/equipe/?order=invalid')
        
        # Assertions
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert 'valeur invalide' in data['error'] 