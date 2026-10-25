// Dynamic Seed & Core Taxonomy Data for Personalized Learning Recommendation System

window.INITIAL_DATA = {
  landingFeatures: [
    { id: 'f-1', icon: 'cpu', title: 'AI-Powered Recommendations', desc: 'Algorithms analyze your class level, skill level, learning style, and quiz scores to recommend tailored learning resources.' },
    { id: 'f-2', icon: 'eye', title: 'VARK Learning Style Assessment', desc: 'Discover whether you learn best visually, auditorily, through reading, or by hands-on kinesthetic practice.' },
    { id: 'f-3', icon: 'git-branch', title: 'Video Lessons for Every Roadmap Step', desc: 'Every milestone step in all subject pathways features dedicated embedded video lectures.' },
    { id: 'f-4', icon: 'graduation-cap', title: 'Videos for Every Enrolled Course', desc: 'Enrolled Courses & Hub features dedicated video study materials across Beginner, Intermediate, and Advanced tiers.' },
    { id: 'f-5', icon: 'bar-chart-3', title: 'Performance Analytics', desc: 'Track your weekly study hours, subject mastery, streak days, and learning goals with visual charts.' },
    { id: 'f-6', icon: 'shield-check', title: 'Badges & Official Certificates', desc: 'Earn achievement badges and download verifiable course completion certificates.' }
  ],

  careerGoals: [
    'AI & Machine Learning Engineer',
    'Data Scientist & Analytics Expert',
    'Full Stack Software Developer',
    'Robotics & Hardware Engineer',
    'Bioinformatics Researcher',
    'Medical Doctor & Biotech Researcher',
    'Chemical Engineer',
    'Quantum Physicist'
  ],

  subjects: [
    { id: 'ds', name: 'Artificial Intelligence & Data Science', icon: 'cpu', color: '#8b5cf6', description: 'Machine Learning, Deep Learning & Neural Networks' },
    { id: 'cs', name: 'Computer Science & Software', icon: 'code', color: '#6366f1', description: 'Algorithms, Web Dev, Python & Programming' },
    { id: 'math', name: 'Mathematics & Analytics', icon: 'calculator', color: '#ec4899', description: 'Algebra, Calculus, Statistics & Discrete Math' },
    { id: 'physics', name: 'Physics & Quantum Systems', icon: 'zap', color: '#f59e0b', description: 'Mechanics, Electromagnetism & Quantum Basics' },
    { id: 'bio', name: 'Biology & Biotechnology', icon: 'dna', color: '#10b981', description: 'Genetics, Cell Biology & Bioinformatics' },
    { id: 'chem', name: 'Chemistry & Molecules', icon: 'flask-conical', color: '#06b6d4', description: 'Organic, Inorganic & Chemical Reactions' }
  ],

  learningStyles: [
    { id: 'visual', name: 'Visual', icon: 'eye', desc: 'Diagrams, infographics, flowchart guides, visual video tutorials' },
    { id: 'auditory', name: 'Auditory', icon: 'volume-2', desc: 'Podcasts, video lectures, verbal breakdowns & explanations' },
    { id: 'reading', name: 'Reading / Writing', icon: 'book-open', desc: 'Articles, written documentation, step-by-step notes & guides' },
    { id: 'kinesthetic', name: 'Kinesthetic', icon: 'activity', desc: 'Interactive coding labs, practice exercises, hands-on simulations' }
  ],

  skillLevels: ['Beginner', 'Intermediate', 'Advanced'],

  classesList: ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'Undergraduate (Year 1-2)', 'Undergraduate (Year 3-4)', 'Postgraduate / Professional'],

  // DYNAMIC ARRAYS: Populated via Admin Panel & Synced via Firebase
  courses: [],
  resources: [],
  roadmaps: {},
  quizzes: (typeof window !== 'undefined' && window.ALL_SUBJECT_QUIZZES && window.ALL_SUBJECT_QUIZZES.length > 0) ? window.ALL_SUBJECT_QUIZZES : [],

  badges: [
    { id: 'b-1', title: 'Quick Starter', icon: 'zap', desc: 'Completed initial profile onboarding assessment', unlocked: true, date: '2026-07-20' },
    { id: 'b-ai-1', title: 'Course Explorer', icon: 'cpu', desc: 'Enrolled in a platform course pathway', unlocked: false, date: '' }
  ],

  defaultUsers: [
    {
      id: 'u-admin',
      name: 'Admin Instructor',
      email: 'admin@gmail.com',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80',
      gradeClass: 'Administrator',
      preferredStyle: 'reading',
      interests: ['ds', 'cs', 'math'],
      enrolledCourseIds: [],
      completedResourceIds: [],
      bookmarkedResourceIds: [],
      dailyGoalMinutes: 60,
      todayStudiedMinutes: 0,
      streakDays: 1,
      recentActivity: []
    }
  ]
};
