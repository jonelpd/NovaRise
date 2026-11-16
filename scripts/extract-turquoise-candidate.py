#!/usr/bin/env python3
"""Generate a review-only turquoise road candidate from the user's annotated map.

Requires Pillow, numpy and opencv-python. Never overwrites the game's active mask.
Usage: python scripts/extract-turquoise-candidate.py mapa-rutas-marcadas\(2\).png
"""
import argparse, base64, json, zlib
from pathlib import Path
import cv2
import numpy as np
from PIL import Image

parser=argparse.ArgumentParser()
parser.add_argument('image',type=Path)
parser.add_argument('--output',type=Path,default=Path('turquoise-candidate.json'))
parser.add_argument('--preview',type=Path,default=Path('turquoise-candidate-preview.png'))
args=parser.parse_args()
image=np.array(Image.open(args.image).convert('RGB'))
r,g,b=image.transpose(2,0,1)
# Cyan brush hue/color isolation; the water/background can contain similar pixels.
mask=((r<80)&(g>115)&(g<225)&(b>170)&(b>g+20)).astype('uint8')*255
mask=cv2.morphologyEx(mask,cv2.MORPH_CLOSE,np.ones((3,3),np.uint8))
count,labels,stats,_=cv2.connectedComponentsWithStats(mask,8)
clean=np.zeros_like(mask)
for i in range(1,count):
    if stats[i,4]>=85:
        clean[labels==i]=255
small=cv2.resize(clean,(160,160),interpolation=cv2.INTER_AREA)
road=(small>=18).astype('uint8')
count,labels,stats,_=cv2.connectedComponentsWithStats(road,8)
for i in range(1,count):
    if stats[i,4]<3:
        road[labels==i]=0
count=cv2.connectedComponents(road,8)[0]-1
data={
    'version':1,'source':args.image.name,'resolution':160,
    'encoding':'zlib-base64-bitset-msb',
    'road_cells':int(road.sum()),'connected_components':int(count),
    'compressed':base64.b64encode(zlib.compress(np.packbits(road.reshape(-1)).tobytes(),9)).decode()
}
args.output.write_text(json.dumps(data,indent=2)+'\n',encoding='utf-8')
preview=cv2.resize(road*255,(image.shape[1],image.shape[0]),interpolation=cv2.INTER_NEAREST)
Image.fromarray(preview).save(args.preview)
print(f"Candidate only: {data['road_cells']} cells, {count} 8-neighbor components")
print("DO NOT deploy until topology and all 44 entrances are visually verified.")
