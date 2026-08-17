#!/bin/bash
# Copy assets/app-icon.png into the Xcode AppIcon slot after `cap sync`.
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
src="$root/assets/app-icon.png"
dest_dir="$root/ios/App/App/Assets.xcassets/AppIcon.appiconset"

if [[ ! -f "$src" ]]; then
  echo "missing $src" >&2
  exit 1
fi

if [[ ! -d "$root/ios/App/App/Assets.xcassets" ]]; then
  echo "iOS project not generated yet; skip AppIcon"
  exit 0
fi

mkdir -p "$dest_dir"
rm -f "$dest_dir"/*.png
cp "$src" "$dest_dir/AppIcon.png"
cat > "$dest_dir/Contents.json" <<'EOF'
{
  "images" : [
    {
      "filename" : "AppIcon.png",
      "idiom" : "universal",
      "platform" : "ios",
      "size" : "1024x1024"
    }
  ],
  "info" : {
    "author" : "xcode",
    "version" : 1
  }
}
EOF
echo "applied AppIcon from assets/app-icon.png"
