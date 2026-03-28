# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev              # 개발 서버 실행
npm run build            # TypeScript 체크 + 프로덕션 빌드
npm run lint             # ESLint 실행
npm run format           # Prettier 포맷팅 (src/**/*.{ts,tsx})
npm run preview          # 빌드된 결과물 미리보기
npm run storybook        # Storybook 개발 서버 (포트 6006)
npm run build-storybook  # Storybook 정적 빌드
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
│   │   ├── axios/     # Axios 인스턴스 (`api`로 export, timeout: 10초)
│   │   ├── tanstack/  # React Query 설정 (staleTime: 5분, gcTime: 10분, retry: 1, refetchOnWindowFocus: false)
│   │   ├── queries/   # Query 훅 (도메인별 폴더)
│   │   ├── mutations/ # Mutation 훅 (도메인별 폴더)
│   │   └── services/  # 훅이 아닌 비동기 함수 (도메인별 폴더, 예: refreshTokenAsync)
│   ├── constants/     # 상수 (도메인별 폴더: time/ 등)
│   ├── hooks/         # 커스텀 훅
│   ├── stores/        # Zustand 스토어
│   ├── utils/         # 유틸리티 함수
│   └── types/         # 공통 타입 정의 (도메인별 폴더: auth/, note/, project/ 등)
├── app/           # 애플리케이션 레이어
│   ├── components/    # UI 컴포넌트 (도메인별: layout/ 등)
│   ├── containers/    # 비즈니스 로직 컨테이너
│   ├── pages/         # 페이지 컴포넌트 (도메인별 구조)
│   └── router/        # React Router 설정 (createBrowserRouter, routes.tsx에서 라우트 정의)
```

**App 부트스트랩**: `main.tsx` → `App.tsx`(QueryClientProvider + RouterProvider + useTokenRefresh) → `routes.tsx`(GlobalLayout이 Outlet으로 감싸는 구조)

## Auth Flow

인증은 여러 파일에 걸친 시스템으로 동작한다:

1. **`useAuthStore`** (Zustand + `persist`): `accessToken`, `refreshToken`, `expiresAt` 관리. `refreshToken`과 `expiresAt`만 localStorage에 persist (`auth-storage` 키)
2. **Axios interceptors** (`axiosInstance.ts`): 요청 시 Bearer 토큰 자동 첨부, 401 응답 시 자동 토큰 갱신 후 재요청
3. **`useTokenRefresh`** (`App.tsx`에서 호출): 만료 60초 전 선제적 토큰 갱신. accessToken이 없으면 즉시 갱신 시도
4. **Route guards** (`ProtectedRoute` / `PublicRoute`): `isAuthenticated` 상태로 라우트 접근 제어. 미인증 → `/login`, 인증 완료 → `/`로 리다이렉트

## CSS / rem 주의사항

- `html { font-size: 62.5% }` 적용으로 **1rem = 10px** (src/index.css)
- Tailwind의 rem 기반 유틸리티(`text-sm`, `p-4` 등)가 기본 브라우저 대비 작게 렌더링됨
- Storybook Story에서 텍스트 크기를 의도대로 표시하려면 Tailwind 클래스 대신 `style={{ fontSize: "1.4rem" }}` 등 inline style 사용
- 커스텀 테마 토큰은 `src/index.css`의 `@theme` 블록에 정의 (예: `--color-primary`, `--color-text-primary` 등)

## Storybook

- Storybook 10 + `@storybook/react-vite` 기반
- `.storybook/preview.tsx`에서 QueryClientProvider 데코레이터와 Tailwind 테마(light/dark) 설정
- 스토리 파일 위치: `src/**/*.stories.tsx` (컴포넌트와 같은 폴더)
- Vitest + Playwright 통합: `@storybook/addon-vitest`로 스토리 기반 컴포넌트 테스트

## Code Conventions

### Component Structure (도메인별 폴더)

```
{domain}/
├── index.ts                      # barrel export
└── {ComponentName}/
    ├── {ComponentName}.tsx
    ├── {ComponentName}.type.ts   # Props 타입 (필요시)
    ├── {ComponentName}.constants.ts  # 상수 (필요시)
    ├── {ComponentName}.stories.tsx   # Storybook (필요시)
    ├── components/               # 내부 전용 하위 컴포넌트 (필요시)
    └── hooks/                    # 내부 전용 훅 (필요시)
```

### Icons 컴포넌트 (예외 구조)

`Icons/`는 메인 `Icons.tsx` 없이 아이콘 컴포넌트들을 묶는 **도메인 그룹 폴더**이면서 PascalCase를 사용하는 예외 구조이다.

```
Icons/
├── index.ts              # barrel export (각 아이콘 re-export)
├── icon.type.ts          # 공통 Props (IconCommonProps)
├── Icons.stories.tsx     # 전체 아이콘 카탈로그 Story
└── {IconName}/
    └── {IconName}.tsx    # 개별 아이콘 컴포넌트
```

- 메인 `Icons.tsx` 파일 없음 — 개별 아이콘을 직접 export
- 공통 타입(`IconCommonProps`)은 `icon.type.ts`에 정의
- Story는 폴더 루트에 `Icons.stories.tsx`로 전체 아이콘을 카탈로그 형태로 문서화
- 새 아이콘 추가 시: `{IconName}/` 폴더 생성 → `{IconName}.tsx` 작성 → `index.ts`에 export 추가

### Shared Types Structure (도메인별 폴더)

```
types/
└── {domain}/
    ├── index.ts                          # barrel export
    └── {typeName}.type.ts                # 개별 타입 정의
```

- 여러 Hook/컴포넌트에서 재사용되는 타입은 `src/lib/types/{domain}/`에 정의
- Hook 전용 타입(Request, Response, Params)은 Hook의 `.type.ts`에 유지
- import 경로: `import type { NoteListItem } from "@lib/types"`

### Query/Mutation Hook Structure (도메인별 폴더)

```
queries/ 또는 mutations/
└── {domain}/
    ├── index.ts                          # barrel export
    ├── keys.ts                           # Query Key Factory (queries만)
    └── {useHookName}/
        ├── index.ts                      # barrel export
        ├── {useHookName}.ts              # 훅 구현
        └── {useHookName}.type.ts         # 요청/응답 타입
```

**타입 네이밍 규칙**: `Use{Action}{Domain}{Suffix}` — Query/Mutation 접미사 제외
```ts
// ✅ 올바른 예
interface UseNotesParams { ... }
interface UseNotesResponse { ... }
interface UseCreateNoteRequest { ... }
interface UseDeleteNoteRequest { ... }

// ❌ 잘못된 예
interface UseNotesQueryParams { ... }
interface UseCreateNoteMutationRequest { ... }
```

**Mutation 비동기 함수 파라미터**: 원시 타입 직접 전달 금지, 반드시 Request 인터페이스 사용
```ts
// ✅
const deleteNote = async ({ noteNumber }: UseDeleteNoteRequest) => { ... };

// ❌
const deleteNote = async (noteNumber: number) => { ... };
```

**Query Key Factory 패턴** (invalidation 계층 고려):
```ts
const all = ["{domain}"] as const;
const domainKeys = {
  all,                                              // 도메인 전체 invalidate
  lists: [...all, "list"] as const,                 // 모든 목록 쿼리 invalidate (prefix match)
  list: (params?: Params) => [...all, "list", params] as const,  // 특정 파라미터 쿼리
  detail: [...all, "detail"] as const,
} as const;
export default domainKeys;
```

### Service Structure (도메인별 폴더)

```
services/
└── {domain}/
    ├── index.ts                          # barrel export
    └── {functionName}/
        ├── index.ts                      # barrel export
        └── {functionName}.ts             # 비동기 함수 구현
```

- 훅이 아닌 순수 비동기 함수 (interceptor, 유틸리티 등에서 직접 호출)

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

### TypeScript

- `verbatimModuleSyntax: true` — 타입 import 시 반드시 `import type` 사용
- `erasableSyntaxOnly: true` — `enum` 사용 불가, `as const` 객체 또는 union type 사용
- strict 모드: `noUnusedLocals`, `noUnusedParameters` 활성화

### Prettier (코드 스타일)

- 쌍따옴표(`"`) 사용 (singleQuote: false)
- `semi: true` — 세미콜론 사용
- `trailingComma: "all"` — 후행 콤마 항상 사용
- `arrowParens: "avoid"` — 화살표 함수 단일 파라미터 시 괄호 생략: `x => x`
- `singleAttributePerLine: true` — JSX 속성 한 줄에 하나씩
- `bracketSameLine: true` — JSX 닫는 괄호를 같은 줄에

### Import Order (Prettier plugin)

1. CSS 파일
2. React 관련
3. `@` alias (lib, app)
4. 상대 경로 (`../`, `./`)
5. Third-party 모듈

각 그룹 사이 빈 줄 삽입 (`importOrderSeparation: true`)

## Tech Stack

- React 19 + TypeScript 5.9 + Vite 7
- TanStack Query v5 (서버 상태)
- Zustand v5 (클라이언트 상태)
- Tailwind CSS 4 (@tailwindcss/vite 플러그인)
- Motion (`motion/react`에서 import — `framer-motion`이 아님)
- React Router DOM 7 (createBrowserRouter)
- React Hook Form v7 (폼 관리)
- Storybook 10 (컴포넌트 개발/문서화)

## Environment Variables

- `VITE_API_URL` - API 서버 주소 (기본값: `http://localhost:8000`)
