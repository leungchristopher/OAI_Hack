# SmolVLA architecture and recorded rollout

`SmolVlaMath` contains three connected worked examples: multimodal conditioning and attention masks; a noise/action interpolation with velocity targets; and Euler integration compared with an analytic solution. They use fixed analytic computations, not the policy's learned weights. The recorded MuJoCo trajectory is separate and comes from real pretrained inference.

## Sources

- [SmolVLA paper, 2506.01844](https://arxiv.org/abs/2506.01844).
- [Official architecture description](https://huggingface.co/blog/smolvla).
- [LeRobot SmolVLA implementation](https://github.com/huggingface/lerobot/blob/main/src/lerobot/policies/smolvla/modeling_smolvla.py).
- [Pinned ALOHA checkpoint](https://huggingface.co/bdth0716/smolvla_aloha_test/tree/0abb36f31120d809f8c743a39a0252faaf5b84e9).
- [Training dataset](https://huggingface.co/datasets/lerobot/aloha_sim_transfer_cube_human).

The checkpoint is community-trained, not an official SmolVLA benchmark release. Its config specifies a top camera, 14-dimensional joint state and action, matching ALOHA TransferCube. Its train config names the dataset above and 100,000 training steps. The dataset's `meta/tasks.parquet` supplies the exact language instruction. Whole-model safetensors load strictly; saved preprocessing and postprocessing statistics are used. No remote model code is trusted or executed. The checkpoint's disabled `compile_model=false` and unused `compile_mode` metadata are omitted for compatibility with installed LeRobot; no architecture dimensions or weights are changed.

The official HuggingFaceVLA LIBERO candidate used a custom input schema and absolute model path. A second LIBERO candidate was compatible in principle but required a different environment. The matching ALOHA checkpoint avoids inventing joint mappings.

## Reproduce

Use the base versions in `robotics/requirements-lock.txt`, then add `transformers>=4.57.1,<5` and `num2words>=0.5.14,<0.6` in a separate environment. The executed environment used transformers 4.57.6 and num2words 0.5.14, with the base robotics environment read-only. Neither LIBERO nor robosuite is needed for this ALOHA recording.

```sh
python robotics/record_smolvla.py --seed 7 --steps 400 --device cpu
```

The script downloads the pinned public checkpoint, constructs its architecture, loads every model parameter strictly, and records real observations, model actions, environment rewards and inference timings. Results are `public/robotics/smolvla-rollout.mp4`, `smolvla-poster.png`, `smolvla-trajectory.json` and `smolvla-manifest.json`. The manifest records hashes, task, revision, step counts, and observed success; failure to solve the task remains a valid recorded execution. The camera poster is the actual first frame.

## Mathematical conventions

For readability the worked interpolation uses noise-to-data time s: x(s)=(1-s)ε+sA and target A−ε. Installed LeRobot uses t=1−s: x(t)=tε+(1−t)A, target ε−A and negative Euler steps from t=1 to t=0. These are the same path with opposite time orientation. The separate analytic field dx/ds=2(c−x) has solution c+(ε−c)exp(−2s), allowing an exact integration-error check. It is not a learned SmolVLA field.

Tests cover interpolation endpoints and derivative, masked-attention normalization and zero blocked weights, Euler convergence, constant solutions and invalid step counts.

## Verified recording

The delivered seed-7 CPU rollout has 400 decoded video frames and 400 finite action samples, 50 fps (8 seconds). Maximum reward was 2; the transfer success criterion of 4 was not reached. The recording took 26.69 seconds excluding model loading. The poster and changing camera frames were inspected, and the manifest contains the checkpoint/video SHA-256 hashes and package versions. No failed rollout was relabeled successful.
