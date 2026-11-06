#!/usr/bin/env python3
"""Validate the approved Telegram publication calendar without sending messages."""
import datetime
import json
import pathlib
import sys
from urllib.parse import urlparse

path = pathlib.Path("telegram/posts.json")
data = json.loads(path.read_text(encoding="utf-8"))
if data.get("channel") != "@NovaRiseNVRA" or data.get("timezone") != "Europe/Madrid":
    sys.exit("Invalid channel or timezone")
posts = data.get("posts")
if not isinstance(posts, list):
    sys.exit("posts must be a list")
dates, images = set(), set()
for post in posts:
    day = datetime.date.fromisoformat(post["date"])
    if day.isoformat() in dates:
        sys.exit(f"Duplicate date: {day}")
    dates.add(day.isoformat())
    caption = post.get("text", "")
    if not isinstance(caption, str) or not caption.strip() or len(caption.encode("utf-8")) > 1024:
        sys.exit(f"Invalid or oversized Telegram caption on {day}")
    image = post.get("image", "")
    parsed = urlparse(image)
    if parsed.scheme != "https" or not parsed.netloc:
        sys.exit(f"Invalid image URL on {day}")
    if image in images:
        sys.exit(f"Reused image on {day}")
    images.add(image)
    if "github.com/jonelpd/NovaRise" in caption:
        sys.exit(f"Public GitHub repository link in caption on {day}")
print(f"VALID: {len(posts)} unique dated posts, captions, and image URLs.")
if posts:
    print(f"Calendar range: {min(dates)} to {max(dates)}")
