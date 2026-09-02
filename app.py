import os
from flask import Flask, request, jsonify, send_from_directory
import ai_engine

app = Flask(__name__, static_folder='.', static_url_path='')

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/api/recommendations', methods=['POST'])
def get_recommendations_api():
    try:
        data = request.get_json() or {}
        resources = data.get('resources', [])
        user = data.get('user')
        filter_subject = data.get('filterSubject', 'all')
        limit = data.get('limit', 10)
        
        recommendations = ai_engine.get_recommendations(
            resources=resources,
            user=user,
            filter_subject=filter_subject,
            limit=limit
        )
        return jsonify(recommendations)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/recalibrate', methods=['POST'])
def recalibrate_api():
    try:
        data = request.get_json() or {}
        user = data.get('user')
        quiz = data.get('quiz')
        score_percentage = data.get('scorePercentage', 0)
        
        if not user or not quiz:
            return jsonify({'error': 'Missing user or quiz data'}), 400
            
        updated_user = ai_engine.recalibrate_skill(
            user=user,
            quiz=quiz,
            score_percentage=score_percentage
        )
        return jsonify(updated_user)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/chat', methods=['POST'])
def chat_api():
    try:
        data = request.get_json() or {}
        message = data.get('message', '')
        history = data.get('history', [])
        user = data.get('user', {})
        current_course_id = data.get('currentCourseId', None)
        
        response = ai_engine.chat_with_ai(
            message=message,
            history=history,
            user=user,
            current_course_id=current_course_id
        )
        return jsonify(response)
    except Exception as e:
        return jsonify({'error': str(e)}), 400


# --------------------------------------------------------------------------
# CORS & OPTIONS Preflight Configuration
# --------------------------------------------------------------------------
@app.before_request
def handle_options_preflight():
    if request.method == 'OPTIONS':
        response = app.make_response('')
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        return response

@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    return response

# --------------------------------------------------------------------------
# Mock Firestore Local API Sync Endpoints
# --------------------------------------------------------------------------
FIRESTORE_DB_FILE = 'firestore_db.json'

def load_firestore_db():
    import json
    if not os.path.exists(FIRESTORE_DB_FILE):
        return {}
    try:
        with open(FIRESTORE_DB_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return {}

def save_firestore_db(db):
    import json
    try:
        with open(FIRESTORE_DB_FILE, 'w', encoding='utf-8') as f:
            json.dump(db, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print("Error saving mock firestore db:", e)

@app.route('/api/firestore/<collection>', methods=['GET'])
def get_firestore_collection(collection):
    db = load_firestore_db()
    items = list(db.get(collection, {}).values())
    return jsonify(items)

@app.route('/api/firestore/<collection>/<doc_id>', methods=['POST'])
def set_firestore_document(collection, doc_id):
    db = load_firestore_db()
    if collection not in db:
        db[collection] = {}
    data = request.get_json() or {}
    db[collection][doc_id] = data
    save_firestore_db(db)
    return jsonify({"success": True})

@app.route('/api/firestore/<collection>/<doc_id>', methods=['DELETE'])
def delete_firestore_document(collection, doc_id):
    db = load_firestore_db()
    if collection in db and doc_id in db[collection]:
        del db[collection][doc_id]
        save_firestore_db(db)
    return jsonify({"success": True})

if __name__ == '__main__':
    # Run locally on port 5000
    print("Starting LearnAI Pro backend server on http://127.0.0.1:5000")
    app.run(host='127.0.0.1', port=5000, debug=True)
