# AlphaGo house

`AlphaGoLab` exposes Search, Networks, Training and Games rooms and an optional `onClose` callback. The Games room imports the separate `GoGames` component. `alphaGoPaper` exports a validated `PaperDocument` containing nine actual excerpts from the user's `papers/Silver2016.pdf` for central source-grounded tutoring.

## Verified architecture

Silver et al., *Mastering the game of Go with deep neural networks and tree search*, Nature 529, 484–489 (2016), DOI [10.1038/nature16961](https://doi.org/10.1038/nature16961). Methods PDF pages 7–8 were read, and the PUCT expression on page 7 was rendered and visually checked.

- Policy input: 19×19×48 binary feature planes. First layer: 5×5 convolutions, stride 1, zero padding, 192 filters in the match system. Layers 2–12: 3×3 convolutions with 192 filters and ReLU. Final 1×1 filter and position-specific biases produce board logits for softmax.
- Value input: the same planes plus colour-to-play (49 planes). Convolutional pathway through hidden layer 12; layer 13 one 1×1 filter; layer 14 fully connected 256 ReLUs; output one tanh unit.
- Original AlphaGo used supervised-policy priors in search, an improved reinforcement-learning policy for self-play data, a separately trained value network, and a fast pattern-based rollout policy. It is not the later AlphaZero architecture/training scheme.
- Methods describe 29.4 million KGS positions (28.4 million training, one million test) from 160,000 games. Value examples came from over 30 million separate self-play games.
- Paper match: Fan Hui, October 2015. Historical game viewer: Lee Sedol, March 2016. [Official history](https://deepmind.google/research/alphago/) distinguishes both matches.

## Interactive computations

Search compares prior-weighted PUCT to UCB1. Editable P, visits, mean Q, exploration coefficient, rollout weight, leaf estimate and rollout outcome affect exact calculations. Each completed cycle adds one visit and backs up separate value and rollout sums. Final action uses most visits. The fixed tree isolates a root decision; asynchronous evaluation queues, virtual loss and full board search are outside this numerical workbench. All values are expressed in the local player perspective; pure backup code supports sign reversal.

The network workbench computes a clickable scalar-channel convolution, stable softmax and tanh. These weights are teaching parameters, not recovered AlphaGo weights. Training performs cross-entropy descent, outcome-weighted REINFORCE updates or value MSE descent on editable small examples.

Eight tests cover softmax stability, the correct λ direction (rollout weight), PUCT calculation, UCB unvisited actions, visit-based final selection, immutable backup/sign reversal, SL/RL update direction, analytic value gradients and convolution/ReLU.

## PDF evidence

Nine source passages were extracted using pdfplumber x_tolerance=1. Whole-width abstract on page 1 and separate left/right columns on pages 7–8 prevent column interleaving. Whitespace and typographic word wrapping are normalized. Each passage retains its page/section; no generated explanation is represented as a quotation.
