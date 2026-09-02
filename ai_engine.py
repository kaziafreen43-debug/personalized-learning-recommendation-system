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
    return updated_user

def chat_with_ai(message, history=None, user=None, current_course_id=None, app_data=None):
    """
    Intelligent educational AI tutor assistant that resolves course doubts, 
    explains complex concepts step-by-step, aligns explanations with the student's
    grade level and VARK learning style, and provides contextual action triggers.
    """
    if not message:
        return {
            'reply': "Hello! I am your **LearnAI Pro Tutor**. How can I help you today with your courses or concepts?",
            'suggestions': ["What should I study next?", "Explain Backpropagation", "Explain Big-O Notation", "How do quizzes work?"],
            'action': None
        }

    msg_lower = message.lower().strip()
    user_name = (user.get('name') if user else 'Student') or 'Student'
    user_class = (user.get('gradeClass') if user else 'Grade 11') or 'Grade 11'
    user_style = (user.get('preferredStyle') if user else 'visual') or 'visual'
    career_goal = (user.get('careerGoal') if user else 'AI & Machine Learning Engineer') or 'AI & Machine Learning Engineer'
    enrolled_ids = (user.get('enrolledCourseIds') if user else []) or []
    interests = (user.get('interests') if user else ['ds', 'math']) or ['ds', 'math']

    # -------------------------------------------------------------
    # 1. GREETINGS & INTRODUCTIONS
    # -------------------------------------------------------------
    if any(greet in msg_lower for greet in ['hello', 'hi ', 'hey', 'good morning', 'good afternoon', 'good evening', 'who are you']) and len(msg_lower) < 25:
        reply = (
            f"Hello **{user_name}**! 👋 I'm your personalized **LearnAI Pro Tutor**.\n\n"
            f"I see you're in **{user_class}** focusing on **{career_goal}** with a **{user_style.upper()}** learning style.\n\n"
            "You can ask me anything about:\n"
            "- 🧠 **AI & Machine Learning** (Neural networks, Transformers, CNNs, Python)\n"
            "- 💻 **Computer Science** (Algorithms, Data structures, Big-O, Python/JS)\n"
            "- 📐 **Mathematics** (Calculus, Linear Algebra, Statistics)\n"
            "- ⚡ **Physics** (Mechanics, Electromagnetism, Quantum basics)\n"
            "- 🧬 **Biology & Biotech** (CRISPR, DNA, Cell biology)\n"
            "- 🧪 **Chemistry** (Molecules, Organic reactions, Kinetics)\n"
            "- 📚 **Your Course Hub, Roadmaps, Quizzes & Study Plans**\n\n"
            "What would you like to explore or clarify today?"
        )
        return {
            'reply': reply,
            'suggestions': [
                "What should I study next?",
                "Explain Backpropagation simply",
                "Explain Big-O Complexity",
                "Recommend courses for my career"
            ],
            'action': None
        }

    # -------------------------------------------------------------
    # 2. STUDENT ENROLLED COURSES & PROGRESS QUERY
    # -------------------------------------------------------------
    if any(k in msg_lower for k in ['my course', 'enrolled', 'what courses am i', 'my progress', 'what am i studying', 'current course']):
        course_names = {
            'course-ai-101': '🤖 AI & Neural Networks Masterclass',
            'course-cs-101': '💻 Computer Science & Software Engineering Pathway',
            'course-math-101': '📐 Mathematics & Applied Analytics Mastery',
            'course-physics-101': '⚡ Physics, Mechanics & Quantum Systems',
            'course-bio-101': '🧬 Genetics, Cell Biology & Biotechnology',
            'course-chem-101': '🧪 Chemistry, Organic Synthesis & Molecules'
        }
        enrolled_titles = [course_names.get(cid, cid) for cid in enrolled_ids]
        if not enrolled_titles:
            enrolled_titles = ['🤖 AI & Neural Networks Masterclass', '📐 Mathematics & Applied Analytics Mastery']
        
        reply = (
            f"Here is a summary of your active learning profile, **{user_name}**:\n\n"
            f"🎓 **Enrolled Courses ({len(enrolled_titles)}):**\n"
            + "\n".join([f"- {title}" for title in enrolled_titles]) + "\n\n"
            f"📊 **Current Target**: {career_goal}\n"
            f"🎯 **Learning Style**: {user_style.capitalize()} (Tailoring visual diagrams & structured step-by-step roadmaps for you!)\n\n"
            "Which course would you like to dive into right now?"
        )
        return {
            'reply': reply,
            'suggestions': ["Open AI Masterclass", "View My Roadmap", "Take a Skill Quiz", "Check Study Notes"],
            'action': {
                'type': 'navigate',
                'view': 'courses',
                'label': '🎓 Open Enrolled Courses Hub'
            }
        }

    # -------------------------------------------------------------
    # 3. WHAT SHOULD I STUDY NEXT / RECOMMENDATIONS
    # -------------------------------------------------------------
    if any(k in msg_lower for k in ['study next', 'what should i study', 'recommend next', 'next step', 'recommendation', 'what to learn']):
        reply = (
            f"Based on your profile as a **{user_class}** student aiming to become an **{career_goal}**:\n\n"
            "### 🎯 Recommended Learning Sequence:\n"
            "1. **Core AI Milestone**: Dive into **Perceptrons & Backpropagation Math** in the *AI & Neural Networks Masterclass*.\n"
            "2. **Math Foundation**: Review **Differential Calculus & Matrix Operations** (essential for gradient descent).\n"
            "3. **Skill Check**: Take the **Intermediate AI Quiz (10 Questions)** to test your comprehension and calibrate your mastery score.\n\n"
            f"💡 *Pro-Tip for {user_style.capitalize()} Learners*: Pay special attention to the embedded 3D computation graphs and weight flow diagrams in the video lectures!"
        )
        return {
            'reply': reply,
            'suggestions': ["Explain Backpropagation", "Explain Gradient Descent", "Open Learning Roadmap", "Start Skill Quiz"],
            'action': {
                'type': 'navigate',
                'view': 'roadmap',
                'subject': 'ds',
                'label': '🗺️ View AI Learning Roadmap'
            }
        }

    # -------------------------------------------------------------
    # 4. SUBJECT DOUBTS: ARTIFICIAL INTELLIGENCE & DATA SCIENCE
    # -------------------------------------------------------------
    if any(k in msg_lower for k in ['backpropagation', 'backprop', 'gradient descent', 'neural network', 'perceptron', 'cnn', 'transformer', 'overfitting', 'activation function', 'relu', 'loss function', 'machine learning', 'deep learning', 'llm', 'attention mechanism']):
        if 'backpropagation' in msg_lower or 'backprop' in msg_lower:
            reply = (
                "### 🧠 How Backpropagation Works (Step-by-Step):\n\n"
                "**Backpropagation** (backward propagation of errors) is the mathematical engine used to train artificial neural networks using the **Chain Rule of Calculus**.\n\n"
                "#### 1. The Forward Pass\n"
                "Input data $X$ travels through layers: each neuron computes $z = W \\cdot X + b$, followed by an activation function $a = \\sigma(z)$. The final layer produces prediction $\\hat{y}$.\n\n"
                "#### 2. Loss Calculation\n"
                "The loss function measures error between prediction $\\hat{y}$ and true label $y$:\n"
                "$$\\mathcal{L} = \\frac{1}{2} (\\hat{y} - y)^2$$\n\n"
                "#### 3. The Backward Pass (Gradients)\n"
                "Using the chain rule, we compute the gradient of loss with respect to each weight:\n"
                "$$\\frac{\\partial \\mathcal{L}}{\\partial W} = \\frac{\\partial \\mathcal{L}}{\\partial \\hat{y}} \\cdot \\frac{\\partial \\hat{y}}{\\partial z} \\cdot \\frac{\\partial z}{\\partial W}$$\n\n"
                "#### 4. Weight Update (Gradient Descent)\n"
                "Weights are updated in the opposite direction of the gradient:\n"
                "$$W_{\\text{new}} = W_{\\text{old}} - \\alpha \\cdot \\frac{\\partial \\mathcal{L}}{\\partial W}$$\n"
                "*(where $\\alpha$ is the learning rate)*.\n\n"
                "👁️ **Visual Analogy**: Imagine rolling a ball down a hilly fog-covered terrain. The gradient tells the ball which direction is steepest downhill to reach the lowest valley (minimum loss)!"
            )
            return {
                'reply': reply,
                'suggestions': ["What is Gradient Descent?", "Explain Activation Functions (ReLU vs Sigmoid)", "What is Overfitting?", "Open AI Course"],
                'action': {
                    'type': 'navigate',
                    'view': 'course-hub',
                    'courseId': 'course-ai-101',
                    'label': '🎥 Watch Perceptrons & Backpropagation Video'
                }
            }
        elif 'gradient descent' in msg_lower:
            reply = (
                "### 📉 Gradient Descent Explained:\n\n"
                "**Gradient Descent** is an optimization algorithm that iteratively adjusts parameters (weights & biases) to minimize a model's cost/loss function.\n\n"
                "```python\n"
                "# Gradient Descent Optimization in Python\n"
                "def gradient_descent(x_start, learning_rate=0.01, epochs=100):\n"
                "    x = x_start\n"
                "    for _ in range(epochs):\n"
                "        # Derivative of Loss function f(x) = x^2 is 2*x\n"
                "        gradient = 2 * x\n"
                "        x = x - (learning_rate * gradient)\n"
                "    return x\n"
                "```\n\n"
                "#### 3 Main Variants:\n"
                "1. **Batch Gradient Descent**: Computes loss on the entire dataset per epoch.\n"
                "2. **Stochastic (SGD)**: Updates weights after every single training example (faster but noisy).\n"
                "3. **Mini-Batch SGD**: Updates weights on small batches (e.g. 32, 64 samples) — the industry standard!"
            )
            return {
                'reply': reply,
                'suggestions': ["What is Learning Rate?", "What is Adam Optimizer?", "Explain Neural Networks", "Open AI Roadmap"],
                'action': None
            }
        elif 'transformer' in msg_lower or 'attention' in msg_lower or 'llm' in msg_lower:
            reply = (
                "### 🤖 Transformers & Self-Attention Explained:\n\n"
                "The **Transformer architecture** (introduced in *'Attention Is All You Need'*, 2017) revolutionized modern AI and powers models like GPT, Gemini, and Claude.\n\n"
                "#### Core Components:\n"
                "1. **Self-Attention Mechanism**: Allows every word in a sentence to look at all other words and assign relevance scores.\n"
                "2. **Query, Key, Value (Q, K, V) Vectors**:\n"
                "$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right) V$$\n"
                "3. **Multi-Head Attention**: Lets the model attend to information from different representation subspaces simultaneously.\n"
                "4. **Positional Encoding**: Injects sequence order without requiring recurrent loops (enabling massive parallelization on GPUs)."
            )
            return {
                'reply': reply,
                'suggestions': ["Explain CNNs", "How do LLMs generate text?", "Take AI Quiz", "Open AI Course"],
                'action': {
                    'type': 'navigate',
                    'view': 'course-hub',
                    'courseId': 'course-ai-101',
                    'label': '🎥 Watch Transformers & LLM Video Lecture'
                }
            }
        elif 'overfitting' in msg_lower or 'underfitting' in msg_lower:
            reply = (
                "### ⚖️ Overfitting vs Underfitting:\n\n"
                "- **Overfitting (High Variance)**: The model memorizes training noise and details. Performs 99% on training data but poorly on unseen test data.\n"
                "  - *Fixes*: Add L1/L2 Regularization, Dropout layers, collect more data, early stopping.\n"
                "- **Underfitting (High Bias)**: The model is too simple to capture underlying patterns (e.g., fitting a straight line to a parabola).\n"
                "  - *Fixes*: Increase model complexity, train longer, add relevant features.\n\n"
                "🎯 *Goal*: Achieve the sweet spot with minimal generalization error!"
            )
            return {
                'reply': reply,
                'suggestions': ["What is Dropout in Neural Networks?", "Explain Backpropagation", "Take AI Quiz"],
                'action': None
            }
        else:
            reply = (
                "### 🧠 Artificial Intelligence & Deep Learning:\n\n"
                "In your **AI & Neural Networks** course, we study how artificial neurons simulate biological learning:\n"
                "- **Perceptrons**: Linear classifiers that compute weighted sums and apply non-linear thresholding.\n"
                "- **Activation Functions**: Non-linear activations like **ReLU** $(f(x) = \\max(0, x))$, **Sigmoid**, and **Softmax** allow networks to learn complex decision boundaries.\n"
                "- **Deep Architectures**: CNNs for vision, Transformers for sequence/language, and GNNs for relational data."
            )
            return {
                'reply': reply,
                'suggestions': ["Explain Backpropagation", "Explain Transformers", "Open AI Masterclass"],
                'action': {
                    'type': 'navigate',
                    'view': 'course-hub',
                    'courseId': 'course-ai-101',
                    'label': '🚀 Open AI Course'
                }
            }

    # -------------------------------------------------------------
    # 5. SUBJECT DOUBTS: COMPUTER SCIENCE & SOFTWARE
    # -------------------------------------------------------------
    if any(k in msg_lower for k in ['big o', 'big-o', 'complexity', 'data structure', 'algorithm', 'recursion', 'binary search', 'linked list', 'array', 'stack', 'queue', 'tree', 'graph', 'sorting', 'quicksort', 'oop', 'python', 'javascript']):
        if 'big o' in msg_lower or 'big-o' in msg_lower or 'complexity' in msg_lower:
            reply = (
                "### ⚡ Big-O Notation & Time Complexity:\n\n"
                "**Big-O notation** measures how the runtime or memory space of an algorithm scales as the input size $N$ grows toward infinity.\n\n"
                "| Complexity | Name | Example Algorithm |\n"
                "| :--- | :--- | :--- |\n"
                "| **$O(1)$** | Constant | Accessing array element `arr[i]` |\n"
                "| **$O(\\log N)$** | Logarithmic | Binary Search in sorted array |\n"
                "| **$O(N)$** | Linear | Single `for` loop over an array |\n"
                "| **$O(N \\log N)$** | Linearithmic | Merge Sort, Quick Sort (avg) |\n"
                "| **$O(N^2)$** | Quadratic | Nested loops (Bubble Sort) |\n"
                "| **$O(2^N)$** | Exponential | Recursive Fibonacci without memoization |\n\n"
                "```python\n"
                "# Example: O(log N) Binary Search\n"
                "def binary_search(arr, target):\n"
                "    left, right = 0, len(arr) - 1\n"
                "    while left <= right:\n"
                "        mid = (left + right) // 2\n"
                "        if arr[mid] == target: return mid\n"
                "        elif arr[mid] < target: left = mid + 1\n"
                "        else: right = mid - 1\n"
                "    return -1\n"
                "```"
            )
            return {
                'reply': reply,
                'suggestions': ["Explain Binary Search", "What is Recursion?", "Open CS Pathway Course", "Take CS Quiz"],
                'action': {
                    'type': 'navigate',
                    'view': 'course-hub',
                    'courseId': 'course-cs-101',
                    'label': '💻 Open Computer Science Pathway'
                }
            }
        elif 'recursion' in msg_lower:
            reply = (
                "### 🔄 Recursion in Computer Science:\n\n"
                "**Recursion** is when a function calls itself to solve smaller subproblems of the same problem until reaching a **base case**.\n\n"
                "#### The 2 Mandatory Rules of Recursion:\n"
                "1. **Base Case**: The termination condition that prevents infinite looping (Stack Overflow).\n"
                "2. **Recursive Step**: Calling the function with modified inputs approaching the base case.\n\n"
                "```python\n"
                "# Factorial: n! = n * (n-1)!\n"
                "def factorial(n):\n"
                "    if n <= 1:  # Base Case\n"
                "        return 1\n"
                "    return n * factorial(n - 1)  # Recursive Step\n"
                "```"
            )
            return {
                'reply': reply,
                'suggestions': ["Explain Big-O Complexity", "Explain Linked Lists vs Arrays", "Take CS Quiz"],
                'action': None
            }
        else:
            reply = (
                "### 💻 Computer Science Foundations:\n\n"
                "In computer science, mastering data structures and algorithmic thinking is key:\n"
                "- **Linear Structures**: Arrays, Linked Lists, Stacks (LIFO), Queues (FIFO).\n"
                "- **Non-Linear Structures**: Binary Search Trees, Heaps, Hash Tables, and Directed Graphs.\n"
                "- **Core Paradigms**: Divide-and-Conquer, Dynamic Programming, Greedy Algorithms."
            )
            return {
                'reply': reply,
                'suggestions': ["Explain Big-O Notation", "Explain Binary Search", "Open CS Course"],
                'action': {
                    'type': 'navigate',
                    'view': 'course-hub',
                    'courseId': 'course-cs-101',
                    'label': '🚀 Open CS Pathway'
                }
            }

    # -------------------------------------------------------------
    # 6. SUBJECT DOUBTS: MATHEMATICS & ANALYTICS
    # -------------------------------------------------------------
    if any(k in msg_lower for k in ['calculus', 'derivative', 'integral', 'linear algebra', 'matrix', 'vector', 'eigenvalue', 'dot product', 'probability', 'statistics', 'math', 'algebra']):
        if 'derivative' in msg_lower or 'calculus' in msg_lower:
            reply = (
                "### 📐 Differential Calculus & Derivatives:\n\n"
                "The **derivative** measures the instantaneous rate of change of a function with respect to an independent variable: the slope of the tangent line at any point.\n\n"
                "#### Definition from First Principles:\n"
                "$$f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$$\n\n"
                "#### Essential Differentiation Rules:\n"
                "- **Power Rule**: $\\frac{d}{dx}[x^n] = n x^{n-1}$\n"
                "- **Product Rule**: $\\frac{d}{dx}[u \\cdot v] = u' v + u v'$\n"
                "- **Chain Rule**: $\\frac{d}{dx}[f(g(x))] = f'(g(x)) \\cdot g'(x)$ *(Crucial for AI backpropagation!)*"
            )
            return {
                'reply': reply,
                'suggestions': ["What is an Integral?", "Explain Matrix Multiplication & Vectors", "Open Math Course", "Take Math Quiz"],
                'action': {
                    'type': 'navigate',
                    'view': 'course-hub',
                    'courseId': 'course-math-101',
                    'label': '📐 Open Mathematics Mastery Course'
                }
            }
        elif 'matrix' in msg_lower or 'vector' in msg_lower or 'linear algebra' in msg_lower or 'dot product' in msg_lower:
            reply = (
                "### 🔢 Linear Algebra: Vectors & Dot Products:\n\n"
                "Linear algebra is the foundational language of Machine Learning and Computer Graphics.\n\n"
                "#### 1. Dot Product of Two Vectors:\n"
                "Given $\\mathbf{a} = [a_1, a_2, \\dots, a_n]$ and $\\mathbf{b} = [b_1, b_2, \\dots, b_n]$:\n"
                "$$\\mathbf{a} \\cdot \\mathbf{b} = \\sum_{i=1}^n a_i b_i = |\\mathbf{a}| |\\mathbf{b}| \\cos(\\theta)$$\n\n"
                "#### 2. Why Dot Product Matters in AI:\n"
                "- Calculates cosine similarity between high-dimensional text embeddings.\n"
                "- Powers the Self-Attention mechanism ($Q K^T$) in Transformers!\n"
                "- Multiplies neuron weights by input features in forward propagation."
            )
            return {
                'reply': reply,
                'suggestions': ["Explain Derivatives", "What are Eigenvalues?", "Take Math Quiz"],
                'action': None
            }
        else:
            reply = (
                "### 📐 Mathematics for Science & AI:\n\n"
                "Mathematics forms the bedrock of engineering:\n"
                "- **Calculus**: Optimization, rates of change, continuous probability densities.\n"
                "- **Linear Algebra**: Matrix transformations, vector spaces, dimensionality reduction (PCA).\n"
                "- **Probability & Statistics**: Bayesian inference, standard deviation, hypothesis testing."
            )
            return {
                'reply': reply,
                'suggestions': ["Explain Derivatives", "Explain Matrix Dot Product", "Open Math Course"],
                'action': {
                    'type': 'navigate',
                    'view': 'course-hub',
                    'courseId': 'course-math-101',
                    'label': '📐 Open Math Course'
                }
            }

    # -------------------------------------------------------------
    # 7. SUBJECT DOUBTS: PHYSICS & QUANTUM
    # -------------------------------------------------------------
    if any(k in msg_lower for k in ['physics', 'newton', 'quantum', 'mechanics', 'electromagnetism', 'kinematics', 'velocity', 'gravity', 'schrodinger', 'wave function']):
        if 'newton' in msg_lower or 'kinematics' in msg_lower:
            reply = (
                "### ⚡ Newton's Three Laws of Motion:\n\n"
                "1. **1st Law (Inertia)**: An object remains at rest or in uniform motion along a straight line unless acted upon by a net external force.\n"
                "2. **2nd Law (Force & Momentum)**: Force is the rate of change of momentum:\n"
                "$$\\mathbf{F} = m \\cdot \\mathbf{a}$$\n"
                "3. **3rd Law (Action-Reaction)**: For every action, there is an equal and opposite reaction ($F_{AB} = -F_{BA}$)."
            )
            return {
                'reply': reply,
                'suggestions': ["Explain Quantum Wave Functions", "Explain Electromagnetism", "Open Physics Course", "Take Physics Quiz"],
                'action': {
                    'type': 'navigate',
                    'view': 'course-hub',
                    'courseId': 'course-physics-101',
                    'label': '⚡ Open Physics Pathway'
                }
            }
        elif 'quantum' in msg_lower or 'wave function' in msg_lower or 'schrodinger' in msg_lower:
            reply = (
                "### 🌌 Quantum Mechanics: Wave Functions & Superposition:\n\n"
                "At subatomic scales, particles exhibit **wave-particle duality** described by the quantum wave function $\\Psi(x, t)$.\n\n"
                "#### The Schrödinger Equation:\n"
                "$$i\\hbar \\frac{\\partial}{\\partial t} \\Psi(\\mathbf{r}, t) = \\hat{H} \\Psi(\\mathbf{r}, t)$$\n\n"
                "#### Core Concepts:\n"
                "- **Born Rule**: The probability density of finding a particle at location $x$ is given by $|\\Psi(x)|^2$.\n"
                "- **Superposition**: A quantum state can exist in a linear combination of multiple states until measured.\n"
                "- **Heisenberg Uncertainty Principle**: $\\Delta x \\cdot \\Delta p \\ge \\frac{\\hbar}{2}$."
            )
            return {
                'reply': reply,
                'suggestions': ["Explain Newton's Laws", "What is Quantum Entanglement?", "Take Physics Quiz"],
                'action': None
            }
        else:
            reply = (
                "### ⚡ Physics & Quantum Systems:\n\n"
                "Covering Classical Mechanics, Electromagnetism, Optics, and Quantum Physics.\n"
                "- **Kinematics**: $v = u + at$, $s = ut + \\frac{1}{2}at^2$, $v^2 = u^2 + 2as$.\n"
                "- **Electromagnetism**: Maxwell's Equations governing electric and magnetic fields."
            )
            return {
                'reply': reply,
                'suggestions': ["Explain Newton's Laws", "Explain Quantum Mechanics", "Open Physics Course"],
                'action': {
                    'type': 'navigate',
                    'view': 'course-hub',
                    'courseId': 'course-physics-101',
                    'label': '⚡ Open Physics Course'
                }
            }

    # -------------------------------------------------------------
    # 8. SUBJECT DOUBTS: BIOLOGY & BIOTECHNOLOGY
    # -------------------------------------------------------------
    if any(k in msg_lower for k in ['biology', 'cell', 'dna', 'crispr', 'gene', 'mitochondria', 'transcription', 'translation', 'genetics', 'bioinformatics']):
        reply = (
            "### 🧬 Biology & Genetic Engineering:\n\n"
            "#### Central Dogma of Molecular Biology:\n"
            "$$\\text{DNA} \\xrightarrow{\\text{Transcription}} \\text{mRNA} \\xrightarrow{\\text{Translation}} \\text{Protein}$$\n\n"
            "#### Key Topics in Your Course:\n"
            "- **CRISPR-Cas9**: A molecular gene editing tool utilizing guide RNA and Cas9 endonuclease to make precise double-strand breaks.\n"
            "- **DNA Structure**: Double helix stabilized by Watson-Crick hydrogen bonding (Adenine-Thymine, Guanine-Cytosine).\n"
            "- **Bioinformatics**: Computational algorithms and machine learning used to align sequence data and predict protein folding (e.g. AlphaFold)."
        )
        return {
            'reply': reply,
            'suggestions': ["Explain DNA Transcription vs Translation", "How does CRISPR-Cas9 work?", "Open Biology Course", "Take Bio Quiz"],
            'action': {
                'type': 'navigate',
                'view': 'course-hub',
                'courseId': 'course-bio-101',
                'label': '🧬 Open Genetics & Biotechnology Masterclass'
            }
        }

    # -------------------------------------------------------------
    # 9. SUBJECT DOUBTS: CHEMISTRY
    # -------------------------------------------------------------
    if any(k in msg_lower for k in ['chemistry', 'atom', 'periodic table', 'chemical bond', 'reaction', 'organic', 'thermodynamics', 'kinetics', 'molecule']):
        reply = (
            "### 🧪 Chemistry & Molecular Science:\n\n"
            "#### Core Principles:\n"
            "- **Chemical Bonding**: Ionic (electron transfer) vs Covalent (electron sharing) vs Metallic.\n"
            "- **Periodic Trends**: Electronegativity and ionization energy increase across a period (left to right) and decrease down a group.\n"
            "- **Chemical Kinetics**: Reaction rates depend on activation energy ($E_a$), temperature, and catalyst presence via the Arrhenius equation: $k = A e^{-E_a / (RT)}$."
        )
        return {
            'reply': reply,
            'suggestions': ["Explain Covalent vs Ionic Bonds", "What is Le Chatelier's Principle?", "Open Chemistry Course", "Take Chem Quiz"],
            'action': {
                'type': 'navigate',
                'view': 'course-hub',
                'courseId': 'course-chem-101',
                'label': '🧪 Open Chemistry Course'
            }
        }

    # -------------------------------------------------------------
    # 10. QUIZZES, ASSIGNMENTS, ROADMAP & NOTES HELP
    # -------------------------------------------------------------
    if any(k in msg_lower for k in ['quiz', 'test', 'exam', 'score', 'recalibrate', 'questionnaire']):
        reply = (
            f"### 📝 Skill Quizzes & Mastery Calibration:\n\n"
            "LearnAI Pro uses adaptive quizzes to recalibrate your mastery level:\n"
            "- **Beginner Category**: 5 Foundational Questions\n"
            "- **Intermediate Category**: 10 Concept & Problem-Solving Questions\n"
            "- **Advanced Category**: 15 Complex Architecture & Analytical Questions\n\n"
            "💡 Scoring **90%+** automatically upgrades your recognized skill tier and unlocks advanced recommendations!"
        )
        return {
            'reply': reply,
            'suggestions': ["Take AI Skill Quiz", "Take CS Skill Quiz", "View My Analytics", "Retake VARK Assessment"],
            'action': {
                'type': 'navigate',
                'view': 'quizzes',
                'label': '🏆 Open Skill Quizzes Hub'
            }
        }

    if any(k in msg_lower for k in ['note', 'study notes', 'write note', 'summary']):
        reply = (
            "### 📓 Study Notes Hub:\n\n"
            "You can write, organize, and download markdown study notes for every subject. Notes are saved directly to your local profile and synchronized with the cloud."
        )
        return {
            'reply': reply,
            'suggestions': ["Open Study Notes", "What should I study next?", "Explain Backpropagation"],
            'action': {
                'type': 'navigate',
                'view': 'notes',
                'label': '📓 Open My Study Notes'
            }
        }

    # -------------------------------------------------------------
    # 11. GENERAL / DEFAULT ACADEMIC AI TUTOR RESPONSE
    # -------------------------------------------------------------
    reply = (
        f"I'm here to assist you with that, **{user_name}**!\n\n"
        f"Regarding *\"{message}\"*:\n"
        "As your **LearnAI Pro Tutor**, I can break down any academic concept step-by-step, review curriculum prerequisites, provide code snippets, or guide your learning path.\n\n"
        f"Since your profile is set to **{user_class}** with a **{user_style.upper()}** style, I can provide visual analogies, diagrams, and code demonstrations.\n\n"
        "Feel free to ask a specific doubt, or choose one of the topics below:"
    )
    return {
        'reply': reply,
        'suggestions': [
            "Explain Backpropagation in AI",
            "Explain Big-O Time Complexity",
            "What is Matrix Dot Product?",
            "What courses should I take next?"
        ],
        'action': None
    }

