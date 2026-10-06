import type {PaperDocument} from '../../shared/contracts';
/** Literal supplied Silver2016.pdf excerpts; whitespace and line wraps normalized. */
export const alphaGoPaper: PaperDocument = {
  "id": "alphago-2016",
  "title": "Mastering the game of Go with deep neural networks and tree search",
  "authors": [
    "David Silver",
    "Aja Huang",
    "Chris J. Maddison",
    "Arthur Guez",
    "Laurent Sifre",
    "George van den Driessche",
    "Julian Schrittwieser",
    "Ioannis Antonoglou",
    "Veda Panneershelvam",
    "Marc Lanctot",
    "Sander Dieleman",
    "Dominik Grewe",
    "John Nham",
    "Nal Kalchbrenner",
    "Ilya Sutskever",
    "Timothy Lillicrap",
    "Madeleine Leach",
    "Koray Kavukcuoglu",
    "Thore Graepel",
    "Demis Hassabis"
  ],
  "sourceUrl": "https://doi.org/10.1038/nature16961",
  "identifiers": {
    "doi": "10.1038/nature16961"
  },
  "passages": [
    {
      "id": "p1",
      "text": "The game of Go has long been viewed as the most challenging of classic games for artificial intelligence owing to its enormous search space and the difficulty of evaluating board positions and moves. Here we introduce a new approach to computer Go that uses ‘value networks’ to evaluate board positions and ‘policy networks’ to select moves. These deep neural networks are trained by a novel combination of supervised learning from human expert games, and reinforcement learning from games of self-play. Without any lookahead search, the neural networks play Go at the level of stateof-the-art Monte Carlo tree search programs that simulate thousands of random games of self-play. We also introduce a new search algorithm that combines Monte Carlo simulation with value and policy networks. Using this search algorithm, our program AlphaGo achieved a 99.8% winning rate against other Go programs, and defeated the human European Go champion by 5 games to 0. This is the first time that a computer program has defeated a human professional player in the full-sized game of Go, a feat previously thought to be at least a decade away.",
      "page": 1,
      "section": "Abstract · PDF p. 1",
      "kind": "quotation"
    },
    {
      "id": "p2",
      "text": "At the end of search AlphaGo selects the action with maximum visit count; this is less sensitive to outliers than maximizing action value15. The search tree is reused at subsequent time steps: the child node corresponding to the played action becomes the new root node; the subtree below this child is retained along with all its statistics, while the remainder of the tree is discarded.",
      "page": 7,
      "section": "Methods: final action selection · PDF p. 7",
      "kind": "quotation"
    },
    {
      "id": "p3",
      "text": "Policy network: classification. We trained the policy network pσ to classify positions according to expert moves played in the KGS data set. This data set contains 29.4 million positions from 160,000 games played by KGS 6 to 9 dan human players; 35.4% of the games are handicap games. The data set was split into a test set (the first million positions) and a training set (the remaining 28.4 million positions). Pass moves were excluded from the data set. Each position consisted of a raw board description s and the move a selected by the human. We augmented the data set to include all eight reflections and rotations of each position.",
      "page": 8,
      "section": "Methods: supervised policy data · PDF p. 8",
      "kind": "quotation"
    },
    {
      "id": "p4",
      "text": "Policy network: reinforcement learning. We further trained the policy network by policy gradient reinforcement learning25,26. Each iteration consisted of a minibatch of n games played in parallel, between the current policy network pρ that is being trained, and an opponent p ρ− that uses parameters ρ− from a previous iteration, randomly sampled from a pool of opponents, so as to increase the stability of training.",
      "page": 8,
      "section": "Methods: policy reinforcement learning · PDF p. 8",
      "kind": "quotation"
    },
    {
      "id": "p5",
      "text": "Value network: regression. We trained a value network vθ (s) ≈ v pρ(s) to approximate the value function of the RL policy network pρ. To avoid overfitting to the strongly correlated positions within games, we constructed a new data set of uncorrelated self-play positions. This data set consisted of over 30 million positions, each drawn from a unique game of self-play.",
      "page": 8,
      "section": "Methods: value regression · PDF p. 8",
      "kind": "quotation"
    },
    {
      "id": "p6",
      "text": "Neural network architecture. The input to the policy network is a 19 × 19 × 48 image stack consisting of 48 feature planes. The first hidden layer zero pads the input into a 23 × 23 image, then convolves k filters of kernel size 5 × 5 with stride 1 with the input image and applies a rectifier nonlinearity. Each of the subsequent hidden layers 2 to 12 zero pads the respective previous hidden layer into a 21 × 21 image, then convolves k filters of kernel size 3 × 3 with stride 1, again followed by a rectifier nonlinearity. The final layer convolves 1 filter of kernel size 1 × 1 with stride 1, with a different bias for each position, and applies a softmax function. The match version of AlphaGo used k = 192 filters; Fig. 2b and Extended Data Table 3 additionally show the results of training with k = 128, 256 and 384 filters.",
      "page": 8,
      "section": "Methods: policy architecture · PDF p. 8",
      "kind": "quotation"
    },
    {
      "id": "p7",
      "text": "The input to the value network is also a 19 × 19 × 48 image stack, with an additional binary feature plane describing the current colour to play. Hidden layers 2 to 11 are identical to the policy network, hidden layer 12 is an additional convolution layer, hidden layer 13 convolves 1 filter of kernel size 1 × 1 with stride 1, and hidden layer 14 is a fully connected linear layer with 256 rectifier units. The output layer is a fully connected linear layer with a single tanh unit.",
      "page": 8,
      "section": "Methods: value architecture · PDF p. 8",
      "kind": "quotation"
    },
    {
      "id": "p8",
      "text": "Rollout policy. The rollout policy p (a|s) is a linear softmax policy based on fast, π incrementally computed, local pattern-based features consisting of both ‘response’ patterns around the previous move that led to state s, and ‘non-response’ patterns around the candidate move a in state s. Each non-response pattern is a binary feature matching a specific 3 × 3 pattern centred on a, defined by the colour (black, white, empty) and liberty count (1, 2, ≥3) for each adjacent intersection. Each response pattern is a binary feature matching the colour and liberty count in a 12-point diamond-shaped pattern21 centred around the previous move.",
      "page": 8,
      "section": "Methods: rollout policy · PDF p. 8",
      "kind": "quotation"
    },
    {
      "id": "p9",
      "text": "where P(s, a) is the prior probability, Wv(s, a) and Wr(s, a) are Monte Carlo estimates of total action value, accumulated over Nv(s, a) and Nr(s, a) leaf evaluations and rollout rewards, respectively, and Q(s, a) is the combined mean action value for that edge. Multiple simulations are executed in parallel on separate search threads.",
      "page": 7,
      "section": "Methods: search edge statistics · PDF p. 7",
      "kind": "quotation"
    }
  ],
  "references": [],
  "coverage": "selected-passages",
  "year": 2016
};
