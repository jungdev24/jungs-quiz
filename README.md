# Jung's Quiz

관리자 모드를 갖춘 영어 퀴즈 플랫폼입니다.

## 기능

### 학생용 (`index.html`)
- 과목 선택 후 이름 입력으로 로그인
- Day별 퀴즈 풀기 (8종: 객관식, 빈칸채우기, 단어장, OX, 문장배열, 매칭, 구문독해, 커스텀)
- TTS 음성 읽기
- 틀린 문제 모아보기
- 시험 결과 자동 저장
- 관리자 채팅 (1:1 메시지)
- 공지사항 확인 (전체/과목별)

### 관리자용 (`admin.html`)
- 과목 관리 (생성, 문제 유형 선택, AI 설명/첨부파일, Day수/문제수 설정)
- 퀴즈 관리 (Day 추가/복사, 문제 편집기)
- AI 문제 자동 생성 (Claude API, settings에 API 키 저장)
- 학생 관리 (일괄 추가, 수정, 삭제, 과목 배정)
- 결과 조회 (과목/학생/기간 필터, CSV 내보내기)
- 관리자↔학생 채팅
- 공지사항 관리 (전체/과목별)
- 과목 복사 (설정 + Day + 문제 전체 복제)
- 과목 간 문제 복사, 과목 초기화

### 스크립트
- `generate.js` — 기존 문제 변형 방식 일괄 생성 (Supabase Management API)
- `migrate.js` — 하드코딩 영문법 20일분 문제 DB 삽입

## 기술 스택

- **프론트엔드**: 순수 HTML/CSS/JS (프레임워크 없음)
- **백엔드**: [Supabase](https://supabase.com) (PostgreSQL + Auth + REST API)
- **호스팅**: Cloudflare Pages
- **AI**: Claude API

## 설정

1. [Supabase](https://supabase.com)에서 프로젝트 생성
2. SQL Editor에서 `supabase/schema.sql` 실행
3. Authentication → Users에서 관리자 계정 생성
4. `index.html`과 `admin.html`의 `SUPABASE_URL`, `SUPABASE_ANON_KEY` 수정
5. (선택) `.env` 파일 생성 — 스크립트(generate.js, migrate.js) 사용 시:
   ```
   SUPABASE_MANAGEMENT_API=https://xxx.supabase.co/rest/v1/rpc/query
   SUPABASE_MANAGEMENT_TOKEN=your-service-role-key
   SUBJECT_ID=과목UUID
   ```
6. Cloudflare Pages에 배포 또는 로컬 서버로 테스트:
   ```bash
   python -m http.server 8080
   ```

## 자연어 명령어

Claude Code에서 사용할 수 있는 명령어는 `COMMANDS.md`를 참고하세요.
