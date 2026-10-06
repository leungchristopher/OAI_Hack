"""Record genuine pretrained SmolVLA actions in the matching ALOHA MuJoCo task."""
import os
os.environ.setdefault('HF_HOME','/private/tmp/marginalia-smolvla-cache')
os.environ.setdefault('HF_HUB_DISABLE_TELEMETRY','1')
import argparse, hashlib, json, time, importlib.metadata
from pathlib import Path
from datetime import datetime,timezone
import numpy as np
import torch
import gymnasium as gym
import gym_aloha
import imageio.v2 as imageio
from huggingface_hub import snapshot_download
from safetensors.torch import load_file
from lerobot.configs.policies import PreTrainedConfig
from lerobot.policies.smolvla.modeling_smolvla import SmolVLAPolicy
from lerobot.policies.factory import make_pre_post_processors
POLICY='bdth0716/smolvla_aloha_test'
REVISION='0abb36f31120d809f8c743a39a0252faaf5b84e9'
ENVIRONMENT='gym_aloha/AlohaTransferCube-v0'
ROOT=Path(__file__).resolve().parent.parent

def main():
 p=argparse.ArgumentParser();p.add_argument('--steps',type=int,default=400);p.add_argument('--seed',type=int,default=7);p.add_argument('--device',default='cpu',choices=['cpu','mps']);args=p.parse_args()
 assert 1<=args.steps<=400
 torch.manual_seed(args.seed);np.random.seed(args.seed);torch.set_num_threads(4)
 snapshot=Path(snapshot_download(POLICY,revision=REVISION))
 # This checkpoint adds disabled compiler metadata newer than installed LeRobot.
 raw=json.loads((snapshot/'config.json').read_text());assert raw.pop('compile_model',False) is False;raw.pop('compile_mode',None)
 import tempfile
 with tempfile.TemporaryDirectory() as d:
  Path(d,'config.json').write_text(json.dumps(raw));cfg=PreTrainedConfig.from_pretrained(d)
 cfg.device=args.device;cfg.load_vlm_weights=False
 policy=SmolVLAPolicy(cfg)
 weights=load_file(str(snapshot/'model.safetensors'))
 policy.load_state_dict(weights,strict=True);policy.to(args.device);policy.eval();policy.reset()
 print('Strict checkpoint load complete; no missing/random model weights',flush=True)
 pre,post=make_pre_post_processors(cfg,str(snapshot),preprocessor_overrides={'device_processor':{'device':args.device}},postprocessor_overrides={'device_processor':{'device':'cpu'}})
 # Language matches the dataset's task text, obtained from its public metadata.
 task='Pick up the cube with the right arm and transfer it to the left arm.'
 env=gym.make(ENVIRONMENT,obs_type='pixels_agent_pos',render_mode='rgb_array',max_episode_steps=args.steps)
 obs,_=env.reset(seed=args.seed);fps=env.metadata['render_fps'];out=ROOT/'public/robotics';out.mkdir(parents=True,exist_ok=True)
 video=out/'smolvla-rollout.mp4';writer=imageio.get_writer(video,fps=fps,codec='libx264',quality=8,macro_block_size=16)
 imageio.imwrite(out/'smolvla-poster.png',obs['pixels']['top'])
 samples=[];max_reward=0.;started=time.perf_counter()
 try:
  with torch.inference_mode():
   for step in range(args.steps):
    writer.append_data(obs['pixels']['top'])
    batch={'observation.images.top':torch.from_numpy(obs['pixels']['top'].copy()).permute(2,0,1).float()/255,'observation.state':torch.tensor(obs['agent_pos'],dtype=torch.float32),'task':task}
    tick=time.perf_counter();action=post(policy.select_action(pre(batch))).squeeze(0).cpu().numpy();ms=(time.perf_counter()-tick)*1000
    assert action.shape==(14,) and np.isfinite(action).all()
    next_obs,reward,terminated,truncated,info=env.step(action);max_reward=max(max_reward,float(reward))
    samples.append({'frame':step,'timeSeconds':step/fps,'jointPositions':obs['agent_pos'].tolist(),'action':action.tolist(),'reward':float(reward),'policyMilliseconds':ms,'chunkStart':step%cfg.n_action_steps==0})
    obs=next_obs
    if step%50==0: print(f'step={step} reward={reward} maxReward={max_reward} latencyMs={ms:.0f}',flush=True)
    if terminated or truncated:break
 finally:writer.close();env.close()
 (out/'smolvla-trajectory.json').write_text(json.dumps({'policyId':POLICY,'revision':REVISION,'seed':args.seed,'fps':fps,'samples':samples},separators=(',',':')))
 manifest={'status':'recorded','policyId':POLICY,'revision':REVISION,'environment':ENVIRONMENT,'seed':args.seed,'videoUrl':'/robotics/smolvla-rollout.mp4','posterUrl':'/robotics/smolvla-poster.png','trajectoryUrl':'/robotics/smolvla-trajectory.json','frames':len(samples),'fps':fps,'durationSeconds':len(samples)/fps,'success':max_reward==4.,'maxReward':max_reward,'successCriterion':'Environment reward reaches 4: transfer completed above table.','recordedAt':datetime.now(timezone.utc).isoformat(),'device':args.device,'wallSeconds':time.perf_counter()-started,'chunkSize':cfg.chunk_size,'actionSteps':cfg.n_action_steps,'flowSteps':cfg.num_steps,'taskInstruction':task,'checkpointSha256':hashlib.sha256((snapshot/'model.safetensors').read_bytes()).hexdigest(),'videoSha256':hashlib.sha256(video.read_bytes()).hexdigest(),'checkpointUrl':f'https://huggingface.co/{POLICY}/tree/{REVISION}','trainingDataset':'lerobot/aloha_sim_transfer_cube_human','versions':{p:importlib.metadata.version(p) for p in ['lerobot','torch','mujoco','gym-aloha','transformers']},'limitations':['Recorded pretrained policy execution in MuJoCo; playback does not run inference in the browser.','One seeded rollout is not a success-rate benchmark.','Community-trained checkpoint; no claim of official SmolVLA benchmark performance.']}
 (out/'smolvla-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n');print(json.dumps(manifest,indent=2))
if __name__=='__main__':main()
