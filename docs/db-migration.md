# DB 마이그레이션: SQLite → Neon (PostgreSQL) + Drizzle ORM

> 완료일: 2026-05-12

## 배경

초기 프로토타입은 `better-sqlite3` + 순수 SQL로 구성.
Vercel 서버리스 환경에서 SQLite 파일 쓰기 불가(read-only filesystem) → Neon으로 전환.

## 결정

| 항목 | 선택 | 이유 |
|------|------|------|
| DB | Neon (PostgreSQL) | 무료, 서버리스 PostgreSQL, Vercel 공식 파트너 |
| ORM | Drizzle ORM | TypeScript-first, 스키마에서 타입 자동 추론 |
| 드라이버 | `@neondatabase/serverless` | Vercel Edge/Serverless 환경 최적화 |

## 현재 상태

- SQLite 제거 완료
- Neon 프로젝트: `soap` (ap-southeast-1, Singapore)
- 마이그레이션 및 시드 데이터 삽입 완료 (재료 26개, 레시피 6개)
- **Vercel 환경변수 미설정** — 배포 시 `DATABASE_URL` 설정 필요

## 환경변수

```
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
```
