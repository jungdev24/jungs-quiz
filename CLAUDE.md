# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Jung's Quiz — 관리자 모드를 갖춘 영어 퀴즈 플랫폼. 선생님이 코드 수정 없이 과목·문제유형·문제·학생을 자유롭게 관리 가능.

## Architecture

- **프론트엔드**: 순수 HTML/CSS/JS 단일 파일 SPA (프레임워크 없음)
- **백엔드**: Supabase (PostgreSQL + REST API + Auth)
- **호스팅**: Cloudflare Pages (정적)
- **AI 문제 생성**: Claude API (관리자 admin.html에서 직접 호출, settings 테이블에 API 키 저장)
- **문제 생성 스크립트**: Node.js (generate.js, migrate.js — Supabase Management API 사용)

## Files

| 파일 | 설명 |
|---|---|
| `index.html` | 학생용 퀴즈 SPA. 8종 렌더러 + TTS + 채팅 + 공지 확인 |
| `admin.html` | 관리자 SPA. 과목/퀴즈/학생/결과/채팅/공지 관리 + 과목 복사 |
| `generate.js` | Node.js 문제 일괄 생성 스크립트 (기존 문제 변형 방식, Supabase Management API) |
| `migrate.js` | Node.js 마이그레이션 스크립트 (하드코딩된 20일분 영문법 문제 → DB 삽입) |
| `supabase/schema.sql` | 현재 운영 DB 스키마 (messages, notices 테이블 포함) |
| `supabase/migrations/20260319000000_init.sql` | 초기 스키마 (messages, notices 미포함) |
| `COMMANDS.md` | Claude Code용 자연어 명령어 가이드 |
| `PROGRESS.md` | 프로젝트 진행사항 기록 |

## DB Tables (schema.sql)

| 테이블 | 설명 |
|---|---|
| `subjects` | 과목 (slug, name, subtitle, quiz_types, ai_description, ai_file_content, ai_files, default_days, default_questions) |
| `days` | Day (subject_id, day_number, lesson, title, sort_order, ai_generated) |
| `questions` | 문제 (day_id, template_id, data JSONB, sort_order) |
| `students` | 학생 (name, subject_ids UUID[], is_active) |
| `results` | 시험 결과 (student_id, day_id, template_id, score, total, details) |
| `settings` | 설정 키-값 (API 키 등) |
| `messages` | 관리자-학생 채팅 (student_id, title, content, sender_type, sender_name, is_read) |
| `notices` | 공지사항 (content, subject_id, is_active) |

## Key Conventions

- Supabase JS 클라이언트는 CDN으로 로드 (`@supabase/supabase-js@2`)
- 관리자 인증: Supabase Auth (이메일+비밀번호)
- 학생 인증: 이름 기반 (students 테이블 조회)
- 문제 데이터: `questions` 테이블의 `data` JSONB 컬럼에 템플릿별 구조 저장
- 과목의 `quiz_types` JSONB: `[{"templateId":"multiple-choice","label":"문법확인","aiDescription":"..."}, ...]`
- 커스텀 유형 지원: `{"templateId":"custom-id","label":"표시이름","custom":true,"aiDescription":"AI 생성 설명"}` — 기본 객관식 구조로 렌더링
- 과목 복사: 설정 + Day + 문제 전체 복제 (`duplicateSubject`)
- 과목 간 문제 복사: 다른 과목의 Day 문제를 가져옴 (`copySubjectQuestions`)
- generate.js/migrate.js: `.env` 파일에서 `SUPABASE_MANAGEMENT_API`, `SUPABASE_MANAGEMENT_TOKEN` 읽어 사용

## Quiz Template Types (8종 + 커스텀)

| ID | 설명 | data 구조 |
|---|---|---|
| `multiple-choice` | 객관식 | `{question, options[], correctIndex, explanation}` |
| `fill-in-blank` | 빈칸채우기 | `{prompt, template, acceptedAnswers[], explanation}` |
| `vocabulary` | 단어장 | `{word, meaning, example}` |
| `true-false` | OX퀴즈 | `{statement, answer(bool), explanation}` |
| `ordering` | 문장배열 | `{instruction, items[], correctOrder[]}` |
| `matching` | 매칭 | `{pairs[{left, right}]}` |
| `reading-comprehension` | 구문독해 | `{passage, question, options[], correctIndex, explanation}` |
| *(커스텀)* | 자유 입력 | 객관식 또는 빈칸채우기 구조 자동 감지 |

## Admin Features

- **과목 관리**: 생성/수정/삭제, 문제 유형 선택, AI 설명/첨부파일, Day수/문제수 설정
- **퀴즈 관리**: Day 추가/복사, 문제 편집기 (유형별 폼), 문제 순서 변경
- **문제 생성**: AI(Claude API) 또는 스크립트(generate.js) 또는 관리자 직접 입력
- **학생 관리**: 추가(일괄), 수정, 삭제, 과목 배정
- **결과 조회**: 과목/학생/기간 필터, CSV 내보내기
- **채팅**: 관리자↔학생 1:1 채팅 (messages 테이블)
- **공지사항**: 전체/과목별 공지 (notices 테이블)
- **과목 복사**: 설정+Day+문제 전체 복제
- **과목 초기화**: 문제만 삭제, ai_generated 상태 리셋

## Student Features

- 과목 선택 → 이름 입력 로그인
- Day별 퀴즈 (유형별 탭), TTS 음성 읽기
- 틀린 문제 모아보기, 결과 자동 저장
- 관리자 채팅, 공지 확인, 미읽은 메시지 알림

## Commands

```bash
# 로컬 서버 실행
python -m http.server 8080

# 마이그레이션 (하드코딩 문제 → DB)
node migrate.js

# 문제 일괄 생성 (기존 문제 변형)
node generate.js

# Supabase 스키마 적용 (Supabase SQL Editor에서 schema.sql 실행)
```

## Setup

1. Supabase 프로젝트 생성 (supabase.com)
2. `supabase/schema.sql` 실행 (messages, notices 테이블 포함 최신 스키마)
3. `index.html`, `admin.html`의 `SUPABASE_URL`, `SUPABASE_ANON_KEY` 교체
4. Supabase Auth에서 관리자 계정 생성
5. `.env` 파일 생성 (스크립트 사용 시): `SUPABASE_MANAGEMENT_API`, `SUPABASE_MANAGEMENT_TOKEN`, `SUBJECT_ID`
6. Cloudflare Pages에 배포
