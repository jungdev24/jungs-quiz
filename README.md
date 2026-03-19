# Jung's Quiz

관리자 모드를 갖춘 영어 퀴즈 플랫폼입니다.

## 기능

### 학생용 (`index.html`)
- 과목 선택 후 이름 입력으로 로그인
- Day별 퀴즈 풀기 (6종: 객관식, 빈칸채우기, 단어장, OX, 문장배열, 매칭)
- TTS 음성 읽기
- 틀린 문제 모아보기
- 시험 결과 자동 저장

### 관리자용 (`admin.html`)
- 과목 관리 (생성, 문제 유형 선택, 활성/비활성)
- 퀴즈 관리 (Day 추가, 문제 편집기)
- AI 문제 자동 생성 (Claude API)
- 학생 관리 (추가, 삭제, 과목 배정)
- 결과 조회 (필터, CSV 내보내기)

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
5. Cloudflare Pages에 배포 또는 로컬 서버로 테스트:
   ```bash
   python -m http.server 8080
   ```
