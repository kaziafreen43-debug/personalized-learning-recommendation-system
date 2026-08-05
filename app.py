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

if __name__ == '__main__':
    # Run locally on port 5000
    print("Starting LearnAI Pro backend server on http://127.0.0.1:5000")
    app.run(host='127.0.0.1', port=5000, debug=True)
