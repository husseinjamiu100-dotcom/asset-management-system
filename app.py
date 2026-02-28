from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app) 

# Configuration
JSON_FILE = 'assets.json'

def read_assets():
    """Read assets from JSON file"""
    if not os.path.exists(JSON_FILE):
        return []
    try:
        with open(JSON_FILE, 'r') as file:
            return json.load(file)
    except (json.JSONDecodeError, FileNotFoundError):
        return []

def write_assets(assets):
    """Write assets to JSON file"""
    with open(JSON_FILE, 'w') as file:
        json.dump(assets, file, indent=2)

@app.route('/')
def index():
    """Serve the main application page"""
    return render_template('index.html')

@app.route('/api/assets', methods=['GET'])
def get_assets():
    """Get all assets"""
    assets = read_assets()
    return jsonify(assets)

@app.route('/api/assets/<int:asset_id>', methods=['GET'])
def get_asset(asset_id):
    """Get single asset by ID"""
    assets = read_assets()
    asset = next((a for a in assets if a['id'] == asset_id), None)
    if asset:
        return jsonify(asset)
    return jsonify({'error': 'Asset not found'}), 404

@app.route('/api/assets', methods=['POST'])
def create_asset():
    """Create new asset"""
    assets = read_assets()
    data = request.json
    
    # Validate input
    if not data or 'name' not in data or 'status' not in data:
        return jsonify({'error': 'Invalid data'}), 400
    
    # Generate new ID
    new_id = max([a['id'] for a in assets], default=0) + 1
    
    new_asset = {
        'id': new_id,
        'name': data['name'].strip(),
        'status': data['status'],
        'created_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'updated_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }
    
    assets.append(new_asset)
    write_assets(assets)
    
    return jsonify(new_asset), 201

@app.route('/api/assets/<int:asset_id>', methods=['PUT'])
def update_asset(asset_id):
    """Update existing asset"""
    assets = read_assets()
    asset_index = next((i for i, a in enumerate(assets) if a['id'] == asset_id), None)
    
    if asset_index is None:
        return jsonify({'error': 'Asset not found'}), 404
    
    data = request.json
    
    # Update fields
    if 'name' in data:
        assets[asset_index]['name'] = data['name'].strip()
    if 'status' in data:
        assets[asset_index]['status'] = data['status']
    
    assets[asset_index]['updated_at'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    write_assets(assets)
    return jsonify(assets[asset_index])

@app.route('/api/assets/<int:asset_id>', methods=['DELETE'])
def delete_asset(asset_id):
    """Delete asset"""
    assets = read_assets()
    asset_index = next((i for i, a in enumerate(assets) if a['id'] == asset_id), None)
    
    if asset_index is None:
        return jsonify({'error': 'Asset not found'}), 404
    
    deleted_asset = assets.pop(asset_index)
    write_assets(assets)
    
    return jsonify(deleted_asset)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)