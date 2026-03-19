# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Jung's Quiz — 관리자 모드를 갖춘 퀴즈 플랫폼. 선생님이 코드 수정 없이 과목·문제유형·문제·학생을 자유롭게 관리 가능.

## Architecture

- **프론트엔드**: 순수 HTML/CSS/JS 단일 파일 SPA (프레임워크 없음)
- **백엔드**: Supabase (PostgreSQL + REST API + Auth)
- **호스팅**: Cloudflare Pages (정적)
- **AI 문제 생성**: Claude API (프론트엔드에서 직접 호출)

## Files

| 파일 | 설명 |
|---|---|
| `index.html` | 학생용 퀴즈 SPA. 6종 렌더러(객관식/빈칸채우기/단어장/OX/문장배열/매칭) |
| `admin.html` | 관리자 SPA. 과목/퀴즈/학생/결과 관리 + AI 문제 생성 |
| `supabase/schema.sql` | DB 스키마 (Supabase SQL Editor에서 실행) |

## Key Conventions

- Supabase JS 클라이언트는 CDN으로 로드 (`@supabase/supabase-js@2`)
- 관리자 인증: Supabase Auth (이메일+비밀번호)
- 학생 인증: 이름 기반 (students 테이블 조회)
- 문제 데이터: `questions` 테이블의 `data` JSONB 컬럼에 템플릿별 구조 저장
- 과목의 `quiz_types` JSONB: `[{"templateId":"multiple-choice","label":"문법확인"}, ...]`

## Quiz Template Types

| ID | 설명 | data 구조 |
|---|---|---|
| `multiple-choice` | 객관식 | `{question, options[], correctIndex, explanation}` |
| `fill-in-blank` | 빈칸채우기 | `{prompt, template, acceptedAnswers[], explanation}` |
| `vocabulary` | 단어장 | `{word, meaning, example}` |
| `true-false` | OX퀴즈 | `{statement, answer(bool), explanation}` |
| `ordering` | 문장배열 | `{instruction, items[], correctOrder[]}` |
| `matching` | 매칭 | `{pairs[{left, right}]}` |

## Commands

```bash
# 로컬 서버 실행
python -m http.server 8080

# Supabase 스키마 적용 (Supabase SQL Editor에서 schema.sql 실행)
```

## Setup

1. Supabase 프로젝트 생성 (supabase.com)
2. `supabase/schema.sql` 실행
3. `index.html`, `admin.html`의 `SUPABASE_URL`, `SUPABASE_ANON_KEY` 교체
4. Supabase Auth에서 관리자 계정 생성
5. Cloudflare Pages에 배포
