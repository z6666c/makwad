#!/bin/bash
# ملفات المحقق: يحدّث اللعبة داخل مشروع الآيفون بدون ما يمسح إعدادات التوقيع.
set -e
DIR="$HOME/mohaqqiq-ios"
[ -d "$DIR/ios" ] || { echo "ما لقيت المشروع. شغّل install-iphone.command أول."; exit 1; }
printf "\n\033[1;33m▶ تنزيل آخر نسخة من اللعبة\033[0m\n"
rm -rf /tmp/mqu && mkdir /tmp/mqu
curl -fL https://github.com/z6666c/mohaqqiq-detective/archive/refs/heads/main.zip -o /tmp/mqu/m.zip
unzip -q /tmp/mqu/m.zip -d /tmp/mqu && SRC=$(ls -d /tmp/mqu/*/)
for f in index.html fonts.css manifest.webmanifest events.json capacitor.config.json package.json; do cp "$SRC$f" "$DIR/"; done
for d in fonts icons img scripts resources; do rm -rf "$DIR/$d"; cp -R "$SRC$d" "$DIR/$d"; done
cd "$DIR"
printf "\n\033[1;33m▶ تحديث مشروع Xcode\033[0m\n"
npm install --no-fund --no-audit >/dev/null
npm run build && npx cap sync ios
PL="$DIR/ios/App/App/Info.plist"
/usr/libexec/PlistBuddy -c "Print :CFBundleURLTypes" "$PL" >/dev/null 2>&1 || {
 /usr/libexec/PlistBuddy -c "Add :CFBundleURLTypes array" "$PL"
 /usr/libexec/PlistBuddy -c "Add :CFBundleURLTypes:0 dict" "$PL"
 /usr/libexec/PlistBuddy -c "Add :CFBundleURLTypes:0:CFBundleURLName string com.hamad.mohaqqiq" "$PL"
 /usr/libexec/PlistBuddy -c "Add :CFBundleURLTypes:0:CFBundleURLSchemes array" "$PL"
 /usr/libexec/PlistBuddy -c "Add :CFBundleURLTypes:0:CFBundleURLSchemes:0 string com.hamad.mohaqqiq" "$PL"; }
open ios/App/App.xcodeproj
printf "\n\033[1;32m✔ تم. وصّل الآيفون واضغط ▶ في Xcode.\033[0m\n"
