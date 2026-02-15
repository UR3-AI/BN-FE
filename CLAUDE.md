# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # 개발 서버 실행
npm run build    # TypeScript 체크 + 프로덕션 빌드
npm run lint     # ESLint 실행
npm run preview  # 빌드된 결과물 미리보기
```

## Path Aliases

- `@/*` → `src/*`
- `@lib/*` → `src/lib/*`
- `@app/*` → `src/app/*`

## Architecture

```
src/
├── lib/           # 공통 라이브러리 (비즈니스 로직 무관)
│   ├── apis/
│   │   ├── axios/     # Axios 인스턴스 (인터셉터 설정)
│   │   └── tanstack/  # React Query 설정 (staleTime: 5분, gcTime: 10분)
│   ├── hooks/         # 커스텀 훅
│   ├── stores/        # Zustand 스토어
│   ├── utils/         # 유틸리티 함수
│   └── types/         # 공통 타입 정의
├── app/           # 애플리케이션 레이어
│   ├── components/    # UI 컴포넌트
│   ├── containers/    # 비즈니스 로직 컨테이너
│   ├── pages/         # 페이지 컴포넌트 (도메인별 구조)
│   └── router/        # React Router 설정 (routes.tsx에서 라우트 정의)
```

## Code Conventions

### Component Structure (도메인별 폴더)

```
{domain}/
├── index.ts                      # barrel export
└── {ComponentName}/
    └── {ComponentName}.tsx
```

### Barrel Export Pattern

```ts
// 도메인 index.ts
export { default as ComponentName } from './ComponentName/ComponentName'

// 루트 index.ts
export * from './domain'
```

### Component Definition

```tsx
// Arrow function + export default 분리
const ComponentName = () => {
  return <div>...</div>
}

export default ComponentName
```

## Tech Stack

- React 19 + TypeScript + Vite
- TanStack Query (서버 상태)
- Zustand (클라이언트 상태)
- Tailwind CSS 4
- Motion (애니메이션)
- React Router DOM 7

## Environment Variables

- `VITE_API_URL` - API 서버 주소 (기본값: `/api`)

## Import Order (Prettier)

1. CSS 파일
2. React 관련
3. `@` alias (lib, app)
4. 상대 경로 (`../`, `./`)
5. Third-party 모듈
