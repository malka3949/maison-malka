import json
from pathlib import Path

ops = json.loads(Path("ops.json").read_text(encoding="utf-8"))
for o in ops:
    if "globals.css" not in o["rel"]:
        continue
    if o["kind"] == "write":
        print(f"line {o['line']}: WRITE len={len(o['contents'])}")
    else:
        old = (o["old"] or "")[:70].replace("\n", " ")
        new = (o["new"] or "")[:90].replace("\n", " ")
        print(f"line {o['line']}: STR all={o['all']}")
        print(f"  old: {old!r}")
        print(f"  new: {new!r}")
