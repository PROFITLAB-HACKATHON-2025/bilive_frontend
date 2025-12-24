# 🎸 Bilive – 밴드를 위한 합주실 예약 모바일 웹앱

Bilive는 **밴드 합주실 검색 · 예약 · 커뮤니티**를 하나의 모바일 웹앱에서 제공하는 플랫폼입니다.

현재는 **지도 기반 합주실 검색과 상세 페이지 중심의 MVP 구조**를 먼저 구축하고 있으며, 예약·커뮤니티·마이페이지는 추후 확장 예정입니다.

---

## 🧩 프로젝트 목표

* 밴드/뮤지션들이 **합주실을 빠르게 찾고**
* 위치 기반으로 **예약 가능 합주실을 한눈에 확인**
* 합주실 예약과 대타·구인 커뮤니티를 하나의 흐름으로 연결

---

## 📱 현재 구현 상태 (MVP 1단계)

* ✅ **Bottom Navigation** 기반 모바일 웹앱 구조
* ✅ **홈 탭**
* 합주실 검색 UI
* 필터 Chip UI (위치 / 날짜·시간 / 인원 / 가격)
* 지도 영역 Placeholder
* 합주실 리스트 및 상세 페이지 이동


* ⏳ **예약 / 커뮤니티 / 마이페이지**
* 라우팅만 연결된 빈 페이지 상태



---

## 🛠 기술 스택

| 구분 | 기술 |
| --- | --- |
| **Framework** | React |
| **Language** | TypeScript |
| **Styling** | styled-components |
| **State Management** | Zustand |
| **Server State** | React Query |
| **Routing** | React Router DOM |
| **Package Manager** | Yarn |
| **Build Tool** | Vite |

---

## 📂 프로젝트 구조

```text
src/
├── app/
│   ├── App.tsx
│   └── providers.tsx
├── pages/
│   ├── home/
│   │   ├── HomeMapPage.tsx
│   │   └── RoomDetailPage.tsx
│   ├── reserve/
│   │   └── ReservePage.tsx
│   ├── community/
│   │   └── CommunityPage.tsx
│   └── my/
│       └── MyPage.tsx
├── components/
│   └── common/
│       ├── BottomNav.tsx
│       └── MobileShell.tsx
├── stores/
│   └── useAppStore.ts
├── api/
│   └── rooms.ts
├── styles/
│   ├── theme.ts
│   └── global.ts
└── main.tsx

```

---

## 🧭 라우팅 구조

| 경로 | 설명 |
| --- | --- |
| `/home` | 지도 기반 합주실 검색 (메인) |
| `/home/rooms/:roomId` | 합주실 상세 페이지 |
| `/reserve` | 예약 페이지 (준비 중) |
| `/community` | 커뮤니티 페이지 (준비 중) |
| `/my` | 마이페이지 (준비 중) |

---

## 🧱 핵심 설계 포인트

### 1. MobileShell + Bottom Navigation

* 모바일 웹앱 UX를 고려한 고정 BottomNav 구조
* 모든 페이지에서 동일한 네비게이션 레이아웃 유지

### 2. Client / Server State 분리

* **Zustand**: 필터, UI 토글 등 클라이언트 상태 관리
* **React Query**: 합주실 리스트, 상세 데이터 등 서버 데이터 캐싱

### 3. 점진적 확장 가능한 구조

* 지도 SDK, 예약 플로우, 커뮤니티 기능을 기존 구조 변경 없이 단계적으로 추가 가능

---

## ▶️ 실행 방법

```bash
# 1. 패키지 설치
yarn

# 2. 개발 서버 실행
yarn dev

```

> 브라우저에서 `http://localhost:5173` 접속

---

## 🧪 데이터 및 개발 현황

### 현재 데이터 상태

* API는 아직 연동되지 않았으며 `api/rooms.ts`의 **Mock 데이터**를 사용 중입니다.
* 추후 실제 합주실 API 또는 지도 SDK(카카오/네이버) 연동 예정입니다.

### 🚧 향후 개발 예정

* 지도 SDK 연동 (카카오 / 네이버 지도)
* 필터 BottomSheet UI 구현
* 합주실 예약 플로우 (날짜·시간 선택 및 결제)
* 대타/구인 커뮤니티 기능 활성화
* 사용자 로그인 및 프로필 관리

---

## 👥 대상 사용자 및 참고

* **사용자**: 밴드, 세션 연주자, 합주실을 자주 이용하는 뮤지션
* **참고**: 본 프로젝트는 기능 확장 및 향후 네이티브 앱(WebView) 전환을 고려한 구조로 설계되었습니다.

---
