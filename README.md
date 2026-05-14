# Soap Studio

DIY 비누 제작을 위한 레시피 · 재료 · 재고 관리 플랫폼.

레시피를 계산기에 담으면 필요한 재료 소요량과 부족 재료를 자동으로 계산해주고, 구매 후 재고 업데이트까지 이어서 처리할 수 있어요.

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
│   └── types/          # 공유 TypeScript 타입
└── docs/               # 요구사항 및 기획 문서
```

---

## 시작하기

### 사전 준비

- Node.js 18+
- [Neon](https://neon.tech/) 계정 및 PostgreSQL 데이터베이스

### 설치

```bash
git clone https://github.com/your-username/soap-studio.git
cd soap-studio
npm install
```

### 환경변수 설정

각 앱 폴더의 `.env.local.example`을 복사해서 `.env.local`을 만들고 실제 값을 채우세요.

```bash
cp apps/admin/.env.local.example apps/admin/.env.local
cp apps/web/.env.local.example apps/web/.env.local
```

**apps/admin/.env.local**
```
DATABASE_URL=           # Neon PostgreSQL 연결 문자열 (관리자 권한)
ADMIN_PASSWORD=         # 관리자 로그인 비밀번호
SESSION_SECRET=         # 세션 시크릿 (openssl rand -base64 32 으로 생성)
```

**apps/web/.env.local**
```
DATABASE_URL=           # Neon PostgreSQL 연결 문자열 (읽기 전용 권한 권장)
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
# 전체 앱 동시 실행
npm run dev

# 개별 실행
npm run dev:web    # 공개 앱만
npm run dev:admin  # 관리자 앱만
```

---

## DB 권한 분리 권장

웹 앱은 읽기 전용 DB 역할을 사용하는 것을 권장합니다.

```sql
-- Neon SQL Editor에서 실행
CREATE ROLE web_reader WITH LOGIN PASSWORD 'your-password';
GRANT CONNECT ON DATABASE neondb TO web_reader;
GRANT USAGE ON SCHEMA public TO web_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO web_reader;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO web_reader;
```

---

## 라이선스

MIT
