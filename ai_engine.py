import math
from datetime import datetime

def calculate_match_score(resource, user):
    if not user:
        return 70

    score = 25  # base score

    # 1. Grade Class Suitability Match (up to 25 points)
    user_class = user.get('gradeClass', 'Grade 11').lower()
    suitable_class = resource.get('suitableClass', 'Grade 11-12').lower()
    resource_level = resource.get('level', '')

    if 'grade 9' in user_class or 'grade 10' in user_class:
        if 'grade 9' in suitable_class or 'grade 10' in suitable_class or resource_level == 'Beginner':
            score += 25
        elif resource_level == 'Intermediate':
            score += 15
    elif 'grade 11' in user_class or 'grade 12' in user_class:
        if 'grade 11' in suitable_class or 'grade 12' in suitable_class or resource_level == 'Intermediate':
            score += 25
        else:
            score += 15
    elif 'undergraduate' in user_class or 'postgraduate' in user_class:
        if 'undergraduate' in suitable_class or resource_level == 'Advanced':
            score += 25
        else:
            score += 18

    # 2. Learning Style (VARK) Match (up to 25 points)
    user_style = user.get('preferredStyle', 'visual')
    secondary_style = user.get('secondaryStyle', 'kinesthetic')
    resource_vark = resource.get('vark', [])

    if resource_vark and user_style in resource_vark:
        score += 25
    elif resource_vark and secondary_style in resource_vark:
        score += 15
    else:
        score += 5

    # 3. Subject Interest Match (up to 20 points)
    interests = user.get('interests', [])
    resource_subject_id = resource.get('subjectId', '')
    if resource_subject_id in interests:
        score += 20

    # 4. Career Goal Alignment (up to 15 points)
    career_goal = user.get('careerGoal', '').lower()
    if 'ai' in career_goal or 'data' in career_goal:
        if resource_subject_id == 'ds':
            score += 15
    elif 'physics' in career_goal or 'quantum' in career_goal:
        if resource_subject_id == 'physics':
            score += 15
    elif 'biotech' in career_goal or 'doctor' in career_goal:
        if resource_subject_id == 'bio':
            score += 15
    elif 'chemical' in career_goal or 'chemistry' in career_goal:
        if resource_subject_id == 'chem':
            score += 15

    # 5. Quiz History Boost (up to 10 points)
    quiz_scores = user.get('quizScores', [])
    if quiz_scores and len(quiz_scores) > 0:
        recent_scores = quiz_scores[-3:]
        for qs in recent_scores:
            qs_score = qs.get('score', 0)
            if qs_score < 80:
                score += 10
            elif qs_score >= 90 and resource_level == 'Advanced':
                score += 10

    return min(99, max(68, round(score)))

def get_recommendations(resources, user, filter_subject='all', limit=10):
    if not resources or not isinstance(resources, list):
        return []

    filtered_resources = resources
    # Filter to keep only subjects of interest to the user
    if user and user.get('interests') and len(user.get('interests', [])) > 0:
        interests = user.get('interests', [])
        filtered_resources = [res for res in filtered_resources if res.get('subjectId') in interests]

    result_list = []
    for res in filtered_resources:
        match_score = calculate_match_score(res, user)
        
        completed_ids = user.get('completedResourceIds', []) if user else []
        bookmarked_ids = user.get('bookmarkedResourceIds', []) if user else []
        res_id = res.get('id')

        is_completed = res_id in completed_ids
        is_bookmarked = res_id in bookmarked_ids

        # Set default reason
        user_grade = user.get('gradeClass', 'your grade') if user else 'your grade'
        reason = f"Recommended for {user_grade}"

        if user:
            user_grade_str = user.get('gradeClass', '')
            res_suitable_str = res.get('suitableClass', '')
            res_vark = res.get('vark', [])
            user_preferred_style = user.get('preferredStyle', '')
            user_interests = user.get('interests', [])
            res_subject_id = res.get('subjectId', '')

            if user_grade_str and res_suitable_str and user_grade_str.lower()[:5] in res_suitable_str.lower():
                reason = f"Tailored for {user_grade_str} Curriculum"
            elif res_vark and user_preferred_style in res_vark:
                reason = f"Matches your {user_preferred_style.upper()} learning style"
            elif user_interests and res_subject_id in user_interests:
                reason = "Matches your subject interest"

        # Apply multiplier for completed resources
        final_score = round(match_score * 0.75) if is_completed else match_score

        # Clone and enrich resource dict
        enriched_res = dict(res)
        enriched_res['matchScore'] = final_score
        enriched_res['isCompleted'] = is_completed
        enriched_res['isBookmarked'] = is_bookmarked
        enriched_res['reason'] = reason

        result_list.append(enriched_res)

    if filter_subject and filter_subject != 'all':
        result_list = [r for r in result_list if r.get('subjectId') == filter_subject]

    # Sort descending by matchScore
    result_list.sort(key=lambda x: x.get('matchScore', 0), reverse=True)

    return result_list[:limit]

def recalibrate_skill(user, quiz, score_percentage):
    # Clone user dictionary
    updated_user = dict(user)
    subject_id = quiz.get('subjectId')

    if 'masteryLevels' not in updated_user or not isinstance(updated_user['masteryLevels'], dict):
        updated_user['masteryLevels'] = {}

    current_mastery = updated_user['masteryLevels'].get(subject_id, 50)
    delta = 0

    if score_percentage >= 90:
        delta = 12
        if updated_user.get('skillLevel') == 'Beginner':
            updated_user['skillLevel'] = 'Intermediate'
        elif updated_user.get('skillLevel') == 'Intermediate' and current_mastery > 85:
            updated_user['skillLevel'] = 'Advanced'
    elif score_percentage >= 70:
        delta = 6
    else:
        delta = -3

    updated_user['masteryLevels'][subject_id] = min(100, max(10, current_mastery + delta))

    if 'quizScores' not in updated_user or not isinstance(updated_user['quizScores'], list):
        updated_user['quizScores'] = []

    updated_user['quizScores'].append({
        'quizId': quiz.get('id'),
        'score': score_percentage,
        'date': datetime.now().strftime('%Y-%m-%d')
    })

    if 'recentActivity' not in updated_user or not isinstance(updated_user['recentActivity'], list):
        updated_user['recentActivity'] = []

    quiz_title = quiz.get('title', 'Quiz')
    updated_user['recentActivity'].insert(0, {
        'title': f"Scored {score_percentage}% on {quiz_title}",
        'time': 'Just now',
        'icon': 'award'
    })

    return updated_user
