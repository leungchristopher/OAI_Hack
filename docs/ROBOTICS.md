# Robotics workbench

The ACT workbench plays a locally executed pretrained LeRobot policy in the official ALOHA MuJoCo transfer-cube environment. Video, frame-aligned joint positions, actions, rewards, and timing come from `robotics/record_act.py`. The browser does not run PyTorch or MuJoCo. Diffusion and SmolVLA are companion explanations, not alternative controllers for this recording.

## Reproduce

Use Python 3.12 on macOS (or a supported Linux environment with MuJoCo rendering configured):

```sh
python3 -m venv robotics/.venv
robotics/.venv/bin/pip install -r robotics/requirements.txt
robotics/.venv/bin/python robotics/record_act.py --seed 7 --steps 400
```

The first run downloads the official model. The environment and cache are ignored by Git; model weights are not shipped in the website. No OpenAI credentials or Hugging Face token are required for this public model. There is no arbitrary-code HTTP endpoint.

The generated files are:

- `public/robotics/manifest.json`: exact checkpoint revision, package versions, seed, measured outcome, video hash, recording timestamp.
- `public/robotics/act-transfer-cube.mp4`: actual MuJoCo camera frames, encoded at the environment's 50 Hz.
- `public/robotics/trajectory.json`: one sample per video frame, including observed joint positions, policy action, post-action reward, and measured action-selection duration. Chunk-start samples run the network; other samples consume ACT's cached action chunk.

The checkpoint is pinned to `ba73b2766f1371cdc133ca4efb97eb090d744625`. It predates LeRobot's preprocessing refactor. The runner loads every `model.*` parameter strictly and applies the normalization statistics embedded in that checkpoint explicitly. No pretrained backbone download or randomly initialized parameter substitutes for checkpoint weights. Safetensors is used; remote custom code is not enabled.

## Interpretation

The task asks two arms to transfer a cube. The official environment's reward reaches 4 when the left gripper holds the transferred cube clear of the table. The manifest records whether this threshold occurred. A single rollout is not a success-rate evaluation. Playback duration is simulation time; measured wall time and inference timing are recorded separately.

This setup connects the pretrained ACT policy to MuJoCo when the recording command runs. Web playback is a recording of that execution. Changing a playback control does not rerun the model. A different seed requires running the command again.

## Primary sources

- [Pinned official ACT checkpoint](https://huggingface.co/lerobot/act_aloha_sim_transfer_cube_human/tree/ba73b2766f1371cdc133ca4efb97eb090d744625), Apache-2.0 model license.
- [LeRobot](https://github.com/huggingface/lerobot), version 0.4.3 used for ACT inference.
- [Official gym-aloha](https://github.com/huggingface/gym-aloha), action layout, rendering, task and reward definitions.
- [ACT paper and project](https://tonyzhaozh.github.io/aloha/).
- [Diffusion Policy paper and project](https://diffusion-policy.cs.columbia.edu/).
- [SmolVLA paper](https://arxiv.org/abs/2506.01844).

## Verified recording

The bundled recording used seed 7 for 400 steps (8 seconds at 50 Hz). ACT reached maximum reward 2/4: the right gripper lifted the cube, but the transfer did not complete. `success` is therefore `false`. All 400 video frames decode; the action trajectory has 400 finite 14-dimensional actions. The four ACT network evaluations begin at frames 0, 100, 200, and 300. Package versions are captured in the manifest and the complete installed dependency set is in `robotics/requirements-lock.txt`.
