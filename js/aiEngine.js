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

  chatWithAi: async function(message, history, user, currentCourseId) {
    try {
      const res = await fetch(this.getApiBase() + '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history, user, currentCourseId })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("API chat error, falling back to local client chatbot engine:", e);
    }
    return this._localChatWithAi(message, history, user, currentCourseId);
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
  },

  _localChatWithAi: function(message, history, user, currentCourseId) {
    if (!message) {
      return {
        reply: "Hello! I am your **LearnAI Pro Tutor**. How can I help you today with your courses or concepts?",
        suggestions: ["What should I study next?", "Explain Backpropagation", "Explain Big-O Notation", "How do quizzes work?"],
        action: null
      };
    }

    const msgLower = message.toLowerCase().trim();
    const userName = (user && user.name) ? user.name : 'Student';
    const userClass = (user && user.gradeClass) ? user.gradeClass : 'Grade 11';
    const userStyle = (user && user.preferredStyle) ? user.preferredStyle : 'visual';
    const careerGoal = (user && user.careerGoal) ? user.careerGoal : 'AI & Machine Learning Engineer';
    const enrolledIds = (user && user.enrolledCourseIds) ? user.enrolledCourseIds : [];

    // Greetings
    if (['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'who are you'].some(g => msgLower.startsWith(g) || msgLower === g) && msgLower.length < 25) {
      return {
        reply: `Hello **${userName}**! 👋 I'm your personalized **LearnAI Pro Tutor**.\n\nI see you're in **${userClass}** focusing on **${careerGoal}** with a **${userStyle.toUpperCase()}** learning style.\n\nYou can ask me doubts about:\n- 🧠 **AI & Machine Learning** (Neural networks, Transformers, Backpropagation, CNNs)\n- 💻 **Computer Science** (Algorithms, Data structures, Big-O, Python/JS)\n- 📐 **Mathematics** (Calculus, Linear Algebra, Matrix operations)\n- ⚡ **Physics** (Mechanics, Electromagnetism, Quantum basics)\n- 🧬 **Biology & Biotech** (CRISPR, DNA, Cell biology)\n- 🧪 **Chemistry** (Molecules, Reactions, Kinetics)\n- 📚 **Your Course Hub, Roadmaps, Quizzes & Study Plans**\n\nWhat would you like to explore or clarify?`,
        suggestions: ["What should I study next?", "Explain Backpropagation simply", "Explain Big-O Complexity", "Recommend courses for my career"],
        action: null
      };
    }

    // Courses & Enrolled summary
    if (['my course', 'enrolled', 'what courses am i', 'my progress', 'what am i studying', 'current course'].some(k => msgLower.includes(k))) {
      const courseNames = {
        'course-ai-101': '🤖 AI & Neural Networks Masterclass',
        'course-cs-101': '💻 Computer Science & Software Engineering Pathway',
        'course-math-101': '📐 Mathematics & Applied Analytics Mastery',
        'course-physics-101': '⚡ Physics, Mechanics & Quantum Systems',
        'course-bio-101': '🧬 Genetics, Cell Biology & Biotechnology',
        'course-chem-101': '🧪 Chemistry, Organic Synthesis & Molecules'
      };
      const enrolledTitles = enrolledIds.map(cid => courseNames[cid] || cid);
      return {
        reply: `Here is a summary of your active learning profile, **${userName}**:\n\n🎓 **Enrolled Courses (${enrolledTitles.length || 2}):**\n` +
          (enrolledTitles.length > 0 ? enrolledTitles.map(t => `- ${t}`).join('\n') : `- 🤖 AI & Neural Networks Masterclass\n- 📐 Mathematics & Applied Analytics Mastery`) +
          `\n\n📊 **Current Target**: ${careerGoal}\n🎯 **Learning Style**: ${userStyle.toUpperCase()} (Tailoring visual diagrams & structured step-by-step roadmaps for you!)\n\nWhich course would you like to dive into right now?`,
        suggestions: ["Open AI Masterclass", "View My Roadmap", "Take a Skill Quiz", "Check Study Notes"],
        action: { type: 'navigate', view: 'courses', label: '🎓 Open Enrolled Courses Hub' }
      };
    }

    // Next study recommendation
    if (['study next', 'what should i study', 'recommend next', 'next step', 'recommendation', 'what to learn'].some(k => msgLower.includes(k))) {
      return {
        reply: `Based on your profile as a **${userClass}** student aiming to become an **${careerGoal}**:\n\n### 🎯 Recommended Learning Sequence:\n1. **Core AI Milestone**: Dive into **Perceptrons & Backpropagation Math** in the *AI & Neural Networks Masterclass*.\n2. **Math Foundation**: Review **Differential Calculus & Matrix Operations** (essential for gradient descent).\n3. **Skill Check**: Take the **Intermediate AI Quiz (10 Questions)** to test your comprehension and calibrate your mastery score.\n\n💡 *Pro-Tip for ${userStyle.toUpperCase()} Learners*: Pay special attention to the embedded 3D computation graphs and weight flow diagrams in the video lectures!`,
        suggestions: ["Explain Backpropagation", "Explain Gradient Descent", "Open Learning Roadmap", "Start Skill Quiz"],
        action: { type: 'navigate', view: 'roadmap', subject: 'ds', label: '🗺️ View AI Learning Roadmap' }
      };
    }

    // AI & DS Doubts
    if (['backpropagation', 'backprop', 'gradient descent', 'neural network', 'perceptron', 'cnn', 'transformer', 'overfitting', 'activation function', 'relu', 'loss function', 'deep learning', 'machine learning', 'llm', 'attention mechanism'].some(k => msgLower.includes(k))) {
      if (msgLower.includes('backpropagation') || msgLower.includes('backprop')) {
        return {
          reply: `### 🧠 How Backpropagation Works (Step-by-Step):\n\n**Backpropagation** (backward propagation of errors) is the mathematical engine used to train artificial neural networks using the **Chain Rule of Calculus**.\n\n#### 1. The Forward Pass\nInput data $X$ travels through layers: each neuron computes $z = W \\cdot X + b$, followed by an activation function $a = \\sigma(z)$. The final layer produces prediction $\\hat{y}$.\n\n#### 2. Loss Calculation\nThe loss function measures error between prediction $\\hat{y}$ and true label $y$:\n$$\\mathcal{L} = \\frac{1}{2} (\\hat{y} - y)^2$$\n\n#### 3. The Backward Pass (Gradients)\nUsing the chain rule, we compute the gradient of loss with respect to each weight:\n$$\\frac{\\partial \\mathcal{L}}{\\partial W} = \\frac{\\partial \\mathcal{L}}{\\partial \\hat{y}} \\cdot \\frac{\\partial \\hat{y}}{\\partial z} \\cdot \\frac{\\partial z}{\\partial W}$$\n\n#### 4. Weight Update (Gradient Descent)\nWeights are updated in the opposite direction of the gradient:\n$$W_{\\text{new}} = W_{\\text{old}} - \\alpha \\cdot \\frac{\\partial \\mathcal{L}}{\\partial W}$$\n*(where $\\alpha$ is the learning rate)*.\n\n👁️ **Visual Analogy**: Imagine rolling a ball down a hilly fog-covered terrain. The gradient tells the ball which direction is steepest downhill to reach the lowest valley (minimum loss)!`,
          suggestions: ["What is Gradient Descent?", "Explain Activation Functions (ReLU vs Sigmoid)", "What is Overfitting?", "Open AI Course"],
          action: { type: 'navigate', view: 'course-hub', courseId: 'course-ai-101', label: '🎥 Watch Perceptrons & Backpropagation Video' }
        };
      } else if (msgLower.includes('gradient descent')) {
        return {
          reply: `### 📉 Gradient Descent Explained:\n\n**Gradient Descent** is an optimization algorithm that iteratively adjusts parameters (weights & biases) to minimize a model's cost/loss function.\n\n\`\`\`python\n# Gradient Descent Optimization in Python\ndef gradient_descent(x_start, learning_rate=0.01, epochs=100):\n    x = x_start\n    for _ in range(epochs):\n        # Derivative of Loss function f(x) = x^2 is 2*x\n        gradient = 2 * x\n        x = x - (learning_rate * gradient)\n    return x\n\`\`\`\n\n#### 3 Main Variants:\n1. **Batch Gradient Descent**: Computes loss on the entire dataset per epoch.\n2. **Stochastic (SGD)**: Updates weights after every single training example (faster but noisy).\n3. **Mini-Batch SGD**: Updates weights on small batches (e.g. 32, 64 samples) — the industry standard!`,
          suggestions: ["What is Learning Rate?", "What is Adam Optimizer?", "Explain Neural Networks", "Open AI Roadmap"],
          action: null
        };
      } else if (msgLower.includes('transformer') || msgLower.includes('attention') || msgLower.includes('llm')) {
        return {
          reply: `### 🤖 Transformers & Self-Attention Explained:\n\nThe **Transformer architecture** (introduced in *'Attention Is All You Need'*, 2017) revolutionized modern AI and powers models like GPT, Gemini, and Claude.\n\n#### Core Components:\n1. **Self-Attention Mechanism**: Allows every word in a sentence to look at all other words and assign relevance scores.\n2. **Query, Key, Value (Q, K, V) Vectors**:\n$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right) V$$\n3. **Multi-Head Attention**: Lets the model attend to information from different representation subspaces simultaneously.\n4. **Positional Encoding**: Injects sequence order without requiring recurrent loops (enabling massive parallelization on GPUs).`,
          suggestions: ["Explain CNNs", "How do LLMs generate text?", "Take AI Quiz", "Open AI Course"],
          action: { type: 'navigate', view: 'course-hub', courseId: 'course-ai-101', label: '🎥 Watch Transformers & LLM Video Lecture' }
        };
      } else {
        return {
          reply: `### 🧠 Artificial Intelligence & Deep Learning:\n\nIn your **AI & Neural Networks** course, we study how artificial neurons simulate biological learning:\n- **Perceptrons**: Linear classifiers that compute weighted sums and apply non-linear thresholding.\n- **Activation Functions**: Non-linear activations like **ReLU** $(f(x) = \\max(0, x))$, **Sigmoid**, and **Softmax** allow networks to learn complex decision boundaries.\n- **Deep Architectures**: CNNs for vision, Transformers for sequence/language, and GNNs for relational data.`,
          suggestions: ["Explain Backpropagation", "Explain Transformers", "Open AI Masterclass"],
          action: { type: 'navigate', view: 'course-hub', courseId: 'course-ai-101', label: '🚀 Open AI Course' }
        };
      }
    }

    // CS Doubts
    if (['big o', 'big-o', 'complexity', 'data structure', 'algorithm', 'recursion', 'binary search', 'linked list', 'array', 'stack', 'queue', 'tree', 'graph', 'sorting', 'quicksort', 'oop', 'python', 'javascript'].some(k => msgLower.includes(k))) {
      if (msgLower.includes('big o') || msgLower.includes('big-o') || msgLower.includes('complexity')) {
        return {
          reply: `### ⚡ Big-O Notation & Time Complexity:\n\n**Big-O notation** measures how the runtime or memory space of an algorithm scales as the input size $N$ grows toward infinity.\n\n| Complexity | Name | Example Algorithm |\n| :--- | :--- | :--- |\n| **$O(1)$** | Constant | Accessing array element \`arr[i]\` |\n| **$O(\\log N)$** | Logarithmic | Binary Search in sorted array |\n| **$O(N)$** | Linear | Single \`for\` loop over an array |\n| **$O(N \\log N)$** | Linearithmic | Merge Sort, Quick Sort (avg) |\n| **$O(N^2)$** | Quadratic | Nested loops (Bubble Sort) |\n| **$O(2^N)$** | Exponential | Recursive Fibonacci without memoization |\n\n\`\`\`python\n# Example: O(log N) Binary Search\ndef binary_search(arr, target):\n    left, right = 0, len(arr) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if arr[mid] == target: return mid\n        elif arr[mid] < target: left = mid + 1\n        else: right = mid - 1\n    return -1\n\`\`\``,
          suggestions: ["Explain Binary Search", "What is Recursion?", "Open CS Pathway Course", "Take CS Quiz"],
          action: { type: 'navigate', view: 'course-hub', courseId: 'course-cs-101', label: '💻 Open Computer Science Pathway' }
        };
      } else {
        return {
          reply: `### 💻 Computer Science Foundations:\n\nIn computer science, mastering data structures and algorithmic thinking is key:\n- **Linear Structures**: Arrays, Linked Lists, Stacks (LIFO), Queues (FIFO).\n- **Non-Linear Structures**: Binary Search Trees, Heaps, Hash Tables, and Directed Graphs.\n- **Core Paradigms**: Divide-and-Conquer, Dynamic Programming, Greedy Algorithms.`,
          suggestions: ["Explain Big-O Notation", "Explain Binary Search", "Open CS Course"],
          action: { type: 'navigate', view: 'course-hub', courseId: 'course-cs-101', label: '🚀 Open CS Pathway' }
        };
      }
    }

    // Math Doubts
    if (['calculus', 'derivative', 'integral', 'linear algebra', 'matrix', 'vector', 'eigenvalue', 'dot product', 'probability', 'statistics', 'math', 'algebra'].some(k => msgLower.includes(k))) {
      return {
        reply: `### 📐 Differential Calculus & Linear Algebra:\n\n- **Derivative**: Measures the instantaneous rate of change: $f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$.\n- **Chain Rule**: $\\frac{d}{dx}[f(g(x))] = f'(g(x)) \\cdot g'(x)$ — essential for AI backpropagation!\n- **Vector Dot Product**: $\\mathbf{a} \\cdot \\mathbf{b} = \\sum_{i=1}^n a_i b_i = |\\mathbf{a}| |\\mathbf{b}| \\cos(\\theta)$ — powers cosine similarity & attention in neural networks.`,
        suggestions: ["Explain Derivatives in AI", "Explain Vector Dot Product", "Open Math Course", "Take Math Quiz"],
        action: { type: 'navigate', view: 'course-hub', courseId: 'course-math-101', label: '📐 Open Math Course' }
      };
    }

    // Physics Doubts
    if (['physics', 'newton', 'quantum', 'mechanics', 'electromagnetism', 'kinematics', 'velocity', 'gravity', 'schrodinger', 'wave function'].some(k => msgLower.includes(k))) {
      return {
        reply: `### ⚡ Physics & Quantum Systems:\n\n- **Newton's 2nd Law**: Force equals rate of change of momentum: $\\mathbf{F} = m \\cdot \\mathbf{a}$.\n- **Conservation of Energy**: Total mechanical energy $E = K + U$ is conserved in isolated systems.\n- **Quantum Wave Function $\\Psi$**: Governed by the Schrödinger equation $i\\hbar \\frac{\\partial}{\\partial t} \\Psi = \\hat{H} \\Psi$, where $|\\Psi|^2$ gives the probability density of finding a particle.`,
        suggestions: ["Explain Newton's Laws", "Explain Quantum Mechanics", "Open Physics Course", "Take Physics Quiz"],
        action: { type: 'navigate', view: 'course-hub', courseId: 'course-physics-101', label: '⚡ Open Physics Course' }
      };
    }

    // Biology Doubts
    if (['biology', 'cell', 'dna', 'crispr', 'gene', 'mitochondria', 'transcription', 'translation', 'genetics', 'bioinformatics'].some(k => msgLower.includes(k))) {
      return {
        reply: `### 🧬 Biology & Genetic Engineering:\n\n- **Central Dogma**: $\\text{DNA} \\xrightarrow{\\text{Transcription}} \\text{mRNA} \\xrightarrow{\\text{Translation}} \\text{Protein}$.\n- **CRISPR-Cas9**: Programmable endonuclease utilizing guide RNA to achieve targeted gene disruption and insertion.\n- **Bioinformatics**: Applying computational algorithms to model protein folding and sequence alignments.`,
        suggestions: ["Explain DNA Transcription vs Translation", "How does CRISPR-Cas9 work?", "Open Biology Course", "Take Bio Quiz"],
        action: { type: 'navigate', view: 'course-hub', courseId: 'course-bio-101', label: '🧬 Open Genetics Course' }
      };
    }

    // Chemistry Doubts
    if (['chemistry', 'atom', 'periodic table', 'chemical bond', 'reaction', 'organic', 'thermodynamics', 'kinetics', 'molecule'].some(k => msgLower.includes(k))) {
      return {
        reply: `### 🧪 Chemistry & Molecular Science:\n\n- **Bonding**: Ionic (electron transfer) vs Covalent (electron sharing).\n- **Periodic Trends**: Electronegativity increases across a period and decreases down a group.\n- **Kinetics & Arrhenius Law**: $k = A e^{-E_a / (RT)}$, indicating reaction rate exponential sensitivity to temperature.`,
        suggestions: ["Explain Covalent vs Ionic Bonds", "What is Le Chatelier's Principle?", "Open Chemistry Course", "Take Chem Quiz"],
        action: { type: 'navigate', view: 'course-hub', courseId: 'course-chem-101', label: '🧪 Open Chemistry Course' }
      };
    }

    // Default response
    return {
      reply: `I'm here to assist you, **${userName}**!\n\nRegarding *"${message}"*:\nAs your **LearnAI Pro Tutor**, I can break down any course concepts step-by-step, review curriculum prerequisites, provide code snippets, or guide your learning path.\n\nSince your profile is set to **${userClass}** with a **${userStyle.toUpperCase()}** style, I can tailor explanations with visual analogies, diagrams, and code demonstrations.\n\nFeel free to ask a specific question, or choose a topic below:`,
      suggestions: [
        "Explain Backpropagation in AI",
        "Explain Big-O Time Complexity",
        "What is Matrix Dot Product?",
        "What courses should I take next?"
      ],
      action: null
    };
  }
};

