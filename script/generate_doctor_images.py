"""
generate_doctor_images.py

Batch-generate realistic, unique doctor profile images for your healthcare micro-project.
Supports two backends:
  - openai : OpenAI Images API (DALL·E-like). Set OPENAI_API_KEY.
  - automatic1111 : Local Automatic1111 Stable Diffusion WebUI (http://127.0.0.1:7860).

Features:
  - Prompt-templating with randomization (age, gender, ethnicity, accessories, lighting).
  - Optional CSV input with doctor IDs/names to match images.
  - Metadata CSV output with prompt and filename for each image.
  - Concurrency, retries, rate-limiting, and progress display.

Usage:
  pip install openai requests pillow tqdm python-dotenv
  export OPENAI_API_KEY="sk-..."  # for OpenAI backend
  python generate_doctor_images.py --count 140 --backend openai --outdir ./doctor_images

For automatic1111 run locally and use:
  python generate_doctor_images.py --count 140 --backend automatic1111 --auto-url http://127.0.0.1:7860

Keep prompts professional. Tweak TEMPLATE_PROMPTS below for style.
"""

import os
import sys
import argparse
import csv
import json
import base64
import time
import random
from pathlib import Path
from typing import List, Optional, Dict

try:
    from PIL import Image
except Exception:
    print('Install pillow: pip install pillow')
    raise

try:
    import requests
except Exception:
    print('Install requests: pip install requests')
    raise

try:
    from tqdm import tqdm
except Exception:
    print('Install tqdm: pip install tqdm')
    raise

# Optional: openai only imported when backend=openai

# --- Prompt templates and utilities ---
GENDERS = ['male', 'female', 'non-binary']
ETHNICITIES = ['South Asian', 'East Asian', 'Southeast Asian', 'Middle Eastern', 'Black', 'White', 'Latino', 'Mixed race']
AGE_RANGES = ['late 20s', 'early 30s', 'mid 30s', 'late 30s', 'early 40s', 'mid 40s', '50s']
HAIR_STYLES = ['short neat hair', 'short curly hair', 'shoulder-length hair', 'bald', 'tied back hair']
ACCESSORIES = ['stethoscope', 'ID badge', 'white lab coat', 'surgical scrubs', 'reading glasses', 'face mask hanging']
BACKGROUNDS = ['hospital corridor softly blurred', 'clinic reception softly blurred', 'professional studio backdrop', 'medical office with bookshelves softly blurred']
LIGHTING = ['soft natural lighting', 'studio lighting with softbox', 'warm clinical lighting']
POSES = ['head and shoulders portrait', '3/4 view portrait', 'slight smile, professional']
CAMERA = ['high detail, photorealistic', '35mm portrait lens look', '8k photo']
STYLE_QUALIFIERS = ['realistic photo', 'ultra-photorealistic', 'professional headshot']

TEMPLATE_PROMPTS = [
    "{style}, {camera}, {age}, {gender}, {ethnicity}, {hair}, wearing a {coat} with {accessory}, {pose}, {background}, {lighting}. No logos, no text.",
    "{style}, {camera}, {age} {gender}, {ethnicity} doctor, {hair}, {coat}, {accessory}, professional headshot, {background}, {lighting}.",
]

NEGATIVE_ADJECTIVES = ['cartoon', 'drawing', 'low-res', 'watermark', 'blurry', 'deformed', 'text', 'logo']

# Ensure randomness reproducible if seed provided

# --- Core functions ---

def build_prompt(seed: int = None) -> str:
    r = random.Random(seed)
    template = r.choice(TEMPLATE_PROMPTS)
    p = template.format(
        style=r.choice(STYLE_QUALIFIERS),
        camera=r.choice(CAMERA),
        age=r.choice(AGE_RANGES),
        gender=r.choice(GENDERS),
        ethnicity=r.choice(ETHNICITIES),
        hair=r.choice(HAIR_STYLES),
        coat=r.choice(['white lab coat', 'surgical scrubs']),
        accessory=r.choice(ACCESSORIES),
        pose=r.choice(POSES),
        background=r.choice(BACKGROUNDS),
        lighting=r.choice(LIGHTING),
    )
    # Add negative prompt section for APIs that accept it
    negative = ', '.join(NEGATIVE_ADJECTIVES)
    return p + ' --negative: ' + negative


def save_image_from_base64(b64: str, out_path: Path) -> None:
    data = base64.b64decode(b64)
    with open(out_path, 'wb') as f:
        f.write(data)


def save_image_from_bytes(b: bytes, out_path: Path) -> None:
    with open(out_path, 'wb') as f:
        f.write(b)


# --- OpenAI backend implementation ---

def generate_with_openai(prompt: str, size: str = '1024x1024', retries: int = 3) -> bytes:
    try:
        import openai
    except Exception:
        raise RuntimeError('openai package not installed. pip install openai')

    key = os.getenv('OPENAI_API_KEY')
    if not key:
        raise RuntimeError('OPENAI_API_KEY not set in environment')
    openai.api_key = key

    for attempt in range(retries):
        try:
            # Using Images API. Behavior may differ across OpenAI versions.
            resp = openai.Image.create(
                prompt=prompt,
                n=1,
                size=size
            )
            # Response contains b64 JSON at resp['data'][0]['b64_json'] or 'url'
            data = resp['data'][0]
            if 'b64_json' in data:
                b64 = data['b64_json']
                return base64.b64decode(b64)
            elif 'url' in data:
                url = data['url']
                r = requests.get(url)
                r.raise_for_status()
                return r.content
            else:
                raise RuntimeError('OpenAI response missing image data')
        except Exception as e:
            last = e
            time.sleep(1 + attempt * 2)
    raise last


# --- Automatic1111 local WebUI backend implementation ---

def generate_with_auto1111(prompt: str, url: str = 'http://127.0.0.1:7860', width: int = 1024, height: int = 1024, steps: int = 20, sampler: str = 'Euler a', cfg_scale: float = 7.0, retries: int = 3) -> bytes:
    api = url.rstrip('/') + '/sdapi/v1/txt2img'
    payload = {
        'prompt': prompt,
        'steps': steps,
        'sampler_index': sampler,
        'cfg_scale': cfg_scale,
        'width': width,
        'height': height,
        'negative_prompt': ', '.join(NEGATIVE_ADJECTIVES),
    }
    headers = {'Content-Type': 'application/json'}

    for attempt in range(retries):
        r = requests.post(api, json=payload, headers=headers, timeout=120)
        if r.status_code == 200:
            j = r.json()
            # auto1111 returns images as base64 strings in j['images']
            if 'images' in j and j['images']:
                b64 = j['images'][0]
                return base64.b64decode(b64)
            else:
                raise RuntimeError('automatic1111 response missing images')
        else:
            time.sleep(1 + attempt * 2)
    r.raise_for_status()


# --- CSV helpers ---

def read_doctors_csv(path: Path) -> List[Dict[str, str]]:
    out = []
    with path.open('r', encoding='utf8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            out.append(row)
    return out


# --- Main batch flow ---

def main():
    parser = argparse.ArgumentParser(description='Batch generate doctor profile images')
    parser.add_argument('--count', type=int, default=140)
    parser.add_argument('--backend', choices=['openai', 'automatic1111'], default='openai')
    parser.add_argument('--outdir', type=str, default='./doctor_images')
    parser.add_argument('--csv', type=str, default=None, help='Optional CSV file with columns id,name to preserve filenames')
    parser.add_argument('--seed', type=int, default=None)
    parser.add_argument('--size', type=str, default='1024x1024', help='Image size for OpenAI e.g. 1024x1024')
    parser.add_argument('--auto-url', type=str, default='http://127.0.0.1:7860', help='Automatic1111 URL')
    args = parser.parse_args()

    outdir = Path(args.outdir)
    outdir.mkdir(parents=True, exist_ok=True)

    doctors = None
    if args.csv:
        doctors = read_doctors_csv(Path(args.csv))
        # Expecting at least an 'id' column. If 'name' exists include it in metadata.

    meta_path = outdir / 'metadata.csv'
    fieldnames = ['index', 'filename', 'doctor_id', 'doctor_name', 'prompt', 'backend', 'seed']

    random_seed = args.seed
    if random_seed is None:
        random_seed = random.randrange(1<<30)
    rng = random.Random(random_seed)

    total = args.count if doctors is None else len(doctors)

    with open(meta_path, 'w', newline='', encoding='utf8') as metafile:
        writer = csv.DictWriter(metafile, fieldnames=fieldnames)
        writer.writeheader()

        for i in tqdm(range(total), desc='Generating'):
            idx = i
            doc_id = None
            doc_name = None
            if doctors is not None:
                row = doctors[i]
                doc_id = row.get('id') or row.get('doctor_id') or row.get('index') or str(i)
                doc_name = row.get('name') or row.get('doctor_name')
                fname_base = f"doctor_{doc_id}"
            else:
                fname_base = f"doctor_{i+1:03d}"

            # Create deterministic variation per index
            local_seed = (random_seed + i) & 0xffffffff
            prompt = build_prompt(seed=local_seed)

            filename = f"{fname_base}.png"
            outfile = outdir / filename

            try:
                if args.backend == 'openai':
                    img_bytes = generate_with_openai(prompt, size=args.size)
                    save_image_from_bytes(img_bytes, outfile)
                else:
                    img_bytes = generate_with_auto1111(prompt, url=args.auto_url)
                    save_image_from_bytes(img_bytes, outfile)

                writer.writerow({
                    'index': idx,
                    'filename': filename,
                    'doctor_id': doc_id,
                    'doctor_name': doc_name,
                    'prompt': prompt,
                    'backend': args.backend,
                    'seed': local_seed,
                })

            except Exception as e:
                print(f"Failed at index {i}: {e}")
                # Write failure metadata
                writer.writerow({
                    'index': idx,
                    'filename': filename,
                    'doctor_id': doc_id,
                    'doctor_name': doc_name,
                    'prompt': prompt,
                    'backend': args.backend + '_FAILED',
                    'seed': local_seed,
                })

    print(f"Done. Images + metadata saved to {outdir}")


if __name__ == '__main__':
    main()
