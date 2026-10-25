/**
 * ============================================================================
 * COMPREHENSIVE QUIZ DATABASE FOR ALL 6 SUBJECTS (3 TIERS EACH)
 * Total: 6 Subjects x 3 Tiers = 18 Quizzes
 * Tiers: Beginner (5 Qs), Intermediate (10 Qs), Advanced (15 Qs)
 * Total Questions: 180 High-Quality Educational Questions
 * ============================================================================
 */

(function() {
  window.ALL_SUBJECT_QUIZZES = [
    // ========================================================================
    // 1. COMPUTER SCIENCE & SOFTWARE (cs)
    // ========================================================================
    {
      id: 'quiz-cs-beginner',
      title: 'Computer Science & Software - Beginner Assessment',
      subjectId: 'cs',
      level: 'Beginner',
      questionCount: 5,
      timeLimitMinutes: 8,
      createdAt: '2026-07-20T00:00:00.000Z',
      questions: [
        {
          id: 'q-cs-beg-1',
          question: 'Which of the following data types in Python is immutable (cannot be modified after creation)?',
          options: ['List', 'Dictionary', 'Tuple', 'Set'],
          correctIndex: 2,
          explanation: 'In Python, Tuples are immutable sequence types. Lists, Dictionaries, and Sets are mutable.'
        },
        {
          id: 'q-cs-beg-2',
          question: 'What is the output of the Python code snippet: `for i in range(1, 4): print(i, end=" ")`?',
          options: ['1 2 3 4', '0 1 2 3', '1 2 3', '1 4'],
          correctIndex: 2,
          explanation: 'The range(start, stop) function stops one step before the stop parameter, outputting 1 2 3.'
        },
        {
          id: 'q-cs-beg-3',
          question: 'Which keyword is used in Python to define a reusable function?',
          options: ['function', 'def', 'func', 'define'],
          correctIndex: 1,
          explanation: 'The `def` keyword introduces a function definition in Python syntax.'
        },
        {
          id: 'q-cs-beg-4',
          question: 'What does the boolean expression `True and not False` evaluate to?',
          options: ['True', 'False', 'None', 'SyntaxError'],
          correctIndex: 0,
          explanation: '`not False` evaluates to True, and `True and True` evaluates to True.'
        },
        {
          id: 'q-cs-beg-5',
          question: 'Which fundamental data structure operates strictly on a Last-In, First-Out (LIFO) order?',
          options: ['Queue', 'Stack', 'Array', 'Linked List'],
          correctIndex: 1,
          explanation: 'A Stack uses LIFO (Last-In, First-Out), where push adds to top and pop removes from top.'
        }
      ]
    },
    {
      id: 'quiz-cs-intermediate',
      title: 'Computer Science & Software - Intermediate Assessment',
      subjectId: 'cs',
      level: 'Intermediate',
      questionCount: 10,
      timeLimitMinutes: 15,
      createdAt: '2026-07-20T00:00:00.000Z',
      questions: [
        {
          id: 'q-cs-int-1',
          question: 'What is the average time complexity of searching for an element in a balanced Binary Search Tree (BST)?',
          options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
          correctIndex: 1,
          explanation: 'Each comparison in a balanced BST halves the search space, giving O(log n) average complexity.'
        },
        {
          id: 'q-cs-int-2',
          question: 'Which sorting algorithm uses divide-and-conquer and guarantees O(n log n) time complexity in all cases?',
          options: ['Quick Sort', 'Merge Sort', 'Bubble Sort', 'Insertion Sort'],
          correctIndex: 1,
          explanation: 'Merge Sort always splits arrays in half and merges them in linear time, guaranteeing O(n log n) even in worst-case.'
        },
        {
          id: 'q-cs-int-3',
          question: 'Which Object-Oriented Programming (OOP) principle allows a subclass to provide a specific implementation of a parent method?',
          options: ['Encapsulation', 'Polymorphism (Method Overriding)', 'Data Hiding', 'Composition'],
          correctIndex: 1,
          explanation: 'Polymorphism via method overriding allows subclasses to redefine behavior while retaining the same method signature.'
        },
        {
          id: 'q-cs-int-4',
          question: 'What essential component must every recursive function contain to avoid infinite recursion and stack overflow?',
          options: ['A while loop', 'A base case', 'A global variable', 'A pointer reference'],
          correctIndex: 1,
          explanation: 'The base case defines the termination condition that halts successive recursive calls.'
        },
        {
          id: 'q-cs-int-5',
          question: 'Which collision resolution strategy in Hash Tables chains multiple key-value pairs at the same bucket using a linked list?',
          options: ['Linear Probing', 'Separate Chaining', 'Quadratic Probing', 'Double Hashing'],
          correctIndex: 1,
          explanation: 'Separate Chaining maintains a linked list at each table index to hold colliding elements.'
        },
        {
          id: 'q-cs-int-6',
          question: 'Which operation removes and returns the front element from a standard FIFO Queue?',
          options: ['Push', 'Pop', 'Dequeue', 'Peek'],
          correctIndex: 2,
          explanation: 'Enqueue inserts an element at the rear, while Dequeue removes the element from the front.'
        },
        {
          id: 'q-cs-int-7',
          question: 'Where is dynamic memory allocated at runtime (e.g. using `malloc` or `new`) stored in computer architecture?',
          options: ['The Call Stack', 'The Heap', 'CPU Registers', 'Static ROM'],
          correctIndex: 1,
          explanation: 'Dynamic runtime objects are placed on the Heap, whereas local variables use the Stack.'
        },
        {
          id: 'q-cs-int-8',
          question: 'Which Git command creates a new branch and immediately checks it out into your working directory?',
          options: ['git branch -new <name>', 'git checkout -b <name>', 'git merge <name>', 'git commit -b <name>'],
          correctIndex: 1,
          explanation: '`git checkout -b <name>` (or `git switch -c <name>`) creates and switches to the new branch.'
        },
        {
          id: 'q-cs-int-9',
          question: 'In an already sorted array of 1,024 elements, what is the maximum number of comparisons needed using Binary Search?',
          options: ['10', '32', '512', '1,024'],
          correctIndex: 0,
          explanation: 'Binary search takes at most ceil(log2(1024)) = 10 comparisons.'
        },
        {
          id: 'q-cs-int-10',
          question: 'In SQL, which clause filters grouped records produced by aggregate functions such as `COUNT()` or `AVG()`?',
          options: ['WHERE', 'GROUP BY', 'HAVING', 'ORDER BY'],
          correctIndex: 2,
          explanation: 'The `HAVING` clause filters aggregated groups, whereas `WHERE` filters individual rows prior to grouping.'
        }
      ]
    },
    {
      id: 'quiz-cs-advanced',
      title: 'Computer Science & Software - Advanced Assessment',
      subjectId: 'cs',
      level: 'Advanced',
      questionCount: 15,
      timeLimitMinutes: 25,
      createdAt: '2026-07-20T00:00:00.000Z',
      questions: [
        {
          id: 'q-cs-adv-1',
          question: 'Which two fundamental properties are required to solve an optimization problem using Dynamic Programming?',
          options: ['Greedy choice and recursion', 'Optimal substructure and overlapping subproblems', 'Divide-and-conquer and backtracking', 'Deterministic states and monotonic sorting'],
          correctIndex: 1,
          explanation: 'Dynamic programming memoizes solutions to overlapping subproblems that compose an optimal global solution.'
        },
        {
          id: 'q-cs-adv-2',
          question: 'Which graph algorithm finds the shortest path from a single source to all vertices in a weighted graph with non-negative edge weights?',
          options: ['Bellman-Ford', 'Floyd-Warshall', "Dijkstra's Algorithm", "Kruskal's Algorithm"],
          correctIndex: 2,
          explanation: "Dijkstra's algorithm uses a priority queue to compute shortest paths in O((V + E) log V) with non-negative weights."
        },
        {
          id: 'q-cs-adv-3',
          question: 'According to the CAP Theorem, when a network partition (P) occurs in a distributed system, what trade-off must be made?',
          options: ['Performance vs Latency', 'Consistency (C) vs Availability (A)', 'Durability vs Isolation', 'Throughput vs Redundancy'],
          correctIndex: 1,
          explanation: 'Under a network partition, a distributed system must choose between remaining available or maintaining strong consistency.'
        },
        {
          id: 'q-cs-adv-4',
          question: 'What concurrency situation occurs when two threads cannot proceed because each is waiting for a lock held by the other?',
          options: ['Race Condition', 'Deadlock', 'Livelock', 'Starvation'],
          correctIndex: 1,
          explanation: 'Deadlock happens when processes hold resources while waiting for others in a cyclic dependency.'
        },
        {
          id: 'q-cs-adv-5',
          question: 'In a Red-Black Tree, what is the maximum ratio of the longest path from the root to any leaf compared to the shortest path?',
          options: ['At most 1.5x', 'At most 2x', 'Exactly 1x', 'No guaranteed bound'],
          correctIndex: 1,
          explanation: 'Because red nodes cannot have red children and black height is identical on all paths, the longest path is at most 2x the shortest.'
        },
        {
          id: 'q-cs-adv-6',
          question: 'What is the primary difference between an operating system process and a thread?',
          options: ['Processes share address space; threads have private memory', 'Threads within the same process share the virtual address space and code segment', 'Processes are scheduled by kernel; threads cannot be scheduled', 'Threads cannot perform I/O operations'],
          correctIndex: 1,
          explanation: 'Threads of the same process share memory space (heap, data), but retain private registers and program counters.'
        },
        {
          id: 'q-cs-adv-7',
          question: 'Which OSI model layer provides end-to-end communication, flow control, and error recovery (e.g., TCP)?',
          options: ['Network Layer (Layer 3)', 'Transport Layer (Layer 4)', 'Session Layer (Layer 5)', 'Data Link Layer (Layer 2)'],
          correctIndex: 1,
          explanation: 'Transport Layer (Layer 4) handles host-to-host data transfer, segmentation, and reliability.'
        },
        {
          id: 'q-cs-adv-8',
          question: 'Why are B+ Trees preferred over regular B Trees for relational database storage indexes?',
          options: ['Data records/pointers are stored exclusively in leaf nodes linked sequentially, facilitating fast range queries', 'B+ Trees have smaller fan-out factor', 'B+ Trees do not require rebalancing on insertions', 'B+ Trees consume zero memory during in-order traversal'],
          correctIndex: 0,
          explanation: 'B+ tree leaf nodes form a continuous linked list, enabling efficient sequential disk block scans for range queries.'
        },
        {
          id: 'q-cs-adv-9',
          question: 'Which GoF behavioral design pattern encapsulates a request as an object, allowing parameterization and undo/redo support?',
          options: ['Factory Pattern', 'Command Pattern', 'Strategy Pattern', 'Observer Pattern'],
          correctIndex: 1,
          explanation: 'The Command pattern decouples the invoker from the receiver by wrapping action details in a command object.'
        },
        {
          id: 'q-cs-adv-10',
          question: 'What hypothesis underlies generational garbage collection dividing heaps into Young and Old generations?',
          options: ['Objects never change size', 'The Weak Generational Hypothesis: most allocated objects have very short lifespans', 'Old objects are always smaller', 'Thread contention occurs only in young generations'],
          correctIndex: 1,
          explanation: 'Most objects die shortly after creation, making frequent minor GC sweeps over the Young generation highly performant.'
        },
        {
          id: 'q-cs-adv-11',
          question: 'Which compiler phase verifies grammatical syntax rules and constructs the Abstract Syntax Tree (AST)?',
          options: ['Lexical Analysis', 'Syntax Analysis (Parsing)', 'Semantic Analysis', 'Code Generation'],
          correctIndex: 1,
          explanation: 'Syntax analysis (parsing) transforms the stream of tokens into a hierarchical Abstract Syntax Tree.'
        },
        {
          id: 'q-cs-adv-12',
          question: 'Which distributed pattern prevents cascading failures by failing fast when a downstream microservice is unhealthy?',
          options: ['Circuit Breaker Pattern', 'Saga Pattern', 'CQRS Pattern', 'Event Sourcing'],
          correctIndex: 0,
          explanation: 'The Circuit Breaker pattern trips open when error rates spike, avoiding thread pool starvation in calling services.'
        },
        {
          id: 'q-cs-adv-13',
          question: 'In asymmetric RSA cryptography, which key decrypts a ciphertext message encrypted using Alice\'s public key?',
          options: ["Alice's Private Key", "Bob's Public Key", "Alice's Public Key", "A shared AES session key"],
          correctIndex: 0,
          explanation: 'Asymmetric encryption encrypts data with the recipient\'s public key; only the recipient\'s matching private key can decrypt it.'
        },
        {
          id: 'q-cs-adv-14',
          question: 'What benefit does Consistent Hashing provide in distributed caching and database partitioning?',
          options: ['Eliminates network latency completely', 'Minimizes key remapping when cache nodes are added or removed to only K/N keys', 'Forces all read queries to a single leader node', 'Guarantees ACID transactions across partitions'],
          correctIndex: 1,
          explanation: 'Consistent hashing maps both keys and servers to a ring, meaning adding or removing a node only impacts adjacent keys.'
        },
        {
          id: 'q-cs-adv-15',
          question: 'What complexity class consists of decision problems whose solutions can be verified in polynomial time by a deterministic Turing machine?',
          options: ['P', 'NP', 'NP-Complete', 'EXPTIME'],
          correctIndex: 1,
          explanation: 'NP (Nondeterministic Polynomial time) contains problems where a given candidate certificate is verifiable in O(n^k) time.'
        }
      ]
    },

    // ========================================================================
    // 2. ARTIFICIAL INTELLIGENCE & DATA SCIENCE (ds)
    // ========================================================================
    {
      id: 'quiz-ds-beginner',
      title: 'Artificial Intelligence & Data Science - Beginner Assessment',
      subjectId: 'ds',
      level: 'Beginner',
      questionCount: 5,
      timeLimitMinutes: 8,
      createdAt: '2026-07-20T00:00:00.000Z',
      questions: [
        {
          id: 'q-ds-beg-1',
          question: 'Which paradigm of Machine Learning involves training a model on labeled input-output training pairs?',
          options: ['Supervised Learning', 'Unsupervised Learning', 'Reinforcement Learning', 'Genetic Evolution'],
          correctIndex: 0,
          explanation: 'Supervised learning algorithms infer a mapping function from input features to known target ground-truth labels.'
        },
        {
          id: 'q-ds-beg-2',
          question: 'Which Python library serves as the core foundation for multi-dimensional array mathematics and vectorized calculations?',
          options: ['Matplotlib', 'NumPy', 'Flask', 'BeautifulSoup'],
          correctIndex: 1,
          explanation: 'NumPy provides N-dimensional arrays (ndarrays) and high-performance vectorized numerical operations.'
        },
        {
          id: 'q-ds-beg-3',
          question: 'Why do data scientists partition datasets into Training and Test sets?',
          options: ['To speed up computation', 'To assess how well the trained model generalizes to unseen real-world data', 'To compress disk space', 'To remove duplicate rows'],
          correctIndex: 1,
          explanation: 'Testing on unseen holdout data tests against overfitting and validates generalizability.'
        },
        {
          id: 'q-ds-beg-4',
          question: 'Predicting real estate market prices in continuous dollar values is an example of what type of machine learning problem?',
          options: ['Clustering', 'Classification', 'Regression', 'Dimensionality Reduction'],
          correctIndex: 2,
          explanation: 'Regression algorithms predict continuous real-valued quantities, whereas classification predicts discrete categories.'
        },
        {
          id: 'q-ds-beg-5',
          question: 'What does it mean when a machine learning model is "overfitted"?',
          options: ['It fits training data too closely, capturing noise and failing to generalize on test data', 'It has too few parameters', 'It runs too slowly on GPUs', 'It outputs identical probabilities for all inputs'],
          correctIndex: 0,
          explanation: 'Overfitting occurs when a model memorizes sample-specific noise rather than generalizable underlying relationships.'
        }
      ]
    },
    {
      id: 'quiz-ds-intermediate',
      title: 'Artificial Intelligence & Data Science - Intermediate Assessment',
      subjectId: 'ds',
      level: 'Intermediate',
      questionCount: 10,
      timeLimitMinutes: 15,
      createdAt: '2026-07-20T00:00:00.000Z',
      questions: [
        {
          id: 'q-ds-int-1',
          question: 'When evaluating rare disease classification models with highly imbalanced classes, which metric is superior to raw Accuracy?',
          options: ['F1-Score and Recall (Sensitivity)', 'Raw Accuracy', 'Mean Squared Error', 'R-squared'],
          correctIndex: 0,
          explanation: 'In imbalanced datasets, accuracy can be deceptively high; F1-score and Recall evaluate false negative disease misses.'
        },
        {
          id: 'q-ds-int-2',
          question: 'What is the characteristic feature of L1 Regularization (Lasso) compared to L2 Regularization (Ridge)?',
          options: ['L1 drives non-essential feature weights to exact zero, performing automatic feature selection', 'L2 drives weights to zero', 'L1 is only usable in decision trees', 'L2 eliminates the loss function'],
          correctIndex: 0,
          explanation: 'L1 adds an absolute penalty |w|, forcing less informative feature coefficients to exactly zero for sparse models.'
        },
        {
          id: 'q-ds-int-3',
          question: 'How does Random Forest reduce prediction variance compared to an individual Decision Tree?',
          options: ['By boosting errors sequentially', 'By aggregating predictions from multiple bootstrap-sampled, feature-subsampled trees (Bagging)', 'By dropping all non-linear features', 'By using single-leaf trees'],
          correctIndex: 1,
          explanation: 'Random Forest trains an ensemble of decorrelated decision trees on bootstrap splits and averages them, dropping variance.'
        },
        {
          id: 'q-ds-int-4',
          question: 'Which optimization algorithm iteratively adjusts model parameters in the opposite direction of the loss function gradient?',
          options: ['Genetic Algorithm', 'Gradient Descent', 'K-Means Clustering', 'Simulated Annealing'],
          correctIndex: 1,
          explanation: 'Gradient Descent updates weights via theta = theta - alpha * grad(J(theta)) to descend toward minimum loss.'
        },
        {
          id: 'q-ds-int-5',
          question: 'In the K-Means clustering algorithm, how are the cluster centroids recalculated at each iteration?',
          options: ['By picking a random data point', 'By calculating the arithmetic mean position of all data points currently assigned to that cluster', 'By maximizing variance', 'By calculating cross-entropy loss'],
          correctIndex: 1,
          explanation: 'Each centroid shifts to the mean vector coordinates of all data points assigned to its cluster.'
        },
        {
          id: 'q-ds-int-6',
          question: 'Why is feature standardization (Z-score scaling) critical for distance-based models such as K-Nearest Neighbors (KNN) and SVM?',
          options: ['It converts numerical features into strings', 'It prevents features with larger numerical magnitudes from artificially dominating Euclidean distance calculations', 'It handles categorical missing data', 'It multiplies parameter counts'],
          correctIndex: 1,
          explanation: 'Without scaling, a feature measured in thousands would overshadow a feature measured in units during distance computation.'
        },
        {
          id: 'q-ds-int-7',
          question: 'What mathematical property does Principal Component Analysis (PCA) maximize when projecting data onto orthogonal axes?',
          options: ['Information entropy', 'Variance of the projected data', 'Classification accuracy directly', 'Data skewness'],
          correctIndex: 1,
          explanation: 'PCA finds orthogonal principal components along which the variance of the projected data points is maximized.'
        },
        {
          id: 'q-ds-int-8',
          question: 'In 5-fold cross-validation, what percentage of the training data is held out for validation during each fold?',
          options: ['50%', '20%', '10%', '5%'],
          correctIndex: 1,
          explanation: 'In 5-fold CV, data is split into 5 equal subsets: 4 folds (80%) train the model, and 1 fold (20%) validates it.'
        },
        {
          id: 'q-ds-int-9',
          question: 'What is a major advantage of the ReLU (Rectified Linear Unit) activation function over Sigmoid in deep neural networks?',
          options: ['ReLU bounds outputs between -1 and 1', 'ReLU maintains a constant derivative of 1 for positive inputs, mitigating the vanishing gradient problem', 'ReLU is smooth at x=0', 'ReLU performs matrix inversion'],
          correctIndex: 1,
          explanation: 'Sigmoid saturates at 0 and 1 with tiny gradients; ReLU has derivative 1 for positive values, enabling deep gradient flow.'
        },
        {
          id: 'q-ds-int-10',
          question: 'Which probability theorem provides the mathematical framework for updating the probability of a hypothesis given observed evidence?',
          options: ['Central Limit Theorem', "Bayes' Theorem", "Chebyshev's Inequality", 'Law of Large Numbers'],
          correctIndex: 1,
          explanation: 'Bayes\' theorem P(A|B) = [P(B|A) * P(A)] / P(B) calculates posterior probabilities using prior beliefs and likelihoods.'
        }
      ]
    },
    {
      id: 'quiz-ds-advanced',
      title: 'Artificial Intelligence & Data Science - Advanced Assessment',
      subjectId: 'ds',
      level: 'Advanced',
      questionCount: 15,
      timeLimitMinutes: 25,
      createdAt: '2026-07-20T00:00:00.000Z',
      questions: [
        {
          id: 'q-ds-adv-1',
          question: 'What mathematical calculus rule underlies the backpropagation algorithm in multi-layer neural networks?',
          options: ['Product Rule', 'Multivariate Chain Rule', "L'Hôpital's Rule", 'Cauchy-Schwarz Inequality'],
          correctIndex: 1,
          explanation: 'Backpropagation computes sensitivities of loss with respect to early weights by chaining partial derivatives backward.'
        },
        {
          id: 'q-ds-adv-2',
          question: 'What is the exact mathematical formulation of Scaled Dot-Product Attention in Transformer architectures?',
          options: ['Softmax( (Q * K^T) / sqrt(d_k) ) * V', 'Sigmoid(Q * K) * V', 'Tanh( (Q * V^T) / d_k ) * K', 'ReLU(Q^T * K) * V'],
          correctIndex: 0,
          explanation: 'Queries and Keys are dot-producted, divided by sqrt(d_k) to prevent softmax gradient saturation, and multiplied by Values.'
        },
        {
          id: 'q-ds-adv-3',
          question: 'What is the primary function of a 1x1 Pointwise Convolution in modern deep vision networks like ResNet?',
          options: ['Spatial downsampling', 'Channel dimensionality reduction or expansion without altering spatial dimensions', 'Detecting diagonal edges', 'Batch normalization replacement'],
          correctIndex: 1,
          explanation: '1x1 convolutions compute linear combinations across channel depth, efficiently compressing feature channels.'
        },
        {
          id: 'q-ds-adv-4',
          question: 'How does the Adam optimizer combine the advantages of Momentum and RMSProp?',
          options: ['It uses Hessian second derivatives', 'It maintains exponentially decaying running averages of both past gradients (first moment) and squared gradients (second moment)', 'It resets learning rate every epoch', 'It replaces backprop with genetic algorithms'],
          correctIndex: 1,
          explanation: 'Adam computes adaptive step sizes using m_t (momentum) and v_t (variance of gradients) with bias corrections.'
        },
        {
          id: 'q-ds-adv-5',
          question: 'Why do LSTMs capture long-range temporal dependencies significantly better than standard recurrent neural networks (RNNs)?',
          options: ['They use no activation functions', 'They feature an additive cell state line regulated by forget, input, and output gates that preserves constant error flow', 'They process all sequence tokens simultaneously', 'They eliminate backward passes'],
          correctIndex: 1,
          explanation: 'The constant error carousel in the LSTM cell state lets gradients propagate across hundreds of steps without vanishing.'
        },
        {
          id: 'q-ds-adv-6',
          question: 'What distinguishes BERT from GPT in their foundational training objectives?',
          options: ['BERT is decoder-only, GPT is encoder-only', 'BERT uses bidirectional masked language modeling (encoder), while GPT uses causal autoregressive next-token prediction (decoder)', 'BERT cannot process text sequences', 'GPT requires supervised classification labels'],
          correctIndex: 1,
          explanation: 'BERT attends to left and right context jointly to produce representations; GPT predicts future tokens sequentially.'
        },
        {
          id: 'q-ds-adv-7',
          question: 'When training a multi-class neural network with mutually exclusive classes, which loss function should be paired with a Softmax output layer?',
          options: ['Categorical Cross-Entropy', 'Binary Cross-Entropy', 'Mean Squared Error', 'Hinge Loss'],
          correctIndex: 0,
          explanation: 'Categorical Cross-Entropy loss evaluates divergence between true one-hot distributions and predicted softmax probabilities.'
        },
        {
          id: 'q-ds-adv-8',
          question: 'In self-supervised contrastive learning frameworks like SimCLR, how are positive and negative sample pairs constructed?',
          options: ['Positive pairs are different stochastic augmentations of the same image; negative pairs are other images in the mini-batch', 'Positive pairs have identical pixel values', 'Negative pairs are synthetic Gaussian noise', 'Positive pairs are manually tagged by human annotators'],
          correctIndex: 0,
          explanation: 'SimCLR pulls representations of two views of the same sample together while pushing views of all other images apart.'
        },
        {
          id: 'q-ds-adv-9',
          question: 'In Generative Adversarial Networks (GANs), what is the minimax game objective between Generator G and Discriminator D?',
          options: ['Both minimize mean squared pixel error', 'Discriminator maximizes correct real/fake classification while Generator minimizes log(1 - D(G(z)))', 'Generator maximizes discriminator loss only', 'Both share identical weight parameters'],
          correctIndex: 1,
          explanation: 'D is trained to maximize correct classification probability while G is trained to produce samples that fool D.'
        },
        {
          id: 'q-ds-adv-10',
          question: 'Which approximate nearest neighbor (ANN) algorithm utilizes hierarchical skip-list graph structures for sub-linear similarity search across vector databases?',
          options: ['HNSW (Hierarchical Navigable Small World)', 'Linear Brute Force Search', 'DBSCAN', 'PageRank'],
          correctIndex: 0,
          explanation: 'HNSW constructs layered graphs with decreasing link lengths, achieving logarithmic vector query latencies.'
        },
        {
          id: 'q-ds-adv-11',
          question: 'What is the core mechanism of Low-Rank Adaptation (LoRA) for parameter-efficient LLM fine-tuning?',
          options: ['Freezing pre-trained model weights and injecting trainable low-rank decomposition matrices into transformer attention layers', 'Quantizing model weights to 1-bit', 'Pruning 80% of model layers', 'Training an external linear classifier on token embeddings'],
          correctIndex: 0,
          explanation: 'LoRA represents weight updates Delta_W as the product of two rank-r matrices A and B (r << d), slashing trainable parameter memory.'
        },
        {
          id: 'q-ds-adv-12',
          question: 'In Reinforcement Learning, what does the Bellman Optimality Equation state for the optimal action-value function Q*(s, a)?',
          options: ['Q*(s, a) = R(s, a) + gamma * sum_{s\'} P(s\'|s, a) * max_{a\'} Q*(s\', a\')', 'Q*(s, a) = sum of all historical rewards', 'Q*(s, a) = probability of state transition', 'Q*(s, a) = inverse policy entropy'],
          correctIndex: 0,
          explanation: 'The Bellman equation expresses optimal value as immediate reward plus discounted expected return under optimal subsequent actions.'
        },
        {
          id: 'q-ds-adv-13',
          question: 'What is the "Double Descent" phenomenon observed in modern deep learning regimes?',
          options: ['Test error decreases, spikes near the interpolation threshold, then decreases further as model overparameterization increases', 'Test error drops to zero on all datasets', 'Training error increases indefinitely', 'Validation loss oscillates randomly with batch size'],
          correctIndex: 0,
          explanation: 'Past the classical capacity limit, overparameterized models with inductive bias achieve lower generalization error.'
        },
        {
          id: 'q-ds-adv-14',
          question: 'What does Kullback-Leibler (KL) Divergence D_KL(P || Q) quantify in information theory?',
          options: ['The symmetric Euclidean distance between vectors', 'The relative entropy or extra information lost when distribution Q is used to approximate true distribution P', 'The joint variance of two distributions', 'The total parameter count of a neural network'],
          correctIndex: 1,
          explanation: 'KL divergence measures the expected excess code length or statistical divergence when approximating true distribution P with Q.'
        },
        {
          id: 'q-ds-adv-15',
          question: 'In advanced Retrieval-Augmented Generation (RAG) pipelines, what is the role of a cross-encoder re-ranker?',
          options: ['To vectorize user prompts into dense embeddings', 'To perform joint self-attention across query and candidate passages to score semantic relevance with high precision', 'To synthesize the final text answer directly', 'To compress vector indices on disk'],
          correctIndex: 1,
          explanation: 'Cross-encoders process query and candidate chunk jointly, capturing cross-attention interactions to accurately re-rank top candidates.'
        }
      ]
    },

    // ========================================================================
    // 3. MATHEMATICS & ANALYTICS (math)
    // ========================================================================
    {
      id: 'quiz-math-beginner',
      title: 'Mathematics & Analytics - Beginner Assessment',
      subjectId: 'math',
      level: 'Beginner',
      questionCount: 5,
      timeLimitMinutes: 8,
      createdAt: '2026-07-20T00:00:00.000Z',
      questions: [
        {
          id: 'q-math-beg-1',
          question: 'Solve for x: `3x + 9 = 24`',
          options: ['x = 3', 'x = 5', 'x = 7', 'x = 15'],
          correctIndex: 1,
          explanation: '3x = 24 - 9 = 15; x = 15 / 3 = 5.'
        },
        {
          id: 'q-math-beg-2',
          question: 'What is the median of the following numbers: [4, 1, 7, 9, 3]?',
          options: ['1', '3', '4', '7'],
          correctIndex: 2,
          explanation: 'Sorting the dataset yields [1, 3, 4, 7, 9]. The middle element is 4.'
        },
        {
          id: 'q-math-beg-3',
          question: 'What is the probability of rolling an even number on a standard fair 6-sided die?',
          options: ['1/6', '1/3', '1/2', '2/3'],
          correctIndex: 2,
          explanation: 'Even numbers are {2, 4, 6}, which is 3 outcomes out of 6 total = 3/6 = 1/2.'
        },
        {
          id: 'q-math-beg-4',
          question: 'What is the simplified value of `2^4 * 2^3`?',
          options: ['2^12', '2^7 (128)', '16', '64'],
          correctIndex: 1,
          explanation: 'When multiplying like bases, exponents add: 4 + 3 = 7. 2^7 = 128.'
        },
        {
          id: 'q-math-beg-5',
          question: 'What is the slope of the linear equation passing through points (2, 3) and (6, 11)?',
          options: ['1', '2', '4', '8'],
          correctIndex: 1,
          explanation: 'Slope m = (y2 - y1) / (x2 - x1) = (11 - 3) / (6 - 2) = 8 / 4 = 2.'
        }
      ]
    },
    {
      id: 'quiz-math-intermediate',
      title: 'Mathematics & Analytics - Intermediate Assessment',
      subjectId: 'math',
      level: 'Intermediate',
      questionCount: 10,
      timeLimitMinutes: 15,
      createdAt: '2026-07-20T00:00:00.000Z',
      questions: [
        {
          id: 'q-math-int-1',
          question: 'What is the first derivative of `f(x) = 5x^3 - 4x^2 + 7x - 2` with respect to x?',
          options: ['15x^2 - 8x + 7', '15x^3 - 8x + 7', '5x^2 - 4x + 7', '30x - 8'],
          correctIndex: 0,
          explanation: 'Applying the power rule d/dx(x^n) = n*x^(n-1) gives 3*5x^2 - 2*4x + 7 = 15x^2 - 8x + 7.'
        },
        {
          id: 'q-math-int-2',
          question: 'What is the determinant of the 2x2 matrix [[3, 2], [1, 4]]?',
          options: ['10', '12', '14', '6'],
          correctIndex: 0,
          explanation: 'det = (a*d - b*c) = (3 * 4) - (2 * 1) = 12 - 2 = 10.'
        },
        {
          id: 'q-math-int-3',
          question: 'What is the definite integral of `2x` from x = 1 to x = 3?',
          options: ['4', '8', '9', '6'],
          correctIndex: 1,
          explanation: 'Antiderivative of 2x is x^2. Evaluating [x^2] from 1 to 3 gives 3^2 - 1^2 = 9 - 1 = 8.'
        },
        {
          id: 'q-math-int-4',
          question: 'If vector A = [3, -1] and vector B = [2, 5], what is their scalar dot product A · B?',
          options: ['1', '6', '11', '-1'],
          correctIndex: 0,
          explanation: 'A · B = (3 * 2) + (-1 * 5) = 6 - 5 = 1.'
        },
        {
          id: 'q-math-int-5',
          question: 'In how many distinct ways can a committee of 3 students be chosen from a group of 7 candidates (7C3)?',
          options: ['21', '35', '42', '210'],
          correctIndex: 1,
          explanation: '7C3 = 7! / (3! * 4!) = (7 * 6 * 5) / (3 * 2 * 1) = 35.'
        },
        {
          id: 'q-math-int-6',
          question: 'If the variance of a statistical dataset is 25, what is its standard deviation?',
          options: ['5', '50', '625', '12.5'],
          correctIndex: 0,
          explanation: 'Standard deviation is the positive square root of variance: sqrt(25) = 5.'
        },
        {
          id: 'q-math-int-7',
          question: 'What is the value of `lim (x -> 0) [sin(x) / x]`?',
          options: ['0', '1', 'Infinity', 'Undefined'],
          correctIndex: 1,
          explanation: 'The fundamental trigonometric limit establishes that as x approaches 0, sin(x)/x equals 1.'
        },
        {
          id: 'q-math-int-8',
          question: 'What is the value of `sin^2(theta) + cos^2(theta)` for any real angle theta?',
          options: ['0', '1', '2', 'tan(theta)'],
          correctIndex: 1,
          explanation: 'The Pythagorean trigonometric identity states that sin^2(theta) + cos^2(theta) is identically 1.'
        },
        {
          id: 'q-math-int-9',
          question: 'For a standard normal distribution Z ~ N(0, 1), what are its mean and variance?',
          options: ['Mean = 0, Variance = 1', 'Mean = 1, Variance = 0', 'Mean = 0, Variance = 0', 'Mean = 1, Variance = 1'],
          correctIndex: 0,
          explanation: 'A standard normal distribution has mean mu = 0 and variance sigma^2 = 1.'
        },
        {
          id: 'q-math-int-10',
          question: 'Can a matrix of size 3x2 be multiplied by a matrix of size 2x4?',
          options: ['Yes, resulting in a 3x4 matrix', 'Yes, resulting in a 2x2 matrix', 'No, inner dimensions do not match', 'Yes, resulting in a 4x3 matrix'],
          correctIndex: 0,
          explanation: 'The inner dimensions match (2 == 2), so the product is defined and has dimension 3x4.'
        }
      ]
    },
    {
      id: 'quiz-math-advanced',
      title: 'Mathematics & Analytics - Advanced Assessment',
      subjectId: 'math',
      level: 'Advanced',
      questionCount: 15,
      timeLimitMinutes: 25,
      createdAt: '2026-07-20T00:00:00.000Z',
      questions: [
        {
          id: 'q-math-adv-1',
          question: 'For a square matrix A and non-zero vector v, what scalar lambda satisfies `A * v = lambda * v`?',
          options: ['The singular value', 'The trace', 'An eigenvalue', 'The rank'],
          correctIndex: 2,
          explanation: 'By definition, lambda is an eigenvalue and v is the corresponding eigenvector of transformation matrix A.'
        },
        {
          id: 'q-math-adv-2',
          question: 'What vector points in the direction of greatest spatial rate of increase of a multivariable scalar function f(x, y, z)?',
          options: ['The Hessian vector', 'The Gradient vector (grad f)', 'The Curl vector', 'The Divergence scalar'],
          correctIndex: 1,
          explanation: 'The gradient vector grad f = [df/dx, df/dy, df/dz] points in the direction of steepest ascent.'
        },
        {
          id: 'q-math-adv-3',
          question: 'Which method determines local extrema of a multivariable function subject to equality constraints g(x, y) = 0?',
          options: ['Lagrange Multipliers', 'Gram-Schmidt Process', 'Newton-Raphson 1D', 'Gaussian Elimination'],
          correctIndex: 0,
          explanation: 'Lagrange multipliers solve grad(f) = lambda * grad(g) along constraint surfaces.'
        },
        {
          id: 'q-math-adv-4',
          question: 'In Singular Value Decomposition `A = U * Sigma * V^T`, what do the columns of orthogonal matrix U represent?',
          options: ['Left singular vectors (eigenvectors of A * A^T)', 'Right singular vectors (eigenvectors of A^T * A)', 'Eigenvalues of A', 'Inverse projection matrices'],
          correctIndex: 0,
          explanation: 'Columns of U are orthonormal eigenvectors of A * A^T, known as left singular vectors.'
        },
        {
          id: 'q-math-adv-5',
          question: 'What is the general solution to the first-order ordinary differential equation `dy/dx = k * y`?',
          options: ['y = C * e^(k * x)', 'y = k * x + C', 'y = C * ln(k * x)', 'y = C * sin(k * x)'],
          correctIndex: 0,
          explanation: 'Separating variables dy/y = k dx and integrating yields ln|y| = kx + C1, so y = C * e^(kx).'
        },
        {
          id: 'q-math-adv-6',
          question: 'In hypothesis testing, what does a p-value less than 0.05 signify regarding the null hypothesis H0?',
          options: ['H0 is mathematically guaranteed false', 'The probability of observing sample data at least as extreme under H0 is < 5%, rejecting H0 at alpha = 0.05', 'Statistical power is 95%', 'Effect size is 0'],
          correctIndex: 1,
          explanation: 'A p-value < 0.05 provides sufficient evidence to reject the null hypothesis at the 5% significance level.'
        },
        {
          id: 'q-math-adv-7',
          question: 'What is the Shannon entropy H(X) in bits of a fair coin toss with two equally likely outcomes (p = 0.5)?',
          options: ['0 bits', '0.5 bits', '1 bit', '2 bits'],
          correctIndex: 2,
          explanation: 'H(X) = - sum(p * log2(p)) = - [0.5 * (-1) + 0.5 * (-1)] = 1 bit of information.'
        },
        {
          id: 'q-math-adv-8',
          question: 'According to Gauss\'s Divergence Theorem, the flux of a vector field through a closed surface equals:',
          options: ['The line integral of its curl', 'The volume integral of its divergence throughout the enclosed region', 'Zero under all conditions', 'The scalar gradient along the normal'],
          correctIndex: 1,
          explanation: 'The Divergence Theorem equates net outward flux across a boundary to the integral of divergence inside the volume.'
        },
        {
          id: 'q-math-adv-9',
          question: 'What property makes convex optimization problems uniquely tractable in applied mathematics?',
          options: ['Any local minimum is guaranteed to be a global minimum', 'The objective function must be strictly linear', 'Parameters cannot be negative', 'Hessian eigenvalues must be negative'],
          correctIndex: 0,
          explanation: 'Convexity guarantees that every stationary point or local minimum is also the global optimum.'
        },
        {
          id: 'q-math-adv-10',
          question: 'In a discrete-time Markov chain, what characterizes an absorbing state?',
          options: ['A state that transitions to all others equally', 'A state that once entered cannot be left (P_ii = 1)', 'A state with zero incoming transition probabilities', 'An oscillating periodic state'],
          correctIndex: 1,
          explanation: 'An absorbing state has self-transition probability 1, meaning the process stays there permanently once reached.'
        },
        {
          id: 'q-math-adv-11',
          question: 'What does the Bolzano-Weierstrass Theorem state regarding any bounded sequence in R^n?',
          options: ['It converges to zero', 'It contains at least one convergent subsequence', 'It is strictly monotonic', 'Its derivative exists everywhere'],
          correctIndex: 1,
          explanation: 'Bolzano-Weierstrass establishes that compactness in Euclidean space guarantees the existence of a convergent subsequence.'
        },
        {
          id: 'q-math-adv-12',
          question: 'According to the Rank-Nullity Theorem for an m x n linear matrix A, what does Rank(A) + Nullity(A) equal?',
          options: ['m (number of rows)', 'n (number of columns / dimension of domain)', 'm * n', 'min(m, n)'],
          correctIndex: 1,
          explanation: 'The dimension of the column space plus the dimension of the null space equals the number of columns n.'
        },
        {
          id: 'q-math-adv-13',
          question: 'What does the continuous Fourier Transform decompose a continuous time-domain function into?',
          options: ['A series of orthogonal step pulses', 'A continuum of complex sinusoidal basis frequencies', 'Discrete binary polynomials', 'Wavelet coefficients only'],
          correctIndex: 1,
          explanation: 'The Fourier Transform decomposes signals into constituent frequencies via integral of f(t) * e^(-i * omega * t) dt.'
        },
        {
          id: 'q-math-adv-14',
          question: 'What does the Central Limit Theorem establish regarding the sample mean of independent identically distributed (i.i.d.) variables with finite variance?',
          options: ['The sample mean distribution approaches a Normal (Gaussian) distribution as sample size n increases', 'The sample mean always equals the median', 'Variance grows to infinity', 'Outliers are completely eliminated'],
          correctIndex: 0,
          explanation: 'Regardless of original distribution shape, sample means converge toward a Gaussian distribution as n grows large.'
        },
        {
          id: 'q-math-adv-15',
          question: 'What condition must real and imaginary parts of f(z) = u(x, y) + i*v(x, y) satisfy to be complex differentiable (holomorphic)?',
          options: ['The Cauchy-Riemann equations: du/dx = dv/dy and du/dy = -dv/dx', 'u must equal v everywhere', 'v must equal zero', 'Contour integrals must be infinite'],
          correctIndex: 0,
          explanation: 'The Cauchy-Riemann differential equations are the foundational requirement for complex analyticity.'
        }
      ]
    },

    // ========================================================================
    // 4. PHYSICS & QUANTUM SYSTEMS (physics)
    // ========================================================================
    {
      id: 'quiz-physics-beginner',
      title: 'Physics & Quantum Systems - Beginner Assessment',
      subjectId: 'physics',
      level: 'Beginner',
      questionCount: 5,
      timeLimitMinutes: 8,
      createdAt: '2026-07-20T00:00:00.000Z',
      questions: [
        {
          id: 'q-phys-beg-1',
          question: 'According to Newton\'s Second Law of Motion, what is the mathematical formula relating Force (F), Mass (m), and Acceleration (a)?',
          options: ['F = m * a', 'F = m / a', 'F = 0.5 * m * v^2', 'F = m * g * h'],
          correctIndex: 0,
          explanation: 'Force equals mass multiplied by acceleration (F = ma).'
        },
        {
          id: 'q-phys-beg-2',
          question: 'When a ray of light passes from air into water and bends toward the normal line, what phenomenon has occurred?',
          options: ['Refraction', 'Diffraction', 'Polarization', 'Total Internal Reflection'],
          correctIndex: 0,
          explanation: 'Refraction is the bending of light caused by a change in speed when entering a medium with a different refractive index.'
        },
        {
          id: 'q-phys-beg-3',
          question: 'What is the electrical resistance of a circuit where a 12V battery produces a current of 3 Amperes (Ohm\'s Law)?',
          options: ['36 Ohms', '4 Ohms', '0.25 Ohms', '15 Ohms'],
          correctIndex: 1,
          explanation: 'Ohm\'s Law states V = I * R, so R = V / I = 12V / 3A = 4 Ohms.'
        },
        {
          id: 'q-phys-beg-4',
          question: 'An apple held stationary 5 meters above the ground possesses which primary form of stored energy?',
          options: ['Gravitational Potential Energy', 'Kinetic Energy', 'Thermal Radiation', 'Elastic Energy'],
          correctIndex: 0,
          explanation: 'Elevated objects possess gravitational potential energy (PE = mgh) relative to the ground.'
        },
        {
          id: 'q-phys-beg-5',
          question: 'Which wave property directly corresponds to the perceived pitch of a sound wave?',
          options: ['Frequency', 'Amplitude', 'Speed in vacuum', 'Phase angle'],
          correctIndex: 0,
          explanation: 'Frequency (measured in Hertz) determines the pitch of sound; amplitude determines loudness.'
        }
      ]
    },
    {
      id: 'quiz-physics-intermediate',
      title: 'Physics & Quantum Systems - Intermediate Assessment',
      subjectId: 'physics',
      level: 'Intermediate',
      questionCount: 10,
      timeLimitMinutes: 15,
      createdAt: '2026-07-20T00:00:00.000Z',
      questions: [
        {
          id: 'q-phys-int-1',
          question: 'In an isolated system with no external net forces, what happens to total linear momentum during an inelastic collision?',
          options: ['Total linear momentum is strictly conserved', 'Total momentum drops to zero', 'Momentum doubles', 'Momentum converts entirely to potential energy'],
          correctIndex: 0,
          explanation: 'Momentum is conserved in all collisions; kinetic energy is converted to thermal/acoustic energy, but momentum is invariant.'
        },
        {
          id: 'q-phys-int-2',
          question: 'What does the First Law of Thermodynamics state about the change in internal energy (Delta_U) of a closed system?',
          options: ['Delta_U = Q - W (Heat added to system minus Work done by system)', 'Entropy must decrease', 'Temperature cannot drop below 0 Celsius', 'Heat flows spontaneously from cold to hot'],
          correctIndex: 0,
          explanation: 'The First Law is the principle of conservation of energy: internal energy change equals heat absorbed minus work done.'
        },
        {
          id: 'q-phys-int-3',
          question: 'What centripetal force is required to keep an object of mass m moving in a circular path of radius r at velocity v?',
          options: ['F = m * v^2 / r', 'F = m * v * r', 'F = m * a^2 / r', 'F = 0.5 * m * v^2'],
          correctIndex: 0,
          explanation: 'Centripetal acceleration a = v^2 / r requires a center-directed net force F = m * v^2 / r.'
        },
        {
          id: 'q-phys-int-4',
          question: 'Which law states that an induced electromotive force (EMF) is proportional to the time rate of change of magnetic flux?',
          options: ["Faraday's Law of Electromagnetic Induction", "Coulomb's Law", "Ampère's Law", "Gauss's Law"],
          correctIndex: 0,
          explanation: 'Faraday\'s law states EMF = -d(Phi_B)/dt, where the negative sign represents Lenz\'s law.'
        },
        {
          id: 'q-phys-int-5',
          question: 'Which historical experiment demonstrated that light behaves as discrete packets of energy (photons), earning Albert Einstein his Nobel Prize?',
          options: ['The Photoelectric Effect', "Young's Double Slit Experiment", 'Michelson-Morley Experiment', 'Rutherford Gold Foil Experiment'],
          correctIndex: 0,
          explanation: 'The Photoelectric Effect showed electrons are ejected by photons with energy E = h*f, proving light quantization.'
        },
        {
          id: 'q-phys-int-6',
          question: 'What occurs when two coherent waves with equal amplitude arrive at a point exactly in phase (phase difference = 0)?',
          options: ['Constructive Interference (resultant amplitude doubles)', 'Destructive Interference (amplitude cancels)', 'Total dispersion', 'Wavelength reduces to zero'],
          correctIndex: 0,
          explanation: 'In-phase waves combine constructively: amplitudes add (A + A = 2A), quadrupling intensity.'
        },
        {
          id: 'q-phys-int-7',
          question: 'When a sound source moves rapidly toward a stationary observer, what Doppler effect shift occurs in the observed sound?',
          options: ['Observed frequency increases (higher pitch)', 'Observed frequency decreases (lower pitch)', 'Frequency remains unchanged', 'Wave speed drops to zero'],
          correctIndex: 0,
          explanation: 'Motion toward the observer compresses the arriving wavefronts, increasing observed frequency.'
        },
        {
          id: 'q-phys-int-8',
          question: 'If the plate separation distance (d) of a parallel-plate capacitor is halved while plate area remains constant, what happens to capacitance (C)?',
          options: ['Capacitance doubles', 'Capacitance is halved', 'Capacitance quadruples', 'Capacitance remains unchanged'],
          correctIndex: 0,
          explanation: 'Capacitance C = (epsilon * A) / d. Halving distance d doubles the capacitance C.'
        },
        {
          id: 'q-phys-int-9',
          question: 'At the apex (highest point) of a projectile\'s parabolic trajectory under uniform gravity, what is its vertical velocity component?',
          options: ['0 m/s', 'Equal to its initial launch speed', '-9.8 m/s', 'Maximum possible'],
          correctIndex: 0,
          explanation: 'Vertical velocity momentarily reaches 0 m/s at maximum height as it reverses direction from upward to downward.'
        },
        {
          id: 'q-phys-int-10',
          question: 'What fundamental equation relates angles of incidence and refraction for light traveling between media with refractive indices n1 and n2?',
          options: ['n1 * sin(theta1) = n2 * sin(theta2) (Snell\'s Law)', 'n1 * cos(theta1) = n2 * cos(theta2)', 'n1 / theta1 = n2 / theta2', 'n1 * n2 = sin(theta1 + theta2)'],
          correctIndex: 0,
          explanation: 'Snell\'s Law governs the refraction of light across planar dielectric interfaces.'
        }
      ]
    },
    {
      id: 'quiz-physics-advanced',
      title: 'Physics & Quantum Systems - Advanced Assessment',
      subjectId: 'physics',
      level: 'Advanced',
      questionCount: 15,
      timeLimitMinutes: 25,
      createdAt: '2026-07-20T00:00:00.000Z',
      questions: [
        {
          id: 'q-phys-adv-1',
          question: 'According to Max Born\'s statistical interpretation of quantum mechanics, what does `|Psi(x, t)|^2` represent?',
          options: ['The probability density of finding the particle at position x at time t', 'The kinetic energy expectation value', 'The classical velocity vector', 'The electrostatic potential'],
          correctIndex: 0,
          explanation: 'The Born rule establishes that the square modulus of the complex wave function equals the spatial probability density.'
        },
        {
          id: 'q-phys-adv-2',
          question: 'What fundamental inequality governs simultaneous measurements of position (x) and momentum (p) according to Heisenberg?',
          options: ['Delta_x * Delta_p >= hbar / 2', 'Delta_x * Delta_p = 0', 'Delta_x / Delta_p <= c', 'Delta_x * Delta_p >= h * c'],
          correctIndex: 0,
          explanation: 'Heisenberg\'s uncertainty relation dictates that conjugate observables have uncertainty product >= hbar/2.'
        },
        {
          id: 'q-phys-adv-3',
          question: 'What quantum mechanical principle enables a qubit to exist in a linear combination of basis states |0> and |1>?',
          options: ['Superposition', 'Quantum Tunneling', 'Zeeman Splitting', 'Spontaneous Emission'],
          correctIndex: 0,
          explanation: 'Superposition allows a quantum state |psi> = alpha|0> + beta|1> where |alpha|^2 + |beta|^2 = 1.'
        },
        {
          id: 'q-phys-adv-4',
          question: 'What did the experimental violation of Bell\'s Inequalities demonstrate about nature?',
          options: ['Local hidden-variable theories cannot explain quantum entanglement correlations', 'Faster-than-light signaling is possible via classical telephone cables', 'Wavefunctions have no physical significance', 'The universe is strictly Newtonian'],
          correctIndex: 0,
          explanation: 'Bell test experiments ruled out local realism, proving quantum entanglement correlations transcend local hidden variables.'
        },
        {
          id: 'q-phys-adv-5',
          question: 'What is the relativistic Lorentz factor (gamma) that scales time dilation and length contraction at velocity v?',
          options: ['gamma = 1 / sqrt(1 - v^2 / c^2)', 'gamma = sqrt(1 - v / c)', 'gamma = 1 - v^2 / c^2', 'gamma = c^2 / (c^2 - v^2)'],
          correctIndex: 0,
          explanation: 'Lorentz factor gamma = 1 / sqrt(1 - beta^2) where beta = v/c governs special relativistic transformations.'
        },
        {
          id: 'q-phys-adv-6',
          question: 'Which term was added by James Clerk Maxwell to Ampère\'s Law to account for magnetic fields induced by changing electric fields?',
          options: ['Displacement Current (mu_0 * epsilon_0 * dE/dt)', 'Poynting Vector', 'Lorentz Force', 'Scalar Potential'],
          correctIndex: 0,
          explanation: 'Maxwell\'s displacement current term completed electromagnetic theory, predicting electromagnetic wave propagation.'
        },
        {
          id: 'q-phys-adv-7',
          question: 'How does a quantum particle tunnel through a potential barrier whose height exceeds the particle\'s total kinetic energy?',
          options: ['The particle wave function penetrates the barrier as an evanescent wave with non-zero transmission probability', 'The particle temporarily acquires infinite speed', 'The barrier collapses upon impact', 'The particle converts into thermal photons'],
          correctIndex: 0,
          explanation: 'Solving Schrödinger\'s equation inside the barrier yields an exponential decaying solution that emerges with finite transmission amplitude.'
        },
        {
          id: 'q-phys-adv-8',
          question: 'What does Ludwig Boltzmann\'s entropy equation `S = k_B * ln(Omega)` connect thermodynamic entropy to?',
          options: ['The number of microstates (Omega) corresponding to a macroscopic thermodynamic state', 'Total volume divided by temperature', 'The speed of sound in the gas', 'Total gravitational potential energy'],
          correctIndex: 0,
          explanation: 'Boltzmann\'s formula connects macroscopic entropy to the statistical multiplicity of microscopic quantum states.'
        },
        {
          id: 'q-phys-adv-9',
          question: 'What revolutionary hypothesis by Max Planck resolved the classical ultraviolet catastrophe in blackbody radiation?',
          options: ['Electromagnetic oscillators emit and absorb energy only in discrete quantized packets E = n * h * nu', 'Blackbodies reflect all ultraviolet light', 'Speed of light changes with temperature', 'Electrons possess infinite mass'],
          correctIndex: 0,
          explanation: 'Planck quantized harmonic energy E = nhnu, successfully eliminating infinite high-frequency energy divergence.'
        },
        {
          id: 'q-phys-adv-10',
          question: 'What is the non-zero ground-state zero-point energy of a 1D quantum harmonic oscillator with angular frequency omega?',
          options: ['E_0 = 0.5 * hbar * omega', 'E_0 = 0', 'E_0 = hbar * omega', 'E_0 = 2 * hbar * omega'],
          correctIndex: 0,
          explanation: 'For energy eigenvalues E_n = (n + 1/2)hbar*omega, setting n = 0 gives the ground-state zero-point energy (1/2)hbar*omega.'
        },
        {
          id: 'q-phys-adv-11',
          question: 'In BCS theory of superconductivity, what lattice interaction binds conduction electrons into zero-resistance Cooper pairs?',
          options: ['Electron-phonon lattice vibrations', 'Direct magnetic dipole attraction', 'Gravitational clustering', 'Strong nuclear force'],
          correctIndex: 0,
          explanation: 'Electrons deform the positive ionic crystal lattice, generating an effective phonon-mediated attraction that binds Cooper pairs.'
        },
        {
          id: 'q-phys-adv-12',
          question: 'Which quantum statistical distribution describes indistinguishable integer-spin particles (bosons) capable of occupying the same quantum state?',
          options: ['Bose-Einstein Statistics', 'Fermi-Dirac Statistics', 'Maxwell-Boltzmann Classical Statistics', 'Poisson Distribution'],
          correctIndex: 0,
          explanation: 'Bosons follow Bose-Einstein statistics and do not obey the Pauli exclusion principle, allowing Bose-Einstein condensation.'
        },
        {
          id: 'q-phys-adv-13',
          question: 'Why do electrons in an atom obey the Pauli Exclusion Principle?',
          options: ['Electrons are fermions with half-integer spin (s = 1/2), requiring an antisymmetric total wave function under particle exchange', 'Electrons are massless bosons', 'Electrostatic repulsion forces a 1-meter minimum distance', 'Quantum gravity aligns electron orbits'],
          correctIndex: 0,
          explanation: 'Identical fermions have antisymmetric wavefunctions; placing two in identical quantum states forces the wave function to zero.'
        },
        {
          id: 'q-phys-adv-14',
          question: 'In analytical mechanics, how is the Lagrangian (L) defined for a conservative system with kinetic energy T and potential energy V?',
          options: ['L = T - V', 'L = T + V (Total Energy)', 'L = p * q_dot - H', 'L = dV/dt'],
          correctIndex: 0,
          explanation: 'The Lagrangian L = T - V satisfies the Euler-Lagrange equations of motion through Hamilton\'s principle of stationary action.'
        },
        {
          id: 'q-phys-adv-15',
          question: 'In the Standard Model of particle physics, which gauge boson mediates the electromagnetic interaction?',
          options: ['Photon (gamma)', 'Gluon', 'W/Z Bosons', 'Higgs Boson'],
          correctIndex: 0,
          explanation: 'The massless spin-1 photon mediates electromagnetic U(1) gauge interactions between charged particles.'
        }
      ]
    },

    // ========================================================================
    // 5. BIOLOGY & BIOTECHNOLOGY (bio)
    // ========================================================================
    {
      id: 'quiz-bio-beginner',
      title: 'Biology & Biotechnology - Beginner Assessment',
      subjectId: 'bio',
      level: 'Beginner',
      questionCount: 5,
      timeLimitMinutes: 8,
      createdAt: '2026-07-20T00:00:00.000Z',
      questions: [
        {
          id: 'q-bio-beg-1',
          question: 'Which cellular organelle is known as the "powerhouse of the cell" because it produces chemical energy in the form of ATP?',
          options: ['Mitochondria', 'Ribosome', 'Endoplasmic Reticulum', 'Golgi Apparatus'],
          correctIndex: 0,
          explanation: 'Mitochondria generate the majority of cellular adenosine triphosphate (ATP) through oxidative phosphorylation.'
        },
        {
          id: 'q-bio-beg-2',
          question: 'Which nitrogenous base is present in RNA but absent in DNA?',
          options: ['Uracil', 'Thymine', 'Cytosine', 'Guanine'],
          correctIndex: 0,
          explanation: 'RNA contains Uracil (U) instead of Thymine (T), pairing with Adenine (A).'
        },
        {
          id: 'q-bio-beg-3',
          question: 'What green pigment in chloroplasts captures light photons to drive the reactions of photosynthesis?',
          options: ['Chlorophyll', 'Carotenoid', 'Hemoglobin', 'Melanin'],
          correctIndex: 0,
          explanation: 'Chlorophyll absorbs blue and red wavelengths, reflecting green light and catalyzing photochemical charge separation.'
        },
        {
          id: 'q-bio-beg-4',
          question: 'Which type of cell division produces two genetically identical diploid daughter cells for growth and tissue repair?',
          options: ['Mitosis', 'Meiosis', 'Binary Fission in gametes', 'Cytokinesis without replication'],
          correctIndex: 0,
          explanation: 'Mitosis produces two genetically identical diploid daughter cells from a single parent somatic cell.'
        },
        {
          id: 'q-bio-beg-5',
          question: 'In a monohybrid cross between homozygous dominant (BB) and homozygous recessive (bb) parents, what percentage of F1 offspring express the dominant phenotype?',
          options: ['100%', '75%', '50%', '25%'],
          correctIndex: 0,
          explanation: 'All F1 offspring inherit genotype Bb, expressing 100% dominant phenotype due to complete dominance.'
        }
      ]
    },
    {
      id: 'quiz-bio-intermediate',
      title: 'Biology & Biotechnology - Intermediate Assessment',
      subjectId: 'bio',
      level: 'Intermediate',
      questionCount: 10,
      timeLimitMinutes: 15,
      createdAt: '2026-07-20T00:00:00.000Z',
      questions: [
        {
          id: 'q-bio-int-1',
          question: 'During transcription, which enzyme reads the DNA template strand and synthesizes messenger RNA (mRNA)?',
          options: ['RNA Polymerase', 'DNA Ligase', 'Helicase', 'Reverse Transcriptase'],
          correctIndex: 0,
          explanation: 'RNA Polymerase binds to gene promoters and transcribes complementary pre-mRNA in the 5\' to 3\' direction.'
        },
        {
          id: 'q-bio-int-2',
          question: 'In eukaryotic cells, in which compartment does the Citric Acid (Krebs) Cycle occur?',
          options: ['Mitochondrial Matrix', 'Cytosol', 'Intermembrane space', 'Nucleolus'],
          correctIndex: 0,
          explanation: 'The Krebs cycle enzymes reside in the mitochondrial matrix, oxidizing acetyl-CoA into CO2, NADH, and FADH2.'
        },
        {
          id: 'q-bio-int-3',
          question: 'What does the Michaelis constant (Km) represent in enzyme kinetics?',
          options: ['The substrate concentration at which reaction rate is exactly half of Vmax', 'The maximum velocity Vmax', 'The catalytic turnover kcat', 'The optimum temperature'],
          correctIndex: 0,
          explanation: 'Km reflects enzyme affinity: a lower Km means the enzyme reaches half-maximal velocity at lower substrate concentrations.'
        },
        {
          id: 'q-bio-int-4',
          question: 'Which enzyme unwinds and separates the double-stranded DNA helix at the replication fork?',
          options: ['DNA Helicase', 'DNA Topoisomerase', 'DNA Polymerase I', 'Primase'],
          correctIndex: 0,
          explanation: 'Helicase breaks hydrogen bonds between nucleotide bases to separate the strands for replication.'
        },
        {
          id: 'q-bio-int-5',
          question: 'Which specialized immune cells synthesize and secrete circulating antigen-specific antibodies?',
          options: ['Plasma B cells', 'Cytotoxic T cells (CD8+)', 'Natural Killer (NK) cells', 'Neutrophils'],
          correctIndex: 0,
          explanation: 'Differentiated B cells (plasma cells) produce large quantities of high-affinity antibodies.'
        },
        {
          id: 'q-bio-int-6',
          question: 'What molecular biology technique uses thermal cycling (denaturation, annealing, extension) to amplify DNA fragments exponentially?',
          options: ['Polymerase Chain Reaction (PCR)', 'Gel Electrophoresis', 'Western Blotting', 'Flow Cytometry'],
          correctIndex: 0,
          explanation: 'PCR employs heat-stable Taq polymerase to amplify targeted DNA regions millions of times in hours.'
        },
        {
          id: 'q-bio-int-7',
          question: 'Which codon functions as the universal translation initiation (start) codon and encodes methionine?',
          options: ['AUG', 'UAA', 'UGA', 'UAG'],
          correctIndex: 0,
          explanation: 'AUG signals the ribosome to begin translation and specifies the amino acid methionine.'
        },
        {
          id: 'q-bio-int-8',
          question: 'What molecular tools cleave double-stranded DNA at specific palindromic recognition sequences for molecular cloning?',
          options: ['Restriction Endonucleases', 'DNA Ligases', 'Exonucleases', 'Cas9 without sgRNA'],
          correctIndex: 0,
          explanation: 'Restriction enzymes recognize specific 4-8 bp palindromic sequences and cut the sugar-phosphate backbone.'
        },
        {
          id: 'q-bio-int-9',
          question: 'Which organisms occupy the first trophic level in an ecological food web by fixing inorganic carbon using sunlight?',
          options: ['Primary Producers (Autotrophs)', 'Primary Consumers (Herbivores)', 'Secondary Consumers', 'Decomposers'],
          correctIndex: 0,
          explanation: 'Autotrophs (plants, cyanobacteria, phytoplankton) produce primary biomass from light and CO2.'
        },
        {
          id: 'q-bio-int-10',
          question: 'In the CRISPR-Cas9 genome editing system, what component guides the Cas9 endonuclease to the target genomic site?',
          options: ['Single guide RNA (sgRNA)', 'Zinc finger array', 'TALEN domain', 'Ribosomal 16S RNA'],
          correctIndex: 0,
          explanation: 'The 20-nucleotide guide spacer within the sgRNA hybridizes with the target genomic DNA adjacent to a PAM site.'
        }
      ]
    },
    {
      id: 'quiz-bio-advanced',
      title: 'Biology & Biotechnology - Advanced Assessment',
      subjectId: 'bio',
      level: 'Advanced',
      questionCount: 15,
      timeLimitMinutes: 25,
      createdAt: '2026-07-20T00:00:00.000Z',
      questions: [
        {
          id: 'q-bio-adv-1',
          question: 'Following a Cas9 double-strand break, which DNA repair pathway is exploited for high-fidelity targeted gene insertion using an exogenous donor template?',
          options: ['Homology-Directed Repair (HDR)', 'Non-Homologous End Joining (NHEJ)', 'Base Excision Repair', 'Mismatch Repair'],
          correctIndex: 0,
          explanation: 'HDR uses homologous template donor strands for error-free sequence replacement and precise gene knock-ins.'
        },
        {
          id: 'q-bio-adv-2',
          question: 'Which algorithmic approach does the NCBI BLAST tool utilize to rapidly query biological sequence databases?',
          options: ['Heuristic seed-and-extend local alignment', 'Needleman-Wunsch global alignment', 'Exhaustive Smith-Waterman only', 'Viterbi decoding'],
          correctIndex: 0,
          explanation: 'BLAST uses k-mer heuristic indexing and local extension to scan databases orders of magnitude faster than exact DP.'
        },
        {
          id: 'q-bio-adv-3',
          question: 'What covalent chemical modification of cytosines in genomic CpG islands typically represses transcriptional gene expression?',
          options: ['DNA Methylation (5-methylcytosine)', 'Histone Acetylation', 'RNA Polyadenylation', 'Ubiquitination'],
          correctIndex: 0,
          explanation: 'DNA methylation of promoter CpG islands condenses chromatin and blocks transcription factor recruitment, silencing genes.'
        },
        {
          id: 'q-bio-adv-4',
          question: 'In G-protein coupled receptor (GPCR) cascades, what second messenger molecule is synthesized from ATP by adenylyl cyclase?',
          options: ['Cyclic AMP (cAMP)', 'Inositol 1,4,5-trisphosphate (IP3)', 'Diacylglycerol (DAG)', 'Nitric Oxide (NO)'],
          correctIndex: 0,
          explanation: 'Activated G_alpha_s stimulates adenylyl cyclase to convert ATP into cAMP, which activates protein kinase A (PKA).'
        },
        {
          id: 'q-bio-adv-5',
          question: 'Which hybrid cell line formed by fusing antibody-secreting splenic B cells with immortal myeloma cells produces monoclonal antibodies?',
          options: ['Hybridoma', 'Embryonic Stem Cell', 'Fibroblast line', 'Macrophage clone'],
          correctIndex: 0,
          explanation: 'Hybridoma technology combines B-cell antibody specificity with immortal myeloma proliferative longevity.'
        },
        {
          id: 'q-bio-adv-6',
          question: 'Which combination of core transcription factors (Yamanaka factors) can reprogram adult somatic cells into induced pluripotent stem cells (iPSCs)?',
          options: ['Oct4, Sox2, Klf4, c-Myc', 'p53, Rb, BRCA1, APC', 'HoxA1, HoxB2, Wnt, Notch', 'Ras, Raf, MEK, ERK'],
          correctIndex: 0,
          explanation: 'Shinya Yamanaka demonstrated that ectopic expression of Oct4, Sox2, Klf4, and c-Myc resets differentiated cells to pluripotency.'
        },
        {
          id: 'q-bio-adv-7',
          question: 'Which attention-based deep learning system developed by DeepMind solved the long-standing computational protein structure prediction challenge?',
          options: ['AlphaFold', 'RosettaFold Classic', 'BioBERT', 'ProtTrans'],
          correctIndex: 0,
          explanation: 'AlphaFold utilizes Evoformer neural architectures to predict 3D atomic coordinates directly from primary amino acid sequences.'
        },
        {
          id: 'q-bio-adv-8',
          question: 'In the bacterial lac operon, what molecular repressor binds to the operator to prevent transcription when lactose is absent?',
          options: ['The LacI Repressor protein', 'The CAP-cAMP complex', 'Allolactose', 'Tryptophan corepressor'],
          correctIndex: 0,
          explanation: 'In the absence of allolactose inducer, the LacI tetramer binds tightly to the operator, physically blocking RNA polymerase.'
        },
        {
          id: 'q-bio-adv-9',
          question: 'Which viral vector system is widely favored for in-vivo human gene therapy due to low pathogenicity and long-term episomal transgene expression in non-dividing tissues?',
          options: ['Recombinant Adeno-Associated Virus (rAAV)', 'Lentivirus', 'Retrovirus', 'Herpes Simplex Virus'],
          correctIndex: 0,
          explanation: 'AAV vectors have excellent safety profiles, minimal genomic integration risk, and strong tropism for retina, liver, and neurons.'
        },
        {
          id: 'q-bio-adv-10',
          question: 'What pivotal tumor suppressor protein arrests cell cycle progression at the G1/S DNA damage checkpoint and triggers apoptosis if damage is irreparable?',
          options: ['p53', 'Cyclin B', 'Cdk2', 'Telomerase'],
          correctIndex: 0,
          explanation: 'Known as "guardian of the genome", p53 transactivates p21 (CIP1) to halt Cdk activity upon DNA double-strand breaks.'
        },
        {
          id: 'q-bio-adv-11',
          question: 'In Illumina Next-Generation Sequencing (NGS), what chemistry ensures that only a single fluorescent base is incorporated per flow-cell cycle?',
          options: ['Reversible terminator nucleotides with removable fluorescent dye labels', 'Irreversible ddNTP chain terminators', 'Proton release pH detection', 'Nanopore current blockage'],
          correctIndex: 0,
          explanation: 'Illumina sequencing uses reversible 3\' blockers that allow only one base incorporation, imaged and cleaved per cycle.'
        },
        {
          id: 'q-bio-adv-12',
          question: 'What synthetic multi-enzyme metabolic pathway was designed to fix atmospheric carbon dioxide with higher catalytic efficiency than RuBisCO?',
          options: ['The CETCH Cycle', 'The Pentose Phosphate Shunt', 'Lactic Acid Fermentation', 'Glycolytic Pathway'],
          correctIndex: 0,
          explanation: 'The synthetic CETCH cycle uses enoyl-CoA carboxylases/reductases to fix CO2 without oxygenase side-reactions.'
        },
        {
          id: 'q-bio-adv-13',
          question: 'Which analytical tool interrogates optical scatter and multi-color fluorescence to characterize and physically sort thousands of single cells per second?',
          options: ['Fluorescence-Activated Cell Sorting (FACS / Flow Cytometry)', 'Isoelectric Focusing', 'MALDI-TOF Mass Spectrometry', 'Cryo-EM'],
          correctIndex: 0,
          explanation: 'FACS focuses single-cell streams past interrogation lasers, measuring forward/side scatter and fluorescent markers.'
        },
        {
          id: 'q-bio-adv-14',
          question: 'What critical structural sequence in the SARS-CoV-2 spike glycoprotein is cleaved by host furin protease during viral maturation?',
          options: ['A polybasic PRRAR cleavage motif at the S1/S2 boundary', 'The internal nucleocapsid core', 'The lipid envelope bilayer', 'The RNA-dependent RNA polymerase domain'],
          correctIndex: 0,
          explanation: 'The insertion of a polybasic cleavage site at S1/S2 primes the spike for efficient ACE2 receptor binding and cell entry.'
        },
        {
          id: 'q-bio-adv-15',
          question: 'In Cryo-Electron Microscopy (Cryo-EM), why are biological specimens plunge-frozen into liquid ethane rather than frozen slowly?',
          options: ['To form amorphous vitrified ice without damaging hexagonal crystal lattices', 'To evaporate water instantly', 'To coat specimens in gold nanoparticles', 'To chemically denature proteins'],
          correctIndex: 0,
          explanation: 'Ultra-fast freezing vitrifies water into an amorphous glass-like state, preserving near-atomic biological structure without crystalline expansion.'
        }
      ]
    },

    // ========================================================================
    // 6. CHEMISTRY & MOLECULES (chem)
    // ========================================================================
    {
      id: 'quiz-chem-beginner',
      title: 'Chemistry & Molecules - Beginner Assessment',
      subjectId: 'chem',
      level: 'Beginner',
      questionCount: 5,
      timeLimitMinutes: 8,
      createdAt: '2026-07-20T00:00:00.000Z',
      questions: [
        {
          id: 'q-chem-beg-1',
          question: 'Which subatomic particle carries a negative electrical charge and occupies atomic orbitals outside the nucleus?',
          options: ['Electron', 'Proton', 'Neutron', 'Positron'],
          correctIndex: 0,
          explanation: 'Electrons carry a -1 charge, while protons are positive and neutrons are neutral.'
        },
        {
          id: 'q-chem-beg-2',
          question: 'Elements in Group 18 of the Periodic Table (e.g. Helium, Neon, Argon) are famously known as:',
          options: ['Noble Gases', 'Alkali Metals', 'Halogens', 'Transition Metals'],
          correctIndex: 0,
          explanation: 'Noble gases possess filled valence electron shells, giving them extreme chemical stability and inertness.'
        },
        {
          id: 'q-chem-beg-3',
          question: 'A chemical aqueous solution with a pH of 2.0 is classified as:',
          options: ['Strongly Acidic', 'Neutral', 'Strongly Basic (Alkaline)', 'Pure Deionized Water'],
          correctIndex: 0,
          explanation: 'pH < 7 indicates acidity; a pH of 2.0 corresponds to a high hydronium concentration [H+] = 0.01 M.'
        },
        {
          id: 'q-chem-beg-4',
          question: 'What phase transition describes the direct transformation of a gas into a solid without passing through a liquid phase?',
          options: ['Deposition', 'Sublimation', 'Condensation', 'Vaporization'],
          correctIndex: 0,
          explanation: 'Deposition converts gas directly to solid (e.g., frost formation). Sublimation is the reverse (solid to gas).'
        },
        {
          id: 'q-chem-beg-5',
          question: 'In the balanced chemical reaction `2 H2 + O2 -> 2 H2O`, what is the molar ratio of H2 to O2 required?',
          options: ['2 : 1', '1 : 1', '1 : 2', '2 : 2'],
          correctIndex: 0,
          explanation: 'Stoichiometric coefficients show that 2 moles of diatomic hydrogen react with 1 mole of diatomic oxygen.'
        }
      ]
    },
    {
      id: 'quiz-chem-intermediate',
      title: 'Chemistry & Molecules - Intermediate Assessment',
      subjectId: 'chem',
      level: 'Intermediate',
      questionCount: 10,
      timeLimitMinutes: 15,
      createdAt: '2026-07-20T00:00:00.000Z',
      questions: [
        {
          id: 'q-chem-int-1',
          question: 'What type of chemical bond forms between two atoms when valence electrons are shared equally between them?',
          options: ['Nonpolar Covalent Bond', 'Ionic Bond', 'Hydrogen Bond', 'Coordinate Covalent Bond'],
          correctIndex: 0,
          explanation: 'Equal sharing of bonding electrons between atoms with minimal electronegativity difference forms nonpolar covalent bonds.'
        },
        {
          id: 'q-chem-int-2',
          question: 'According to the Ideal Gas Law `PV = nRT`, what happens to pressure P if the gas volume V is halved at constant temperature and moles?',
          options: ['Pressure doubles (Boyle\'s Law)', 'Pressure is halved', 'Pressure remains unchanged', 'Pressure drops to zero'],
          correctIndex: 0,
          explanation: 'Boyle\'s law dictates P is inversely proportional to V at constant T: halving volume doubles gas collision pressure.'
        },
        {
          id: 'q-chem-int-3',
          question: 'For an exothermic chemical equilibrium (Delta_H < 0), what does Le Chatelier\'s Principle predict will occur if temperature is raised?',
          options: ['Equilibrium shifts to the left toward reactants', 'Equilibrium shifts to the right toward products', 'Equilibrium constant Kc increases', 'No change occurs'],
          correctIndex: 0,
          explanation: 'Heat is a product in exothermic reactions; adding thermal energy shifts equilibrium left to consume excess heat.'
        },
        {
          id: 'q-chem-int-4',
          question: 'In the redox reaction `Zn + Cu2+ -> Zn2+ + Cu`, what happens to metallic zinc (Zn)?',
          options: ['It is oxidized (loses 2 electrons)', 'It is reduced (gains 2 electrons)', 'It acts as an oxidizing agent', 'It undergoes protonation'],
          correctIndex: 0,
          explanation: 'Oxidation is loss of electrons; Zn increases its oxidation state from 0 to +2 by releasing two electrons.'
        },
        {
          id: 'q-chem-int-5',
          question: 'What is the molar concentration (M) of a solution prepared by dissolving 2.0 moles of solute in 0.50 Liters of water?',
          options: ['4.0 M', '1.0 M', '0.25 M', '2.5 M'],
          correctIndex: 0,
          explanation: 'Molarity M = moles / Liters = 2.0 mol / 0.50 L = 4.0 M.'
        },
        {
          id: 'q-chem-int-6',
          question: 'Which chemical element on the Periodic Table possesses the highest Pauling electronegativity value (3.98)?',
          options: ['Fluorine (F)', 'Oxygen (O)', 'Chlorine (Cl)', 'Cesium (Cs)'],
          correctIndex: 0,
          explanation: 'Fluorine has the highest electronegativity, exerting the strongest pull on shared bonding electrons.'
        },
        {
          id: 'q-chem-int-7',
          question: 'What organic functional group consists of a carbonyl group bonded directly to a hydroxyl group (-COOH)?',
          options: ['Carboxylic Acid', 'Aldehyde', 'Ketone', 'Ester'],
          correctIndex: 0,
          explanation: 'The carboxyl group (-COOH) characterizes organic carboxylic acids such as formic acid and acetic acid.'
        },
        {
          id: 'q-chem-int-8',
          question: 'What is the standard enthalpy of formation (Delta_H_f) for any pure element in its most stable standard thermodynamic state (e.g. O2 gas, C graphite)?',
          options: ['0 kJ/mol', '100 kJ/mol', '-285.8 kJ/mol', 'Variable with volume'],
          correctIndex: 0,
          explanation: 'By standard thermodynamic definition, the enthalpy of formation of an element in its standard state is assigned 0 kJ/mol.'
        },
        {
          id: 'q-chem-int-9',
          question: 'How does a chemical catalyst accelerate reaction rates without being consumed?',
          options: ['By providing an alternative mechanism with a lower activation energy barrier (E_a)', 'By increasing the net enthalpy Delta_H', 'By shifting equilibrium toward products', 'By heating up reactants'],
          correctIndex: 0,
          explanation: 'Catalysts lower the activation energy required to achieve transition states, speeding forward and reverse rates equally.'
        },
        {
          id: 'q-chem-int-10',
          question: 'Which prominent intermolecular force accounts for water\'s anomalously high boiling point and surface tension?',
          options: ['Hydrogen Bonding', 'London Dispersion Forces only', 'Dipole-induced dipole forces', 'Covalent network bonding'],
          correctIndex: 0,
          explanation: 'Extensive intermolecular hydrogen bonds between electronegative oxygen and polar hydrogen atoms require substantial thermal energy to disrupt.'
        }
      ]
    },
    {
      id: 'quiz-chem-advanced',
      title: 'Chemistry & Molecules - Advanced Assessment',
      subjectId: 'chem',
      level: 'Advanced',
      questionCount: 15,
      timeLimitMinutes: 25,
      createdAt: '2026-07-20T00:00:00.000Z',
      questions: [
        {
          id: 'q-chem-adv-1',
          question: 'What thermodynamic condition determines that a chemical reaction will proceed spontaneously at constant temperature and pressure?',
          options: ['Delta_G < 0 (Negative Gibbs Free Energy change)', 'Delta_H < 0 only', 'Delta_S_system > 0 only', 'Delta_G > 0'],
          correctIndex: 0,
          explanation: 'A negative change in Gibbs free energy (Delta_G = Delta_H - T*Delta_S < 0) is the strict criterion for thermodynamic spontaneity.'
        },
        {
          id: 'q-chem-adv-2',
          question: 'What fundamental equation relates the temperature dependence of chemical rate constants: `k = A * e^(-E_a / (R * T))`?',
          options: ['The Arrhenius Equation', 'The Nernst Equation', "The Van 't Hoff Equation", 'The Henderson-Hasselbalch Equation'],
          correctIndex: 0,
          explanation: 'The Arrhenius equation mathematically quantifies how thermal energy overcomes the activation barrier Ea.'
        },
        {
          id: 'q-chem-adv-3',
          question: 'Which nucleophilic substitution mechanism proceeds via a planar carbocation intermediate and exhibits first-order kinetics?',
          options: ['SN1 (Substitution Nucleophilic Unimolecular)', 'SN2 (Substitution Nucleophilic Bimolecular)', 'E2 Elimination', 'Electrophilic Addition'],
          correctIndex: 0,
          explanation: 'SN1 features a rate-limiting ionization forming a planar carbocation, resulting in partial or complete racemization.'
        },
        {
          id: 'q-chem-adv-4',
          question: 'Which electrochemical equation calculates cell potential (E) under non-standard concentration conditions from standard potential (E°)?',
          options: ['The Nernst Equation: E = E° - (RT / nF) * ln(Q)', 'The Butler-Volmer Equation', "Faraday's Law", 'Debye-Hückel Law'],
          correctIndex: 0,
          explanation: 'The Nernst equation calculates the reduction potential of a half-cell or battery as a function of the reaction quotient Q.'
        },
        {
          id: 'q-chem-adv-5',
          question: 'According to Molecular Orbital Theory, what is the bond order and magnetic property of diatomic Oxygen (O2)?',
          options: ['Bond Order = 2 and Paramagnetic (two unpaired electrons in pi* antibonding orbitals)', 'Bond Order = 2 and Diamagnetic', 'Bond Order = 1 and Diamagnetic', 'Bond Order = 3 and Ferromagnetic'],
          correctIndex: 0,
          explanation: 'MO theory places 8 valence electrons in bonding and 4 in antibonding orbitals: (8 - 4)/2 = 2. Two degenerate pi* orbitals hold unpaired spins.'
        },
        {
          id: 'q-chem-adv-6',
          question: 'In 1H-NMR spectroscopy, what causes scalar spin-spin coupling and the multiplet (n + 1) peak splitting pattern?',
          options: ['Magnetic interactions with non-equivalent neighboring protons mediated through chemical bonding electrons', 'Thermal relaxation decay', 'Chemical shift anisotropy', 'Solvent deuterium exchange'],
          correctIndex: 0,
          explanation: 'J-coupling occurs through bonding electron clouds, splitting peak resonances into (n + 1) sub-peaks.'
        },
        {
          id: 'q-chem-adv-7',
          question: 'In an octahedral transition metal coordination complex, how does the crystal field split the degenerate d-orbitals?',
          options: ['Into lower energy triply degenerate t2g orbitals and higher energy doubly degenerate eg orbitals', 'Into lower eg and higher t2g', 'All 5 d-orbitals remain degenerate', 'Into four distinct energy levels'],
          correctIndex: 0,
          explanation: 'Ligands approaching along Cartesian axes repel dz2 and dx2-y2 (eg) more strongly than non-axial dxy, dxz, dyz (t2g).'
        },
        {
          id: 'q-chem-adv-8',
          question: 'Which equation calculates the pH of a conjugate acid-base buffer system: `pH = pKa + log([A-] / [HA])`?',
          options: ['The Henderson-Hasselbalch Equation', 'The Arrhenius pH Formula', 'The Debye-Hückel Equation', "Kohlrausch's Law"],
          correctIndex: 0,
          explanation: 'Henderson-Hasselbalch relates buffer pH directly to the weak acid pKa and conjugate base/acid concentration ratio.'
        },
        {
          id: 'q-chem-adv-9',
          question: 'Which quantum number specifies the spatial orientation of an atomic orbital in a three-dimensional magnetic field?',
          options: ['Magnetic Quantum Number (m_l)', 'Principal Quantum Number (n)', 'Azimuthal / Angular Momentum Quantum Number (l)', 'Spin Quantum Number (m_s)'],
          correctIndex: 0,
          explanation: 'The magnetic quantum number m_l ranges from -l to +l, designating orbital spatial orientation in space.'
        },
        {
          id: 'q-chem-adv-10',
          question: 'What term defines non-superimposable stereoisomers that are exact mirror images of each other and rotate plane-polarized light in opposite directions?',
          options: ['Enantiomers', 'Diastereomers', 'Constitutional Isomers', 'Conformational Rotamers'],
          correctIndex: 0,
          explanation: 'Enantiomers are chiral stereoisomers that are non-superimposable mirror reflections, possessing identical physical properties except optical activity.'
        },
        {
          id: 'q-chem-adv-11',
          question: 'Which thermodynamic principle states that the total enthalpy change of a reaction depends only on initial and final states, independent of pathway?',
          options: ["Hess's Law of Constant Heat Summation", "Raoult's Law", "Henry's Law", "Beer-Lambert Law"],
          correctIndex: 0,
          explanation: 'Because enthalpy is a state function, Hess\'s Law allows calculating net Delta_H by summing steps of a reaction cycle.'
        },
        {
          id: 'q-chem-adv-12',
          question: 'For the Haber-Bosch ammonia synthesis `N2(g) + 3 H2(g) <=> 2 NH3(g)`, how does increasing overall pressure affect equilibrium composition?',
          options: ['Shifts right toward NH3 products (4 gas moles -> 2 gas moles)', 'Shifts left toward N2 and H2 reactants', 'No equilibrium shift occurs', 'Stops reaction progress'],
          correctIndex: 0,
          explanation: 'Le Chatelier\'s principle dictates that compressing the gas volume shifts equilibrium toward the side with fewer gas moles (from 4 to 2).'
        },
        {
          id: 'q-chem-adv-13',
          question: 'In chemical kinetics, what core assumption is made by the Steady-State Approximation regarding reactive reaction intermediates?',
          options: ['The net rate of change of intermediate concentration is approximately zero (d[Intermediate]/dt approx 0)', 'Intermediates never react further', 'Intermediates match initial reactant concentration', 'Forward rate is infinite'],
          correctIndex: 0,
          explanation: 'Highly reactive intermediates exist at very low, nearly constant concentration, allowing their net rate of formation/consumption to be set to zero.'
        },
        {
          id: 'q-chem-adv-14',
          question: 'What non-covalent supramolecular interaction involves attractive forces between the electron-rich pi cloud of an aromatic ring and a metal or organic cation?',
          options: ['Cation-pi Interaction', 'Salt bridge only', 'London dispersion only', 'Halogen bonding'],
          correctIndex: 0,
          explanation: 'Cation-pi interactions arise between a monopolar positive ion and the quadrupole electron density of an aromatic ring.'
        },
        {
          id: 'q-chem-adv-15',
          question: 'In Jablonski photophysical diagrams, what radiationless transition describes an electron crossing between states of different spin multiplicities (e.g. S1 to T1)?',
          options: ['Intersystem Crossing (ISC)', 'Internal Conversion (IC)', 'Fluorescence Emission', 'Vibrational Relaxation'],
          correctIndex: 0,
          explanation: 'Intersystem crossing involves spin-orbit coupling enabling non-radiative transitions between singlet and triplet excited states.'
        }
      ]
    }
  ];

  // Auto-seed into INITIAL_DATA if present
  if (typeof window !== 'undefined' && window.INITIAL_DATA) {
    window.INITIAL_DATA.quizzes = window.ALL_SUBJECT_QUIZZES;
  }
})();
