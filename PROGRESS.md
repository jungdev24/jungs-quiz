# Jung's Quiz 진행사항

## 완료된 기능 (2026-03-19 ~ 03-20)

### 코어
- [x] Supabase DB 스키마 설계 (subjects, days, questions, students, results, settings)
- [x] 학생용 index.html — 8종 퀴즈 렌더러, TTS, 과목 선택, 이름 로그인
- [x] 관리자 admin.html — 과목/퀴즈/학생/결과 관리

### AI 문제 생성
- [x] 관리자 UI에서 Claude API로 AI 문제 생성 (settings 테이블에 API 키 저장)
- [x] generate.js — 기존 문제 변형 방식 일괄 생성 스크립트
- [x] migrate.js — 하드코딩된 20일분 영문법 문제 마이그레이션

### 관리 기능
- [x] 과목 복사 (설정 + Day + 문제 전체 복제)
- [x] 과목 간 문제 복사
- [x] 과목 초기화 (문제 삭제 + ai_generated 리셋)
- [x] AI 설명/첨부파일 기반 문제 생성
- [x] Day수/문제수 과목별 설정 (default_days, default_questions)

### 커뮤니케이션
- [x] 관리자↔학생 1:1 채팅 (messages 테이블)
- [x] 공지사항 관리 (notices 테이블, 전체/과목별)
- [x] 학생 미읽은 메시지 알림 배지

### 보안
- [x] RLS (Row Level Security) 적용
- [x] 관리자 인증 토큰 분리 (Supabase Auth)
- [x] anon 사용자 읽기 전용 + 결과 제출만 허용

## 운영 중
- [x] Supabase 프로젝트 연동 완료
- [x] Cloudflare Pages 배포 완료

## 참고
- 자연어 명령어 가이드: `COMMANDS.md`
- DB 스키마: `supabase/schema.sql` (최신), `supabase/migrations/20260319000000_init.sql` (초기)
- schema.sql과 실제 운영 DB 차이: messages, notices 테이블은 schema.sql에 아직 미반영 (운영 DB에는 존재)
