// Initial Seed Data for Personalized Learning Recommendation System

window.INITIAL_DATA = {
  landingFeatures: [
    { id: 'f-1', icon: 'cpu', title: 'AI-Powered Recommendations', desc: 'Algorithms analyze your class level, skill level, learning style, and quiz scores to recommend tailored learning resources.' },
    { id: 'f-2', icon: 'eye', title: 'VARK Learning Style Assessment', desc: 'Discover whether you learn best visually, auditorily, through reading, or by hands-on kinesthetic practice.' },
    { id: 'f-3', icon: 'git-branch', title: 'Video Lessons for Every Roadmap Step', desc: 'Every milestone step in all 6 subject pathways features dedicated embedded video lectures.' },
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

  // FULL COURSES WITH DEDICATED VIDEOS FOR ALL 3 CATEGORIES FOR EVERY SUBJECT
  courses: [
    {
      id: 'course-ai-101',
      title: 'Artificial Intelligence & Neural Networks Masterclass',
      subjectId: 'ds',
      rating: 4.98,
      enrolledCount: 3420,
      matchScore: 98,
      suitableClass: 'Undergraduate',
      bannerImage: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80',
      description: 'Master Artificial Intelligence with video lectures across Beginner (5 Qs), Intermediate (10 Qs), and Advanced (15 Qs).',
      instructor: 'Dr. Alan Turing & AI Lab Team',
      prerequisites: 'Basic Math & Logic',
      duration: '10 Weeks',
      categories: {
        Beginner: { title: 'Beginner Category (5 Questions Quiz)', materials: [{ id: 'res-ai-road-1', title: '🎥 Python & Data Wrangling for AI Video Lecture', format: 'video', duration: '25 mins' }], quizId: 'quiz-ds-beginner' },
        Intermediate: { title: 'Intermediate Category (10 Questions Quiz)', materials: [{ id: 'res-ai-road-2', title: '🎥 Perceptrons & Backpropagation Math Video', format: 'video', duration: '35 mins' }], quizId: 'quiz-ds-intermediate' },
        Advanced: { title: 'Advanced Category (15 Questions Quiz)', materials: [{ id: 'res-ai-road-4', title: '🎥 Transformers & LLM Architectures Masterclass Video', format: 'video', duration: '40 mins' }], quizId: 'quiz-ds-advanced' }
      }
    },
    {
      id: 'course-cs-101',
      title: 'Computer Science & Software Engineering Pathway',
      subjectId: 'cs',
      rating: 4.92,
      enrolledCount: 5120,
      matchScore: 95,
      suitableClass: 'Grade 10-12',
      bannerImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
      description: 'Full Computer Science video curriculum across Beginner (5 Qs), Intermediate (10 Qs), and Advanced (15 Qs).',
      instructor: 'Prof. Guido van Rossum',
      prerequisites: 'Basic Computer Literacy',
      duration: '12 Weeks',
      categories: {
        Beginner: { title: 'Beginner Category (5 Questions Quiz)', materials: [{ id: 'res-cs-road-1', title: '🎥 Programming Fundamentals & Control Flow Video', format: 'video', duration: '30 mins' }], quizId: 'quiz-cs-beginner' },
        Intermediate: { title: 'Intermediate Category (10 Questions Quiz)', materials: [{ id: 'res-cs-road-2', title: '🎥 Data Structures & Big-O Complexity Video', format: 'video', duration: '45 mins' }], quizId: 'quiz-cs-intermediate' },
        Advanced: { title: 'Advanced Category (15 Questions Quiz)', materials: [{ id: 'res-cs-road-4', title: '🎥 System Design & Microservices Video Lecture', format: 'video', duration: '50 mins' }], quizId: 'quiz-cs-advanced' }
      }
    },
    {
      id: 'course-math-101',
      title: 'Mathematics & Applied Analytics Mastery',
      subjectId: 'math',
      rating: 4.88,
      enrolledCount: 2890,
      matchScore: 91,
      suitableClass: 'Grade 11-12',
      bannerImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
      description: 'Comprehensive math video course across Beginner (5 Qs), Intermediate (10 Qs), and Advanced (15 Qs).',
      instructor: 'Dr. Katherine Johnson',
      prerequisites: 'High School Algebra',
      duration: '8 Weeks',
      categories: {
        Beginner: { title: 'Beginner Category (5 Questions Quiz)', materials: [{ id: 'res-math-road-1', title: '🎥 Discrete Mathematics & Logic Gates Video', format: 'video', duration: '20 mins' }], quizId: 'quiz-math-beginner' },
        Intermediate: { title: 'Intermediate Category (10 Questions Quiz)', materials: [{ id: 'res-math-road-2', title: '🎥 Differential & Integral Calculus Video', format: 'video', duration: '35 mins' }], quizId: 'quiz-math-intermediate' },
        Advanced: { title: 'Advanced Category (15 Questions Quiz)', materials: [{ id: 'res-math-road-3', title: '🎥 Linear Algebra & Vector Spaces Video', format: 'video', duration: '45 mins' }], quizId: 'quiz-math-advanced' }
      }
    },
    {
      id: 'course-physics-101',
      title: 'Physics, Mechanics & Quantum Systems Pathway',
      subjectId: 'physics',
      rating: 4.91,
      enrolledCount: 2980,
      matchScore: 94,
      suitableClass: 'Grade 11-12',
      bannerImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
      description: 'Comprehensive physics video course across Beginner (5 Qs), Intermediate (10 Qs), and Advanced (15 Qs).',
      instructor: 'Dr. Richard Feynman',
      prerequisites: 'High School Physics Basics',
      duration: '10 Weeks',
      categories: {
        Beginner: { title: 'Beginner Category (5 Questions Quiz)', materials: [{ id: 'res-phys-road-1', title: '🎥 Newtonian Kinematics & Motion Laws Video', format: 'video', duration: '20 mins' }], quizId: 'quiz-physics-beginner' },
        Intermediate: { title: 'Intermediate Category (10 Questions Quiz)', materials: [{ id: 'res-phys-road-2', title: '🎥 Electromagnetism & Circuit Laws Video', format: 'video', duration: '30 mins' }], quizId: 'quiz-physics-intermediate' },
        Advanced: { title: 'Advanced Category (15 Questions Quiz)', materials: [{ id: 'res-phys-road-3', title: '🎥 Quantum Mechanics & Wave Function Video', format: 'video', duration: '40 mins' }], quizId: 'quiz-physics-advanced' }
      }
    },
    {
      id: 'course-bio-101',
      title: 'Genetics, Cell Biology & Biotechnology Masterclass',
      subjectId: 'bio',
      rating: 4.89,
      enrolledCount: 2410,
      matchScore: 92,
      suitableClass: 'Grade 10-12',
      bannerImage: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=800&q=80',
      description: 'Biological sciences video curriculum across Beginner (5 Qs), Intermediate (10 Qs), and Advanced (15 Qs).',
      instructor: 'Dr. Jennifer Doudna',
      prerequisites: 'High School Biology',
      duration: '8 Weeks',
      categories: {
        Beginner: { title: 'Beginner Category (5 Questions Quiz)', materials: [{ id: 'res-bio-road-1', title: '🎥 Cell Structure & Organelles 3D Visual Video', format: 'video', duration: '20 mins' }], quizId: 'quiz-bio-beginner' },
        Intermediate: { title: 'Intermediate Category (10 Questions Quiz)', materials: [{ id: 'res-bio-road-2', title: '🎥 DNA Replication & Transcription Video', format: 'video', duration: '30 mins' }], quizId: 'quiz-bio-intermediate' },
        Advanced: { title: 'Advanced Category (15 Questions Quiz)', materials: [{ id: 'res-bio-road-3', title: '🎥 CRISPR-Cas9 Gene Editing Video Lecture', format: 'video', duration: '45 mins' }], quizId: 'quiz-bio-advanced' }
      }
    },
    {
      id: 'course-chem-101',
      title: 'Chemistry, Organic Synthesis & Molecular Science',
      subjectId: 'chem',
      rating: 4.87,
      enrolledCount: 2150,
      matchScore: 90,
      suitableClass: 'Grade 11-12',
      bannerImage: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80',
      description: 'Chemical bonding and organic reactions video course across Beginner (5 Qs), Intermediate (10 Qs), and Advanced (15 Qs).',
      instructor: 'Dr. Marie Curie Lab',
      prerequisites: 'High School Chemistry',
      duration: '9 Weeks',
      categories: {
        Beginner: { title: 'Beginner Category (5 Questions Quiz)', materials: [{ id: 'res-chem-road-1', title: '🎥 Atomic Models & Periodic Trends Video', format: 'video', duration: '25 mins' }], quizId: 'quiz-chem-beginner' },
        Intermediate: { title: 'Intermediate Category (10 Questions Quiz)', materials: [{ id: 'res-chem-road-2', title: '🎥 Organic Reaction Mechanisms Video', format: 'video', duration: '35 mins' }], quizId: 'quiz-chem-intermediate' },
        Advanced: { title: 'Advanced Category (15 Questions Quiz)', materials: [{ id: 'res-chem-road-3', title: '🎥 Chemical Thermodynamics & Kinetics Video', format: 'video', duration: '40 mins' }], quizId: 'quiz-chem-advanced' }
      }
    }
  ],

  // ALL DEDICATED UNIQUE VIDEO RESOURCES FOR ROADMAP & COURSES
  resources: [
    // AI VIDEOS
    {
      id: 'res-ai-road-1',
      title: 'Python for AI & Data Wrangling Video Masterclass',
      subjectId: 'ds',
      format: 'video',
      vark: ['visual', 'kinesthetic'],
      level: 'Beginner',
      suitableClass: 'Grade 10-12',
      duration: '35 mins',
      rating: 4.95,
      tags: ['python', 'numpy', 'ai'],
      contentUrl: 'https://www.youtube.com/embed/r-uOLxNrNk8',
      description: 'Step 1 Video: NumPy arrays, matrix reshaping, Pandas dataframes, and data preprocessing for AI pipelines.',
      summary: 'Master array vectorization and data manipulation for artificial intelligence models.'
    },
    {
      id: 'res-ai-road-2',
      title: 'Artificial Intelligence Core: Perceptrons & Backpropagation Math Video',
      subjectId: 'ds',
      format: 'video',
      vark: ['visual', 'auditory'],
      level: 'Intermediate',
      suitableClass: 'Undergraduate',
      duration: '45 mins',
      rating: 4.98,
      tags: ['ai', 'backprop', 'perceptrons'],
      contentUrl: 'https://www.youtube.com/embed/aircAruvnKk',
      description: 'Step 2 Video: Mathematical breakdown of forward pass, loss functions, activation gradients, and backpropagation.',
      summary: 'Understand gradient descent and weight optimization step-by-step.'
    },
    {
      id: 'res-ai-road-3',
      title: 'Deep Learning & Convolutional Neural Networks (CNNs) Video',
      subjectId: 'ds',
      format: 'video',
      vark: ['visual', 'kinesthetic'],
      level: 'Advanced',
      suitableClass: 'Undergraduate',
      duration: '50 mins',
      rating: 4.96,
      tags: ['cnn', 'deep-learning', 'computer-vision'],
      contentUrl: 'https://www.youtube.com/embed/YRhxdVk_sIs',
      description: 'Step 3 Video: Convolutional filters, max pooling layers, feature maps, and image classification architectures.',
      summary: 'Build and inspect spatial feature extractors in deep convolutional networks.'
    },
    {
      id: 'res-ai-road-4',
      title: 'Transformers & LLM Architectures Video (Attention Mechanism)',
      subjectId: 'ds',
      format: 'video',
      vark: ['visual', 'reading'],
      level: 'Advanced',
      suitableClass: 'Undergraduate',
      duration: '55 mins',
      rating: 4.99,
      tags: ['transformers', 'attention', 'llm'],
      contentUrl: 'https://www.youtube.com/embed/wjZofJX0v4M',
      description: 'Step 4 Video: Self-Attention mechanism, Scaled Dot-Product Attention, BERT, GPT, and modern Large Language Models.',
      summary: 'Deep architectural walkthrough of Transformer encoders and decoders.'
    },

    // COMPUTER SCIENCE VIDEOS
    {
      id: 'res-cs-road-1',
      title: 'Programming Fundamentals & Control Flow in Python Video',
      subjectId: 'cs',
      format: 'video',
      vark: ['visual', 'auditory'],
      level: 'Beginner',
      suitableClass: 'Grade 9-10',
      tags: ['programming', 'python', 'control-flow'],
      contentUrl: 'https://www.youtube.com/embed/kqtD5dpn9C8',
      duration: '30 mins',
      rating: 4.91,
      description: 'Step 1 Video: Core programming logic, variables, conditional branch statements, loops, and function syntax.',
      summary: 'Master foundational computer programming with interactive code execution.'
    },
    {
      id: 'res-cs-road-2',
      title: 'Data Structures, Big-O Complexity & Sorting Algorithms Video',
      subjectId: 'cs',
      format: 'video',
      vark: ['visual', 'kinesthetic'],
      level: 'Intermediate',
      suitableClass: 'Grade 11-12',
      duration: '40 mins',
      rating: 4.94,
      tags: ['dsa', 'big-o', 'data-structures'],
      contentUrl: 'https://www.youtube.com/embed/RBSGKlAvoiM',
      description: 'Step 2 Video: Arrays, Linked Lists, Stacks, Queues, Binary Trees, Big-O time complexity analysis, and QuickSort.',
      summary: 'Analyze algorithm performance and learn memory-efficient data structures.'
    },
    {
      id: 'res-cs-road-3',
      title: 'Full Stack Web Architecture & REST API Engineering Video',
      subjectId: 'cs',
      format: 'video',
      vark: ['visual', 'reading'],
      level: 'Advanced',
      suitableClass: 'Undergraduate',
      duration: '45 mins',
      rating: 4.92,
      tags: ['web-dev', 'rest-api', 'fullstack'],
      contentUrl: 'https://www.youtube.com/embed/zQnBQ4tB3ZA',
      description: 'Step 3 Video: HTTP client-server architecture, RESTful API endpoint design, JSON serialization, and database queries.',
      summary: 'Design scalable backends and modern web frontends.'
    },
    {
      id: 'res-cs-road-4',
      title: 'System Design, DevOps & Distributed Microservices Video',
      subjectId: 'cs',
      format: 'video',
      vark: ['visual', 'auditory'],
      level: 'Advanced',
      suitableClass: 'Undergraduate',
      duration: '50 mins',
      rating: 4.97,
      tags: ['system-design', 'microservices', 'devops'],
      contentUrl: 'https://www.youtube.com/embed/F2FmTdLtb_4',
      description: 'Step 4 Video: Distributed system architecture, load balancing, horizontal scaling, caching strategies, and Docker containers.',
      summary: 'Architect high-concurrency systems handling millions of daily requests.'
    },

    // MATHEMATICS VIDEOS
    {
      id: 'res-math-road-1',
      title: 'Discrete Mathematics, Logic Gates & Set Theory Video',
      subjectId: 'math',
      format: 'video',
      vark: ['reading', 'visual'],
      level: 'Beginner',
      suitableClass: 'Grade 10-12',
      duration: '30 mins',
      rating: 4.88,
      tags: ['math', 'discrete-math', 'logic'],
      contentUrl: 'https://www.youtube.com/embed/tyDKR4FG3Yw',
      description: 'Step 1 Video: Propositional logic truth tables, boolean algebra, set theory operations, and mathematical proofs.',
      summary: 'Build mathematical rigorous thinking for computer algorithms.'
    },
    {
      id: 'res-math-road-2',
      title: 'Differential & Integral Calculus Visually Explained Video',
      subjectId: 'math',
      format: 'video',
      vark: ['visual', 'auditory'],
      level: 'Intermediate',
      suitableClass: 'Grade 11-12',
      duration: '40 mins',
      rating: 4.95,
      tags: ['calculus', 'derivatives', 'integrals'],
      contentUrl: 'https://www.youtube.com/embed/WUvTyaaNkzM',
      description: 'Step 2 Video: Limits, rates of change, power rule derivatives, anti-derivatives, and definite integrals.',
      summary: 'Intuitive geometric understanding of continuous rates of change.'
    },
    {
      id: 'res-math-road-3',
      title: 'Linear Algebra Essence: Vectors, Matrices & Transformations Video',
      subjectId: 'math',
      format: 'video',
      vark: ['visual', 'kinesthetic'],
      level: 'Advanced',
      suitableClass: 'Undergraduate',
      duration: '45 mins',
      rating: 4.99,
      tags: ['linear-algebra', 'vectors', 'matrices'],
      contentUrl: 'https://www.youtube.com/embed/fNk_zzaMoSs',
      description: 'Step 3 Video: Vector spaces, linear transformations, matrix multiplication, determinants, and eigenvalues.',
      summary: 'Visual linear algebra foundation essential for machine learning geometry.'
    },
    {
      id: 'res-math-road-4',
      title: 'Probability Distributions & Bayesian Decision Statistics Video',
      subjectId: 'math',
      format: 'video',
      vark: ['visual', 'reading'],
      level: 'Advanced',
      suitableClass: 'Undergraduate',
      duration: '45 mins',
      rating: 4.93,
      tags: ['probability', 'bayes', 'statistics'],
      contentUrl: 'https://www.youtube.com/embed/HZGCoVF3YvM',
      description: 'Step 4 Video: Random variables, Gaussian normal distributions, conditional probability, and Bayes Theorem inference.',
      summary: 'Master statistical inference and probabilistic modeling.'
    },

    // PHYSICS VIDEOS
    {
      id: 'res-phys-road-1',
      title: 'Classical Mechanics: Kinematics & Newton Laws Video',
      subjectId: 'physics',
      format: 'video',
      vark: ['visual', 'auditory'],
      level: 'Beginner',
      suitableClass: 'Grade 9-10',
      duration: '25 mins',
      rating: 4.91,
      tags: ['physics', 'mechanics', 'newton'],
      contentUrl: 'https://www.youtube.com/embed/ZM8ECpBuQYE',
      description: 'Step 1 Video: Displacement, velocity, constant acceleration equations, forces, and Newton three motion laws.',
      summary: 'Explore mechanical motion with live physical trajectory simulations.'
    },
    {
      id: 'res-phys-road-2',
      title: 'Electromagnetism, Circuit Laws & Maxwell Equations Video',
      subjectId: 'physics',
      format: 'video',
      vark: ['visual', 'kinesthetic'],
      level: 'Intermediate',
      suitableClass: 'Grade 11-12',
      duration: '35 mins',
      rating: 4.94,
      tags: ['physics', 'circuits', 'electromagnetism'],
      contentUrl: 'https://www.youtube.com/embed/hFAOXdXZ5TM',
      description: 'Step 2 Video: Coulomb electric force, magnetic fields, Ohm Law, circuit currents, and Maxwell field equations.',
      summary: 'Master electrical potential and magnetic field propagation.'
    },
    {
      id: 'res-phys-road-3',
      title: 'Quantum Mechanics, Wave Function & Double Slit Video',
      subjectId: 'physics',
      format: 'video',
      vark: ['visual', 'reading'],
      level: 'Advanced',
      suitableClass: 'Undergraduate',
      duration: '45 mins',
      rating: 4.98,
      tags: ['physics', 'quantum', 'schrodinger'],
      contentUrl: 'https://www.youtube.com/embed/p9pPjASnnxw',
      description: 'Step 3 Video: Wave-particle duality, double-slit interference, Planck energy quantization, and Schrödinger wave equation.',
      summary: 'Deep dive into quantum mechanical wave packet collapse.'
    },

    // BIOLOGY VIDEOS
    {
      id: 'res-bio-road-1',
      title: 'Cellular Biology, Organelles & ATP Energy Video',
      subjectId: 'bio',
      format: 'video',
      vark: ['visual', 'auditory'],
      level: 'Beginner',
      suitableClass: 'Grade 9-10',
      duration: '25 mins',
      rating: 4.89,
      tags: ['biology', 'cells', 'mitochondria'],
      contentUrl: 'https://www.youtube.com/embed/URUJD5NEXC8',
      description: 'Step 1 Video: Eukaryotic cell membrane structure, mitochondria ATP synthesis, nucleus, and ribosomes.',
      summary: '3D animation tour through microscopic cellular organelles.'
    },
    {
      id: 'res-bio-road-2',
      title: 'DNA Replication, Transcription & Translation Video',
      subjectId: 'bio',
      format: 'video',
      vark: ['visual', 'reading'],
      level: 'Intermediate',
      suitableClass: 'Grade 11-12',
      duration: '35 mins',
      rating: 4.93,
      tags: ['biology', 'dna', 'transcription'],
      contentUrl: 'https://www.youtube.com/embed/gG7uCskUOrA',
      description: 'Step 2 Video: Double-helix unzipping by helicase, RNA polymerase transcription, mRNA processing, and ribosome translation.',
      summary: 'Step-by-step molecular biology of central dogma.'
    },
    {
      id: 'res-bio-road-3',
      title: 'CRISPR-Cas9 Gene Editing & Genomic Biotech Video',
      subjectId: 'bio',
      format: 'video',
      vark: ['visual', 'kinesthetic'],
      level: 'Advanced',
      suitableClass: 'Undergraduate',
      duration: '45 mins',
      rating: 4.97,
      tags: ['biology', 'crispr', 'gene-editing'],
      contentUrl: 'https://www.youtube.com/embed/6tw_JVz_IEc',
      description: 'Step 3 Video: Targeted genomic cuts using Cas9 endonuclease, single guide RNA (sgRNA) design, and therapeutic gene therapy.',
      summary: 'Discover revolutionary gene editing technologies in modern biotechnology.'
    },

    // CHEMISTRY VIDEOS
    {
      id: 'res-chem-road-1',
      title: 'Atomic Models, Electron Shells & Periodic Trends Video',
      subjectId: 'chem',
      format: 'video',
      vark: ['visual', 'reading'],
      level: 'Beginner',
      suitableClass: 'Grade 9-10',
      duration: '25 mins',
      rating: 4.88,
      tags: ['chemistry', 'atomic-structure', 'periodic-table'],
      contentUrl: 'https://www.youtube.com/embed/Gy9HR65DpYQ',
      description: 'Step 1 Video: Bohr atomic radius, electron orbital filling, electronegativity trends, and ionic vs covalent bonding.',
      summary: 'Explore periodic table trends and atomic structures.'
    },
    {
      id: 'res-chem-road-2',
      title: 'Organic Functional Groups & Reaction Mechanisms Video',
      subjectId: 'chem',
      format: 'video',
      vark: ['visual', 'kinesthetic'],
      level: 'Intermediate',
      suitableClass: 'Grade 11-12',
      duration: '35 mins',
      rating: 4.92,
      tags: ['chemistry', 'organic', 'sn2-reaction'],
      contentUrl: 'https://www.youtube.com/embed/B_ketdzJtY8',
      description: 'Step 2 Video: Alcohols, aldehydes, carboxylic acids, SN1 vs SN2 nucleophilic substitution, and arrow-pushing mechanisms.',
      summary: 'Master organic chemistry synthesis and reaction steps.'
    },
    {
      id: 'res-chem-road-3',
      title: 'Chemical Thermodynamics, Enthalpy & Reaction Kinetics Video',
      subjectId: 'chem',
      format: 'video',
      vark: ['visual', 'auditory'],
      level: 'Advanced',
      suitableClass: 'Undergraduate',
      duration: '40 mins',
      rating: 4.95,
      tags: ['chemistry', 'kinetics', 'thermodynamics'],
      contentUrl: 'https://www.youtube.com/embed/7qOFtL3VEBc',
      description: 'Step 3 Video: Reaction rate laws, activation energy, Arrhenius equation, Hess Law, and Gibbs Free Energy spontaneity.',
      summary: 'Analyze chemical thermodynamics and reaction rate equations.'
    }
  ],

  // SUBJECT LEARNING ROADMAPS WITH ALL VIDEO LINKS
  roadmaps: {
    ds: {
      subjectId: 'ds',
      title: 'Artificial Intelligence & Deep Learning Pathway',
      nodes: [
        { id: 'ds-node-1', title: '1. Python for AI & Data Wrangling', status: 'completed', desc: 'NumPy arrays, Pandas & Matrix operations', icon: 'file-text', resourceId: 'res-ai-road-1' },
        { id: 'ds-node-2', title: '2. Artificial Intelligence Core', status: 'in-progress', desc: 'Perceptrons, Gradient Descent & Backpropagation', icon: 'cpu', resourceId: 'res-ai-road-2' },
        { id: 'ds-node-3', title: '3. Deep Learning & CNNs', status: 'locked', desc: 'Convolutional neural nets & Computer Vision', icon: 'eye', resourceId: 'res-ai-road-3' },
        { id: 'ds-node-4', title: '4. Transformers & LLM Architectures', status: 'locked', desc: 'Attention mechanism, BERT, GPT & NLP Models', icon: 'sparkles', resourceId: 'res-ai-road-4' }
      ]
    },
    cs: {
      subjectId: 'cs',
      title: 'Computer Science & Software Engineering Pathway',
      nodes: [
        { id: 'cs-node-1', title: '1. Programming Fundamentals & Control Flow', status: 'completed', desc: 'Variables, loops, arrays & functions in Python/JS', icon: 'code', resourceId: 'res-cs-road-1' },
        { id: 'cs-node-2', title: '2. Data Structures & Algorithm Complexity', status: 'in-progress', desc: 'Trees, Graphs, Sorting & Big-O Analysis', icon: 'git-branch', resourceId: 'res-cs-road-2' },
        { id: 'cs-node-3', title: '3. Full Stack Web Architecture & APIs', status: 'locked', desc: 'HTTP, RESTful APIs, Databases & Client State', icon: 'globe', resourceId: 'res-cs-road-3' },
        { id: 'cs-node-4', title: '4. System Design & Microservices', status: 'locked', desc: 'Distributed systems, load balancers & DevOps', icon: 'layers', resourceId: 'res-cs-road-4' }
      ]
    },
    math: {
      subjectId: 'math',
      title: 'Mathematics & Applied Analytics Pathway',
      nodes: [
        { id: 'math-node-1', title: '1. Discrete Mathematics & Logic Gates', status: 'completed', desc: 'Set theory, boolean logic & mathematical proofs', icon: 'calculator', resourceId: 'res-math-road-1' },
        { id: 'math-node-2', title: '2. Differential & Integral Calculus', status: 'in-progress', desc: 'Limits, derivatives & definite integrals', icon: 'activity', resourceId: 'res-math-road-2' },
        { id: 'math-node-3', title: '3. Linear Algebra & Matrix Vector Operations', status: 'locked', desc: 'Vector spaces, matrix multiplication & eigenvalues', icon: 'grid', resourceId: 'res-math-road-3' },
        { id: 'math-node-4', title: '4. Probability & Bayesian Statistics', status: 'locked', desc: 'Gaussian distributions & Bayes Theorem inference', icon: 'pie-chart', resourceId: 'res-math-road-4' }
      ]
    },
    physics: {
      subjectId: 'physics',
      title: 'Physics & Quantum Systems Pathway',
      nodes: [
        { id: 'phys-node-1', title: '1. Classical Mechanics & Kinematics', status: 'completed', desc: 'Newtonian motion laws, velocity & acceleration', icon: 'zap', resourceId: 'res-phys-road-1' },
        { id: 'phys-node-2', title: '2. Electromagnetism & Circuit Theory', status: 'in-progress', desc: 'Electric fields, circuits & Maxwell equations', icon: 'activity', resourceId: 'res-phys-road-2' },
        { id: 'phys-node-3', title: '3. Quantum Mechanics & Wave Duality', status: 'locked', desc: 'Wave-particle duality & Schrödinger wave equation', icon: 'cpu', resourceId: 'res-phys-road-3' }
      ]
    },
    bio: {
      subjectId: 'bio',
      title: 'Biology & Biotechnology Pathway',
      nodes: [
        { id: 'bio-node-1', title: '1. Cellular Biology & Organelles', status: 'completed', desc: 'Eukaryotic cells, mitochondria & ATP synthesis', icon: 'dna', resourceId: 'res-bio-road-1' },
        { id: 'bio-node-2', title: '2. DNA Replication & Gene Expression', status: 'in-progress', desc: 'Transcription, translation & central dogma', icon: 'activity', resourceId: 'res-bio-road-2' },
        { id: 'bio-node-3', title: '3. CRISPR Gene Editing & Biotechnology', status: 'locked', desc: 'Cas9 targeted cuts & genomic engineering', icon: 'cpu', resourceId: 'res-bio-road-3' }
      ]
    },
    chem: {
      subjectId: 'chem',
      title: 'Chemistry & Molecular Science Pathway',
      nodes: [
        { id: 'chem-node-1', title: '1. Atomic Models & Periodic Trends', status: 'completed', desc: 'Electron orbital shells, electronegativity & bonding', icon: 'flask-conical', resourceId: 'res-chem-road-1' },
        { id: 'chem-node-2', title: '2. Organic Functional Groups & Reactions', status: 'in-progress', desc: 'Alcohols, carbonyls, SN1/SN2 reaction pathways', icon: 'grid', resourceId: 'res-chem-road-2' },
        { id: 'chem-node-3', title: '3. Chemical Thermodynamics & Reaction Kinetics', status: 'locked', desc: 'Rate laws, Arrhenius equation & Gibbs Free Energy', icon: 'trending-up', resourceId: 'res-chem-road-3' }
      ]
    }
  },

  quizzes: [
    // --------------------------------------------------------------------------
    // ARTIFICIAL INTELLIGENCE & DATA SCIENCE
    // --------------------------------------------------------------------------
    {
      id: 'quiz-ds-beginner',
      title: 'Artificial Intelligence - Beginner Category (5 Questions)',
      subjectId: 'ds',
      level: 'Beginner',
      questionCount: 5,
      timeLimitMinutes: 8,
      questions: [
        { id: 'b_ds_1', question: 'What does AI stand for in computer science?', options: ['Automated Interface', 'Artificial Intelligence', 'Algorithmic Integration', 'Advanced Input'], correctIndex: 1, explanation: 'AI stands for Artificial Intelligence.' },
        { id: 'b_ds_2', question: 'Which programming language is most widely used for AI development?', options: ['C++', 'HTML', 'Python', 'JavaScript'], correctIndex: 2, explanation: 'Python is preferred for AI due to its simplicity and rich ecosystem of ML libraries.' },
        { id: 'b_ds_3', question: 'What is a dataset in machine learning?', options: ['A collection of files', 'A set of data used to train models', 'A type of database', 'A software framework'], correctIndex: 1, explanation: 'A dataset is a structured collection of data points used to train and evaluate ML models.' },
        { id: 'b_ds_4', question: 'Which of the following is an example of supervised learning?', options: ['Clustering customers', 'Spam email detection', 'Dimensionality reduction', 'Generative art'], correctIndex: 1, explanation: 'Spam detection is supervised learning because the training data has labels (Spam or Not Spam).' },
        { id: 'b_ds_5', question: 'What is the main goal of machine learning?', options: ['To build websites', 'To write software manually', 'To enable systems to learn from data', 'To secure networks'], correctIndex: 2, explanation: 'The goal of ML is to allow systems to learn and improve automatically from experience without being explicitly programmed.' }
      ]
    },
    {
      id: 'quiz-ds-intermediate',
      title: 'Artificial Intelligence - Intermediate Category (10 Questions)',
      subjectId: 'ds',
      level: 'Intermediate',
      questionCount: 10,
      timeLimitMinutes: 15,
      questions: [
        { id: 'i_ds_1', question: 'What is backpropagation in neural networks?', options: ['A method to save weights', 'An algorithm to compute gradients and update weights', 'A forward pass technique', 'A data cleaning process'], correctIndex: 1, explanation: 'Backpropagation computes the gradient of the loss function with respect to the weights to optimize the network.' },
        { id: 'i_ds_2', question: 'Which activation function outputs values between 0 and 1?', options: ['ReLU', 'Tanh', 'Sigmoid', 'Linear'], correctIndex: 2, explanation: 'The sigmoid function maps any real-valued input to a range between 0 and 1.' },
        { id: 'i_ds_3', question: 'What is overfitting in machine learning?', options: ['Model performs well on test data but poor on train data', 'Model performs well on training data but poorly on unseen data', 'Model fails to learn the training data', 'Model is too simple'], correctIndex: 1, explanation: 'Overfitting occurs when a model learns the training data too well, including its noise, and fails to generalize.' },
        { id: 'i_ds_4', question: 'Which of the following is a common classification algorithm?', options: ['Linear Regression', 'K-Means', 'Logistic Regression', 'Principal Component Analysis'], correctIndex: 2, explanation: 'Despite its name regression, Logistic Regression is used for binary classification tasks.' },
        { id: 'i_ds_5', question: 'What is the purpose of a validation dataset?', options: ['To test final model accuracy', 'To tune hyperparameters and prevent overfitting', 'To train the model parameters', 'To archive historical records'], correctIndex: 1, explanation: 'The validation set is used to tune hyperparameters and select the best model configuration during training.' },
        { id: 'i_ds_6', question: 'What does ReLU stand for in deep learning?', options: ['Rectified Linear Unit', 'Recursive Linear Utility', 'Regularized Linear Unit', 'Rotated Linear Unit'], correctIndex: 0, explanation: 'ReLU stands for Rectified Linear Unit, defined as f(x) = max(0, x).' },
        { id: 'i_ds_7', question: 'Which library is commonly used for data manipulation in Python?', options: ['TensorFlow', 'Pandas', 'Matplotlib', 'PyTorch'], correctIndex: 1, explanation: 'Pandas is the standard Python library for data manipulation and analysis.' },
        { id: 'i_ds_8', question: 'What does gradient descent do?', options: ['Increases the loss function', 'Calculates accuracy metrics', 'Minimizes the loss function iteratively', 'Trains model parameters randomly'], correctIndex: 2, explanation: 'Gradient descent is an optimization algorithm that minimizes the loss function by moving in the opposite direction of the gradient.' },
        { id: 'i_ds_9', question: 'What is classification?', options: ['Predicting continuous values', 'Grouping data without labels', 'Predicting categorical class labels', 'Finding data correlations'], correctIndex: 2, explanation: 'Classification is predicting discrete category labels (e.g., spam vs. normal).' },
        { id: 'i_ds_10', question: 'What is the role of weights in a neural network?', options: ['They store hyperparameter configurations', 'They determine the strength of connection between nodes', 'They act as input variables', 'They define the loss function'], correctIndex: 1, explanation: 'Weights determine the signal strength passed between connected nodes in neural net layers.' }
      ]
    },
    {
      id: 'quiz-ds-advanced',
      title: 'Artificial Intelligence - Advanced Category (15 Questions)',
      subjectId: 'ds',
      level: 'Advanced',
      questionCount: 15,
      timeLimitMinutes: 25,
      questions: [
        { id: 'a_ds_1', question: 'What is the core mechanism of the Transformer architecture?', options: ['Recurrent connections', 'Convolutional layers', 'Self-Attention mechanism', 'Pooling filters'], correctIndex: 2, explanation: 'Transformers rely entirely on the Self-Attention mechanism to process sequence inputs in parallel.' },
        { id: 'a_ds_2', question: 'In deep learning, what is a Vanishing Gradient problem?', options: ['Gradients become too large during backprop', 'Gradients shrink exponentially towards zero, preventing weight updates', 'Loss function value goes to infinity', 'Model runs out of memory'], correctIndex: 1, explanation: 'Vanishing gradients occur when gradients shrink during backpropagation through deep networks, stalling training.' },
        { id: 'a_ds_3', question: 'Which optimization algorithm adapts the learning rate for each parameter?', options: ['Stochastic Gradient Descent (SGD)', 'Momentum', 'Adam', 'Mini-batch Gradient Descent'], correctIndex: 2, explanation: 'Adam (Adaptive Moment Estimation) computes adaptive learning rates for each parameter.' },
        { id: 'a_ds_4', question: 'What does GPT stand for?', options: ['Generative Programmed Text', 'Generative Pre-trained Transformer', 'Global Predictive Translation', 'General Purpose Transformer'], correctIndex: 1, explanation: 'GPT stands for Generative Pre-trained Transformer.' },
        { id: 'a_ds_5', question: 'Which technique is used to reduce model overfitting by randomly disabling nodes?', options: ['Batch Normalization', 'L2 Regularization', 'Dropout', 'Data Augmentation'], correctIndex: 2, explanation: 'Dropout randomly deactivates a fraction of neurons during training to prevent co-adaptation.' },
        { id: 'a_ds_6', question: 'What is the mathematical purpose of Softmax function?', options: ['Normalizes output values into probability distributions', 'Clips gradients within a threshold', 'Initializes weights randomly', 'Calculates accuracy scores'], correctIndex: 0, explanation: 'Softmax converts raw network scores into a probability distribution summing to 1.' },
        { id: 'a_ds_7', question: 'What does epoch mean in model training?', options: ['A single training data batch', 'One complete pass through the entire training dataset', 'The total duration of training', 'The number of layers in the model'], correctIndex: 1, explanation: 'An epoch represents one complete iteration through the training dataset.' },
        { id: 'a_ds_8', question: 'Which network is suited for spatial / image data processing?', options: ['RNN', 'LSTM', 'CNN', 'Autoencoder'], correctIndex: 2, explanation: 'Convolutional Neural Networks (CNNs) extract spatial features, making them ideal for image processing.' },
        { id: 'a_ds_9', question: 'What is transfer learning?', options: ['Moving data between databases', 'Using a pre-trained model as a starting point for a new task', 'Transferring parameters to CPU', 'Copying files between servers'], correctIndex: 1, explanation: 'Transfer learning applies knowledge gained from solving one problem to a different but related task.' },
        { id: 'a_ds_10', question: 'What is L1 regularization (Lasso) characterized by?', options: ['Creating dense weight matrices', 'Shrinking weights to absolute zero, causing sparsity', 'Doubling gradient sizes', 'Using squared weight values'], correctIndex: 1, explanation: 'L1 regularization adds absolute weight penalty, driving some weights to zero for feature selection.' },
        { id: 'a_ds_11', question: 'What is a hyperparameter?', options: ['A parameter learned during training', 'A configuration variable set before the training process starts', 'An output prediction score', 'The activation value of a node'], correctIndex: 1, explanation: 'Hyperparameters are parameters set before training (e.g., learning rate, batch size).' },
        { id: 'a_ds_12', question: 'Which metric measures the balance between Precision and Recall?', options: ['Accuracy', 'ROC-AUC', 'F1 Score', 'Mean Squared Error'], correctIndex: 2, explanation: 'F1 Score is the harmonic mean of precision and recall.' },
        { id: 'a_ds_13', question: 'What is an Autoencoder used for?', options: ['Supervised regression', 'Unsupervised feature learning & dimensionality reduction', 'Web scraping data', 'Distributed file storage'], correctIndex: 1, explanation: 'Autoencoders compress input data into a latent representation and reconstruct it back.' },
        { id: 'a_ds_14', question: 'What is the purpose of Batch Normalization?', options: ['To balance dataset categories', 'To normalize layer inputs to stabilize and accelerate training', 'To split data into train/test sets', 'To back up model parameters'], correctIndex: 1, explanation: 'Batch normalization normalizes layer activations to reduce internal covariate shift.' },
        { id: 'a_ds_15', question: 'In Reinforcement Learning, what defines the goal of the agent?', options: ['Minimizing input data variance', 'Maximizing cumulative reward over time', 'Predicting class categories', 'Reconstructing input pixels'], correctIndex: 1, explanation: 'An RL agent aims to learn a policy that maximizes the total expected cumulative reward.' }
      ]
    },

    // --------------------------------------------------------------------------
    // COMPUTER SCIENCE
    // --------------------------------------------------------------------------
    {
      id: 'quiz-cs-beginner',
      title: 'Computer Science - Beginner Category (5 Questions)',
      subjectId: 'cs',
      level: 'Beginner',
      questionCount: 5,
      timeLimitMinutes: 8,
      questions: [
        { id: 'b_cs_1', question: 'Which keyword defines a function in Python?', options: ['func', 'def', 'function', 'define'], correctIndex: 1, explanation: 'The "def" keyword is used to define functions in Python.' },
        { id: 'b_cs_2', question: 'What is the index of the first element in an array in most languages?', options: ['1', '0', '-1', 'None'], correctIndex: 1, explanation: 'Computer science arrays are zero-indexed, starting at index 0.' },
        { id: 'b_cs_3', question: 'What does HTML stand for?', options: ['Hypertext Markup Language', 'Hyperlink Text Management', 'High Text Machine Language', 'Home Tool Markup Language'], correctIndex: 0, explanation: 'HTML stands for Hypertext Markup Language.' },
        { id: 'b_cs_4', question: 'Which loop is used to execute code a specific number of times?', options: ['While loop', 'For loop', 'Do-while loop', 'Infinite loop'], correctIndex: 1, explanation: 'A for loop is ideal for iterating over a sequence or executing a block a specific number of times.' },
        { id: 'b_cs_5', question: 'What does CSS stand for in web development?', options: ['Creative Style Sheets', 'Computer Style Sheets', 'Cascading Style Sheets', 'Colorful Style Sheets'], correctIndex: 2, explanation: 'CSS stands for Cascading Style Sheets, used to style HTML layouts.' }
      ]
    },
    {
      id: 'quiz-cs-intermediate',
      title: 'Computer Science - Intermediate Category (10 Questions)',
      subjectId: 'cs',
      level: 'Intermediate',
      questionCount: 10,
      timeLimitMinutes: 15,
      questions: [
        { id: 'i_cs_1', question: 'Which data structure operates on a Last-In-First-Out (LIFO) basis?', options: ['Queue', 'Stack', 'Linked List', 'Binary Tree'], correctIndex: 1, explanation: 'A stack is LIFO, meaning the last element added is the first one removed.' },
        { id: 'i_cs_2', question: 'What is the time complexity of searching in a sorted array using Binary Search?', options: ['O(n)', 'O(n log n)', 'O(log n)', 'O(1)'], correctIndex: 2, explanation: 'Binary Search continually splits search intervals in half, resulting in O(log n) time complexity.' },
        { id: 'i_cs_3', question: 'What is a primary key in a database table?', options: ['A key that unlocks files', 'A column that uniquely identifies each row in a table', 'A password field', 'An index for sorting columns'], correctIndex: 1, explanation: 'A primary key uniquely identifies each record in a relational database table.' },
        { id: 'i_cs_4', question: 'Which sorting algorithm has a worst-case time complexity of O(n^2)?', options: ['Merge Sort', 'Quick Sort', 'Bubble Sort', 'Heap Sort'], correctIndex: 2, explanation: 'Bubble Sort has O(n^2) worst-case time complexity due to nested iterations.' },
        { id: 'i_cs_5', question: 'What is recursion?', options: ['A function that calls itself', 'A loop that never terminates', 'A memory management tool', 'An API call method'], correctIndex: 0, explanation: 'Recursion is a programming technique where a function calls itself directly or indirectly.' },
        { id: 'i_cs_6', question: 'Which database type uses tables, rows, and columns?', options: ['NoSQL', 'Relational (SQL)', 'Graph Database', 'Key-Value Store'], correctIndex: 1, explanation: 'Relational databases use tables with structured rows and columns.' },
        { id: 'i_cs_7', question: 'What is Git?', options: ['A programming language', 'A distributed version control system', 'A web hosting service', 'A database engine'], correctIndex: 1, explanation: 'Git is a distributed version control system to track file modifications.' },
        { id: 'i_cs_8', question: 'What is HTTP?', options: ['Hypertext Transfer Protocol', 'High Technology Transfer Process', 'Hyperlink Text Transmission', 'Hypertext Terminate Process'], correctIndex: 0, explanation: 'HTTP is the protocol used to transfer web data over the Internet.' },
        { id: 'i_cs_9', question: 'What is the purpose of an index in a database?', options: ['To secure tables', 'To speed up data retrieval queries', 'To store backup records', 'To define table columns'], correctIndex: 1, explanation: 'Indexes optimize search queries to find database rows faster.' },
        { id: 'i_cs_10', question: 'Which data structure uses pointers to connect nodes sequentially?', options: ['Array', 'Stack', 'Linked List', 'Hash Table'], correctIndex: 2, explanation: 'A linked list consists of nodes containing data and references/pointers to next nodes.' }
      ]
    },
    {
      id: 'quiz-cs-advanced',
      title: 'Computer Science - Advanced Category (15 Questions)',
      subjectId: 'cs',
      level: 'Advanced',
      questionCount: 15,
      timeLimitMinutes: 25,
      questions: [
        { id: 'a_cs_1', question: 'Which protocol operates at the Transport Layer of the OSI Model to provide reliable delivery?', options: ['UDP', 'IP', 'TCP', 'DNS'], correctIndex: 2, explanation: 'TCP (Transmission Control Protocol) guarantees reliable data stream delivery using handshakes.' },
        { id: 'a_cs_2', question: 'What is the time complexity of QuickSort in the worst-case scenario?', options: ['O(n log n)', 'O(n)', 'O(n^2)', 'O(2^n)'], correctIndex: 2, explanation: 'QuickSort has O(n^2) complexity in the worst-case if pivots are chosen poorly (e.g., already sorted array).' },
        { id: 'a_cs_3', question: 'In multithreading, what is a Deadlock?', options: ['A process running out of stack space', 'Threads blocked permanently waiting for resources held by each other', 'A secure thread execution state', 'A system crash due to CPU heat'], correctIndex: 1, explanation: 'A deadlock is a state where concurrent threads are blocked forever waiting for mutual resource releases.' },
        { id: 'a_cs_4', question: 'What does REST stand for in API design?', options: ['Representational State Transfer', 'Remote Entry System Technology', 'Responsive Secure Text Protocol', 'Redirected State Transmission'], correctIndex: 0, explanation: 'REST stands for Representational State Transfer.' },
        { id: 'a_cs_5', question: 'Which design pattern restricts class instantiation to a single instance?', options: ['Factory Pattern', 'Singleton Pattern', 'Observer Pattern', 'Strategy Pattern'], correctIndex: 1, explanation: 'The Singleton Pattern ensures a class has only one instance and provides global access to it.' },
        { id: 'a_cs_6', question: 'What is a compiler?', options: ['A text editor', 'A program that translates source code into machine code', 'A debugging utility', 'A database manager'], correctIndex: 1, explanation: 'Compilers compile human-readable high-level source code into binary machine execution instructions.' },
        { id: 'a_cs_7', question: 'Which data structure is best suited for implementing a priority queue?', options: ['Array', 'Stack', 'Heap', 'Linked List'], correctIndex: 2, explanation: 'A binary heap structure efficiently supports extract-min/extract-max operations in O(log n) time.' },
        { id: 'a_cs_8', question: 'What is Docker used for in DevOps?', options: ['To compile C++ applications', 'To containerize apps for consistent environments', 'To design SQL databases', 'To write unit tests'], correctIndex: 1, explanation: 'Docker package applications inside isolated software containers.' },
        { id: 'a_cs_9', question: 'What is the primary feature of NoSQL databases?', options: ['Strict SQL schemas', 'Schema-free/flexible document storage', 'Only supports integers', 'No support for indexes'], correctIndex: 1, explanation: 'NoSQL databases support non-relational document or key-value schemas with high scalability.' },
        { id: 'a_cs_10', question: 'In graph theory, what is Dijkstra Algorithm used for?', options: ['Detecting graph loops', 'Finding the shortest path from a source node to all other nodes', 'Sorting vertices topologically', 'Generating minimum spanning trees'], correctIndex: 1, explanation: 'Dijkstra finds shortest paths in graphs with non-negative edge weights.' },
        { id: 'a_cs_11', question: 'What is a race condition?', options: ['A speed test for algorithms', 'Multiple threads accessing shared data concurrently, causing unpredictable outputs', 'A network connection failure', 'A database crash during queries'], correctIndex: 1, explanation: 'A race condition occurs when concurrent threads write shared memory without synchronization.' },
        { id: 'a_cs_12', question: 'Which paradigm does Haskell belong to?', options: ['Object-Oriented Programming', 'Imperative Programming', 'Functional Programming', 'Logical Programming'], correctIndex: 2, explanation: 'Haskell is a purely functional programming language.' },
        { id: 'a_cs_13', question: 'What is cross-site scripting (XSS)?', options: ['A method to copy site layouts', 'An injection attack injecting malicious scripts into trusted websites', 'A domain name mapping failure', 'A CSS layout bug'], correctIndex: 1, explanation: 'XSS attacks inject malicious JavaScript blocks into dynamic web forms.' },
        { id: 'a_cs_14', question: 'What is the function of a Load Balancer?', options: ['To measure server weights', 'To distribute incoming network traffic across multiple servers', 'To backup databases', 'To optimize code compilation'], correctIndex: 1, explanation: 'Load balancers balance traffic to prevent individual server exhaustion.' },
        { id: 'a_cs_15', question: 'What is the Halting Problem in computer science theory?', options: ['A bug that crashes operating systems', 'Deciding whether a program halts or runs forever on a given input', 'An hardware interruption handler', 'A sorting algorithm boundary'], correctIndex: 1, explanation: 'Alan Turing proved that a general algorithm to solve the Halting Problem for all programs is undecidable.' }
      ]
    },

    // --------------------------------------------------------------------------
    // MATHEMATICS
    // --------------------------------------------------------------------------
    {
      id: 'quiz-math-beginner',
      title: 'Mathematics - Beginner Category (5 Questions)',
      subjectId: 'math',
      level: 'Beginner',
      questionCount: 5,
      timeLimitMinutes: 8,
      questions: [
        { id: 'b_m_1', question: 'What is the slope of a horizontal line?', options: ['1', '0', 'Undefined', '-1'], correctIndex: 1, explanation: 'Horizontal lines have zero vertical change, so their slope is 0.' },
        { id: 'b_m_2', question: 'What is the value of pi rounded to two decimal places?', options: ['3.12', '3.16', '3.14', '3.18'], correctIndex: 2, explanation: 'Pi is approximately 3.14159...' },
        { id: 'b_m_3', question: 'Solve for x: 2x + 5 = 15.', options: ['x = 5', 'x = 10', 'x = 2', 'x = 8'], correctIndex: 0, explanation: 'Subtract 5: 2x = 10. Divide by 2: x = 5.' },
        { id: 'b_m_4', question: 'What is the square root of 144?', options: ['10', '12', '14', '16'], correctIndex: 1, explanation: '12 multiplied by 12 equals 144.' },
        { id: 'b_m_5', question: 'In a right triangle, what is the hypotenuse?', options: ['The shortest side', 'The side opposite the right angle', 'The adjacent side', 'The vertical side'], correctIndex: 1, explanation: 'The hypotenuse is the longest side of a right-angled triangle, opposite the 90-degree angle.' }
      ]
    },
    {
      id: 'quiz-math-intermediate',
      title: 'Mathematics - Intermediate Category (10 Questions)',
      subjectId: 'math',
      level: 'Intermediate',
      questionCount: 10,
      timeLimitMinutes: 15,
      questions: [
        { id: 'i_m_1', question: 'What is the derivative of x^2 with respect to x?', options: ['x', '2x', '2', '1/2 x'], correctIndex: 1, explanation: 'By the power rule, d/dx(x^n) = n * x^(n-1), so d/dx(x^2) = 2x.' },
        { id: 'i_m_2', question: 'What is the determinant of a 2x2 matrix [[a, b], [c, d]]?', options: ['ab - cd', 'ad + bc', 'ad - bc', 'ac - bd'], correctIndex: 2, explanation: 'The determinant is calculated as ad - bc.' },
        { id: 'i_m_3', question: 'In set theory, what does the symbol ∩ represent?', options: ['Union', 'Intersection', 'Subset', 'Universal Set'], correctIndex: 1, explanation: 'The symbol ∩ represents the intersection of sets, containing common elements.' },
        { id: 'i_m_4', question: 'What is the limit of 1/x as x approaches infinity?', options: ['Infinity', '1', '0', 'Undefined'], correctIndex: 2, explanation: 'As denominator x grows larger, the fraction 1/x approaches 0.' },
        { id: 'i_m_5', question: 'What is the probability of rolling a 3 or a 5 on a fair 6-sided die?', options: ['1/3', '1/6', '1/2', '2/3'], correctIndex: 0, explanation: 'The target outcomes are 2 (rolling a 3 or 5) out of 6 total, so 2/6 = 1/3.' },
        { id: 'i_m_6', question: 'Solve the integral of 2x dx.', options: ['x^2 + C', '2x^2 + C', 'x + C', '2 + C'], correctIndex: 0, explanation: 'The anti-derivative of 2x is x^2 (plus constant C).' },
        { id: 'i_m_7', question: 'Which theorem states that a^2 + b^2 = c^2 in right-angled triangles?', options: ['Fermat Theorem', 'Pythagorean Theorem', 'Euler Theorem', 'Taylor Theorem'], correctIndex: 1, explanation: 'The Pythagorean Theorem defines the side length relationships in right triangles.' },
        { id: 'i_m_8', question: 'What is the log base 10 of 1000?', options: ['2', '3', '4', '10'], correctIndex: 1, explanation: '10 raised to the power of 3 equals 1000.' },
        { id: 'i_m_9', question: 'Which angle is represented by pi radians?', options: ['90 degrees', '180 degrees', '360 degrees', '45 degrees'], correctIndex: 1, explanation: 'Pi radians represents a straight angle of 180 degrees.' },
        { id: 'i_m_10', question: 'What is the mode in statistics?', options: ['The average of data points', 'The middle value when sorted', 'The value that appears most frequently', 'The difference between max and min'], correctIndex: 2, explanation: 'The mode is the statistical metric representing the most frequent value in a dataset.' }
      ]
    },
    {
      id: 'quiz-math-advanced',
      title: 'Mathematics - Advanced Category (15 Questions)',
      subjectId: 'math',
      level: 'Advanced',
      questionCount: 15,
      timeLimitMinutes: 25,
      questions: [
        { id: 'a_m_1', question: 'In linear algebra, what does it mean if a set of vectors is linearly independent?', options: ['None of the vectors can be written as a linear combination of the others', 'All vectors are scalar multiples of each other', 'The vectors sum to zero', 'The dot product of all pairs is zero'], correctIndex: 0, explanation: 'Vectors are linearly independent if no vector in the set can be represented as a linear combination of the remaining vectors.' },
        { id: 'a_m_2', question: 'What are the eigenvalues of a diagonal matrix?', options: ['The sum of the diagonal elements', 'The diagonal elements themselves', 'Zero', 'The trace divided by the determinant'], correctIndex: 1, explanation: 'For a diagonal matrix, the eigenvalues are simply the diagonal entries.' },
        { id: 'a_m_3', question: 'State the Fundamental Theorem of Calculus.', options: ['Derivatives are slopes', 'Integrals represent volume', 'Differentiation and integration are inverse operations', 'Limits are continuous functions'], correctIndex: 2, explanation: 'The theorem establishes that differentiation and integration are inverse operations.' },
        { id: 'a_m_4', question: 'What does Bayes Theorem calculate?', options: ['Continuous random variable averages', 'Conditional probability of an event based on prior knowledge', 'Matrix eigenvectors', 'Derivative tangents'], correctIndex: 1, explanation: 'Bayes Theorem defines conditional probability: P(A|B) = [P(B|A) * P(A)] / P(B).' },
        { id: 'a_m_5', question: 'Which distribution is characterized by equal mean, median, and mode forming a bell-shaped curve?', options: ['Binomial Distribution', 'Poisson Distribution', 'Normal (Gaussian) Distribution', 'Exponential Distribution'], correctIndex: 2, explanation: 'The Normal/Gaussian distribution is symmetric and bell-shaped around its mean.' },
        { id: 'a_m_6', question: 'What is the trace of a square matrix?', options: ['The product of diagonal elements', 'The sum of diagonal elements', 'The inverse of the matrix', 'The transpose of the matrix'], correctIndex: 1, explanation: 'The trace is the sum of the elements on the main diagonal.' },
        { id: 'a_m_7', question: 'What is the derivative of e^x?', options: ['xe^(x-1)', 'e^x', 'ln(x)', '1/e^x'], correctIndex: 1, explanation: 'The exponential function e^x is its own derivative.' },
        { id: 'a_m_8', question: 'Which equation represents the Central Limit Theorem outcome?', options: ['Variables approach zero', 'Sample means approach a normal distribution as sample size grows', 'Matrix determinants sum to 1', 'Probability goes to infinity'], correctIndex: 1, explanation: 'The CLT states that sample means approach normal distribution as sample size n increases, regardless of population shape.' },
        { id: 'a_m_9', question: 'What is the dot product of two orthogonal vectors?', options: ['1', '-1', '0', 'The product of their magnitudes'], correctIndex: 2, explanation: 'Orthogonal vectors are perpendicular, meaning their dot product is zero.' },
        { id: 'a_m_10', question: 'What is the Taylor series used for?', options: ['Solving linear matrices', 'Representing functions as infinite sums of terms calculated from derivatives', 'Sorting statistical datasets', 'Calculating probability averages'], correctIndex: 1, explanation: 'Taylor series approximate functions using infinite polynomial sums of derivatives at a single point.' },
        { id: 'a_m_11', question: 'What is a null hypothesis in statistics?', options: ['A hypothesis with zero values', 'A statement of no effect or no difference, tested for rejection', 'An invalid statistical conclusion', 'A hypothesis that is always true'], correctIndex: 1, explanation: 'The null hypothesis (H0) assumes no effect or difference, acting as baseline for significance tests.' },
        { id: 'a_m_12', question: 'Which matrix has the property A^T = A^-1?', options: ['Symmetric Matrix', 'Orthogonal Matrix', 'Skew-Symmetric Matrix', 'Identity Matrix'], correctIndex: 1, explanation: 'An orthogonal matrix has its transpose equal to its inverse.' },
        { id: 'a_m_13', question: 'What is the derivative of ln(x) with respect to x?', options: ['e^x', '1/x', 'x', '1/x^2'], correctIndex: 1, explanation: 'The derivative of natural logarithm ln(x) is 1/x.' },
        { id: 'a_m_14', question: 'Which theorem states that every polynomial of degree n >= 1 has at least one complex root?', options: ['Mean Value Theorem', 'Fundamental Theorem of Algebra', 'Euler Polyhedral Formula', 'Stokes Theorem'], correctIndex: 1, explanation: 'The Fundamental Theorem of Algebra states that polynomials always have complex roots.' },
        { id: 'a_m_15', question: 'In differential equations, what is the order of an equation?', options: ['The number of variables', 'The highest derivative present in the equation', 'The degree of polynomial terms', 'The sequence of solving steps'], correctIndex: 1, explanation: 'The order of a differential equation is defined by its highest derivative.' }
      ]
    },

    // --------------------------------------------------------------------------
    // PHYSICS
    // --------------------------------------------------------------------------
    {
      id: 'quiz-physics-beginner',
      title: 'Physics - Beginner Category (5 Questions)',
      subjectId: 'physics',
      level: 'Beginner',
      questionCount: 5,
      timeLimitMinutes: 8,
      questions: [
        { id: 'bp1', question: 'What is the SI unit of force?', options: ['Joule', 'Newton', 'Watt', 'Pascal'], correctIndex: 1, explanation: 'Force is measured in Newtons (N).' },
        { id: 'bp2', question: 'Which law states that for every action, there is an equal and opposite reaction?', options: ['Newton First Law', 'Newton Second Law', 'Newton Third Law', 'Law of Gravitation'], correctIndex: 2, explanation: 'Newton Third Law defines action-reaction pairs.' },
        { id: 'bp3', question: 'What is the speed of light in a vacuum approximately?', options: ['300,000 km/s', '150,000 km/s', '1,000,000 km/s', '50,000 km/s'], correctIndex: 0, explanation: 'The speed of light c is approximately 299,792 km/s (or 3x10^8 m/s).' },
        { id: 'bp4', question: 'What type of energy is stored in a stretched rubber band?', options: ['Kinetic Energy', 'Thermal Energy', 'Elastic Potential Energy', 'Chemical Energy'], correctIndex: 2, explanation: 'Deforming elastic objects stores elastic potential energy.' },
        { id: 'bp5', question: 'Which instrument measures electrical current?', options: ['Voltmeter', 'Barometer', 'Ammeter', 'Thermometer'], correctIndex: 2, explanation: 'Ammeters measure electric current flow in Amperes.' }
      ]
    },
    {
      id: 'quiz-physics-intermediate',
      title: 'Physics - Intermediate Category (10 Questions)',
      subjectId: 'physics',
      level: 'Intermediate',
      questionCount: 10,
      timeLimitMinutes: 15,
      questions: [
        { id: 'ip1', question: 'State Ohm Law equation.', options: ['P = VI', 'V = IR', 'F = ma', 'E = mc^2'], correctIndex: 1, explanation: 'Ohm Law relates voltage (V), current (I), and resistance (R) via V = IR.' },
        { id: 'ip2', question: 'What does the area under a velocity-time graph represent?', options: ['Acceleration', 'Velocity', 'Displacement / Distance traveled', 'Force'], correctIndex: 2, explanation: 'Integrating velocity over time yields displacement (distance).' },
        { id: 'ip3', question: 'Which term describes the resistance of an object to change its state of motion?', options: ['Momentum', 'Inertia', 'Friction', 'Gravity'], correctIndex: 1, explanation: 'Inertia (proportional to mass) is the resistance to motion changes.' },
        { id: 'ip4', question: 'What is the frequency of a wave with a period of 0.2 seconds?', options: ['2 Hz', '5 Hz', '10 Hz', '0.5 Hz'], correctIndex: 1, explanation: 'Frequency is the reciprocal of period: f = 1/T = 1/0.2 = 5 Hz.' },
        { id: 'ip5', question: 'Which force keeps planets orbiting the Sun?', options: ['Electromagnetic Force', 'Centripetal Gravitational Force', 'Frictional Force', 'Nuclear Force'], correctIndex: 1, explanation: 'Gravitational attraction acts as centripetal force keeping planets in orbit.' },
        { id: 'ip6', question: 'What is the acceleration due to gravity on Earth approximately?', options: ['9.8 m/s^2', '5.4 m/s^2', '12.0 m/s^2', '1.6 m/s^2'], correctIndex: 0, explanation: 'Standard acceleration g is 9.81 m/s^2.' },
        { id: 'ip7', question: 'Which wave type does not require a medium to travel?', options: ['Sound Waves', 'Water Waves', 'Electromagnetic Waves', 'Seismic Waves'], correctIndex: 2, explanation: 'EM waves propagate through vacuum space via oscillating fields.' },
        { id: 'ip8', question: 'What is the SI unit of work and energy?', options: ['Watt', 'Joule', 'Newton', 'Pascal'], correctIndex: 1, explanation: 'Work and energy are measured in Joules (J).' },
        { id: 'ip9', question: 'What type of lens converges light rays to a single point?', options: ['Concave Lens', 'Convex Lens', 'Diverging Lens', 'Flat Lens'], correctIndex: 1, explanation: 'Convex/bi-convex lenses converge light toward focal points.' },
        { id: 'ip10', question: 'State the First Law of Thermodynamics.', options: ['Entropy increases', 'Absolute zero is unreachable', 'Energy cannot be created or destroyed, only conserved', 'Heat flows to colder areas'], correctIndex: 2, explanation: 'First Law is the law of energy conservation.' }
      ]
    },
    {
      id: 'quiz-physics-advanced',
      title: 'Physics - Advanced Category (15 Questions)',
      subjectId: 'physics',
      level: 'Advanced',
      questionCount: 15,
      timeLimitMinutes: 25,
      questions: [
        { id: 'ap1', question: 'What was demonstrated by the Double-Slit Experiment?', options: ['Wave-particle duality of light/matter', 'Photoelectric threshold', 'Theory of Relativity proof', 'Atomic nucleus existence'], correctIndex: 0, explanation: 'Double-slit displays interference patterns, demonstrating wave-particle duality.' },
        { id: 'ap2', question: 'In quantum mechanics, what is the physical meaning of the squared wave function |ψ|^2?', options: ['Energy levels', 'Particle velocity', 'Probability density of finding a particle at a location', 'Electric charge distribution'], correctIndex: 2, explanation: 'Born rule defines |ψ|^2 as the probability density function for finding particle positions.' },
        { id: 'ap3', question: 'Which equation represents Einstein famous mass-energy equivalence?', options: ['F = ma', 'E = mc^2', 'V = IR', 'PV = nRT'], correctIndex: 1, explanation: 'E = mc^2 establishes that mass can be converted to energy.' },
        { id: 'ap4', question: 'What is the escape velocity of an object from Earth approximately?', options: ['5 km/s', '11.2 km/s', '30 km/s', '8 km/s'], correctIndex: 1, explanation: 'Earth escape velocity is roughly 11.2 km/s (or 40,320 km/h).' },
        { id: 'ap5', question: 'State Heisenberg Uncertainty Principle regarding position and momentum.', options: ['Δx * Δp >= h/4π', 'Δx * Δt = constant', 'ΔE * Δp = h', 'Δv * Δt = 0'], correctIndex: 0, explanation: 'Heisenberg principle dictates Δx * Δp >= h/4π, limiting simultaneous measurement precision.' },
        { id: 'ap6', question: 'Which fundamental interaction has the shortest range?', options: ['Gravitational Force', 'Weak Nuclear Force', 'Electromagnetic Force', 'Strong Nuclear Force'], correctIndex: 1, explanation: 'Weak nuclear force acts only over subatomic distance ranges (~10^-18 m).' },
        { id: 'ap7', question: 'What does the term superconductivity mean?', options: ['High electrical resistance', 'Zero electrical resistance in materials cooled below critical temperature', 'Increased thermal capacity', 'Magnetic field amplification'], correctIndex: 1, explanation: 'Superconductivity features zero resistance and Meissner magnetic expulsion.' },
        { id: 'ap8', question: 'What is the photo-electric effect?', options: ['Light bending in glass', 'Emission of electrons from metal surface when light shines on it', 'Chemical reaction by heat', 'Nuclear fission reactions'], correctIndex: 1, explanation: 'Einstein explained photo-electrons by treating light as quantized energy packets (photons).' },
        { id: 'ap9', question: 'Which quantum number determines the orientation of an orbital in space?', options: ['Principal Quantum Number (n)', 'Angular Momentum Quantum Number (l)', 'Magnetic Quantum Number (ml)', 'Spin Quantum Number (ms)'], correctIndex: 2, explanation: 'Magnetic quantum number ml defines spatial orientation configurations.' },
        { id: 'ap10', question: 'What is the cosmological redshift?', options: ['Bending of star paths', 'Expansion of space stretching light waves to longer wavelengths', 'Star surface cooling', 'Black hole light absorption'], correctIndex: 1, explanation: 'Space expansion stretches wavelengths of light traveling from distant galaxies (Hubble Law).' },
        { id: 'ap11', question: 'What represents the Stefan-Boltzmann law for blackbody radiation?', options: ['P proportional to T', 'P proportional to T^4', 'P proportional to 1/T', 'P proportional to T^2'], correctIndex: 1, explanation: 'Stefan-Boltzmann law states energy radiated per unit area is proportional to T^4.' },
        { id: 'ap12', question: 'Which constant defines the quantization of light energy?', options: ['Boltzmann Constant', 'Planck Constant', 'Gravitational Constant', 'Gas Constant'], correctIndex: 1, explanation: 'Planck constant h (6.626x10^-34 J·s) scales photon energy E = hf.' },
        { id: 'ap13', question: 'What is Kepler Second Law of planetary motion?', options: ['Planets move in ellipses', 'A line segment joining a planet and the Sun sweeps out equal areas during equal intervals of time', 'Orbital periods square with distance', 'Gravitational pull decreases with square distance'], correctIndex: 1, explanation: 'Second Law defines equal areas in equal times, implying planets speed up near perihelion.' },
        { id: 'ap14', question: 'In electromagnetic theory, what does Lenz Law dictate?', options: ['Magnetic fields have poles', 'Induced current opposes the change in magnetic flux that produced it', 'Voltage increases with loops', 'Electrical charge is conserved'], correctIndex: 1, explanation: 'Lenz Law dictates that induced currents generate counteracting magnetic flux.' },
        { id: 'ap15', question: 'What defines a black hole event horizon?', options: ['The physical surface boundary', 'The boundary where escape velocity equals the speed of light', 'The center singular point', 'The magnetic field limit'], correctIndex: 1, explanation: 'Inside the event horizon, gravitational pull is so strong that even light cannot escape.' }
      ]
    },

    // --------------------------------------------------------------------------
    // BIOLOGY
    // --------------------------------------------------------------------------
    {
      id: 'quiz-bio-beginner',
      title: 'Biology - Beginner Category (5 Questions)',
      subjectId: 'bio',
      level: 'Beginner',
      questionCount: 5,
      timeLimitMinutes: 8,
      questions: [
        { id: 'bb1', question: 'What is known as the powerhouse of the cell?', options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi'], correctIndex: 1, explanation: 'Mitochondria produce cellular ATP energy.' },
        { id: 'bb2', question: 'Which molecule carries genetic instructions in living organisms?', options: ['RNA', 'DNA', 'Protein', 'Lipid'], correctIndex: 1, explanation: 'DNA (Deoxyribonucleic Acid) stores genetic codes.' },
        { id: 'bb3', question: 'What process do plants use to make food from sunlight?', options: ['Respiration', 'Photosynthesis', 'Fermentation', 'Transpiration'], correctIndex: 1, explanation: 'Photosynthesis synthesizes glucose using carbon dioxide, water, and light energy.' },
        { id: 'bb4', question: 'What is the main function of red blood cells?', options: ['Fighting infections', 'Clotting blood', 'Carrying oxygen', 'Digesting nutrients'], correctIndex: 2, explanation: 'Hemoglobin in red cells binds and transports oxygen molecules.' },
        { id: 'bb5', question: 'How many chromosomes do normal human body cells contain?', options: ['23', '46', '48', '32'], correctIndex: 1, explanation: 'Human somatic cells have 46 chromosomes (23 pairs).' }
      ]
    },
    {
      id: 'quiz-bio-intermediate',
      title: 'Biology - Intermediate Category (10 Questions)',
      subjectId: 'bio',
      level: 'Intermediate',
      questionCount: 10,
      timeLimitMinutes: 15,
      questions: [
        { id: 'ib1', question: 'What is the primary site of protein synthesis in a cell?', options: ['Ribosome', 'Lysosome', 'Nucleus', 'Endoplasmic Reticulum'], correctIndex: 0, explanation: 'Ribosomes translate mRNA sequences into polypeptide chains.' },
        { id: 'ib2', question: 'What is the product of transcription?', options: ['DNA copy', 'Polypeptide chain', 'mRNA molecule', 'Amino acid'], correctIndex: 2, explanation: 'Transcription copies DNA sequences into messenger RNA (mRNA).' },
        { id: 'ib3', question: 'Which organelle contains digestive enzymes to break down waste?', options: ['Vacuole', 'Ribosome', 'Lysosome', 'Chloroplast'], correctIndex: 2, explanation: 'Lysosomes contain acidic enzymes to digest waste and foreign bodies.' },
        { id: 'ib4', question: 'What represents the start codon in mRNA translation?', options: ['UAA', 'UAG', 'AUG', 'UGA'], correctIndex: 2, explanation: 'AUG codes for methionine and initiates protein translation.' },
        { id: 'ib5', question: 'What is mitosis?', options: ['Cell death process', 'Cell division resulting in two identical daughter cells', 'Sexual reproduction cell division', 'Protein folding phase'], correctIndex: 1, explanation: 'Mitosis creates two identical diploid daughter cells.' },
        { id: 'ib6', question: 'Which hormone regulates blood glucose levels?', options: ['Thyroxine', 'Adrenaline', 'Insulin', 'Estrogen'], correctIndex: 2, explanation: 'Insulin secreted by the pancreas decreases blood glucose levels.' },
        { id: 'ib7', question: 'What are the building blocks of proteins?', options: ['Nucleotides', 'Fatty acids', 'Amino acids', 'Monosaccharides'], correctIndex: 2, explanation: 'Proteins are polymers constructed from amino acid monomers.' },
        { id: 'ib8', question: 'What type of bond holds DNA base pairs together?', options: ['Covalent Bond', 'Hydrogen Bond', 'Ionic Bond', 'Peptide Bond'], correctIndex: 1, explanation: 'Complementary base pairs (A-T, G-C) form hydrogen bonds.' },
        { id: 'ib9', question: 'What is the primary function of the large intestine?', options: ['Nutrient absorption', 'Water absorption', 'Protein digestion', 'Bile production'], correctIndex: 1, explanation: 'The large intestine reabsorbs remaining water and salts from waste.' },
        { id: 'ib10', question: 'Which process yields the most ATP molecules during cellular respiration?', options: ['Glycolysis', 'Krebs Cycle', 'Electron Transport Chain (ETC)', 'Fermentation'], correctIndex: 2, explanation: 'ETC generates ~32-34 ATP per glucose molecule via oxidative phosphorylation.' }
      ]
    },
    {
      id: 'quiz-bio-advanced',
      title: 'Biology - Advanced Category (15 Questions)',
      subjectId: 'bio',
      level: 'Advanced',
      questionCount: 15,
      timeLimitMinutes: 25,
      questions: [
        { id: 'ab1', question: 'What does CRISPR-Cas9 target to edit genes?', options: ['Protein folds', 'Specific DNA sequences guided by RNA', 'Ribosome structures', 'Cell membranes'], correctIndex: 1, explanation: 'CRISPR-Cas9 uses a single guide RNA (sgRNA) to cut specific genomic DNA targets.' },
        { id: 'ab2', question: 'What is the role of Cas9 in CRISPR gene editing?', options: ['Synthesizing RNA primers', 'Acts as molecular scissors to cut double-stranded DNA', 'Translating mRNA proteins', 'Replicating DNA strands'], correctIndex: 1, explanation: 'Cas9 is an endonuclease that creates double-strand cuts in target DNA.' },
        { id: 'ab3', question: 'What is PCR (Polymerase Chain Reaction) used for?', options: ['Sequencing proteins', 'Amplifying specific DNA segments', 'Synthesizing lipids', 'Growing bacterial colonies'], correctIndex: 1, explanation: 'PCR replicates/amplifies target DNA sequences exponentially in vitro.' },
        { id: 'ab4', question: 'Which enzyme unwinds the DNA double helix during replication?', options: ['DNA Polymerase', 'Helicase', 'Ligase', 'RNA Primase'], correctIndex: 1, explanation: 'Helicase separates double-stranded DNA templates by breaking hydrogen bonds.' },
        { id: 'ab5', question: 'What is epigenetic modification?', options: ['Alteration of the DNA base sequence', 'Heritable changes in gene expression without altering DNA sequence', 'Protein degradation', 'Viral gene insertions'], correctIndex: 1, explanation: 'Epigenetics includes DNA methylation and histone acetylation without modifying nucleotide sequence.' },
        { id: 'ab6', question: 'What is the function of the Golgi Apparatus?', options: ['ATP production', 'Modifying, sorting, and packaging proteins for secretion', 'RNA transcription', 'Lipid synthesis'], correctIndex: 1, explanation: 'Golgi modifies proteins coming from rough ER and packs them into vesicles.' },
        { id: 'ab7', question: 'Which cell type lacks membrane-bound organelles?', options: ['Eukaryote', 'Prokaryote', 'Plant Cell', 'Fungal Cell'], correctIndex: 1, explanation: 'Prokaryotic cells (like bacteria) lack nuclei or other membrane-bound organelles.' },
        { id: 'ab8', question: 'What is plasmid DNA?', options: ['Chromosomal nuclear DNA', 'Small, circular extrachromosomal DNA found in bacteria', 'Viral RNA fragments', 'Mitochondrial genes'], correctIndex: 1, explanation: 'Plasmids are independent circular DNA loops carrying auxiliary bacterial genes.' },
        { id: 'ab9', question: 'What is meiosis?', options: ['A asexual division', 'A cell division producing four genetically diverse haploid gametes', 'A metabolic pathway', 'An enzyme activation phase'], correctIndex: 1, explanation: 'Meiosis reduces chromosomal count by half to generate diverse gametes.' },
        { id: 'ab10', question: 'What is the primary role of tRNA in translation?', options: ['Carrying genetic code from nucleus', 'Transporting specific amino acids to ribosomes matching mRNA codons', 'Degrading misfolded proteins', 'Forming ribosomal structural units'], correctIndex: 1, explanation: 'Transfer RNA (tRNA) pairs anticodons with codons to deliver corresponding amino acids.' },
        { id: 'ab11', question: 'Which genetic condition is caused by a codominant allele system in humans?', options: ['Cystic Fibrosis', 'ABO Blood Group System', 'Hemophilia', 'Huntington Disease'], correctIndex: 1, explanation: 'A and B alleles are codominant, expressing AB blood groups simultaneously.' },
        { id: 'ab12', question: 'What represents the central dogma of molecular biology?', options: ['Protein -> RNA -> DNA', 'DNA -> RNA -> Protein', 'RNA -> DNA -> Protein', 'Lipids -> DNA -> RNA'], correctIndex: 1, explanation: 'Central dogma traces genetic flow from DNA replication, to transcription (RNA), to translation (Protein).' },
        { id: 'ab13', question: 'What type of mutation is characterized by a nucleotide insertion shifting the reading frame?', options: ['Missense Mutation', 'Nonsense Mutation', 'Frameshift Mutation', 'Silent Mutation'], correctIndex: 2, explanation: 'Insertions or deletions not in multiples of three disrupt coding frames (frameshift).' },
        { id: 'ab14', question: 'What is apoptosis?', options: ['Cell division cycle', 'Programmed cell death', 'Cell migration phase', 'Protein synthesis rate'], correctIndex: 1, explanation: 'Apoptosis is a clean, regulated process of programmed cellular self-destruction.' },
        { id: 'ab15', question: 'Which pathway converts pyruvate into lactic acid under anaerobic conditions?', options: ['Lactic Acid Fermentation', 'Krebs Cycle', 'Oxidative Phosphorylation', 'Glycogenesis'], correctIndex: 0, explanation: 'Fermentation recycles NAD+ in absence of oxygen by converting pyruvate to lactate.' }
      ]
    },

    // --------------------------------------------------------------------------
    // CHEMISTRY
    // --------------------------------------------------------------------------
    {
      id: 'quiz-chem-beginner',
      title: 'Chemistry - Beginner Category (5 Questions)',
      subjectId: 'chem',
      level: 'Beginner',
      questionCount: 5,
      timeLimitMinutes: 8,
      questions: [
        { id: 'bc1', question: 'What subatomic particle carries a negative charge?', options: ['Proton', 'Electron', 'Neutron', 'Photon'], correctIndex: 1, explanation: 'Electrons carry a negative charge (-1e).' },
        { id: 'bc2', question: 'What is the chemical formula for water?', options: ['CO2', 'H2O', 'NaCl', 'O2'], correctIndex: 1, explanation: 'Water consists of two hydrogen atoms bonded to one oxygen.' },
        { id: 'bc3', question: 'Which gas is essential for human respiration?', options: ['Nitrogen', 'Carbon Dioxide', 'Oxygen', 'Hydrogen'], correctIndex: 2, explanation: 'Human metabolic respiration requires diatomic Oxygen (O2).' },
        { id: 'bc4', question: 'What is the pH value of pure neutral water?', options: ['3', '7', '10', '14'], correctIndex: 1, explanation: 'Neutral water at 25°C has a pH of 7.0.' },
        { id: 'bc5', question: 'Which element is represented by the symbol "C"?', options: ['Calcium', 'Copper', 'Carbon', 'Chlorine'], correctIndex: 2, explanation: 'C is the atomic symbol for Carbon.' }
      ]
    },
    {
      id: 'quiz-chem-intermediate',
      title: 'Chemistry - Intermediate Category (10 Questions)',
      subjectId: 'chem',
      level: 'Intermediate',
      questionCount: 10,
      timeLimitMinutes: 15,
      questions: [
        { id: 'ic1', question: 'Which bond shares electrons between two non-metal atoms?', options: ['Ionic Bond', 'Covalent Bond', 'Metallic Bond', 'Hydrogen Bond'], correctIndex: 1, explanation: 'Covalent bonds involve the mutual sharing of valence electron pairs.' },
        { id: 'ic2', question: 'What is the Avogadro number of particles in a mole?', options: ['6.02x10^23', '3.00x10^8', '1.60x10^-19', '9.81x10^2'], correctIndex: 0, explanation: 'A mole contains 6.022x10^23 particles/mole.' },
        { id: 'ic3', question: 'Which functional group characterizes an alcohol?', options: ['-COOH', '-OH', '-CHO', '-NH2'], correctIndex: 1, explanation: 'Alcohols contain the hydroxyl (-OH) functional group.' },
        { id: 'ic4', question: 'State the ideal gas law equation.', options: ['V = IR', 'PV = nRT', 'F = ma', 'E = mc^2'], correctIndex: 1, explanation: 'Ideal gas law relates pressure (P), volume (V), moles (n), gas constant (R), and temperature (T).' },
        { id: 'ic5', question: 'What type of reaction releases heat energy into surroundings?', options: ['Endothermic Reaction', 'Exothermic Reaction', 'Synthesis Reaction', 'Decomposition'], correctIndex: 1, explanation: 'Exothermic processes release heat (negative enthalpy change).' },
        { id: 'ic6', question: 'Which acid is found in stomach juices?', options: ['Sulfuric Acid', 'Acetic Acid', 'Hydrochloric Acid', 'Nitric Acid'], correctIndex: 2, explanation: 'Gastric acid contains dilute Hydrochloric acid (HCl).' },
        { id: 'ic7', question: 'What is the atomic number representing protons in an atom of Helium?', options: ['1', '2', '4', '8'], correctIndex: 1, explanation: 'Helium has 2 protons (atomic number 2).' },
        { id: 'ic8', question: 'What is the main component of organic compounds?', options: ['Silicon', 'Nitrogen', 'Carbon', 'Iron'], correctIndex: 2, explanation: 'Organic chemistry studies carbon-chain compounds.' },
        { id: 'ic9', question: 'What is a catalyst?', options: ['A reactant consumed', 'A substance speeding up reactions without being consumed', 'A cooling agent', 'A solvent choice'], correctIndex: 1, explanation: 'Catalysts lower activation energy to speed up reactions.' },
        { id: 'ic10', question: 'What is the name for positive ions?', options: ['Anions', 'Cations', 'Electrons', 'Isotopes'], correctIndex: 1, explanation: 'Cations are positively charged ions (e.g. Na+).' }
      ]
    },
    {
      id: 'quiz-chem-advanced',
      title: 'Chemistry - Advanced Category (15 Questions)',
      subjectId: 'chem',
      level: 'Advanced',
      questionCount: 15,
      timeLimitMinutes: 25,
      questions: [
        { id: 'ac1', question: 'Which equation represents Gibbs Free Energy spontaneity condition?', options: ['ΔG = ΔH - TΔS', 'PV = nRT', 'pH = -log[H+]', 'Rate = k[A]'], correctIndex: 0, explanation: 'Spontaneous reactions require negative change in Gibbs energy ΔG = ΔH - TΔS < 0.' },
        { id: 'ac2', question: 'In organic mechanisms, what characterizes an SN2 reaction?', options: ['Two-step carbocation pathway', 'One-step bimolecular backside attack with inversion', 'Free radical addition', 'Acid-base neutralization'], correctIndex: 1, explanation: 'SN2 features a single-step concerted backside attack causing stereochemical inversion.' },
        { id: 'ac3', question: 'Which equation expresses the Arrhenius relationship for reaction rates?', options: ['k = Ae^(-Ea/RT)', 'PV = nRT', 'ΔG = -RT ln K', 'pH = pKa + log(base/acid)'], correctIndex: 0, explanation: 'Arrhenius equation scales rate constants k with activation energy Ea and temperature.' },
        { id: 'ac4', question: 'What is the hybridization of carbon in ethylene (C2H4)?', options: ['sp', 'sp2', 'sp3', 'dsp2'], correctIndex: 1, explanation: 'Double-bonded carbons in ethylene are sp2 hybridized (trigonal planar).' },
        { id: 'ac5', question: 'According to Le Chatelier principle, what happens if volume is decreased in a gaseous system?', options: ['Reaction shifts to side with more gas moles', 'Reaction shifts to side with fewer gas moles', 'Reaction stops completely', 'Temperature goes to absolute zero'], correctIndex: 1, explanation: 'Decreasing volume increases pressure, shifting equilibrium to reduce gas volume moles.' },
        { id: 'ac6', question: 'Which law states that total enthalpy change of a reaction is equal to the sum of changes of its steps?', options: ['Boyles Law', 'Hess Law', 'Charles Law', 'Daltons Law'], correctIndex: 1, explanation: 'Hess Law states enthalpy changes are state functions independent of path.' },
        { id: 'ac7', question: 'What is the conjugate base of HSO4-?', options: ['H2SO4', 'SO4^2-', 'H3O+', 'OH-'], correctIndex: 1, explanation: 'Losing a proton converts HSO4- to sulfate ion SO4^2-.' },
        { id: 'ac8', question: 'What determines the rate-determining step in reaction mechanisms?', options: ['The fastest step', 'The slowest step', 'The first step', 'The final product step'], correctIndex: 1, explanation: 'The slowest elementary step acts as the bottleneck for overall reaction rates.' },
        { id: 'ac9', question: 'What does a buffer solution resist?', options: ['Changes in volume', 'Changes in temperature', 'Changes in pH upon adding small amounts of acid/base', 'Chemical spontaneous phase changes'], correctIndex: 2, explanation: 'Weak acid-conjugate base buffer pairs maintain stable pH profiles.' },
        { id: 'ac10', question: 'Which quantum number represents the electron spin orientation?', options: ['n', 'l', 'ml', 'ms'], correctIndex: 3, explanation: 'Spin quantum number ms takes values of +1/2 or -1/2.' },
        { id: 'ac11', question: 'What represents the Nernst equation for cell potential?', options: ['E = E° - (RT/nF) ln Q', 'ΔG = -nFE', 'PV = nRT', 'K = [products]/[reactants]'], correctIndex: 0, explanation: 'Nernst equation computes non-standard electrochemical potentials using reaction quotient Q.' },
        { id: 'ac12', question: 'What is the shape of a molecule with sp3d hybridization and zero lone pairs?', options: ['Octahedral', 'Trigonal Bipyramidal', 'Tetrahedral', 'Linear'], correctIndex: 1, explanation: 'Five electron pairs organize into a trigonal bipyramidal geometry.' },
        { id: 'ac13', question: 'Which thermodynamic law establishes that entropy of a pure crystalline substance at 0 K is zero?', options: ['Zeroth Law', 'First Law', 'Second Law', 'Third Law'], correctIndex: 3, explanation: 'Third Law of Thermodynamics defines absolute zero entropy standards.' },
        { id: 'ac14', question: 'What is the oxidation state of sulfur in H2SO4?', options: ['+4', '+6', '-2', '0'], correctIndex: 1, explanation: '2(+1) + S + 4(-2) = 0. Solving for S yields +6.' },
        { id: 'ac15', question: 'Which rule states that orbitals are filled singly with parallel spins before pairing?', options: ['Aufbau Principle', 'Pauli Exclusion Principle', 'Hund Rule', 'Markovnikov Rule'], correctIndex: 2, explanation: 'Hund Rule minimizes electron repulsion by maximizing spin alignment.' }
      ]
    }
  ],

  badges: [
    { id: 'b-1', title: 'Quick Starter', icon: 'zap', desc: 'Completed initial profile onboarding assessment', unlocked: true, date: '2026-07-20' },
    { id: 'b-ai-1', title: 'AI Enrollee', icon: 'cpu', desc: 'Enrolled in Artificial Intelligence Masterclass', unlocked: true, date: '2026-07-20' }
  ],

  defaultUsers: [
    {
      id: 'u-1',
      name: 'Afreen Kazi',
      email: 'alex@student.ai',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      gradeClass: 'Grade 11',
      preferredStyle: 'visual',
      secondaryStyle: 'kinesthetic',
      skillLevel: 'Intermediate',
      careerGoal: 'AI & Machine Learning Engineer',
      interests: ['ds', 'math'],
      enrolledCourseIds: ['course-ai-101', 'course-math-101'],
      completedResourceIds: ['res-ai-road-1'],
      bookmarkedResourceIds: [],
      dailyGoalMinutes: 30,
      todayStudiedMinutes: 25,
      streakDays: 6,
      recentActivity: [
        { title: 'Enrolled in All 6 Subject Video Pathways', time: 'Just now', icon: 'graduation-cap' }
      ]
    }
  ]
};
