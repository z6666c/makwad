#!/bin/bash
# ملفات المحقق: يجهّز تطبيق الآيفون ويفتحه في Xcode. شغّله بالضغط عليه مرتين.
set -e
say(){ printf "\n\033[1;33m▶ %s\033[0m\n" "$1"; }
fail(){ printf "\n\033[1;31m✖ %s\033[0m\n" "$1"; read -p "اضغط Enter للإغلاق"; exit 1; }
DIR="$HOME/mohaqqiq-ios"

say "1/6 التحقق من Xcode"
if ! [ -d /Applications/Xcode.app ]; then
  open "macappstores://apps.apple.com/app/xcode/id497799835"
  fail "Xcode غير مثبت. فتحت لك صفحته في App Store: ثبّته وافتحه مرة وحدة ووافق على الشروط، ثم شغّل هذا الملف من جديد."
fi
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer 2>/dev/null || true
xcodebuild -checkFirstLaunchStatus >/dev/null 2>&1 || sudo xcodebuild -runFirstLaunch

say "2/6 التحقق من Node.js"
if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 20 ]; then
  V=$(curl -fsSL https://nodejs.org/dist/index.json | python3 -c "import json,sys;print([r['version'] for r in json.load(sys.stdin) if r['lts']][0])")
  curl -fL "https://nodejs.org/dist/$V/node-$V.pkg" -o /tmp/node.pkg
  say "بيطلب منك كلمة مرور الماك لتثبيت Node.js"
  sudo installer -pkg /tmp/node.pkg -target / || fail "تعذّر تثبيت Node.js"
  export PATH="/usr/local/bin:$PATH"
fi

say "3/6 تنزيل اللعبة"
rm -rf "$DIR" && mkdir -p "$DIR"
curl -fL https://github.com/z6666c/mohaqqiq-detective/archive/refs/heads/main.zip -o /tmp/mq.zip
unzip -q /tmp/mq.zip -d /tmp/mqz && cp -R /tmp/mqz/*/. "$DIR" && rm -rf /tmp/mqz /tmp/mq.zip
cd "$DIR"

say "4/6 تثبيت مكتبات التطبيق (دقيقة أو دقيقتين)"
npm install --no-fund --no-audit

say "5/6 إنشاء مشروع iOS"
npm run ios:add
npm run assets || true
npx cap sync ios

say "6/6 فتح المشروع في Xcode"
open ios/App/App.xcodeproj
printf "\n\033[1;32m✔ جاهز. كمّل الخطوات في Xcode (التوقيع ثم زر التشغيل ▶).\033[0m\n"
read -p "اضغط Enter للإغلاق"
