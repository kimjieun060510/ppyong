#!/bin/bash
# cap sync only registers npm plugins. Keep our in-app Apple login plugin in the list.
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
config="$root/ios/App/App/capacitor.config.json"

if [[ ! -f "$config" ]]; then
  echo "missing $config; skip plugin registration"
  exit 0
fi

python3 - "$config" <<'PY'
import json
import sys
from pathlib import Path

path = Path(sys.argv[1])
data = json.loads(path.read_text())
classes = list(data.get("packageClassList") or [])
if "PpyongAppleAuth" not in classes:
    classes.append("PpyongAppleAuth")
data["packageClassList"] = classes
path.write_text(json.dumps(data, indent="\t", ensure_ascii=False) + "\n")
print("registered PpyongAppleAuth in capacitor.config.json")
PY
