from pathlib import Path
import json,wave,subprocess,textwrap,concurrent.futures
from PIL import Image,ImageDraw,ImageFont
ROOT=Path(__file__).resolve().parents[1]; OUT=ROOT/'output/demo'; RAW=OUT/'raw'
FF=ROOT/'robotics/.venv/lib/python3.12/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1'
FONT='/System/Library/Fonts/Supplemental/Arial.ttf'; BOLD='/System/Library/Fonts/Supplemental/Arial Bold.ttf'
scenes=[
('01-world','A landscape\nfor ideas.','Read the paper.\nMove the ideas.',['Pixel world + brush & ink','A house for every research lens'],['01a-pixel','01b-brush']),
('02-alphago','Inside\nAlphaGo.','Intuition. Judgment. Search.',['Policy + value networks','MCTS and UCB, step by step','All five Lee Sedol games'],['02a-approach','02b-policy','02c-value','02d-probability','02e-search','02f-select','02g-expand','02h-evaluate','02i-backup','02j-ucb','02k-training','02l-move37','02m-board']),
('03-hannon','Follow\nthe guide.','Hannon / RNA interference',['A testable research extension','Falsification and critique','Dicer → RISC → target cleavage'],['03a-rna-walk','03b-extension','03c-falsify','03d-critique','03e-dicer','03f-risc','03g-cleavage','03h-knockout']),
('04-robotics','From observation\nto action.','LeRobot × MuJoCo',['ACT · Diffusion · SmolVLA','Real pretrained-policy rollouts','Interactive architecture mathematics'],['04a-robot-walk','04b-smolvla','04d-attention','04e-flow']),
('05-chat','Ask. Reason.\nUnderstand.','A Socratic research tutor',['ACT: horizon versus reactivity','Beyond MCTS and UCB','One focused question at a time'],['05a-question-act','05b-act-answer','05c-question-search','05d-search-answer','05e-search-followup']),
('06-close','Read the paper.\nMove the ideas.','Marginalia',['Explore across disciplines','Connect mechanisms and critiques','Build understanding through interaction'],['06a-village'])]

def build_scene(n,scene):
 sid,title,sub,points,clips=scene
 with wave.open(str(OUT/'audio'/f'{sid}.wav')) as w: dur=len(w.readframes(w.getnframes()))/(w.getframerate()*w.getnchannels()*w.getsampwidth())
 bg=Image.new('RGB',(1920,1080),'#0f172a');d=ImageDraw.Draw(bg)
 d.text((88,78),'MARGINALIA',font=ImageFont.truetype(BOLD,27),fill='#a8d8c8');d.text((88,130),f'{n:02d} / 06',font=ImageFont.truetype(FONT,22),fill='#aebbd1')
 d.line((88,210,920,210),fill='#40506d',width=2)
 d.multiline_text((88,282),title,font=ImageFont.truetype(BOLD,70),fill='#f6d58a',spacing=15)
 d.text((88,495),sub,font=ImageFont.truetype(FONT,29),fill='#e3e8ef')
 for i,p in enumerate(points):
  d.rectangle((90,600+i*70,99,609+i*70),fill='#9acdb9');d.text((122,586+i*70),p,font=ImageFont.truetype(FONT,29),fill='#d1daea')
 d.line((1008,48,1008,1032),fill='#40506d',width=2)
 d.text((88,972),'Actual app interaction · AI-generated narration',font=ImageFont.truetype(FONT,21),fill='#9aaac2')
 bgpath=OUT/f'{sid}-title.png';bg.save(bgpath)
 data=[]
 for clip in clips:
  manifest=json.loads((RAW/clip/'frames.json').read_text()); frames=manifest['frames']; total=manifest['duration']
  for j,f in enumerate(frames): data.append((f['file'],max(.01,(frames[j+1]['time'] if j+1<len(frames) else total)-f['time'])))
 scale=dur/sum(t for _,t in data)
 listing=OUT/f'{sid}-frames.txt';listing.write_text(''.join("file '"+file+"'\nduration "+str(t*scale)+'\n' for file,t in data)+"file '"+data[-1][0]+"'\n")
 target=OUT/f'{sid}.mp4'
 cmd=[str(FF),'-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',str(listing),'-loop','1','-i',str(bgpath),'-i',str(OUT/'audio'/f'{sid}.wav'),'-filter_complex','[0:v]scale=880:1080:force_original_aspect_ratio=decrease,pad=880:1080:(ow-iw)/2:(oh-ih)/2:color=0x0f172a,setsar=1[screen];[1:v][screen]overlay=1040:0:shortest=1[v]','-map','[v]','-map','2:a','-t',str(dur),'-r','20','-c:v','libx264','-preset','ultrafast','-crf','21','-pix_fmt','yuv420p','-c:a','aac','-b:a','160k','-movflags','+faststart',str(target)]
 subprocess.run(cmd,check=True); print(sid,'encoded',round(dur,2),flush=True);return target
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool: paths=list(pool.map(lambda x:build_scene(*x),enumerate(scenes,1)))
listing=OUT/'join.txt';listing.write_text(''.join("file '"+str(p)+"'\n" for p in paths))
subprocess.run([str(FF),'-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',str(listing),'-c','copy','-movflags','+faststart',str(OUT/'Marginalia-demo.mp4')],check=True)
subprocess.run([str(FF),'-hide_banner','-loglevel','error','-y','-ss','10','-i',str(OUT/'Marginalia-demo.mp4'),'-frames:v','1',str(OUT/'poster.jpg')],check=True)
print('DONE',OUT/'Marginalia-demo.mp4',flush=True)
