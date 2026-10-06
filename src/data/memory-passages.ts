/** Quotations extracted from supplied PDFs. Rebuild: python scripts/extract-papers.py. */
export const memoryPassages: Record<string, Array<{ id: string; text: string; section: string; kind: 'quotation'; page: number }>> = {
  "forget-2000": [
    {
      "id": "p1",
      "text": "Saturation will make h’s derivative vanish, thus blocking incoming errors, and make the cell output equal the output gate activation; that is, the entire memory cell will degenerate into an ordinary BPTT unit, so that the cell will cease functioning as a memory. The problem did not arise in the experiments reported by Hochreiter and Schmidhuber (1997) because cell states were explicitly reset to zero before the start of each new sequence.",
      "section": "Limits of standard LSTM · PDF p. 5",
      "kind": "quotation",
      "page": 5
    },
    {
      "id": "p2",
      "text": "Our solution to the problem above is to use adaptive forget gates, which learn to reset memory blocks once their contents are out of date and hence useless. By resets, we do not mean only immediate resets to zero but also gradual resets corresponding to slowly fading cell states.",
      "section": "Section 3: Solution: Forget Gates · PDF p. 5",
      "kind": "quotation",
      "page": 5
    },
    {
      "id": "p3",
      "text": "Table 2: Continuous Embedded Reber Grammar (CERG). Algorithm % Solutionsa % Good Solutionsb % Restc Standard LSTM with external reset 74 (7441) 0 ⟨−⟩ 26 ⟨31⟩ Standard LSTM 0 (-) 1 ⟨1166⟩ 99 ⟨37⟩ LSTM with state decay (0.9) 0 (-) 0 ⟨−⟩ 100 ⟨56⟩ LSTM with forget gates 18 (18,889) 29 ⟨39,171⟩ 53 ⟨145⟩ LSTM with forget gates and sequential α decay 62 (14,087) 6 ⟨68,464⟩ 32 ⟨30⟩ aPercentage of “perfect” solutions (correct prediction of 10 streams of 100,000 symbols each). The number of training streams presented until a solution was reached is shown in parentheses. bPercentage of solutions with an average stream length > 1000. The mean length of error-free prediction is given in angle brackets. cPercentage of “bad” solutions with average stream length ≤ 1000. The mean length of error-free prediction is given in angle brackets. Notes: The results are averages over 100 independently trained networks. Other algorithms like BPTT are not included in the comparison, because they tend to fail even on the easier, noncontinual ERG.",
      "section": "Table 2: CERG results and sample size · PDF p. 14",
      "kind": "quotation",
      "page": 14
    },
    {
      "id": "p4",
      "text": "aPercentage of “perfect” solutions (correct prediction of 10 streams of 100,000 symbols each). The number of training streams presented until a solution was reached is shown in parentheses. bPercentage of solutions with an average stream length > 1000. The mean length of error-free prediction is given in angle brackets. cPercentage of “bad” solutions with average stream length ≤ 1000. The mean length of error-free prediction is given in angle brackets. Notes: The results are averages over 100 independently trained networks. Other algorithms like BPTT are not included in the comparison, because they tend to fail even on the easier, noncontinual ERG.",
      "section": "Table 2: success criterion and sample size · PDF p. 14",
      "kind": "quotation",
      "page": 14
    },
    {
      "id": "p5",
      "text": "Using a large bias (5.0) for the forget gates, extended LSTM solved the task as quickly as standard LSTM (recall that a high forget gate bias makes extended LSTM degenerate into standard LSTM). Using a moderate bias like the one used for CERG (1.0), extended LSTM took about three times longer on average, but did solve the problem. The slower learning speed results from the net’s having to learn to remember everything and not to forget. Generally we have not yet encountered a problem that LSTM solves while extended LSTM does not.",
      "section": "Section 4.5.1: forget-gate bias · PDF p. 17",
      "kind": "quotation",
      "page": 17
    },
    {
      "id": "p6",
      "text": "The standard technique of weight decay, which helps to contain the level of overall activity within the network, was found to generate solutions that were particularly prone to unbounded state growth. Variants of focused backpropagation (Mozer, 1989) also do not work well. These let the internal state decay via a self-connection whose weight is smaller than 1. But there is no principled way of designing appropriate decay constants. A potential gain for some tasks is paid for by a loss of ability to deal with arbitrary, unknown causal delays between inputs and targets. In fact, state decay does not significantly improve experimental performance (see “state decay” in Table 2).",
      "section": "Section 2.1: fixed decay trade-off · PDF p. 5",
      "kind": "quotation",
      "page": 5
    }
  ],
  "lstm-1997": [
    {
      "id": "p1",
      "text": "Figure 1: Architecture of memory cell cj (the box) and its gate units inj; outj. The self-recurrent connection (with weight 1.0) indicates feedback with a delay of 1 time step. It builds the basis of the “constant error carrousel” CEC. The gate units open and close access to CEC. See text and appendix A.1 for details.",
      "section": "Figure 1: memory cell and gates · PDF p. 7",
      "kind": "quotation",
      "page": 7
    },
    {
      "id": "p2",
      "text": "Learning to store information over extended time intervals via recurrent backpropagation takes a very long time, mostly due to insufficient, decaying error back flow. We briefly review Hochreiter's 1991 analysis of this problem, then address it by introducing a novel, efficient, gradient-based method called “Long Short-Term Memory” (LSTM). Truncating the gradient where this does not do harm, LSTM can learn to bridge minimal time lags in excess of 1000 discrete time steps by enforcing constant error flow through “constant error carrousels” within special units. Multiplicative gate units learn to open and close access to the constant error flow. LSTM is local in space and time; its computational complexity per time step and weight is O(1). Our experiments with artificial data involve local, distributed, real-valued, and noisy pattern representations. In comparisons with RTRL, BPTT, Recurrent Cascade-Correlation, Elman nets, and Neural Sequence Chunking, LSTM leads to many more successful runs, and learns much faster. LSTM also solves complex, artificial long time lag tasks that have never been solved by previous recurrent network algorithms.",
      "section": "Abstract · PDF p. 1",
      "kind": "quotation",
      "page": 1
    },
    {
      "id": "p3",
      "text": "Learning. We use a variant of RTRL (e.g., Robinson and Fallside 1987) which properly takes into account the altered, multiplicative dynamics caused by input and output gates. However, to ensure non-decaying error backprop through internal states of memory cells, as with truncated BPTT (e.g., Williams and Peng 1990), errors arriving at “memory cell net inputs” (for cell cj, this includes netcj , netinj , netoutj ) do not get propagated back further in time (although they do serve 2 to change the incoming weights). Only within memory cells, errors are propagated back through previous internal states scj .",
      "section": "Section 4: learning · PDF p. 8",
      "kind": "quotation",
      "page": 8
    }
  ],
  "timing-2002": [
    {
      "id": "p1",
      "text": "The temporal distance between events conveys information essential for numerous sequential tasks such as motor control and rhythm detection. While Hidden Markov Models tend to ignore this information, recurrent neural networks (RNNs) can in principle learn to make use of it. We focus on Long Short-Term Memory (LSTM) because it has been shown to outperform other RNNs on tasks involving long time lags. We find that LSTM augmented by “peephole connections” from its internal cells to its multiplicative gates can learn the fine distinction between sequences of spikes spaced either 50 or 49 time steps apart without the help of any short training exemplars. Without external resets or teacher forcing, our LSTM variant also learns to generate stable streams of precisely timed spikes and other highly nonlinear periodic patterns. This makes LSTM a promising approach for tasks that require the accurate measurement or generation of time intervals.",
      "section": "Abstract · PDF p. 1",
      "kind": "quotation",
      "page": 1
    },
    {
      "id": "p2",
      "text": "Peephole connections. Our simple but effective remedy is to add weighted “peephole” connections from the CEC to the gates of the same memory block (Figure 2). The peephole connections allow all gates to inspect the current cell state even when the output gate is closed. This information can be essential for finding well-working network solutions, as we will see in the experiments below. During learning no error signals are propagated back from gates via peephole connections to the CEC (see backward pass, Section 3.2). Peephole connections are treated like regular connections to gates (e.g., from the input) except for update timing.",
      "section": "Section 3: peephole connections · PDF p. 7",
      "kind": "quotation",
      "page": 7
    },
    {
      "id": "p3",
      "text": "A qualitative explanation is that longer intervals necessitate finer tuning of the weights, which requires more training. Peephole LSTM outperforms LSTM for some sets, though peephole connections are not mandatory for the task. They correlate the opening of the output gate to high cell states. Otherwise the output gate has to learn to be open all the time, using its bias input, which may take longer, because the cells states might have higher activation values than the bias (activation one). The continual MSD task for F = 10 with I (n) ∈ {0, 1} or I (n) ∈ {0, 1, 2}, is solved with or without peephole connections (Table 1).",
      "section": "Section 4.2: timing results · PDF p. 12",
      "kind": "quotation",
      "page": 12
    }
  ]
};
