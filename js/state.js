// App State Management & Persistence

// --------------------------------------------------------------------------
// Multi-Category & Recommendation Taxonomy Engine
// --------------------------------------------------------------------------
window.CATEGORY_TAXONOMY = {
  ds: {
    id: 'ds',
    name: 'Artificial Intelligence & Data Science',
    category: 'AI Machine Learning',
    tags: ['AI Machine Learning', 'Computer science', 'Artificial Intelligence', 'Data Science', 'Machine Learning'],
    aliases: ['ds', 'ai', 'ml', 'ai-ml', 'ai/ml', 'aiml', 'ai machine learning', 'ai & machine learning', 'artificial intelligence', 'artificial intelligence & data science', 'data science', 'datascience', 'data-science', 'machine learning', 'deep learning']
  },
  cs: {
    id: 'cs',
    name: 'Computer Science & Software',
    category: 'Computer science',
    tags: ['Computer science', 'Software Engineering', 'Algorithms', 'Web Development'],
    aliases: ['cs', 'computer science', 'computer science & software', 'software', 'programming', 'software engineering', 'web dev', 'python']
  },
  math: {
    id: 'math',
    name: 'Mathematics & Analytics',
    category: 'Mathematics',
    tags: ['Mathematics', 'Analytics', 'Calculus', 'Algebra', 'Statistics'],
    aliases: ['math', 'maths', 'mathematics', 'mathematics & analytics', 'algebra', 'calculus', 'analytics', 'statistics', 'discrete math']
  },
  physics: {
    id: 'physics',
    name: 'Physics & Quantum Systems',
    category: 'Physics',
    tags: ['Physics', 'Quantum Systems', 'Mechanics', 'Electromagnetism'],
    aliases: ['physics', 'physic', 'physics & quantum systems', 'quantum systems', 'quantum', 'mechanics', 'electromagnetism']
  },
  bio: {
    id: 'bio',
    name: 'Biology & Biotechnology',
    category: 'Biology',
    tags: ['Biology', 'Biotechnology', 'Genetics', 'Cell Biology'],
    aliases: ['bio', 'biology', 'biology & biotechnology', 'biotechnology', 'genetics', 'cell biology', 'bioinformatics']
  },
  chem: {
    id: 'chem',
    name: 'Chemistry & Molecules',
    category: 'Chemistry',
    tags: ['Chemistry', 'Molecular Science', 'Organic Synthesis', 'Chemical Reactions'],
    aliases: ['chem', 'chemistry', 'chemistry & molecules', 'molecules', 'chemical', 'organic chemistry', 'chemical reactions']
  }
};

window.normalizeCategoryKey = function(cat) {
  if (!cat || typeof cat !== 'string') return '';
  const clean = cat.trim().toLowerCase();
  if (window.CATEGORY_TAXONOMY) {
    for (const [key, meta] of Object.entries(window.CATEGORY_TAXONOMY)) {
      if (key === clean) return key;
      if (meta.aliases && meta.aliases.some(a => {
        if (a === clean) return true;
        if (a.length <= 3) {
          const regex = new RegExp(`(^|[\\s_-])${a}([\\s_-]|$)`, 'i');
          return regex.test(clean);
        }
        return clean.includes(a) || a.includes(clean);
      })) {
        return key;
      }
    }
  }
  return clean;
};

window.getSubjectCategoryName = function(subId) {
  if (!subId) return 'General';
  const norm = window.normalizeCategoryKey(subId);
  if (window.CATEGORY_TAXONOMY && window.CATEGORY_TAXONOMY[norm]) {
    return window.CATEGORY_TAXONOMY[norm].category;
  }
  return subId;
};

window.getItemCategories = function(item) {
  const cats = new Set();
  if (!item || typeof item !== 'object') return [];
  if (item.category) {
    if (Array.isArray(item.category)) item.category.forEach(c => cats.add(c));
    else if (typeof item.category === 'string') cats.add(item.category);
  }
  if (Array.isArray(item.categories)) {
    item.categories.forEach(c => {
      if (typeof c === 'string') cats.add(c);
    });
  }
  if (Array.isArray(item.tags)) {
    item.tags.forEach(t => {
      if (typeof t === 'string') cats.add(t);
    });
  }
  if (item.subjectId) {
    cats.add(item.subjectId);
  }
  if (item.courseId && window.AppState && window.AppState.data && window.AppState.data.courses) {
    const parent = window.AppState.data.courses.find(c => c.id === item.courseId);
    if (parent) {
      window.getItemCategories(parent).forEach(c => cats.add(c));
    }
  }
  return Array.from(cats);
};

window.itemMatchesInterests = function(item, userInterests) {
  if (!item) return false;
  if (!userInterests || !Array.isArray(userInterests) || userInterests.length === 0) {
    return false;
  }
  const itemCats = window.getItemCategories(item);
  if (itemCats.length === 0) return false;

  const normalizedUserInterests = userInterests.map(i => window.normalizeCategoryKey(i));

  for (const rawCat of itemCats) {
    const norm = window.normalizeCategoryKey(rawCat);
    if (norm && normalizedUserInterests.includes(norm)) {
      return true;
    }
    for (const rawInterest of userInterests) {
      if (typeof rawInterest === 'string' && typeof rawCat === 'string') {
        const a = rawInterest.trim().toLowerCase();
        const b = rawCat.trim().toLowerCase();
        if (a === b) {
          return true;
        }
        if (a.length > 3 && b.length > 3 && (a.includes(b) || b.includes(a))) {
          return true;
        }
        if (a.length <= 3) {
          const regex = new RegExp(`(^|[\\s_-])${a}([\\s_-]|$)`, 'i');
          if (regex.test(b)) return true;
        }
        if (b.length <= 3) {
          const regex = new RegExp(`(^|[\\s_-])${b}([\\s_-]|$)`, 'i');
          if (regex.test(a)) return true;
        }
      }
    }
  }
  return false;
};

window.autoCategorizeItem = function(item, type = 'item') {
  if (!item || typeof item !== 'object') return item;
  
  const subId = item.subjectId || (item.courseId && window.AppState && window.AppState.data && window.AppState.data.courses && (window.AppState.data.courses.find(c => c.id === item.courseId) || {}).subjectId) || '';
  const tax = (window.CATEGORY_TAXONOMY && subId && window.CATEGORY_TAXONOMY[subId]) || null;
  
  let cats = Array.isArray(item.categories) ? [...item.categories] : [];
  if (item.category && typeof item.category === 'string' && !cats.includes(item.category)) {
    cats.push(item.category);
  }
  let tags = Array.isArray(item.tags) ? [...item.tags] : [];

  if (tax) {
    if (!item.category) item.category = tax.category;
    if (cats.length === 0) cats.push(tax.category);
    if (tax.tags) {
      tax.tags.forEach(t => {
        if (!tags.includes(t)) tags.push(t);
      });
    }
    if (!tags.includes(tax.category)) tags.push(tax.category);
    if (!tags.includes(tax.name)) tags.push(tax.name);
    if (!tags.includes(tax.id)) tags.push(tax.id);
  }

  const text = ((item.title || '') + ' ' + (item.description || '')).toLowerCase();
  if (window.CATEGORY_TAXONOMY) {
    Object.values(window.CATEGORY_TAXONOMY).forEach(t => {
      if (t.aliases.some(a => {
        if (a.length <= 3) {
          const regex = new RegExp(`(^|[\\s_-])${a}([\\s_-]|$)`, 'i');
          return regex.test(text);
        }
        return text.includes(a);
      })) {
        if (!cats.includes(t.category)) cats.push(t.category);
        if (!tags.includes(t.category)) tags.push(t.category);
      }
    });
  }

  if (cats.length === 0) cats.push(subId || 'General');
  if (tags.length === 0) tags.push(subId || 'General');

  item.categories = cats;
  item.tags = Array.from(new Set(tags));
  if (!item.category) item.category = cats[0];

  return item;
};

// --------------------------------------------------------------------------
// --------------------------------------------------------------------------
// Robust Search Matching for All 6 Core Subjects (Physics, Chem, Bio, Math, AI-ML, Data Science)
// --------------------------------------------------------------------------
window.resourceMatchesSearch = function(r, query) {
  if (!r || typeof r !== "object") return false;
  if (!query || !query.trim()) return true;
  const q = query.toLowerCase().trim();

  const title = (r.title || "").toLowerCase();
  const desc = ((r.description || "") + " " + (r.summary || "")).toLowerCase();
  const subId = (r.subjectId || "").toLowerCase();
  const cat = (r.category || "").toLowerCase();
  const cats = (Array.isArray(r.categories) ? r.categories : []).map(c => String(c).toLowerCase());
  const tags = (Array.isArray(r.tags) ? r.tags : []).map(t => String(t).toLowerCase());

  // 1. Direct core subject lookup for all 6 target subjects
  const subjectExactMap = {
    physics: ['physics', 'physic'],
    chem: ['chemistry', 'chem'],
    bio: ['biology', 'bio'],
    math: ['math', 'maths', 'mathematics'],
    ds: ['ai', 'ml', 'ai-ml', 'ai/ml', 'aiml', 'artificial intelligence', 'machine learning', 'data science', 'datascience', 'data-science'],
    cs: ['cs', 'computer science', 'software', 'programming']
  };

  for (const [sId, names] of Object.entries(subjectExactMap)) {
    if (names.includes(q)) {
      if (subId === sId) return true;
      if (sId === 'ds' && (tags.some(t => t.includes('data science') || t.includes('artificial intelligence') || t.includes('machine learning')) || cat.includes('ai machine learning') || cat.includes('data science'))) return true;
      if (sId === 'cs' && (tags.some(t => t.includes('computer science') || t.includes('software engineering')) || cat.includes('computer science'))) return true;
      return false;
    }
  }

  if (title.includes(q) || desc.includes(q)) return true;
  if (subId === q) return true;
  if (cat && (cat.includes(q) || (cat.length > 3 && q.includes(cat)))) return true;
  if (cats.some(c => c && (c.includes(q) || (c.length > 3 && q.includes(c))))) return true;
  if (tags.some(t => {
    if (!t) return false;
    if (t === q) return true;
    if (t.includes(q)) return true;
    if (t.length <= 3) {
      const rx = new RegExp("(^|[\\s_-])" + t.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&") + "([\\s_-]|$)", "i");
      return rx.test(q);
    }
    return q.includes(t);
  })) return true;

  const subjectQueryMap = {
    physics: ["physics", "physic", "quantum", "mechanics", "electromagnetism", "newton", "kinematics"],
    chem: ["chemistry", "chem", "chemical", "molecules", "molecular", "organic", "thermodynamics", "periodic"],
    bio: ["biology", "bio", "biotechnology", "biotech", "genetics", "cellular", "dna", "crispr", "organelles"],
    math: ["math", "maths", "mathematics", "calculus", "algebra", "analytics", "statistics", "discrete math", "derivatives", "matrices", "linear algebra", "probability"],
    ds: ["ai", "ml", "ai-ml", "ai/ml", "aiml", "artificial intelligence", "machine learning", "deep learning", "neural", "perceptron", "data science", "datascience", "data-science", "transformers", "llm", "backpropagation"],
    cs: ["cs", "computer science", "software", "programming", "software engineering", "web dev", "algorithms", "dsa", "system design", "control flow"]
  };

  for (const [sId, keywords] of Object.entries(subjectQueryMap)) {
    const matchesKeyword = keywords.some(k => {
      if (k.length <= 3) {
        const regex = new RegExp("(^|[\\s_-])" + k + "([\\s_-]|$)", "i");
        return regex.test(q);
      }
      return q.includes(k) || k.includes(q);
    });

    if (matchesKeyword) {
      if (subId === sId) return true;
      if (sId === "ds" && (tags.some(t => t.includes("data science") || t.includes("artificial intelligence") || t.includes("machine learning")) || cat.includes("ai machine learning") || cat.includes("data science"))) return true;
      if (sId === "cs" && (tags.some(t => t.includes("computer science") || t.includes("software engineering")) || cat.includes("computer science"))) return true;
      if (sId === "math" && (tags.some(t => t.includes("mathematics") || t.includes("calculus") || t.includes("discrete math")) || cat.includes("mathematics"))) return true;
      if (sId === "physics" && (tags.some(t => t.includes("physics") || t.includes("mechanics") || t.includes("quantum")) || cat.includes("physics"))) return true;
      if (sId === "bio" && (tags.some(t => t.includes("biology") || t.includes("genetics") || t.includes("biotechnology")) || cat.includes("biology"))) return true;
      if (sId === "chem" && (tags.some(t => t.includes("chemistry") || t.includes("organic") || t.includes("molecules")) || cat.includes("chemistry"))) return true;
    }
  }

  return false;
};

window.courseMatchesSearch = function(c, query) {
  if (!c || typeof c !== "object") return false;
  if (!query || !query.trim()) return true;
  const q = query.toLowerCase().trim();

  const title = (c.title || "").toLowerCase();
  const desc = (c.description || "").toLowerCase();
  const subId = (c.subjectId || "").toLowerCase();
  const cat = (c.category || "").toLowerCase();
  const cats = (Array.isArray(c.categories) ? c.categories : []).map(cat => String(cat).toLowerCase());
  const tags = (Array.isArray(c.tags) ? c.tags : []).map(t => String(t).toLowerCase());

  // 1. Direct core subject lookup for all 6 target subjects
  const courseExactMap = {
    physics: ['physics', 'physic'],
    chem: ['chemistry', 'chem'],
    bio: ['biology', 'bio'],
    math: ['math', 'maths', 'mathematics'],
    ds: ['ai', 'ml', 'ai-ml', 'ai/ml', 'aiml', 'artificial intelligence', 'machine learning', 'data science', 'datascience', 'data-science'],
    cs: ['cs', 'computer science', 'software', 'programming']
  };

  for (const [sId, names] of Object.entries(courseExactMap)) {
    if (names.includes(q)) {
      if (subId === sId) return true;
      if (sId === 'ds' && (tags.some(t => t.includes('data science') || t.includes('artificial intelligence') || t.includes('machine learning')) || cat.includes('ai machine learning') || cat.includes('data science'))) return true;
      if (sId === 'cs' && (tags.some(t => t.includes('computer science') || t.includes('software engineering')) || cat.includes('computer science'))) return true;
      return false;
    }
  }

  if (title.includes(q) || desc.includes(q)) return true;
  if (subId === q) return true;
  if (cat && (cat.includes(q) || (cat.length > 3 && q.includes(cat)))) return true;
  if (cats.some(cat => cat && (cat.includes(q) || (cat.length > 3 && q.includes(cat))))) return true;
  if (tags.some(t => {
    if (!t) return false;
    if (t === q) return true;
    if (t.includes(q)) return true;
    if (t.length <= 3) {
      const rx = new RegExp("(^|[\\s_-])" + t.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&") + "([\\s_-]|$)", "i");
      return rx.test(q);
    }
    return q.includes(t);
  })) return true;

  const subjectQueryMap = {
    physics: ["physics", "physic", "quantum", "mechanics", "electromagnetism"],
    chem: ["chemistry", "chem", "chemical", "molecules", "molecular", "organic"],
    bio: ["biology", "bio", "biotechnology", "biotech", "genetics"],
    math: ["math", "maths", "mathematics", "calculus", "algebra", "analytics"],
    ds: ["ai", "ml", "ai-ml", "ai/ml", "aiml", "artificial intelligence", "machine learning", "deep learning", "data science", "datascience", "data-science"],
    cs: ["cs", "computer science", "software", "programming", "algorithms", "software engineering"]
  };

  for (const [sId, keywords] of Object.entries(subjectQueryMap)) {
    const matchesKeyword = keywords.some(k => {
      if (k.length <= 3) {
        const regex = new RegExp("(^|[\\s_-])" + k + "([\\s_-]|$)", "i");
        return regex.test(q);
      }
      return q.includes(k) || k.includes(q);
    });
    if (matchesKeyword && subId === sId) return true;
  }

  return false;
};

window.autoCategorizeAllData = function(data) {
  if (!data) return;
  if (Array.isArray(data.courses)) {
    data.courses.forEach(c => window.autoCategorizeItem(c, 'course'));
  }
  if (Array.isArray(data.resources)) {
    data.resources.forEach(r => window.autoCategorizeItem(r, 'resource'));
  }
  if (data.roadmaps && typeof data.roadmaps === 'object') {
    Object.entries(data.roadmaps).forEach(([k, rm]) => {
      rm.subjectId = rm.subjectId || k;
      window.autoCategorizeItem(rm, 'roadmap');
    });
  }
  if (Array.isArray(data.quizzes)) {
    data.quizzes.forEach(q => window.autoCategorizeItem(q, 'quiz'));
  }
  if (Array.isArray(data.assignments)) {
    data.assignments.forEach(a => window.autoCategorizeItem(a, 'assignment'));
  }
};

window.AppState = {
  data: null,
  currentUser: null,
  isAuthenticated: false,
  showAllCourses: false,
  theme: 'light',
  currentView: 'dashboard',
  activeSubjectFilter: 'all',
  activeFormatFilter: 'all',
  activeQuizCategoryFilter: 'all',
  activeQuizSubjectFilter: 'all',
  searchQuery: '',
  selectedCourseId: null,
  
  activeModal: null,
  modalData: null,

  isLoadingStudents: true,
  studentLoadError: null,
  realtimeUnsubscribe: null,
  _userProfileUnsubscribe: null,
  
  listeners: [],

  init: function() {
    this.showAllCourses = false;
    const savedData = localStorage.getItem('plr_app_data');
    if (savedData) {
      try {
        this.data = JSON.parse(savedData);
      } catch (e) {
        this.data = null;
      }
    }
    if (!this.data) {
      this.data = {
        courses: (window.INITIAL_DATA && window.INITIAL_DATA.courses) ? [...window.INITIAL_DATA.courses] : [],
        resources: (window.INITIAL_DATA && window.INITIAL_DATA.resources) ? [...window.INITIAL_DATA.resources] : [],
        quizzes: (window.INITIAL_DATA && window.INITIAL_DATA.quizzes) ? [...window.INITIAL_DATA.quizzes] : [],
        assignments: (window.INITIAL_DATA && window.INITIAL_DATA.assignments) ? [...window.INITIAL_DATA.assignments] : [],
        submissions: [],
        subjects: (window.INITIAL_DATA && window.INITIAL_DATA.subjects) || [],
        defaultUsers: (window.INITIAL_DATA && window.INITIAL_DATA.defaultUsers) || [],
        roadmaps: (window.INITIAL_DATA && window.INITIAL_DATA.roadmaps) || {}
      };
      this.saveData();
    }

    if (!Array.isArray(this.data.courses)) this.data.courses = [];
    if (!Array.isArray(this.data.resources)) this.data.resources = [];
    if (!Array.isArray(this.data.quizzes)) this.data.quizzes = [];
    if (!Array.isArray(this.data.assignments)) this.data.assignments = [];
    if (!Array.isArray(this.data.submissions)) this.data.submissions = [];
    if (!Array.isArray(this.data.subjects)) this.data.subjects = (window.INITIAL_DATA && window.INITIAL_DATA.subjects) || [];
    if (!this.data.roadmaps) this.data.roadmaps = (window.INITIAL_DATA && window.INITIAL_DATA.roadmaps) || {};

    // Guarantee full content from INITIAL_DATA: merge all core courses and resources
    const KNOWN_BROKEN_VIDEOS = ['P3RXtoYCF4U', '8hly31xKLI0', '5vcj8kSwBCY', 'Qe453-yYjbg', 'SqsC34ghxCM', 'ndSpJq7q4G8'];
    const isUrlBroken = (url) => url && KNOWN_BROKEN_VIDEOS.some(badId => String(url).includes(badId));

    if (window.INITIAL_DATA && Array.isArray(window.INITIAL_DATA.courses)) {
      window.INITIAL_DATA.courses.forEach(initCourse => {
        const existingIdx = this.data.courses.findIndex(c => c.id === initCourse.id);
        if (existingIdx === -1) {
          this.data.courses.push({ ...initCourse });
        } else {
          // Keep mapped tiers if existing course lacks them
          if (!this.data.courses[existingIdx].tiers && initCourse.tiers) {
            this.data.courses[existingIdx].tiers = initCourse.tiers;
          } else if (this.data.courses[existingIdx].tiers && initCourse.tiers) {
            // Synchronize materials to ensure verified embed URLs and fallback options
            for (const tier in initCourse.tiers) {
              const initTier = initCourse.tiers[tier];
              const existTier = this.data.courses[existingIdx].tiers[tier];
              if (initTier && initTier.materials && existTier && existTier.materials) {
                existTier.materials.forEach(m => {
                  const initM = initTier.materials.find(im => im.id === m.id);
                  if (initM && (isUrlBroken(m.contentUrl) || !m.contentUrl || m.contentUrl !== initM.contentUrl)) {
                    m.contentUrl = initM.contentUrl;
                    m.fallbackUrls = initM.fallbackUrls;
                    m.title = initM.title;
                    m.duration = initM.duration;
                  }
                });
              }
            }
          }
        }
      });
    }
    if (window.INITIAL_DATA && Array.isArray(window.INITIAL_DATA.resources)) {
      window.INITIAL_DATA.resources.forEach(initRes => {
        const existingRes = this.data.resources.find(r => r.id === initRes.id);
        if (!existingRes) {
          this.data.resources.push({ ...initRes });
        } else {
          if (isUrlBroken(existingRes.contentUrl) || !existingRes.contentUrl || existingRes.contentUrl !== initRes.contentUrl) {
            existingRes.contentUrl = initRes.contentUrl;
            existingRes.fallbackUrls = initRes.fallbackUrls;
            existingRes.title = initRes.title;
            existingRes.description = initRes.description;
            existingRes.summary = initRes.summary;
          }
        }
      });
    }
    if (window.INITIAL_DATA && window.INITIAL_DATA.roadmaps) {
      Object.entries(window.INITIAL_DATA.roadmaps).forEach(([k, rm]) => {
        if (!this.data.roadmaps[k]) {
          this.data.roadmaps[k] = rm;
        }
      });
    }
    if (window.INITIAL_DATA && Array.isArray(window.INITIAL_DATA.assignments)) {
      window.INITIAL_DATA.assignments.forEach(initAssign => {
        if (!this.data.assignments.some(a => a.id === initAssign.id)) {
          this.data.assignments.push({ ...initAssign });
        }
      });
    }

    // Always maintain master repository for instant search and subject switching
    this.data._masterCourses = [...this.data.courses];
    this.data._masterResources = [...this.data.resources];
    this.data._masterAssignments = [...this.data.assignments];

    // Automatically assign multiple categories & tags to any content missing them
    if (window.autoCategorizeAllData) {
      window.autoCategorizeAllData(this.data);
    }

    // Ensure all 6 core subjects are always present
    const coreSubjects = (window.INITIAL_DATA && window.INITIAL_DATA.subjects) || [];
    coreSubjects.forEach(s => {
      if (!this.data.subjects.some(existing => existing.id === s.id)) {
        this.data.subjects.push(s);
      }
    });

    // Ensure all 18 core subject category quizzes (Beginner, Intermediate, Advanced) are always present
    const defaultQuizzes = (window.ALL_SUBJECT_QUIZZES || (window.INITIAL_DATA && window.INITIAL_DATA.quizzes) || []);
    defaultQuizzes.forEach(dq => {
      const idx = this.data.quizzes.findIndex(q => q.id === dq.id || (q.subjectId === dq.subjectId && q.level === dq.level));
      if (idx === -1) {
        this.data.quizzes.push(dq);
      } else if (!this.data.quizzes[idx].questions || this.data.quizzes[idx].questions.length === 0) {
        this.data.quizzes[idx] = dq;
      }
    });

    // Ensure admin user always exists with role: 'admin' and never gets purged
    if (!this.data.defaultUsers) this.data.defaultUsers = [];
    let existingAdmin = this.data.defaultUsers.find(u => u.id === 'u-admin' || (u.email && u.email.toLowerCase() === 'admin@gmail.com') || u.role === 'admin');
    if (!existingAdmin) {
      existingAdmin = {
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
      };
      this.data.defaultUsers.unshift(existingAdmin);
    }
    existingAdmin.role = 'admin';
    existingAdmin.gradeClass = 'Administrator';

    // Purge any legacy static mock students (u-1 to u-8) from cached localStorage data
    const legacyMockIds = ['u-1', 'u-2', 'u-3', 'u-4', 'u-5', 'u-6', 'u-7', 'u-8'];
    const mockEmails = ['alex@student.ai', 'ethan.b@student.ai', 'sophia.c@student.ai', 'marcus.t@student.ai', 'priya.s@student.ai', 'lucas.s@student.ai', 'elena.r@student.ai', 'noah.k@student.ai'];
    if (this.data && this.data.defaultUsers) {
      this.data.defaultUsers = this.data.defaultUsers.filter(u => {
        if (u.id === 'u-admin' || (u.email && u.email.toLowerCase() === 'admin@gmail.com') || u.role === 'admin') return true;
        if (legacyMockIds.includes(u.id) || (u.email && mockEmails.includes(u.email.toLowerCase()))) return false;
        return true;
      });
    }

    // Ensure state.data.students is initialized with registered students
    if (!this.data.students || this.data.students.length === 0) {
      this.data.students = (this.data.defaultUsers || []).filter(u => u && u.role !== 'admin' && u.id !== 'u-admin' && (u.email || '').toLowerCase() !== 'admin@gmail.com');
    }
    this.studentLoadError = null;

    const savedTheme = localStorage.getItem('plr_theme');
    this.theme = savedTheme || 'light';
    document.documentElement.setAttribute('data-theme', this.theme);

    const savedAuth = localStorage.getItem('plr_is_auth');
    const savedUserId = localStorage.getItem('plr_user_id');

    if (savedAuth === 'true' && savedUserId) {
      if (savedUserId === 'u-admin') {
        const adminUser = (this.data.defaultUsers || []).find(u => u.id === 'u-admin' || (u.email && u.email.toLowerCase() === 'admin@gmail.com')) || {
          id: 'u-admin',
          name: 'Admin Instructor',
          email: 'admin@gmail.com',
          role: 'admin',
          gradeClass: 'Administrator',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80',
          preferredStyle: 'reading',
          interests: ['ds', 'cs', 'math'],
          enrolledCourseIds: [],
          completedResourceIds: [],
          bookmarkedResourceIds: [],
          videoProgress: {},
          certificates: [],
          dailyGoalMinutes: 60,
          todayStudiedMinutes: 0,
          streakDays: 1,
          recentActivity: []
        };
        adminUser.role = 'admin';
        adminUser.gradeClass = 'Administrator';
        this.currentUser = adminUser;
        this.isAuthenticated = true;
      } else {
        // Authenticated student session
        this.isAuthenticated = true;
        const cachedUser = (this.data.defaultUsers || []).find(u => u.id === savedUserId);
        this.currentUser = cachedUser ? { ...cachedUser } : {
          id: savedUserId,
          uid: savedUserId,
          role: 'student',
          interests: ['cs', 'ds'],
          enrolledCourseIds: [],
          completedResourceIds: [],
          bookmarkedResourceIds: [],
          videoProgress: {},
          certificates: []
        };
      }
    } else {
      this.currentUser = null;
      this.isAuthenticated = false;
    }

    if (this.currentUser && this.currentUser.role !== 'admin') {
      if (!Array.isArray(this.currentUser.interests)) {
        this.currentUser.interests = [];
      }
      const enrolledIds = [];
      const dbCourses = (this.data && this.data.courses) ? this.data.courses : [];
      if (this.currentUser.interests.length > 0) {
        dbCourses.forEach(c => {
          if (window.itemMatchesInterests && window.itemMatchesInterests(c, this.currentUser.interests)) {
            if (!enrolledIds.includes(c.id)) enrolledIds.push(c.id);
          }
        });
      }
      this.currentUser.enrolledCourseIds = enrolledIds;
      if (!this.currentUser.completedResourceIds) this.currentUser.completedResourceIds = [];
      if (!this.currentUser.bookmarkedResourceIds) this.currentUser.bookmarkedResourceIds = [];
      if (!this.currentUser.certificates) this.currentUser.certificates = [];
      if (!this.currentUser.careerGoal) this.currentUser.careerGoal = 'AI & Machine Learning Engineer';
      if (!this.currentUser.learningStyle) this.currentUser.learningStyle = this.currentUser.preferredStyle || 'visual';
      if (!this.currentUser.preferredStyle) this.currentUser.preferredStyle = this.currentUser.learningStyle || 'visual';
      if (!this.currentUser.skillLevel) this.currentUser.skillLevel = 'Intermediate';
      if (!this.currentUser.videoProgress) this.currentUser.videoProgress = {};
    }

    // Initialize Firestore dynamic sync
    if (window.FirebaseDB) {
      window.FirebaseDB.init();
      window.FirebaseDB.syncAppState(this);
    }

    this.setupAuthObserver();
    this.setupStudentListener();
    if (this.currentUser && this.currentUser.id) {
      this.setupRealtimeProfileListener(this.currentUser.id);
    }
  },

  setupAuthObserver: function() {
    if (this._authObserverAttached) return;
    this._authObserverAttached = true;
    if (window.auth && typeof window.auth.onAuthStateChanged === 'function') {
      window.auth.onAuthStateChanged(async (firebaseUser) => {
        // If registration is actively running in submitQuestionnaire, do NOT interfere with premature document creation
        if (this._isRegistering) {
          console.log("[Auth State Observer] Student registration in progress; deferring observer sync.");
          return;
        }

        if (firebaseUser) {
          const authUid = firebaseUser.uid;
          const authEmail = (firebaseUser.email || '').toLowerCase();
          const isActuallyAdmin = authEmail === 'admin@gmail.com' || authUid === 'u-admin';
          if (isActuallyAdmin) return;

          // If current user is already this user, avoid redundant refresh
          if (this.currentUser && this.currentUser.id === authUid && this.isAuthenticated) {
            return;
          }

          console.log(`[Auth State Observer] Student authenticated with Firebase Auth UID: ${authUid}`);
          let userDoc = null;
          if (window.FirebaseDB) {
            userDoc = await window.FirebaseDB.getUser(authUid);
            if (!userDoc) {
              console.log(`[Auth State Observer] User document for UID '${authUid}' not found. Automatically creating document in Firestore...`);
              userDoc = await window.FirebaseDB.ensureUserDocument(authUid, {
                email: authEmail,
                name: firebaseUser.displayName || (authEmail ? authEmail.split('@')[0] : 'Student'),
                avatar: firebaseUser.photoURL || undefined
              });
            }
          }

          if (userDoc) {
            this.currentUser = userDoc;
            this.isAuthenticated = true;
            try {
              localStorage.setItem('plr_is_auth', 'true');
              localStorage.setItem('plr_user_id', userDoc.id);
            } catch (_) {}
            if (window.FirebaseDB && typeof window.FirebaseDB.syncPersonalizedContent === 'function') {
              await window.FirebaseDB.syncPersonalizedContent(this);
            }
            this.setupRealtimeProfileListener(userDoc.id);
            this.notify();
          }
        } else {
          // Firebase Auth user signed out
          if (this.currentUser && !this.isAdmin(this.currentUser) && this.isAuthenticated) {
            console.log("[Auth State Observer] Auth state changed to unauthenticated. Clearing session.");
            this.currentUser = null;
            this.isAuthenticated = false;
            try {
              localStorage.setItem('plr_is_auth', 'false');
              localStorage.removeItem('plr_user_id');
            } catch (_) {}
            this.notify();
          }
        }
      });
    }
  },

  saveData: function() {
    try {
      localStorage.setItem('plr_app_data', JSON.stringify(this.data));
    } catch(e) {}
    if (window.FirebaseDB && this.currentUser) {
      window.FirebaseDB.saveUser(this.currentUser);
    }
    this.notify();
  },

  subscribe: function(listener) {
    this.listeners.push(listener);
  },

  notify: function() {
    this.listeners.forEach(fn => {
      try { fn(this); } catch(e) { console.error(e); }
    });
  },

  setTheme: function(themeName) {
    this.theme = themeName;
    try { localStorage.setItem('plr_theme', themeName); } catch(e) {}
    document.documentElement.setAttribute('data-theme', themeName);
    this.notify();
  },

  toggleTheme: function() {
    const nextTheme = this.theme === 'light' ? 'dark' : 'light';
    this.setTheme(nextTheme);
  },

  setupStudentListener: function() {
    if (this.realtimeUnsubscribe) {
      try { this.realtimeUnsubscribe(); } catch (_) {}
      this.realtimeUnsubscribe = null;
    }

    if (window.FirebaseDB) {
      this.isLoadingStudents = true;
      this.studentLoadError = null;

      this.realtimeUnsubscribe = window.FirebaseDB.listenToStudents(
        (students) => {
          this.isLoadingStudents = false;
          this.studentLoadError = null;

          if (!this.data) this.data = {};
          if (!this.data.defaultUsers) this.data.defaultUsers = [];

          // Retain admin account
          let admin = this.data.defaultUsers.find(u => u.id === 'u-admin' || (u.email && u.email.toLowerCase() === 'admin@gmail.com') || u.role === 'admin') || (window.INITIAL_DATA && window.INITIAL_DATA.defaultUsers ? window.INITIAL_DATA.defaultUsers.find(u => u.role === 'admin') : null);
          if (admin) {
            admin.role = 'admin';
            admin.gradeClass = 'Administrator';
          }

          // Rebuild defaultUsers with admin + dynamic Firestore students (excluding any admin duplicates)
          const validStudents = (students || []).filter(s => s && s.role !== 'admin' && s.id !== 'u-admin' && (s.email || '').toLowerCase() !== 'admin@gmail.com');
          this.data.defaultUsers = admin ? [admin, ...validStudents] : validStudents;
          this.data.students = validStudents;

          if (this.currentUser && this.currentUser.role !== 'admin') {
            const updatedProfile = validStudents.find(s => s.id === this.currentUser.id || s.uid === this.currentUser.id);
            if (updatedProfile) {
              const prevInterests = JSON.stringify(this.currentUser.interests || []);
              const newInterests = JSON.stringify(updatedProfile.interests || []);
              Object.assign(this.currentUser, updatedProfile);
              if (prevInterests !== newInterests) {
                if (window.FirebaseDB && typeof window.FirebaseDB.syncPersonalizedContent === 'function') {
                  window.FirebaseDB.syncPersonalizedContent(this);
                }
              }
            }
          }

          try {
            localStorage.setItem('plr_app_data', JSON.stringify(this.data));
          } catch (_) {}

          this.notify();
        },
        (error) => {
          console.warn("Notice: Real-time student listener fallback active:", error);
          this.isLoadingStudents = false;

          // Check if we already have valid registered students in memory or storage
          const existingStudents = (this.data && this.data.students && this.data.students.length > 0)
            ? this.data.students
            : ((this.data && this.data.defaultUsers) ? this.data.defaultUsers.filter(u => u && u.role !== 'admin' && u.id !== 'u-admin' && (u.email || '').toLowerCase() !== 'admin@gmail.com') : []);

          if (existingStudents.length > 0) {
            this.studentLoadError = null;
            this.data.students = existingStudents;
          } else {
            // Check localStorage plr_app_data and plr_firestore_mock
            let recovered = [];
            try {
              const rawData = localStorage.getItem('plr_app_data');
              if (rawData) {
                const parsed = JSON.parse(rawData);
                const candidates = parsed.students || parsed.defaultUsers || [];
                recovered = candidates.filter(u => u && u.role !== 'admin' && u.id !== 'u-admin' && (u.email || '').toLowerCase() !== 'admin@gmail.com');
              }
              if (recovered.length === 0) {
                const mockDB = JSON.parse(localStorage.getItem('plr_firestore_mock') || '{}');
                if (mockDB.users) {
                  recovered = Object.values(mockDB.users).filter(u => u && u.role !== 'admin' && u.id !== 'u-admin' && (u.email || '').toLowerCase() !== 'admin@gmail.com');
                }
              }
            } catch (_) {}

            if (recovered.length > 0) {
              this.studentLoadError = null;
              this.data.students = recovered;
              const admin = (this.data.defaultUsers || []).find(u => u.role === 'admin' || u.id === 'u-admin');
              this.data.defaultUsers = admin ? [admin, ...recovered] : recovered;
            } else {
              this.studentLoadError = "Unable to load student data. Please try again.";
            }
          }
          this.notify();
        }
      );
    } else {
      this.isLoadingStudents = false;
    }
  },

  setupRealtimeProfileListener: function(userId) {
    if (this._userProfileUnsubscribe) {
      try { this._userProfileUnsubscribe(); } catch (_) {}
      this._userProfileUnsubscribe = null;
    }
    if (!window.db || !userId) return;
    try {
      const userRef = window.db.collection('users').doc(userId);
      if (typeof userRef.onSnapshot === 'function') {
        this._userProfileUnsubscribe = userRef.onSnapshot(doc => {
          if (!doc) return;
          const data = typeof doc.data === 'function' ? doc.data() : doc;
          if (!data || !this.currentUser || (this.currentUser.id !== userId && this.currentUser.email !== data.email)) return;
          
          const prevInterests = JSON.stringify(this.currentUser.interests || []);
          const newInterests = JSON.stringify(data.interests || []);
          const prevGoal = this.currentUser.careerGoal;
          const prevSkill = this.currentUser.skillLevel;
          const prevStyle = this.currentUser.learningStyle || this.currentUser.preferredStyle;

          Object.assign(this.currentUser, data);
          if (data.preferredStyle && !this.currentUser.learningStyle) this.currentUser.learningStyle = data.preferredStyle;
          if (data.learningStyle && !this.currentUser.preferredStyle) this.currentUser.preferredStyle = data.learningStyle;

          if (prevInterests !== newInterests || prevGoal !== data.careerGoal || prevSkill !== data.skillLevel || prevStyle !== (data.learningStyle || data.preferredStyle)) {
            console.log("Real-time profile change detected via Firestore listener. Refreshing recommendations in-place...");
            if (window.FirebaseDB && typeof window.FirebaseDB.syncPersonalizedContent === 'function') {
              window.FirebaseDB.syncPersonalizedContent(this);
            }
            this.notify();
          }
        }, err => {
          console.warn("Real-time user profile listener error:", err);
        });
      }
    } catch (e) {
      console.warn("Could not attach real-time profile listener:", e);
    }
  },

  loginUser: async function(email, password = '') {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (cleanEmail === 'admin@gmail.com') {
      if (password && password !== 'Pass@123' && password !== 'admin' && password !== 'demo123') {
        alert('Invalid admin credentials. Please use Pass@123.');
        return false;
      }
      let user = (this.data.defaultUsers || []).find(u => (u.email && u.email.toLowerCase() === 'admin@gmail.com') || u.id === 'u-admin');
      if (!user) {
        user = {
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
          videoProgress: {},
          certificates: [],
          dailyGoalMinutes: 60,
          todayStudiedMinutes: 0,
          streakDays: 1,
          recentActivity: []
        };
        if (!this.data.defaultUsers) this.data.defaultUsers = [];
        this.data.defaultUsers.unshift(user);
      }
      user.role = 'admin';
      user.gradeClass = 'Administrator';
      this.currentUser = user;
      this.isAuthenticated = true;
      try {
        localStorage.setItem('plr_is_auth', 'true');
        localStorage.setItem('plr_user_id', user.id);
      } catch(e) {}
      this.closeModal();
      this.setView('admin');
      return true;
    }

    // STUDENT LOGIN:
    // 1. Immediately wipe any prior student's in-memory data, trackers, or listeners
    if (window.cleanupVideoModalTracker) {
      try { window.cleanupVideoModalTracker(); } catch(_) {}
    }
    if (this._userProfileUnsubscribe) {
      try { this._userProfileUnsubscribe(); } catch (_) {}
      this._userProfileUnsubscribe = null;
    }
    this.currentUser = null;
    this.isAuthenticated = false;

    let authUid = null;
    let authUser = null;

    // 2. Authenticate with Firebase Authentication
    if (window.auth && password) {
      try {
        console.log(`[Firebase Auth] Signing in with email: ${cleanEmail}...`);
        const cred = await window.auth.signInWithEmailAndPassword(cleanEmail, password);
        if (cred && cred.user) {
          authUser = cred.user;
          authUid = cred.user.uid;
          console.log(`[Firebase Auth Success] Signed in as UID: ${authUid}`);
        }
      } catch (authErr) {
        console.warn("[Firebase Auth SignIn Note]:", authErr.code || authErr.message);
        if (authErr.code === 'auth/wrong-password' || authErr.code === 'auth/invalid-credential') {
          alert("Invalid password. Please check your credentials.");
          return false;
        }
        if (authErr.code === 'auth/user-not-found') {
          alert("No registered student account found for " + cleanEmail + ". Please register to continue.");
          return false;
        }
      }
    }

    if (!authUid && window.auth && window.auth.currentUser && (window.auth.currentUser.email || '').toLowerCase() === cleanEmail) {
      authUser = window.auth.currentUser;
      authUid = window.auth.currentUser.uid;
    }

    let userDoc = null;
    // 3. Always read exclusively from the currently authenticated user's Firestore document
    if (authUid && window.FirebaseDB) {
      console.log(`[Firestore Read] Reading authenticated student document: users/${authUid}...`);
      try {
        userDoc = await window.FirebaseDB.getUser(authUid);
        if (userDoc) {
          console.log(`[Firestore Read Success: users/${authUid}] Loaded student document:`, userDoc.name || userDoc.email);
        }
      } catch (readErr) {
        console.error(`[Firestore Read Error: users/${authUid}]`, readErr);
      }
    }

    // 4. If a logged-in user's Firestore document does not exist, automatically create it with required default fields
    if (authUid && !userDoc && window.FirebaseDB) {
      console.log(`[Firestore Auto-Create] Logged-in user's Firestore document does not exist. Creating document for UID: users/${authUid}...`);
      try {
        userDoc = await window.FirebaseDB.ensureUserDocument(authUid, {
          email: cleanEmail,
          name: (authUser && authUser.displayName) ? authUser.displayName : cleanEmail.split('@')[0],
          avatar: (authUser && authUser.photoURL) ? authUser.photoURL : undefined
        });
        console.log(`[Firestore Auto-Create Success: users/${authUid}] Default student document created.`);
      } catch (createErr) {
        console.error(`[Firestore Auto-Create Error: users/${authUid}]`, createErr);
      }
    }

    // Secondary fallback for offline or mock environments without Firebase Auth
    if (!userDoc && window.FirebaseDB) {
      userDoc = await window.FirebaseDB.getUserByEmail(cleanEmail);
      if (userDoc && !authUid) {
        authUid = userDoc.uid || userDoc.id;
      }
    }

    if (!userDoc && !authUid) {
      alert("No registered student account found for " + cleanEmail + ". Please register to continue.");
      return false;
    }

    if (!userDoc && authUid) {
      userDoc = await window.FirebaseDB.ensureUserDocument(authUid, { email: cleanEmail });
    }

    // 5. Establish authenticated session strictly bound to this user document
    this.currentUser = userDoc;
    if (!this.currentUser.videoProgress) this.currentUser.videoProgress = {};
    if (!this.currentUser.completedResourceIds) this.currentUser.completedResourceIds = [];
    if (!this.currentUser.bookmarkedResourceIds) this.currentUser.bookmarkedResourceIds = [];
    if (!this.currentUser.certificates) this.currentUser.certificates = [];
    if (!this.currentUser.interests) this.currentUser.interests = ['cs', 'ds'];

    this.showAllCourses = false;
    this.activeSubjectFilter = 'all';
    this.searchQuery = '';
    this.isAuthenticated = true;

    try {
      localStorage.setItem('plr_is_auth', 'true');
      localStorage.setItem('plr_user_id', userDoc.id);
    } catch(e) {}

    // Update students list in state
    if (this.data && this.data.students) {
      const sIdx = this.data.students.findIndex(s => s.id === userDoc.id || s.uid === userDoc.id);
      if (sIdx >= 0) {
        this.data.students[sIdx] = userDoc;
      } else {
        this.data.students.push(userDoc);
      }
      this.studentLoadError = null;
    }

    this.saveData();

    if (window.FirebaseDB) {
      await window.FirebaseDB.syncAppState(this);
      await window.FirebaseDB.syncPersonalizedContent(this);
    }

    this.setupRealtimeProfileListener(userDoc.id);
    this.closeModal();
    this.setView('dashboard');
    return true;
  },

  logoutUser: function() {
    if (window.cleanupVideoModalTracker) {
      try { window.cleanupVideoModalTracker(); } catch(_) {}
    }
    if (window.auth) {
      try { window.auth.signOut(); } catch (_) {}
    }
    this.isAuthenticated = false;
    this.currentUser = null;
    this.activeModal = null;
    this.modalData = null;
    this.showAllCourses = false;
    this.activeSubjectFilter = 'all';
    this.searchQuery = '';
    try {
      localStorage.setItem('plr_is_auth', 'false');
      localStorage.removeItem('plr_user_id');
    } catch(e) {}
    this.setView('dashboard');
  },

  isAdmin: function(user) {
    const u = user || this.currentUser;
    if (!u) return false;
    if (u.role === 'admin') return true;
    if (u.id === 'u-admin') return true;
    if (u.email && u.email.toLowerCase() === 'admin@gmail.com') return true;
    if (u.gradeClass === 'Administrator') return true;
    if (u.name === 'Admin Instructor') return true;
    return false;
  },

  setUser: function(userId) {
    let user = (this.data.defaultUsers || []).find(u => u.id === userId);
    if (!user && userId === 'u-admin') {
      user = (this.data.defaultUsers || []).find(u => (u.email && u.email.toLowerCase() === 'admin@gmail.com') || u.role === 'admin');
    }
    if (user) {
      if (userId === 'u-admin' || (user.email && user.email.toLowerCase() === 'admin@gmail.com')) {
        user.role = 'admin';
        user.gradeClass = 'Administrator';
      }
      this.currentUser = user;
      this.isAuthenticated = true;
      try {
        localStorage.setItem('plr_is_auth', 'true');
        localStorage.setItem('plr_user_id', user.id);
      } catch(e) {}
      if (window.FirebaseDB) {
        window.FirebaseDB.syncAppState(this);
        if (!this.isAdmin(user)) {
          window.FirebaseDB.syncPersonalizedContent(this);
        }
      }
      if (this.isAdmin(user)) {
        this.setView('admin');
      } else {
        this.setView('dashboard');
      }
    }
  },

  setView: function(viewName, params = {}) {
    this.currentView = viewName;
    if (viewName === 'admin') {
      if (!this.currentUser || !this.isAdmin(this.currentUser)) {
        let admin = (this.data.defaultUsers || []).find(u => u.id === 'u-admin' || (u.email && u.email.toLowerCase() === 'admin@gmail.com') || u.role === 'admin');
        if (!admin) {
          admin = {
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
          };
          if (!this.data.defaultUsers) this.data.defaultUsers = [];
          this.data.defaultUsers.unshift(admin);
        }
        admin.role = 'admin';
        admin.gradeClass = 'Administrator';
        this.currentUser = admin;
        this.isAuthenticated = true;
      }
    }
    if (params.subject) this.activeSubjectFilter = params.subject;
    if (params.courseId) this.selectedCourseId = params.courseId;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.closeMobileSidebar) window.closeMobileSidebar();
    this.notify();
  },

  openModal: function(modalName, data = null) {
    if (modalName === 'quiz') {
      if (typeof window.resetQuizState === 'function') {
        window.resetQuizState();
      }
    }
    if (modalName === 'register') {
      if (window.cleanupVideoModalTracker) {
        try { window.cleanupVideoModalTracker(); } catch(_) {}
      }
    }
    this.activeModal = modalName;
    this.modalData = data;
    if (window.closeMobileSidebar) window.closeMobileSidebar();
    this.notify();
  },

  closeModal: function() {
    if (window.cleanupVideoModalTracker) {
      try { window.cleanupVideoModalTracker(); } catch(_) {}
    }
    this.activeModal = null;
    this.modalData = null;
    this.notify();
  },

  submitQuestionnaire: async function(formData) {
    if (window.cleanupVideoModalTracker) {
      try { window.cleanupVideoModalTracker(); } catch(_) {}
    }
    const isNewRegistration = !!(this.modalData && this.modalData.isNewRegistration);
    this._isRegistering = isNewRegistration;

    try {
      let registeredEmail = (this.modalData && this.modalData.email) 
        ? this.modalData.email.trim() 
        : ((this.currentUser && this.currentUser.email) ? this.currentUser.email : '');
      let studentName = (formData.name && formData.name.trim()) 
        ? formData.name.trim() 
        : ((this.modalData && this.modalData.name) ? this.modalData.name.trim() : (this.currentUser ? this.currentUser.name : 'Student'));

      // If new student registration, immediately wipe previous student state to eliminate cross-contamination
      if (isNewRegistration) {
        if (this._userProfileUnsubscribe) {
          try { this._userProfileUnsubscribe(); } catch (_) {}
          this._userProfileUnsubscribe = null;
        }
        this.currentUser = null;
        this.isAuthenticated = false;
      }

      let authUid = null;

      // 1. Connect with Firebase Authentication when registering new student
      if (isNewRegistration && window.auth && this.modalData && this.modalData.email && this.modalData.password) {
        try {
          console.log(`[Firebase Auth Registration] Registering student: ${this.modalData.email}...`);
          const userCredential = await window.auth.createUserWithEmailAndPassword(this.modalData.email, this.modalData.password);
          if (userCredential && userCredential.user) {
            authUid = userCredential.user.uid;
            registeredEmail = userCredential.user.email;
            console.log(`[Firebase Auth Registration Success] Obtained Auth UID: ${authUid}`);
            try {
              await userCredential.user.updateProfile({ displayName: studentName });
            } catch (_) {}
          }
        } catch (authErr) {
          console.warn("[Firebase Auth Registration Warning]:", authErr.code || authErr.message);
          if (authErr.code === 'auth/email-already-in-use') {
            try {
              const signCred = await window.auth.signInWithEmailAndPassword(this.modalData.email, this.modalData.password);
              if (signCred && signCred.user) {
                authUid = signCred.user.uid;
                registeredEmail = signCred.user.email;
                console.log(`[Firebase Auth SignIn Success] Obtained Auth UID: ${authUid}`);
              }
            } catch (signInErr) {
              console.warn("[Firebase Auth SignIn Fallback Error]:", signInErr);
            }
          }
        }
      }

      if (!authUid && window.auth && window.auth.currentUser && (window.auth.currentUser.email || '').toLowerCase() === (registeredEmail || '').toLowerCase()) {
        authUid = window.auth.currentUser.uid;
      }

      if (!authUid && isNewRegistration) {
        authUid = 'std_' + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
      }

      const userId = isNewRegistration ? authUid : ((this.currentUser && this.currentUser.id) ? this.currentUser.id : (authUid || 'std_student'));

      const selectedInterests = Array.isArray(formData.interests) ? formData.interests : [];
      const masterCourses = (this.data && Array.isArray(this.data._masterCourses) && this.data._masterCourses.length > 0)
        ? this.data._masterCourses
        : ((this.data && Array.isArray(this.data.courses)) ? this.data.courses : ((window.INITIAL_DATA && window.INITIAL_DATA.courses) || []));
      
      // Auto-enroll ONLY in courses matching newly selected interests
      let enrolledIds = [];
      masterCourses.forEach(c => {
        if (window.itemMatchesInterests && window.itemMatchesInterests(c, selectedInterests)) {
          if (!enrolledIds.includes(c.id)) enrolledIds.push(c.id);
        }
      });

      const isActuallyAdmin = registeredEmail.toLowerCase() === 'admin@gmail.com' || userId === 'u-admin' || this.isAdmin(this.currentUser);
      const userRole = isActuallyAdmin ? 'admin' : 'student';

      const userProfile = {
        id: userId,
        uid: userId,
        name: studentName,
        email: registeredEmail,
        role: userRole,
        avatar: (this.currentUser && this.currentUser.avatar && !isNewRegistration) ? this.currentUser.avatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        gradeClass: isActuallyAdmin ? 'Administrator' : (formData.gradeClass || 'Grade 11'),
        skillLevel: formData.skillLevel || 'Intermediate',
        learningStyle: formData.learningStyle || formData.preferredStyle || 'visual',
        preferredStyle: formData.preferredStyle || formData.learningStyle || 'visual',
        careerGoal: formData.careerGoal || 'AI & Machine Learning Engineer',
        interests: selectedInterests,
        enrolledCourseIds: enrolledIds,
        completedResourceIds: (this.currentUser && !isNewRegistration && Array.isArray(this.currentUser.completedResourceIds)) ? [...this.currentUser.completedResourceIds] : [],
        bookmarkedResourceIds: (this.currentUser && !isNewRegistration && Array.isArray(this.currentUser.bookmarkedResourceIds)) ? [...this.currentUser.bookmarkedResourceIds] : [],
        videoProgress: (this.currentUser && !isNewRegistration && this.currentUser.videoProgress) ? { ...this.currentUser.videoProgress } : {},
        certificates: (this.currentUser && !isNewRegistration && Array.isArray(this.currentUser.certificates)) ? [...this.currentUser.certificates] : [],
        quizScores: (this.currentUser && !isNewRegistration && Array.isArray(this.currentUser.quizScores)) ? [...this.currentUser.quizScores] : [],
        dailyGoalMinutes: (this.currentUser && !isNewRegistration && this.currentUser.dailyGoalMinutes) ? this.currentUser.dailyGoalMinutes : 30,
        todayStudiedMinutes: (this.currentUser && !isNewRegistration && this.currentUser.todayStudiedMinutes) ? this.currentUser.todayStudiedMinutes : 0,
        streakDays: (this.currentUser && !isNewRegistration && this.currentUser.streakDays) ? this.currentUser.streakDays : 1,
        createdAt: (this.currentUser && !isNewRegistration && this.currentUser.createdAt) ? this.currentUser.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        recentActivity: (this.currentUser && this.currentUser.recentActivity && !isNewRegistration)
          ? [{ title: 'Updated Questionnaire & Learning Preferences', time: 'Just now', icon: 'edit-3' }, ...this.currentUser.recentActivity]
          : [{ title: 'Registered & Completed Onboarding Questionnaire', time: 'Just now', icon: 'check-circle' }]
      };

      this.currentUser = userProfile;
      if (!this.data.defaultUsers) this.data.defaultUsers = [];
      const existingIdx = this.data.defaultUsers.findIndex(u => u.id === userId);
      if (existingIdx >= 0) {
        this.data.defaultUsers[existingIdx] = userProfile;
      } else {
        this.data.defaultUsers.push(userProfile);
      }

      if (userRole !== 'admin') {
        if (!this.data.students) this.data.students = [];
        const stuIdx = this.data.students.findIndex(u => u.id === userId);
        if (stuIdx >= 0) {
          this.data.students[stuIdx] = userProfile;
        } else {
          this.data.students.push(userProfile);
        }
        this.studentLoadError = null;
      }

      this.isAuthenticated = true;
      try {
        localStorage.setItem('plr_is_auth', 'true');
        localStorage.setItem('plr_user_id', userProfile.id);
      } catch(e) {}

      this.saveData();

      // Write complete registration document to Firestore
      console.log(`[Firestore Write: users/${userId}] Saving complete registration document with selected interests:`, selectedInterests);
      if (window.FirebaseDB) {
        await window.FirebaseDB.saveUser(userProfile);
        await window.FirebaseDB.syncPersonalizedContent(this);
      }

      this.setupRealtimeProfileListener(userId);
      this.showAllCourses = false;
      this.activeSubjectFilter = 'all';

      this.closeModal();

      if (isNewRegistration) {
        this.setView('dashboard');
      } else {
        this.notify();
      }
    } finally {
      this._isRegistering = false;
    }
  },

  getUserCertificates: function() {
    if (!this.currentUser) return [];
    if (!Array.isArray(this.currentUser.certificates)) {
      this.currentUser.certificates = [];
    }
    return this.currentUser.certificates;
  },

  getOrIssueCertificate: function(courseId) {
    if (!this.currentUser || !this.currentUser.id) return null;
    if (!Array.isArray(this.currentUser.certificates)) {
      this.currentUser.certificates = [];
    }
    let cert = this.currentUser.certificates.find(c => c.courseId === courseId);
    if (!cert) {
      const courses = (this.data && this.data.courses) ? this.data.courses : [];
      const course = courses.find(c => c.id === courseId) || { id: courseId, title: 'Course Masterclass' };
      const certId = `LAI-2026-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      cert = {
        id: certId,
        courseId: courseId,
        courseTitle: course.title,
        recipientName: this.currentUser.name || 'Student',
        issueDate: new Date().toISOString(),
        verified: true
      };
      this.currentUser.certificates.push(cert);
      this.saveData();
      if (window.FirebaseDB) {
        window.FirebaseDB.saveUser(this.currentUser);
      }
    }
    return cert;
  },

  // Helper getters for dynamic personalization across all pages
  getPersonalizedCourses: function() {
    const master = (this.data && Array.isArray(this.data._masterCourses) && this.data._masterCourses.length > 0)
      ? this.data._masterCourses
      : ((this.data && Array.isArray(this.data.courses)) ? this.data.courses : ((window.INITIAL_DATA && window.INITIAL_DATA.courses) || []));
    
    // Admins or unauthenticated visitors: show full catalog with active filters/search
    if (!this.currentUser || this.isAdmin(this.currentUser)) {
      if (this.searchQuery && this.searchQuery.trim() !== '') {
        return master.filter(c => window.courseMatchesSearch ? window.courseMatchesSearch(c, this.searchQuery) : true);
      }
      if (this.activeSubjectFilter && this.activeSubjectFilter !== 'all') {
        const normFilter = window.normalizeCategoryKey ? window.normalizeCategoryKey(this.activeSubjectFilter) : this.activeSubjectFilter;
        return master.filter(c => c.subjectId === normFilter || (window.normalizeCategoryKey && window.normalizeCategoryKey(c.subjectId) === normFilter) || (window.normalizeCategoryKey && window.normalizeCategoryKey(c.category) === normFilter));
      }
      return master;
    }

    // Authenticated students: strictly show ONLY courses matching selected questionnaire interests
    const interests = Array.isArray(this.currentUser.interests) ? this.currentUser.interests : [];
    if (interests.length === 0) {
      return [];
    }

    let filtered = master.filter(c => window.itemMatchesInterests ? window.itemMatchesInterests(c, interests) : false);

    if (this.activeSubjectFilter && this.activeSubjectFilter !== 'all') {
      const normFilter = window.normalizeCategoryKey ? window.normalizeCategoryKey(this.activeSubjectFilter) : this.activeSubjectFilter;
      filtered = filtered.filter(c => c.subjectId === normFilter || (window.normalizeCategoryKey && window.normalizeCategoryKey(c.subjectId) === normFilter) || (window.normalizeCategoryKey && window.normalizeCategoryKey(c.category) === normFilter));
    }

    if (this.searchQuery && this.searchQuery.trim() !== '') {
      filtered = filtered.filter(c => window.courseMatchesSearch ? window.courseMatchesSearch(c, this.searchQuery) : true);
    }

    return filtered;
  },

  getPersonalizedResources: function(format = 'all') {
    const master = (this.data && Array.isArray(this.data._masterResources) && this.data._masterResources.length > 0)
      ? this.data._masterResources
      : ((this.data && Array.isArray(this.data.resources)) ? this.data.resources : ((window.INITIAL_DATA && window.INITIAL_DATA.resources) || []));
    let resources = master;
    if (!this.currentUser || this.isAdmin(this.currentUser)) {
      if (this.activeSubjectFilter && this.activeSubjectFilter !== 'all') {
        const normFilter = window.normalizeCategoryKey ? window.normalizeCategoryKey(this.activeSubjectFilter) : this.activeSubjectFilter;
        resources = resources.filter(r => r.subjectId === normFilter || (window.normalizeCategoryKey && window.normalizeCategoryKey(r.subjectId) === normFilter) || (window.normalizeCategoryKey && window.normalizeCategoryKey(r.category) === normFilter));
      }
      if (this.searchQuery && this.searchQuery.trim() !== '') {
        resources = resources.filter(r => window.resourceMatchesSearch ? window.resourceMatchesSearch(r, this.searchQuery) : true);
      }
    } else {
      const interests = Array.isArray(this.currentUser.interests) ? this.currentUser.interests : [];
      if (interests.length === 0) {
        resources = [];
      } else {
        resources = master.filter(r => window.itemMatchesInterests ? window.itemMatchesInterests(r, interests) : false);
        if (this.activeSubjectFilter && this.activeSubjectFilter !== 'all') {
          const normFilter = window.normalizeCategoryKey ? window.normalizeCategoryKey(this.activeSubjectFilter) : this.activeSubjectFilter;
          resources = resources.filter(r => r.subjectId === normFilter || (window.normalizeCategoryKey && window.normalizeCategoryKey(r.subjectId) === normFilter) || (window.normalizeCategoryKey && window.normalizeCategoryKey(r.category) === normFilter));
        }
        if (this.searchQuery && this.searchQuery.trim() !== '') {
          resources = resources.filter(r => window.resourceMatchesSearch ? window.resourceMatchesSearch(r, this.searchQuery) : true);
        }
      }
    }
    if (format !== 'all') {
      resources = resources.filter(r => r.format === format);
    }
    return resources;
  },

  getPersonalizedQuizzes: function() {
    let quizzes = (this.data && Array.isArray(this.data.quizzes) && this.data.quizzes.length > 0)
      ? this.data.quizzes
      : (window.ALL_SUBJECT_QUIZZES || (window.INITIAL_DATA && window.INITIAL_DATA.quizzes) || []);
    if (!this.currentUser || this.isAdmin(this.currentUser)) {
      const allQuizzes = (window.ALL_SUBJECT_QUIZZES || (window.INITIAL_DATA && window.INITIAL_DATA.quizzes) || []);
      const pool = (allQuizzes.length > 0 && quizzes.length < allQuizzes.length) ? allQuizzes : quizzes;
      if (this.searchQuery && this.searchQuery.trim() !== '') {
        return pool.filter(q => (q.title && q.title.toLowerCase().includes(this.searchQuery.toLowerCase())));
      }
      if (this.activeSubjectFilter && this.activeSubjectFilter !== 'all') {
        const normFilter = window.normalizeCategoryKey ? window.normalizeCategoryKey(this.activeSubjectFilter) : this.activeSubjectFilter;
        return pool.filter(q => q.subjectId === normFilter || (window.normalizeCategoryKey && window.normalizeCategoryKey(q.subjectId) === normFilter));
      }
      return pool;
    }
    const interests = Array.isArray(this.currentUser.interests) ? this.currentUser.interests : [];
    if (interests.length === 0) return [];
    let filtered = quizzes.filter(q => window.itemMatchesInterests ? window.itemMatchesInterests(q, interests) : false);
    if (this.activeSubjectFilter && this.activeSubjectFilter !== 'all') {
      const normFilter = window.normalizeCategoryKey ? window.normalizeCategoryKey(this.activeSubjectFilter) : this.activeSubjectFilter;
      filtered = filtered.filter(q => q.subjectId === normFilter || (window.normalizeCategoryKey && window.normalizeCategoryKey(q.subjectId) === normFilter));
    }
    if (this.searchQuery && this.searchQuery.trim() !== '') {
      filtered = filtered.filter(q => (q.title && q.title.toLowerCase().includes(this.searchQuery.toLowerCase())));
    }
    return filtered;
  },

  getPersonalizedSubjects: function() {
    const subjects = (this.data && Array.isArray(this.data.subjects) && this.data.subjects.length > 0)
      ? this.data.subjects
      : ((window.INITIAL_DATA && window.INITIAL_DATA.subjects) || []);
    return subjects;
  },

  getPersonalizedRoadmaps: function() {
    const roadmaps = (this.data && this.data.roadmaps) ? this.data.roadmaps : ((window.INITIAL_DATA && window.INITIAL_DATA.roadmaps) || {});
    if (!this.currentUser || this.isAdmin(this.currentUser)) {
      return roadmaps;
    }
    const interests = this.currentUser.interests || [];
    if (interests.length === 0) return {};
    const filtered = {};
    Object.entries(roadmaps).forEach(([key, rm]) => {
      if (window.itemMatchesInterests({ ...rm, subjectId: rm.subjectId || key }, interests)) {
        filtered[key] = rm;
      }
    });
    return filtered;
  },

  getPersonalizedAssignments: function() {
    const master = (this.data && Array.isArray(this.data._masterAssignments) && this.data._masterAssignments.length > 0)
      ? this.data._masterAssignments
      : ((this.data && Array.isArray(this.data.assignments)) ? this.data.assignments : ((window.INITIAL_DATA && window.INITIAL_DATA.assignments) || []));
    if (!this.currentUser || this.isAdmin(this.currentUser)) {
      return master;
    }
    const interests = this.currentUser.interests || [];
    if (interests.length === 0) return [];
    const matchedCourses = this.getPersonalizedCourses();
    const matchedCourseIds = matchedCourses.map(c => c.id);
    return master.filter(a => {
      if (a.courseId && matchedCourseIds.includes(a.courseId)) return true;
      return window.itemMatchesInterests(a, interests);
    });
  },

  enrollInCourse: function(courseId) {
    if (!this.currentUser) return;
    if (!this.currentUser.enrolledCourseIds) {
      this.currentUser.enrolledCourseIds = [];
    }
    if (!this.currentUser.enrolledCourseIds.includes(courseId)) {
      this.currentUser.enrolledCourseIds.push(courseId);
      if (!this.currentUser.recentActivity) this.currentUser.recentActivity = [];
      const course = (this.data.courses || []).find(c => c.id === courseId);
      this.currentUser.recentActivity.unshift({
        title: `Enrolled in Course: ${course ? course.title : 'Course'}`,
        time: 'Just now',
        icon: 'graduation-cap'
      });
      this.saveData();
    }
    this.setView('course-hub', { courseId: courseId });
  },

  toggleBookmark: function(resourceId) {
    if (!this.currentUser) return;
    if (!this.currentUser.bookmarkedResourceIds) {
      this.currentUser.bookmarkedResourceIds = [];
    }
    const idx = this.currentUser.bookmarkedResourceIds.indexOf(resourceId);
    if (idx >= 0) {
      this.currentUser.bookmarkedResourceIds.splice(idx, 1);
    } else {
      this.currentUser.bookmarkedResourceIds.push(resourceId);
    }
    this.saveData();
  },

  toggleCompleteResource: function(resourceId) {
    if (!this.currentUser) return;
    if (!this.currentUser.completedResourceIds) {
      this.currentUser.completedResourceIds = [];
    }
    const idx = this.currentUser.completedResourceIds.indexOf(resourceId);
    if (idx < 0) {
      this.currentUser.completedResourceIds.push(resourceId);
      this.currentUser.todayStudiedMinutes = (this.currentUser.todayStudiedMinutes || 0) + 15;
      
      const res = (this.data.resources || []).find(r => r.id === resourceId);
      if (!this.currentUser.recentActivity) this.currentUser.recentActivity = [];
      this.currentUser.recentActivity.unshift({
        title: `Completed Study Material: ${res ? res.title : 'Lesson'}`,
        time: 'Just now',
        icon: 'check-circle'
      });
    }
    this.saveData();
  },

  getVideoProgress: function(key, targetUserId = null) {
    const user = targetUserId 
      ? ((this.data && this.data.defaultUsers) ? this.data.defaultUsers.find(u => u.id === targetUserId) : null)
      : this.currentUser;
    if (!user || !user.id || !key) return null;
    const userId = user.id;

    let item = null;

    if (user.videoProgress) {
      if (user.videoProgress[key]) {
        item = user.videoProgress[key];
      } else {
        for (const k in user.videoProgress) {
          const p = user.videoProgress[k];
          if (p && (p.courseId === key || p.resourceId === key)) {
            item = p;
            break;
          }
        }
      }
    }

    if (!item) {
      try {
        const cached = JSON.parse(localStorage.getItem('plr_user_progress_' + userId) || '{}');
        if (cached[key]) {
          item = cached[key];
        } else {
          for (const k in cached) {
            const p = cached[k];
            if (p && (p.courseId === key || p.resourceId === key)) {
              item = p;
              break;
            }
          }
        }
        if (item && user.videoProgress) {
          user.videoProgress[key] = item;
        }
      } catch (_) {}
    }

    if (item) {
      // Validate that this record strictly belongs to the requested user ID
      if (item.userId && item.userId !== userId) {
        return null;
      }
      return item;
    }
    return null;
  },

  saveVideoProgress: function(courseId, resourceId, currentTime, duration, percentage, videoTitle, options = {}) {
    if (!this.currentUser || !this.currentUser.id) return null;
    const userId = this.currentUser.id;
    if (!this.currentUser.videoProgress) this.currentUser.videoProgress = {};

    const rawCurrentTime = Math.max(0, Math.floor(currentTime || 0));
    const rawDuration = Math.max(1, Math.floor(duration || 900));
    // Calculate actual watch percentage dynamically strictly from playback time & duration
    const calculatedPercent = Math.min(100, Math.max(0, Math.round((rawCurrentTime / rawDuration) * 100)));

    const courses = (this.data && this.data.courses) ? this.data.courses : [];
    const resources = (this.data && this.data.resources) ? this.data.resources : [];
    let resolvedCourse = courses.find(c => c.id === courseId);
    let resolvedResource = resources.find(r => r.id === resourceId);

    // If course not found directly by courseId, attempt to locate course containing this material
    if (!resolvedCourse && resourceId) {
      for (const c of courses) {
        if (c.categories) {
          for (const t in c.categories) {
            if (c.categories[t] && c.categories[t].materials && c.categories[t].materials.some(m => m.id === resourceId)) {
              resolvedCourse = c;
              break;
            }
          }
        }
        if (resolvedCourse) break;
      }
    }
    if (!resolvedCourse && resolvedResource && resolvedResource.subjectId) {
      resolvedCourse = courses.find(c => c.subjectId === resolvedResource.subjectId);
    }

    const finalCourseId = resolvedCourse ? resolvedCourse.id : (courseId || 'course-default');
    const finalCourseTitle = resolvedCourse ? resolvedCourse.title : 'Course Masterclass';
    const finalVideoTitle = videoTitle || (resolvedResource ? resolvedResource.title : 'Core Video Lecture');
    const finalResourceId = resourceId || (resolvedResource ? resolvedResource.id : null);

    const formattedTime = (window.formatSeconds)
      ? `${window.formatSeconds(rawCurrentTime)} / ${window.formatSeconds(rawDuration)}`
      : `${Math.floor(rawCurrentTime / 60)}:${(rawCurrentTime % 60).toString().padStart(2, '0')}`;

    const isCompleted = calculatedPercent >= 95;
    const lastWatched = new Date().toISOString();

    const progressEntry = {
      userId: userId,
      courseId: finalCourseId,
      courseTitle: finalCourseTitle,
      resourceId: finalResourceId,
      videoTitle: finalVideoTitle,
      currentTime: rawCurrentTime,
      duration: rawDuration,
      percentage: calculatedPercent,
      formattedTime: formattedTime,
      lastWatched: lastWatched,
      completed: isCompleted
    };

    // Stored separately for this authenticated user by course ID and video/resource ID
    this.currentUser.videoProgress[finalCourseId] = progressEntry;
    if (finalResourceId) {
      this.currentUser.videoProgress[finalResourceId] = progressEntry;
    }

    // Also persist in user-scoped storage key
    try {
      const userStorageKey = 'plr_user_progress_' + userId;
      let userProgMap = JSON.parse(localStorage.getItem(userStorageKey) || '{}');
      userProgMap[finalCourseId] = progressEntry;
      if (finalResourceId) userProgMap[finalResourceId] = progressEntry;
      localStorage.setItem(userStorageKey, JSON.stringify(userProgMap));
    } catch (_) {}

    // Auto-enroll student into this course if not already enrolled
    if (!this.currentUser.enrolledCourseIds) this.currentUser.enrolledCourseIds = [];
    if (!this.currentUser.enrolledCourseIds.includes(finalCourseId)) {
      this.currentUser.enrolledCourseIds.push(finalCourseId);
    }

    // If watched >= 95%, also mark resource as completed for this user
    if (isCompleted && finalResourceId) {
      if (!this.currentUser.completedResourceIds) this.currentUser.completedResourceIds = [];
      if (!this.currentUser.completedResourceIds.includes(finalResourceId)) {
        this.currentUser.completedResourceIds.push(finalResourceId);
      }
    }

    // Keep user in defaultUsers and students array synced
    if (this.data && this.data.defaultUsers) {
      const uIdx = this.data.defaultUsers.findIndex(u => u.id === userId);
      if (uIdx >= 0) {
        this.data.defaultUsers[uIdx].videoProgress = { ...this.currentUser.videoProgress };
        this.data.defaultUsers[uIdx].enrolledCourseIds = [...this.currentUser.enrolledCourseIds];
        this.data.defaultUsers[uIdx].completedResourceIds = [...(this.currentUser.completedResourceIds || [])];
      }
    }
    if (this.data && this.data.students) {
      const sIdx = this.data.students.findIndex(s => s.id === userId);
      if (sIdx >= 0) {
        this.data.students[sIdx].videoProgress = { ...this.currentUser.videoProgress };
        this.data.students[sIdx].enrolledCourseIds = [...this.currentUser.enrolledCourseIds];
        this.data.students[sIdx].completedResourceIds = [...(this.currentUser.completedResourceIds || [])];
      }
    }

    // Persist progress to local storage cache safely without triggering full app re-render
    try {
      localStorage.setItem('plr_app_data', JSON.stringify(this.data));
    } catch(e) {}

    // Synchronize to Firestore remote database only when requested (prevents API call spamming)
    if (options && options.syncRemote && window.FirebaseDB && this.currentUser) {
      window.FirebaseDB.saveUser(this.currentUser);
    }

    // Only notify listeners if explicitly requested (prevents unmounting active video player)
    if (options && options.notify) {
      this.notify();
    }

    return progressEntry;
  },

  getResumeCourses: function() {
    if (!this.currentUser || !this.currentUser.id) return [];
    const allCourses = (this.data && Array.isArray(this.data._masterCourses) && this.data._masterCourses.length > 0)
      ? this.data._masterCourses
      : ((this.data && Array.isArray(this.data.courses)) ? this.data.courses : ((window.INITIAL_DATA && window.INITIAL_DATA.courses) || []));
    const allResources = (this.data && Array.isArray(this.data._masterResources) && this.data._masterResources.length > 0)
      ? this.data._masterResources
      : ((this.data && Array.isArray(this.data.resources)) ? this.data.resources : ((window.INITIAL_DATA && window.INITIAL_DATA.resources) || []));

    const user = this.currentUser;
    const userId = user.id;
    const enrolledIds = user.enrolledCourseIds || [];
    const videoProgressMap = user.videoProgress || {};

    const courseMap = new Map();

    // 1. Add all courses that have explicit video progress for THIS authenticated user
    Object.keys(videoProgressMap).forEach(key => {
      const prog = videoProgressMap[key];
      if (prog && prog.courseId && !courseMap.has(prog.courseId)) {
        // Enforce user isolation: progress must belong to this user
        if (prog.userId && prog.userId !== userId) return;
        if (user.role !== 'admin' && enrolledIds.length > 0 && !enrolledIds.includes(prog.courseId)) return;

        const c = allCourses.find(item => item.id === prog.courseId);
        if (c) {
          // Verify that prog.resourceId actually matches this course's subject!
          let validResource = allResources.find(r => r.id === prog.resourceId);
          if (validResource && validResource.subjectId !== c.subjectId) {
            validResource = allResources.find(r => r.subjectId === c.subjectId && r.format === 'video');
            prog.resourceId = validResource ? validResource.id : null;
            prog.videoTitle = validResource ? validResource.title : c.title;
          }
          const duration = Math.max(1, Math.floor(prog.duration || (validResource && window.parseDurationToSeconds ? window.parseDurationToSeconds(validResource.duration) : 900)));
          const currentTime = Math.max(0, Math.floor(prog.currentTime || 0));
          // Dynamically calculate percentage strictly based on video playback time
          const calculatedPct = Math.min(100, Math.max(0, Math.round((currentTime / duration) * 100)));
          const remainingSec = Math.max(0, duration - currentTime);
          courseMap.set(prog.courseId, {
            ...c,
            activeVideoId: prog.resourceId || (validResource ? validResource.id : null),
            videoTitle: prog.videoTitle || (validResource ? validResource.title : 'Active Video Lesson'),
            percentage: calculatedPct,
            currentTime: currentTime,
            duration: duration,
            formattedTime: window.formatSeconds ? `${window.formatSeconds(currentTime)} / ${window.formatSeconds(duration)}` : `${Math.floor(currentTime / 60)}:${(currentTime % 60).toString().padStart(2, '0')}`,
            formattedCurrentTime: window.formatSeconds ? window.formatSeconds(currentTime) : `${Math.floor(currentTime / 60)}m`,
            remainingTime: window.formatSeconds ? window.formatSeconds(remainingSec) + ' remaining' : `${Math.floor(remainingSec / 60)}m remaining`,
            lastWatched: prog.lastWatched || null,
            completed: calculatedPct >= 95
          });
        }
      }
    });

    // 2. Next, add enrolled courses that might not have a progress record yet (0% watched)
    enrolledIds.forEach(id => {
      if (!courseMap.has(id)) {
        const c = allCourses.find(item => item.id === id);
        if (c) {
          // Look for first material to use as default video
          let firstMatTitle = 'Introduction Video Lecture';
          let firstMatId = null;
          const tierObj = (!Array.isArray(c.categories) && typeof c.categories === 'object' && c.categories) ? c.categories : (c.tiers || {});
          for (const tier of ['Beginner', 'Intermediate', 'Advanced']) {
            if (tierObj[tier] && tierObj[tier].materials && tierObj[tier].materials.length > 0) {
              firstMatTitle = tierObj[tier].materials[0].title;
              firstMatId = tierObj[tier].materials[0].id;
              break;
            }
          }
          if (!firstMatId) {
            const matched = allResources.find(r => r.subjectId === c.subjectId && r.format === 'video');
            if (matched) {
              firstMatTitle = matched.title;
              firstMatId = matched.id;
            }
          }

          courseMap.set(id, {
            ...c,
            activeVideoId: firstMatId,
            videoTitle: firstMatTitle,
            percentage: 0,
            currentTime: 0,
            duration: 900,
            formattedTime: '00:00 / 15:00',
            formattedCurrentTime: '0 mins',
            remainingTime: '15 mins remaining',
            lastWatched: null,
            completed: false
          });
        }
      }
    });

    const list = Array.from(courseMap.values());

    // Sort: In-progress courses (0% < percentage < 100%) first, then by lastWatched desc, then not started, then completed
    list.sort((a, b) => {
      const aInProgress = a.percentage > 0 && a.percentage < 100 ? 1 : 0;
      const bInProgress = b.percentage > 0 && b.percentage < 100 ? 1 : 0;
      if (aInProgress !== bInProgress) return bInProgress - aInProgress;
      if (a.lastWatched && b.lastWatched) return new Date(b.lastWatched) - new Date(a.lastWatched);
      if (a.lastWatched) return -1;
      if (b.lastWatched) return 1;
      return 0;
    });

    return list;
  },

  saveQuizResult: function(quizId, scorePercentage) {
    if (!this.currentUser) return;
    const quiz = (this.data.quizzes || []).find(q => q.id === quizId) || { subjectId: 'ds', title: 'Quiz' };
    
    if (window.AIEngine) {
      this.currentUser = window.AIEngine.recalibrateSkill(this.currentUser, quiz, scorePercentage);
    }

    if (!this.currentUser.quizScores) this.currentUser.quizScores = [];
    this.currentUser.quizScores.push({
      quizId: quizId,
      subjectId: quiz.subjectId,
      score: scorePercentage,
      date: new Date().toISOString()
    });

    let interestText = 'High Interest & Great Comprehension (95%)';
    if (scorePercentage < 60) {
      interestText = 'Needs Fundamental Practice (60% Interest)';
    } else if (scorePercentage < 85) {
      interestText = 'Solid Progress & Growing Interest (80%)';
    }

    this.openModal('quiz-result-interest', {
      quizId: quizId,
      score: scorePercentage,
      interestText: interestText,
      subjectName: quiz.title
    });

    this.saveData();
  },

  updateUserProfile: function(profileData) {
    if (!this.currentUser) return;
    Object.assign(this.currentUser, profileData);
    this.saveData();
  },

  addResource: function(resourceObj) {
    resourceObj.id = resourceObj.id || 'res-' + Date.now();
    resourceObj.rating = 5.0;
    resourceObj.reviewsCount = 1;
    if (!this.data.resources) this.data.resources = [];
    this.data.resources.unshift(resourceObj);
    this.saveData();
    if (window.FirebaseDB) {
      window.FirebaseDB.saveResource(resourceObj);
    }
  },

  deleteResource: function(resourceId) {
    if (!this.data.resources) return;
    this.data.resources = this.data.resources.filter(r => r.id !== resourceId);
    this.saveData();
    if (window.FirebaseDB && window.FirebaseDB.isInitialized) {
      window.FirebaseDB.db.collection('resources').doc(resourceId).delete()
        .then(() => console.log("Resource deleted from Firestore"))
        .catch(e => console.error("Error deleting resource from Firestore:", e));
    }
  },

  addSubject: function(subjectObj) {
    if (!this.data.subjects) this.data.subjects = [];
    this.data.subjects.push(subjectObj);
    this.saveData();
    if (window.FirebaseDB) {
      window.FirebaseDB.saveSubject(subjectObj);
    }
  },

  deleteSubject: function(subjectId) {
    if (!this.data.subjects) return;
    this.data.subjects = this.data.subjects.filter(s => s.id !== subjectId);
    this.saveData();
    if (window.FirebaseDB && window.FirebaseDB.isInitialized) {
      window.FirebaseDB.db.collection('subjects').doc(subjectId).delete()
        .then(() => console.log("Subject deleted from Firestore"))
        .catch(e => console.error("Error deleting subject from Firestore:", e));
    }
  },

  addCourse: function(courseObj) {
    courseObj.id = courseObj.id || ('course-' + Date.now());
    courseObj.rating = 5.0;
    courseObj.enrolledCount = 0;
    courseObj.matchScore = 95;
    
    // Ensure tiers object exists for study hub
    if (!courseObj.categories || Array.isArray(courseObj.categories)) {
      const catList = Array.isArray(courseObj.categories) ? courseObj.categories : [courseObj.category || window.getSubjectCategoryName(courseObj.subjectId)];
      courseObj.categoryList = catList;
      courseObj.categories = {
        Beginner: { title: 'Beginner Category (5 Questions Quiz)', materials: [], quizId: `quiz-${courseObj.subjectId || 'ds'}-beginner` },
        Intermediate: { title: 'Intermediate Category (10 Questions Quiz)', materials: [], quizId: `quiz-${courseObj.subjectId || 'ds'}-intermediate` },
        Advanced: { title: 'Advanced Category (15 Questions Quiz)', materials: [], quizId: `quiz-${courseObj.subjectId || 'ds'}-advanced` }
      };
    }
    
    if (window.autoCategorizeItem) {
      window.autoCategorizeItem(courseObj, 'course');
    }

    if (!this.data.courses) this.data.courses = [];
    this.data.courses.unshift(courseObj);
    if (!this.data._masterCourses) this.data._masterCourses = [];
    this.data._masterCourses.unshift(courseObj);
    this.saveData();
    if (window.FirebaseDB) {
      window.FirebaseDB.saveCourse(courseObj);
    }
  },

  deleteCourse: function(courseId) {
    if (!this.data.courses) return;
    this.data.courses = this.data.courses.filter(c => c.id !== courseId);
    if (this.data._masterCourses) {
      this.data._masterCourses = this.data._masterCourses.filter(c => c.id !== courseId);
    }
    this.saveData();
    if (window.FirebaseDB && window.FirebaseDB.deleteCourse) {
      window.FirebaseDB.deleteCourse(courseId);
    } else if (window.FirebaseDB && window.FirebaseDB.db) {
      try {
        window.FirebaseDB.db.collection('courses').doc(courseId).delete()
          .then(() => console.log("Course deleted from Firestore"))
          .catch(e => console.error("Error deleting course from Firestore:", e));
      } catch (e) {
        console.error("Firestore course delete error:", e);
      }
    }
  },

  addVideoToCourse: function(courseId, tier, title, description, contentUrl, duration, extraCategories = [], extraTags = []) {
    const course = (this.data.courses || []).find(c => c.id === courseId);
    if (!course) return;
    const resId = 'res-vid-' + Date.now();
    const courseCats = window.getItemCategories ? window.getItemCategories(course) : [course.category || course.subjectId];
    const combinedCats = Array.from(new Set([...courseCats, ...(Array.isArray(extraCategories) ? extraCategories : [extraCategories])]));
    const combinedTags = Array.from(new Set([...(course.tags || []), ...combinedCats, ...(Array.isArray(extraTags) ? extraTags : [extraTags])]));

    const resource = {
      id: resId,
      title: title,
      format: 'video',
      duration: duration || '15 mins',
      contentUrl: contentUrl,
      summary: description,
      description: description,
      subjectId: course.subjectId,
      category: course.category || combinedCats[0] || window.getSubjectCategoryName(course.subjectId),
      categories: combinedCats,
      tags: combinedTags,
      level: tier,
      vark: ['visual', 'auditory'],
      rating: 5.0,
      reviewsCount: 1,
      suitableClass: course.suitableClass || 'Grade 11-12'
    };

    if (window.autoCategorizeItem) {
      window.autoCategorizeItem(resource, 'resource');
    }

    if (!this.data.resources) this.data.resources = [];
    this.data.resources.unshift(resource);
    if (!this.data._masterResources) this.data._masterResources = [];
    this.data._masterResources.unshift(resource);

    if (!course.categories || Array.isArray(course.categories)) {
      course.categories = {
        Beginner: { title: 'Beginner Category (5 Questions Quiz)', materials: [], quizId: `quiz-${course.subjectId || 'ds'}-beginner` },
        Intermediate: { title: 'Intermediate Category (10 Questions Quiz)', materials: [], quizId: `quiz-${course.subjectId || 'ds'}-intermediate` },
        Advanced: { title: 'Advanced Category (15 Questions Quiz)', materials: [], quizId: `quiz-${course.subjectId || 'ds'}-advanced` }
      };
    }
    if (!course.categories[tier]) {
      course.categories[tier] = {
        title: `${tier} Category`,
        materials: [],
        quizId: `quiz-${course.subjectId}-${tier.toLowerCase()}`
      };
    }
    if (!course.categories[tier].materials) {
      course.categories[tier].materials = [];
    }
    course.categories[tier].materials.push({
      id: resId,
      title: '🎥 ' + title,
      format: 'video',
      duration: duration || '15 mins'
    });

    this.saveData();
    if (window.FirebaseDB) {
      window.FirebaseDB.saveResource(resource);
      window.FirebaseDB.saveCourse(course);
    }
  },

  addAssignment: function(courseId, title, description, points, questions, extraCategories = [], extraTags = []) {
    const course = (this.data.courses || []).find(c => c.id === courseId) || {};
    const courseCats = window.getItemCategories ? window.getItemCategories(course) : (course.category ? [course.category] : []);
    const combinedCats = Array.from(new Set([...courseCats, ...(Array.isArray(extraCategories) ? extraCategories : [extraCategories])]));
    const combinedTags = Array.from(new Set([...(course.tags || []), ...combinedCats, ...(Array.isArray(extraTags) ? extraTags : [extraTags])]));

    const assignment = {
      id: 'assign-' + Date.now(),
      courseId: courseId,
      subjectId: course.subjectId || 'ds',
      category: course.category || combinedCats[0] || window.getSubjectCategoryName(course.subjectId),
      categories: combinedCats.length > 0 ? combinedCats : [course.category || 'General'],
      tags: combinedTags.length > 0 ? combinedTags : [course.category || 'General'],
      title: title,
      description: description,
      points: Number(points) || 100,
      questions: Array.isArray(questions) ? questions : [],
      createdAt: new Date().toISOString()
    };
    if (window.autoCategorizeItem) {
      window.autoCategorizeItem(assignment, 'assignment');
    }
    if (!this.data.assignments) this.data.assignments = [];
    this.data.assignments.unshift(assignment);
    if (!this.data._masterAssignments) this.data._masterAssignments = [];
    this.data._masterAssignments.unshift(assignment);
    this.saveData();
    if (window.FirebaseDB) {
      window.FirebaseDB.saveAssignment(assignment);
    }
    return assignment;
  },

  updateAssignment: function(assignmentId, updatedData) {
    if (!this.data.assignments) return null;
    const idx = this.data.assignments.findIndex(a => a.id === assignmentId);
    if (idx >= 0) {
      this.data.assignments[idx] = {
        ...this.data.assignments[idx],
        ...updatedData,
        updatedAt: new Date().toISOString()
      };
      this.saveData();
      if (window.FirebaseDB) {
        window.FirebaseDB.saveAssignment(this.data.assignments[idx]);
      }
      return this.data.assignments[idx];
    }
    return null;
  },

  deleteAssignment: function(assignmentId) {
    if (!this.data.assignments) return;
    this.data.assignments = this.data.assignments.filter(a => a.id !== assignmentId);
    this.saveData();
    if (window.FirebaseDB && window.FirebaseDB.db) {
      try {
        window.FirebaseDB.db.collection('assignments').doc(assignmentId).delete()
          .then(() => console.log("Assignment deleted from Firestore"))
          .catch(e => console.error("Error deleting assignment from Firestore:", e));
      } catch (e) {
        console.error("Firestore delete error:", e);
      }
    }
  },

  addQuiz: function(quizObj) {
    if (!quizObj.id) quizObj.id = 'quiz-' + Date.now();
    if (!this.data.quizzes) this.data.quizzes = [];
    this.data.quizzes.unshift(quizObj);
    this.saveData();
    if (window.FirebaseDB && window.FirebaseDB.saveQuiz) {
      window.FirebaseDB.saveQuiz(quizObj);
    }
    return quizObj;
  },

  updateQuiz: function(quizId, updatedData) {
    if (!this.data.quizzes) return null;
    const idx = this.data.quizzes.findIndex(q => q.id === quizId);
    if (idx >= 0) {
      this.data.quizzes[idx] = {
        ...this.data.quizzes[idx],
        ...updatedData,
        updatedAt: new Date().toISOString()
      };
      this.saveData();
      if (window.FirebaseDB && window.FirebaseDB.saveQuiz) {
        window.FirebaseDB.saveQuiz(this.data.quizzes[idx]);
      }
      return this.data.quizzes[idx];
    }
    return null;
  },

  deleteQuiz: function(quizId) {
    if (!this.data.quizzes) return;
    this.data.quizzes = this.data.quizzes.filter(q => q.id !== quizId);
    this.saveData();
    if (window.FirebaseDB && window.FirebaseDB.deleteQuiz) {
      window.FirebaseDB.deleteQuiz(quizId);
    } else if (window.FirebaseDB && window.FirebaseDB.db) {
      try {
        window.FirebaseDB.db.collection('quizzes').doc(quizId).delete()
          .then(() => console.log("Quiz deleted from Firestore"))
          .catch(e => console.error("Error deleting quiz from Firestore:", e));
      } catch (e) {
        console.error("Firestore quiz delete error:", e);
      }
    }
  },

  submitAssignment: function(assignmentId, courseId, submissionText, submissionLink, mcqData) {
    if (!this.currentUser) return;
    const submission = {
      userId: this.currentUser.id,
      userName: this.currentUser.name,
      assignmentId: assignmentId,
      courseId: courseId,
      submissionText: submissionText || '',
      submissionLink: submissionLink || '',
      submittedAt: new Date().toISOString(),
      status: mcqData ? 'graded' : 'submitted',
      ...(mcqData || {})
    };
    if (!this.data.submissions) this.data.submissions = [];
    
    const existingIndex = this.data.submissions.findIndex(s => s.assignmentId === assignmentId && s.userId === this.currentUser.id);
    if (existingIndex >= 0) {
      this.data.submissions[existingIndex] = submission;
    } else {
      this.data.submissions.push(submission);
    }

    if (!this.currentUser.recentActivity) this.currentUser.recentActivity = [];
    const assign = (this.data.assignments || []).find(a => a.id === assignmentId);
    this.currentUser.recentActivity.unshift({
      title: mcqData ? `Completed MCQ: ${assign ? assign.title : 'Assignment'} (${mcqData.percentage}%)` : `Submitted Assignment: ${assign ? assign.title : 'Course Work'}`,
      time: 'Just now',
      icon: 'file-text'
    });

    this.saveData();
    if (window.FirebaseDB) {
      window.FirebaseDB.saveSubmission(submission);
      window.FirebaseDB.saveUser(this.currentUser);
    }
    return submission;
  }
};
