# 뿅 iOS 앱으로 내기

웹 게임을 Capacitor로 감싼 뒤, iPhone에서 **네이티브 Sign in with Apple**로 로그인합니다.
Bundle ID는 `com.kimjieun.ppyong` 입니다.

웹용 Services ID와 Return URL은 **필요 없습니다.** 그건 브라우저에서 Apple JS SDK를 쓸 때 필요합니다. iOS 앱은 App ID에 Sign in with Apple만 켜면 됩니다.

## 한 번에 하는 일 (개발자 계정)

1. [Apple Developer](https://developer.apple.com/account) → Identifiers → App ID `com.kimjieun.ppyong`
2. Capability에서 **Sign in with Apple** 을 켭니다. (이미 켜는 중이면 저장만 하면 됩니다.)
3. Team ID `65BCG32JFR` 로 서명할 수 있는지 확인합니다. 유료 Apple Developer Program이 있어야 App Store에 올립니다.
4. [App Store Connect](https://appstoreconnect.apple.com)에서 새 앱을 만듭니다.
   - Bundle ID: `com.kimjieun.ppyong`
   - 이름: 뿅
   - 개인정보 처리방침 URL: 아래 `privacy.html`을 공개 주소로 올린 뒤 그 URL

## 이 저장소에서 빌드

Mac에 Node.js와 Xcode가 있어야 합니다.

```bash
npm install
npm run ios
```

`npm run ios`는 게임을 `www`에 모으고, iOS 프로젝트와 맞춘 뒤 Xcode를 엽니다.

Xcode에서:

1. Signing & Capabilities → Team을 본인 계정으로 고릅니다.
2. **Sign in with Apple** capability가 보이는지 확인합니다. 없으면 + Capability로 추가합니다. (저장소의 `App.entitlements`에도 이미 넣어 두었습니다.)
3. 실제 iPhone을 연결하거나 시뮬레이터에서 Run 합니다.
4. 시작 화면의 **Apple로 로그인**을 누르면 시스템 Apple 시트가 열려야 합니다.

브라우저(`python3 -m http.server`) 미리보기에서는 네이티브 시트가 없으므로, 예전처럼 이 기기 로컬 계정으로 진행됩니다.

## App Store에 올리기

1. Xcode 메뉴 Product → Archive
2. Organizer에서 Distribute App → App Store Connect
3. App Store Connect에서 스크린샷, 설명, 연령, 개인정보 설문(계정·게임 진행은 기기에만 저장)을 채웁니다.
4. 심사에 대비해 테스트 계정 안내가 필요하면, Sign in with Apple은 심사 기기의 Apple ID로 로그인하면 됩니다. 서버 로그인이 없습니다.
5. 프로필의 **계정 삭제**가 동작하는지 한 번 확인합니다. (계정 생성 앱은 삭제 기능이 있어야 합니다.)

앱 로고는 `assets/app-icon.png` (뿅망치) 입니다. `npm run ios` / `npm run sync`가 Xcode `AppIcon`에 이 PNG를 넣습니다. 시작 화면에도 같은 로고가 보입니다.

## 이 저장소가 대신 못 하는 일

- Apple Developer 유료 등록·계약 서명
- App Store Connect 업로드와 심사 제출
- 실기기 서명에 쓰는 인증서를 다른 사람 맥에 설치하기
- 개인정보 처리방침을 항상 켜져 있는 HTTPS 주소에 호스팅하기 (`privacy.html` 파일은 준비되어 있습니다)
