# Soap Studio

DIY 비누 제작을 위한 레시피 · 재료 · 재고 관리 플랫폼.

레시피를 계산기에 담으면 재료 소요량과 부족 재료를 자동 계산하고, 구매 후 재고 업데이트까지 이어서 처리 가능.

---

## 주요 기능

### 공개 앱 (apps/web)
- **레시피 목록** — 제조 방식(MP/CP/HP), 배치 크기, 재료 구성 확인
- **재료 현황** — 카테고리별 재고 현황 및 색상 표시
- **계산기** — 여러 레시피를 세션에 담고 배율 조정 → 재료 소요량 합산 → 부족 재료 및 구매 옵션 추천 → 추천 몰드 계산
- **소요량/구매목록 복사** — 비누 제작 후 재고 차감 또는 구매 후 재고 추가를 어드민에서 처리하기 위한 JSON 복사

### 관리자 앱 (apps/admin)
- **레시피 관리** — 생성 · 수정 · 삭제, 재료 동적 추가 및 대체재료 등록
- **재료 관리** — 생성 · 수정 · 삭제, 구매 옵션(용량 단위) 관리
- **몰드 관리** — 칸당 무게 × 칸 수 기반 총 용량 자동 계산
- **재고 추가** — 구매목록 JSON 붙여넣기 → 미리보기 → 일괄 재고 추가
- **재고 차감** — 소요량 JSON 붙여넣기 → 미리보기 → 일괄 재고 차감

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| 모노레포 | [Turborepo](https://turbo.build/) + npm workspaces |
| 프레임워크 | [Next.js](https://nextjs.org/) (App Router) |
| 데이터베이스 | [Neon](https://neon.tech/) PostgreSQL |
| ORM | [Drizzle ORM](https://orm.drizzle.team/) |
| 스타일 | [Tailwind CSS](https://tailwindcss.com/) |
| 상태관리 | [Zustand](https://zustand-demo.pmnd.rs/) |
| 언어 | TypeScript |

---

## 프로젝트 구조

```
soap-studio/
├── apps/
│   ├── admin/          # 관리자 대시보드 (Next.js)
│   └── web/            # 공개 웹 앱 (Next.js)
├── packages/
│   ├── db/             # Drizzle ORM 스키마 · 쿼리 · 마이그레이션
│   ├── types/          # 공유 TypeScript 타입 및 상수
│   └── ui/             # 공유 UI 컴포넌트 라이브러리 + Storybook
└── docs/               # 요구사항 및 기획 문서
```

---

## 시작하기

### 사전 준비

- Node.js 18+
- [Neon](https://neon.tech/) 계정 및 PostgreSQL 데이터베이스

### 설치

```bash
git clone https://github.com/ryuheeyoung/soap-studio.git
cd soap-studio
npm install
```

### 환경변수 설정

각 앱 폴더의 `.env.local.example`을 복사 후 실제 값 입력.

```bash
cp apps/admin/.env.local.example apps/admin/.env.local
cp apps/web/.env.local.example apps/web/.env.local
```

**apps/admin/.env.local**
```
DATABASE_URL=     # Neon PostgreSQL 연결 문자열 (관리자 권한)
ADMIN_PASSWORD=   # 관리자 로그인 비밀번호
SESSION_SECRET=   # 세션 시크릿 — openssl rand -base64 32 으로 생성 권장
```

**apps/web/.env.local**
```
DATABASE_URL=     # Neon PostgreSQL 연결 문자열 (읽기 전용 권한 권장)
```

### DB 마이그레이션 및 시드

```bash
# 마이그레이션 적용
cd packages/db
npx drizzle-kit migrate

# 샘플 데이터 삽입 (선택)
cd ../../
npm run seed
```

### 개발 서버 실행

```bash
npm run dev          # 전체 앱 동시 실행
npm run dev:web      # 공개 앱만
npm run dev:admin    # 관리자 앱만
```

---

## 테스트

```bash
# 단위 테스트
npm run test                          # 전체 실행
npm run test:coverage                 # 커버리지 리포트 (각 앱 디렉터리에서)

# UI 컴포넌트 시각적 검증
cd packages/ui && npm run storybook   # 포트 6006
```

- `pre-commit` — ESLint + TypeScript 타입 체크 자동 실행
- `pre-push` — 전체 단위 테스트 자동 실행

커버리지 임계값은 초기 단계 기준으로 낮게 설정되어 있으며, 테스트 추가에 따라 단계적으로 상향 예정.  
자세한 테스트 전략 및 작성 규칙 → [`docs/testing.md`](docs/testing.md)  
UI 패키지 설계 및 컴포넌트 목록 → [`docs/ui-package.md`](docs/ui-package.md)

---

## DB 권한 분리 권장

웹 앱은 읽기 전용 DB 역할 사용 권장.

```sql
-- Neon SQL Editor에서 실행
CREATE ROLE web_reader WITH LOGIN PASSWORD 'your-password';
GRANT CONNECT ON DATABASE neondb TO web_reader;
GRANT USAGE ON SCHEMA public TO web_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO web_reader;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO web_reader;
```

---

## 보안

- 관리자 앱은 미들웨어로 전체 라우트 인증 보호 — 미인증 요청은 `/login`으로 리다이렉트
- `SESSION_SECRET` 미설정 시 서버 기동 불가 (의도적 설계)
- 웹 앱 DB 계정은 읽기 전용 역할로 분리 권장

---

## 라이선스

MIT
