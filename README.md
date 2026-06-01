# 반별 웹앱 리뷰 시스템

학생들이 자신이 만든 웹앱 링크를 제출하고, 친구들의 웹앱을 확인한 뒤 기능 개선 요청 형태의 리뷰 댓글을 남길 수 있는 수업용 Next.js 웹앱입니다.

## 주요 기능

- 학번과 이름 기반 간단 로그인
- Google Apps Script Web App API를 통한 Google Sheets 저장/조회
- API 연결 전 mock 데이터 fallback
- 웹앱 제출/수정 upsert
- 반별 필터, 검색, 정렬
- 리뷰 댓글 조회/작성
- 다크모드와 모바일 반응형 카드 UI

## 개발 실행

```bash
npm install
npm run dev
```

## 환경변수

```bash
NEXT_PUBLIC_APPS_SCRIPT_API_URL=https://script.google.com/macros/s/배포_ID/exec
```

자세한 Google Sheets 및 Apps Script 설정은 `google-apps-script/README.md`를 참고하세요.
