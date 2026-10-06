"""Run the pinned public Diffusion checkpoint in MuJoCo and export measured artifacts."""
import argparse
import hashlib
import importlib.metadata
import json
import os
from pathlib import Path
import time
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parent.parent
os.environ.setdefault('HF_HOME', str(ROOT / 'robotics/.cache'))
os.environ.setdefault('HF_HUB_DISABLE_TELEMETRY', '1')
import gymnasium as gym
import gym_aloha  # Registers official ALOHA MuJoCo environments.
import imageio.v2 as imageio
import numpy as np
import torch
from huggingface_hub import snapshot_download
from safetensors.torch import load_file
from lerobot.configs.policies import PreTrainedConfig
from lerobot.policies.diffusion.configuration_diffusion import DiffusionConfig
from lerobot.policies.diffusion.modeling_diffusion import DiffusionPolicy

POLICY = 'sangil109/diffusion_aloha_sim'
REVISION = '3bb11d51b9c951a381fb44849b79c7919b50b55d'
ENVIRONMENT = 'gym_aloha/AlohaTransferCube-v0'


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--seed', type=int, default=7)
    parser.add_argument('--steps', type=int, default=400, choices=range(1, 401))
    parser.add_argument('--output', type=Path, default=ROOT / 'public/robotics')
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    torch.manual_seed(args.seed)
    np.random.seed(args.seed)
    torch.set_num_threads(4)
    snapshot = Path(snapshot_download(POLICY, revision=REVISION, allow_patterns=['config.json', 'model.safetensors']))
    config = PreTrainedConfig.from_pretrained(snapshot)
    config.device = 'cpu'
    config.pretrained_backbone_weights = None  # Every backbone weight comes from the checkpoint.
    policy = DiffusionPolicy(config)
    weights = load_file(str(snapshot / 'model.safetensors'))
    # This checkpoint stores normalization inside the policy. LeRobot 0.4 moved
    # normalization to processors; apply the exact saved means/stds explicitly.
    policy.load_state_dict({k: v for k, v in weights.items() if k.startswith('diffusion.')}, strict=True)
    policy.eval()
    policy.reset()
    print('Checkpoint loaded strictly, CPU inference; initializing MuJoCo', flush=True)
    env = gym.make(ENVIRONMENT, obs_type='pixels_agent_pos', render_mode='rgb_array', max_episode_steps=args.steps)
    observation, _ = env.reset(seed=args.seed)
    fps = env.metadata['render_fps']
    video_path = args.output / 'diffusion-rollout.mp4'
    writer = imageio.get_writer(video_path, fps=fps, codec='libx264', quality=8, macro_block_size=16)
    samples = []
    max_reward = 0.0
    wall_started = time.perf_counter()
    try:
        with torch.inference_mode():
            for step in range(args.steps):
                writer.append_data(observation['pixels']['top'])
                if step == 0: imageio.imwrite(args.output / 'diffusion-poster.png', observation['pixels']['top'])
                image = torch.from_numpy(observation['pixels']['top'].copy()).permute(2, 0, 1).float().div(255).unsqueeze(0)
                state = torch.from_numpy(np.asarray(observation['agent_pos'], dtype=np.float32)).unsqueeze(0)
                batch = {}
                for name, tensor in [('observation.images.top', image), ('observation.state', state)]:
                    prefix = 'normalize_inputs.buffer_' + name.replace('.', '_')
                    if name == 'observation.state':
                        low, high = weights[prefix + '.min'], weights[prefix + '.max']
                        batch[name] = 2 * (tensor-low)/(high-low+1e-8)-1
                    else:
                        batch[name] = (tensor - weights[prefix + '.mean']) / (weights[prefix + '.std'] + 1e-8)
                started = time.perf_counter()
                normalized = policy.select_action(batch)
                low, high = weights['unnormalize_outputs.buffer_action.min'], weights['unnormalize_outputs.buffer_action.max']
                action = (normalized + 1) / 2 * (high-low) + low
                elapsed = (time.perf_counter() - started) * 1000
                action = action.squeeze(0).cpu().numpy()
                assert action.shape == (14,) and np.isfinite(action).all()
                next_observation, reward, terminated, truncated, info = env.step(action)
                max_reward = max(max_reward, float(reward))
                samples.append({'frame': step, 'timeSeconds': step / fps, 'jointPositions': observation['agent_pos'].tolist(), 'action': action.tolist(), 'reward': float(reward), 'policyMilliseconds': elapsed, 'chunkStart': step % config.n_action_steps == 0})
                observation = next_observation
                if step % 50 == 0:
                    print(f'step={step} reward={reward} maxReward={max_reward}', flush=True)
                if terminated or truncated:
                    break
    finally:
        writer.close()
        env.close()
    success = max_reward == 4.0
    manifest = {
        'status': 'recorded', 'policyId': POLICY, 'revision': REVISION,
        'checkpointUrl': f'https://huggingface.co/{POLICY}/tree/{REVISION}',
        'environment': ENVIRONMENT, 'seed': args.seed,
        'videoUrl': '/robotics/diffusion-rollout.mp4', 'trajectoryUrl': '/robotics/diffusion-trajectory.json',
        'frames': len(samples), 'fps': fps, 'durationSeconds': len(samples) / fps,
        'success': success, 'maxReward': max_reward, 'successCriterion': 'Environment reward reaches 4 (cube transferred to left gripper clear of the table).',
        'recordedAt': datetime.now(timezone.utc).isoformat(),
        'wallSeconds': time.perf_counter() - wall_started,
        'device': 'cpu', 'chunkSize': config.horizon, 'actionSteps': config.n_action_steps,
        'checkpointSha256': hashlib.sha256((snapshot / 'model.safetensors').read_bytes()).hexdigest(),
        'videoSha256': hashlib.sha256(video_path.read_bytes()).hexdigest(),
        'versions': {p: importlib.metadata.version(p) for p in ['lerobot', 'torch', 'mujoco', 'gym-aloha']},
        'posterUrl': '/robotics/diffusion-poster.png',
        'noiseScheduler': config.noise_scheduler_type, 'denoisingSteps': config.num_inference_steps or config.num_train_timesteps,
        'limitations': ['Recorded execution of a community-published pretrained Diffusion policy with the official LeRobot implementation.', 'One seeded rollout; not a success-rate benchmark.']
    }
    (args.output / 'diffusion-trajectory.json').write_text(json.dumps({'policyId': POLICY, 'revision': REVISION, 'seed': args.seed, 'fps': fps, 'samples': samples}, separators=(',', ':')))
    (args.output / 'diffusion-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
    print(json.dumps(manifest, indent=2), flush=True)


if __name__ == '__main__':
    main()
