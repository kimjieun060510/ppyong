# 뿅 두더지 iOS 앱으로 내기

웹 게임을 Capacitor로 감싼 뒤, iPhone에서 **로그인 없이 바로 플레이**할 수 있습니다. **네이티브 Sign in with Apple**은 선택입니다.
Bundle ID는 `com.kimjieun.ppyong` 입니다.

웹용 Services ID와 Return URL은 **필요 없습니다.** 그건 브라우저에서 Apple JS SDK를 쓸 때 필요합니다. iOS 앱은 App ID에 Sign in with Apple만 켜면 됩니다.

## 한 번에 하는 일 (개발자 계정)

1. [Apple Developer](https://developer.apple.com/account) → Identifiers → App ID `com.kimjieun.ppyong`
2. Capability에서 **Sign in with Apple** 을 켭니다. (이미 켜는 중이면 저장만 하면 됩니다.)
3. Team ID `65BCG32JFR` 로 서명할 수 있는지 확인합니다. 유료 Apple Developer Program이 있어야 App Store에 올립니다.
4. [App Store Connect](https://appstoreconnect.apple.com)에서 새 앱을 만듭니다.
   - Bundle ID: `com.kimjieun.ppyong`
   - 이름: 뿅 두더지
   - 개인정보 처리방침 URL: GitHub Pages 등 HTTPS 주소 (아래 2번 참고)

## 이 저장소에서 빌드

Mac에 Node.js와 Xcode가 있어야 합니다.

```bash
npm install
npm run ios
```

`npm run ios`는 게임을 `www`에 모으고, iOS 프로젝트와 맞춘 뒤 Xcode를 엽니다.

Xcode에서:

1. 왼쪽에서 **App**을 고른 뒤 위 탭 **Signing & Capabilities**를 엽니다.
2. Team을 본인 계정으로 고릅니다.
3. 목록에 **Sign in with Apple**이 있는지 봅니다. 없으면 왼쪽 **+ Capability** → Sign in with Apple을 고릅니다.
   Apple 문서 전체를 따라 버튼을 새로 만들 필요는 없습니다. 게임 화면에 이미 로그인 버튼이 있습니다.
4. 가능하면 **실제 아이폰**을 연결하고 ▶ Run 합니다. 시뮬레이터에서는 Apple 시트가 바로 닫히는 경우가 많습니다.
5. 시작 화면의 **시작**을 누르면 로그인 없이 게임이 열려야 합니다. **Apple로 로그인**은 선택이며, 누르면 시스템 Apple 시트가 열려야 합니다.

브라우저(`python3 -m http.server`) 미리보기에서는 네이티브 시트가 없으므로, 예전처럼 이 기기 로컬 계정으로 진행됩니다.

## App Store에 올리기

빌드 번호(`CURRENT_PROJECT_VERSION`)는 TestFlight에 올릴 때마다 이전보다 크게 올립니다. 최소 iOS는 15입니다.

1. Xcode 메뉴 Product → Archive
2. Organizer에서 Distribute App → App Store Connect
3. App Store Connect에서 스크린샷, 설명, 연령, 개인정보 설문(계정·게임 진행은 기기에만 저장)을 채웁니다.
4. 심사에 대비해, 시작 화면에서 로그인 없이 **시작**이 되는지를 확인합니다. Sign in with Apple은 선택이며 심사 기기의 Apple ID로 로그인하면 됩니다. 서버 로그인이 없습니다.
5. 프로필의 **계정 삭제**가 동작하는지 한 번 확인합니다. (계정 생성 앱은 삭제 기능이 있어야 합니다.)

앱 로고는 `assets/app-icon.png` (뿅망치) 입니다. `npm run ios` / `npm run sync`가 Xcode `AppIcon`에 이 PNG를 넣습니다. 시작 화면에도 같은 로고가 보입니다.

## 이 저장소가 대신 못 하는 일

- Apple Developer 유료 등록·계약 서명
- App Store Connect 업로드와 심사 제출
- 실기기 서명에 쓰는 인증서를 다른 사람 맥에 설치하기
- 개인정보 처리방침을 항상 켜져 있는 HTTPS 주소에 호스팅하기 (`privacy.html`은 저장소 루트에 있음. GitHub Pages 사용법은 출시 안내 참고)
