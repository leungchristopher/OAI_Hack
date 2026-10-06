# Diffusion trajectory and mathematics

The application uses the official LeRobot DiffusionPolicy implementation with the public community checkpoint [sangil109/diffusion_aloha_sim](https://huggingface.co/sangil109/diffusion_aloha_sim/tree/3bb11d51b9c951a381fb44849b79c7919b50b55d), revision `3bb11d51b9c951a381fb44849b79c7919b50b55d`. Its published training configuration identifies `lerobot/aloha_sim_transfer_cube_human`. This checkpoint is not represented as an official Hugging Face trained model.

`robotics/record_diffusion.py` loads safetensors only, checks all neural weights with `strict=True`, and applies the checkpoint's saved image mean/std and state/action min/max normalization. It executes `gym_aloha/AlohaTransferCube-v0`, seed 7, on CPU using the saved 100-step DDPM scheduler, observation history 2, horizon 16 and execution horizon 8. There is no substitute controller. Actual measurements, completion status, SHA256 hashes and dependency versions are written to `public/robotics/diffusion-manifest.json`; joint/action samples are in `diffusion-trajectory.json`, video in `diffusion-rollout.mp4`, first-frame poster in `diffusion-poster.png`.

Run from the project root with the existing robotics environment:

```sh
robotics/.venv/bin/python robotics/record_diffusion.py --seed 7 --steps 400
```

Native MuJoCo rendering requires graphics access. The initial sandboxed renderer could not initialize; the successful recording uses native access. One seeded rollout is not a benchmark. A failure to reach reward 4 remains visible as `success: false`.

## Architecture notebook

`DiffusionMath` walks through observation conditioning, temporal U-Net and FiLM, action chunk dimensions, forward Gaussian noising, epsilon prediction training, DDPM reverse posterior and receding horizon execution. It distinguishes robot time from denoising iterations.

The interactive worked example uses a known scalar-coordinate action chunk, seeded Gaussian noise and exact epsilon (an oracle). It deliberately isolates the DDPM equations from the recorded pretrained rollout. A linear beta schedule and an exact forward-noised start make the algebra directly inspectable; the learned checkpoint uses its own cosine schedule and Gaussian initial sample. Controls change K, final beta, target, random seed, reverse iteration and execution prefix. Five tests verify schedule bounds, forward endpoints, posterior final-step recovery, seed reproducibility and full-chunk recovery.

Primary sources: [Diffusion Policy project/paper](https://diffusion-policy.cs.columbia.edu/) and [official LeRobot Diffusion implementation](https://github.com/huggingface/lerobot/blob/main/src/lerobot/policies/diffusion/modeling_diffusion.py).

## Recorded result (6 October 2026)

Completed 400 frames at 50 fps (8 seconds); 400 distinct finite action vectors. The cube-transfer success criterion was **not reached**: maximum environment reward 0, `success: false`. CPU execution took 208.26 seconds. Decoded the MP4 and confirmed exactly 400 frames; inspected both first and final frames. The supplied checkpoint moved the grippers but did not pick up the cube in this run. The UI must preserve that outcome rather than presenting a successful transfer.
