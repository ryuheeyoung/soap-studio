# DB 마이그레이션 계획: SQLite → Neon (PostgreSQL) + Drizzle ORM

## 배경

현재 `packages/db/`는 `better-sqlite3` + 순수 SQL로 구성되어 있음.
Vercel 서버리스 환경에서는 SQLite 파일 쓰기가 불가능(read-only filesystem)하므로 배포 불가.

## 결정

| 항목 | 선택 | 이유 |
|------|------|------|
| DB | Neon (PostgreSQL) | 무료, 서버리스 PostgreSQL, Vercel 공식 파트너 |
| ORM | Drizzle ORM | TypeScript-first, 스키마에서 타입 자동 추론, 수동 매핑 함수 불필요 |
| 드라이버 | `@neondatabase/serverless` | Vercel Edge/Serverless 환경 최적화 |

## 마이그레이션 준비 사항

Neon 프로젝트 생성 후 아래 환경변수 준비:
```
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
```

## 마이그레이션 작업 목록

- [x] 패키지 설치: `drizzle-orm`, `@neondatabase/serverless`, `drizzle-kit`
- [x] `packages/db/src/schema.ts` 작성 (기존 CREATE TABLE → Drizzle 스키마)
- [x] `packages/db/src/index.ts` 교체 (better-sqlite3 → Neon 클라이언트)
- [x] 쿼리 함수 전환
  - [x] `queries/ingredients.ts`
  - [x] `queries/molds.ts`
  - [x] `queries/recipes.ts`
- [x] `drizzle-kit push`로 Neon에 테이블 생성
- [x] `seed.ts` PostgreSQL 방식으로 업데이트
- [x] `better-sqlite3` 의존성 제거
- [ ] Vercel 환경변수 설정 (배포 시 필요)

## Drizzle 스키마 예시 (참고)

```typescript
// packages/db/src/schema.ts
import { pgTable, text, real, integer, boolean, timestamp } from 'drizzle-orm/pg-core';

export const ingredients = pgTable('ingredients', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  unit: text('unit').notNull(),
  stock: real('stock').notNull().default(0),
  memo: text('memo'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

수동 `toIngredient(row)` 매핑 함수 없이 타입이 자동으로 추론됨.

## 현재 상태

- SQLite: 제거 완료
- Neon 프로젝트: `soap` (ap-southeast-1, Singapore)
- 마이그레이션: **완료** (2026-05-12)
- 시드 데이터: 재료 26개, 레시피 6개 삽입 완료
