// Dynamic AI Recommendation Engine with Grade Class & Skill Alignment (Python Backend Bridge with Local Fallbacks)

window.AIEngine = {
  getApiBase: function() {
    return window.location.port === '5000' ? '' : 'http://127.0.0.1:5000';
  },

  calculateMatchScore: function(resource, user) {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', this.getApiBase() + '/api/recommendations', false); // synchronous HTTP request
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify({ resources: [resource], user: user, filterSubject: 'all', limit: 1 }));
      if (xhr.status === 200) {
        const res = JSON.parse(xhr.responseText);
        if (res && res.length > 0) {
          return res[0].matchScore;
        }
      }
    } catch (e) {
      console.warn("Fallback to local calculateMatchScore (Python server not responding):", e);
    }
    return this._localCalculateMatchScore(resource, user);
  },

  getRecommendations: function(resources, user, filterSubject = 'all', limit = 10) {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', this.getApiBase() + '/api/recommendations', false); // synchronous HTTP request
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify({ resources, user, filterSubject, limit }));
      if (xhr.status === 200) {
        return JSON.parse(xhr.responseText);
      }
    } catch (e) {
      console.warn("Fallback to local getRecommendations (Python server not responding):", e);
    }
    return this._localGetRecommendations(resources, user, filterSubject, limit);
  },

  recalibrateSkill: function(user, quiz, scorePercentage) {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', this.getApiBase() + '/api/recalibrate', false); // synchronous HTTP request
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify({ user, quiz, scorePercentage }));
      if (xhr.status === 200) {
        return JSON.parse(xhr.responseText);
      }
    } catch (e) {
      console.warn("Fallback to local recalibrateSkill (Python server not responding):", e);
    }
    return this._localRecalibrateSkill(user, quiz, scorePercentage);
  },

  // --------------------------------------------------------------------------
  // LOCAL FALLBACK IMPLEMENTATIONS (Original Client-Side Logic)
  // --------------------------------------------------------------------------
  _localCalculateMatchScore: function(resource, user) {
    if (!user) return 70;

    let score = 25; // base score

    // 1. Grade Class Suitability Match (up to 25 points)
    const userClass = (user.gradeClass || 'Grade 11').toLowerCase();
    const suitableClass = (resource.suitableClass || 'Grade 11-12').toLowerCase();

    if (userClass.includes('grade 9') || userClass.includes('grade 10')) {
      if (suitableClass.includes('grade 9') || suitableClass.includes('grade 10') || resource.level === 'Beginner') {
        score += 25;
      } else if (resource.level === 'Intermediate') {
        score += 15;
      }
    } else if (userClass.includes('grade 11') || userClass.includes('grade 12')) {
      if (suitableClass.includes('grade 11') || suitableClass.includes('grade 12') || resource.level === 'Intermediate') {
        score += 25;
      } else {
        score += 15;
      }
    } else if (userClass.includes('undergraduate') || userClass.includes('postgraduate')) {
      if (suitableClass.includes('undergraduate') || resource.level === 'Advanced') {
        score += 25;
      } else {
        score += 18;
      }
    }

    // 2. Learning Style (VARK) Match (up to 25 points)
    const userStyle = user.preferredStyle || 'visual';
    const secondaryStyle = user.secondaryStyle || 'kinesthetic';

    if (resource.vark && resource.vark.includes(userStyle)) {
      score += 25;
    } else if (resource.vark && resource.vark.includes(secondaryStyle)) {
      score += 15;
    } else {
      score += 5;
    }

    // 3. Subject Interest Match (up to 20 points)
    const interests = user.interests || [];
    if (interests.includes(resource.subjectId)) {
      score += 20;
    }

    // 4. Career Goal Alignment (up to 15 points)
    const careerGoal = (user.careerGoal || '').toLowerCase();
    if (careerGoal.includes('ai') || careerGoal.includes('data')) {
      if (resource.subjectId === 'ds') score += 15;
    } else if (careerGoal.includes('physics') || careerGoal.includes('quantum')) {
      if (resource.subjectId === 'physics') score += 15;
    } else if (careerGoal.includes('biotech') || careerGoal.includes('doctor')) {
      if (resource.subjectId === 'bio') score += 15;
    } else if (careerGoal.includes('chemical') || careerGoal.includes('chemistry')) {
      if (resource.subjectId === 'chem') score += 15;
    }

    // 5. Quiz History Boost (up to 10 points)
    if (user.quizScores && user.quizScores.length > 0) {
      const recentScores = user.quizScores.slice(-3);
      recentScores.forEach(qs => {
        if (qs.score < 80) {
          score += 10;
        } else if (qs.score >= 90 && resource.level === 'Advanced') {
          score += 10;
        }
      });
    }

    return Math.min(99, Math.max(68, Math.round(score)));
  },

  _localGetRecommendations: function(resources, user, filterSubject = 'all', limit = 10) {
    if (!resources || !Array.isArray(resources)) return [];

    // Filter to keep only subjects of interest to the user
    if (user && user.interests && user.interests.length > 0) {
      resources = resources.filter(res => user.interests.includes(res.subjectId));
    }

    let list = resources.map(res => {
      const matchScore = this._localCalculateMatchScore(res, user);
      const isCompleted = user && user.completedResourceIds ? user.completedResourceIds.includes(res.id) : false;
      const isBookmarked = user && user.bookmarkedResourceIds ? user.bookmarkedResourceIds.includes(res.id) : false;

      let reason = `Recommended for ${user ? user.gradeClass || 'your grade' : 'your grade'}`;
      if (user) {
        if (user.gradeClass && res.suitableClass && res.suitableClass.toLowerCase().includes((user.gradeClass || '').toLowerCase().substring(0, 5))) {
          reason = `Tailored for ${user.gradeClass} Curriculum`;
        } else if (res.vark && res.vark.includes(user.preferredStyle)) {
          reason = `Matches your ${user.preferredStyle.toUpperCase()} learning style`;
        } else if (user.interests && user.interests.includes(res.subjectId)) {
          reason = `Matches your subject interest`;
        }
      }

      return {
        ...res,
        matchScore: isCompleted ? Math.round(matchScore * 0.75) : matchScore,
        isCompleted: isCompleted,
        isBookmarked: isBookmarked,
        reason: reason
      };
    });

    if (filterSubject && filterSubject !== 'all') {
      list = list.filter(r => r.subjectId === filterSubject);
    }

    list.sort((a, b) => b.matchScore - a.matchScore);

    return list.slice(0, limit);
  },

  _localRecalibrateSkill: function(user, quiz, scorePercentage) {
    const updatedUser = { ...user };
    const subjectId = quiz.subjectId;

    if (!updatedUser.masteryLevels) {
      updatedUser.masteryLevels = {};
    }

    const currentMastery = updatedUser.masteryLevels[subjectId] || 50;
    let delta = 0;

    if (scorePercentage >= 90) {
      delta = 12;
      if (updatedUser.skillLevel === 'Beginner') updatedUser.skillLevel = 'Intermediate';
      else if (updatedUser.skillLevel === 'Intermediate' && currentMastery > 85) updatedUser.skillLevel = 'Advanced';
    } else if (scorePercentage >= 70) {
      delta = 6;
    } else {
      delta = -3;
    }

    updatedUser.masteryLevels[subjectId] = Math.min(100, Math.max(10, currentMastery + delta));

    if (!updatedUser.quizScores) updatedUser.quizScores = [];
    updatedUser.quizScores.push({
      quizId: quiz.id,
      score: scorePercentage,
      date: new Date().toISOString().split('T')[0]
    });

    if (!updatedUser.recentActivity) updatedUser.recentActivity = [];
    updatedUser.recentActivity.unshift({
      title: `Scored ${scorePercentage}% on ${quiz.title || 'Quiz'}`,
      time: 'Just now',
      icon: 'award'
    });

    return updatedUser;
  }
};
