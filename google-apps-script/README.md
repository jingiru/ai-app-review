# Google Sheets / Apps Script 연결 안내

이 문서는 `반별 웹앱 리뷰 시스템`의 데이터를 Google Sheets에 저장하기 위한 설정 방법입니다.

## 1. Google Sheets 만들기

1. Google Drive에서 새 스프레드시트를 만듭니다.
2. 아래 3개 시트를 정확한 이름으로 생성합니다.
   - `students`
   - `submissions`
   - `reviews`
3. 각 시트의 1행에 다음 헤더를 입력합니다.

### students 시트

| studentId | name | classNo |
| --- | --- | --- |
| 2403 | 홍길동 | 4 |
| 2810 | 김영희 | 8 |

### submissions 시트

| submissionId | studentId | name | classNo | title | description | appUrl | createdAt | updatedAt |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |

### reviews 시트

| reviewId | submissionId | reviewerId | reviewerName | content | createdAt |
| --- | --- | --- | --- | --- | --- |

> `reviewId`와 `submissionId`는 행 번호에 의존하지 않고 UUID 기반으로 생성됩니다. 교사는 필요한 경우 Google Sheets에서 행을 직접 삭제해 관리할 수 있습니다.

## 2. Apps Script 붙여넣기

1. Google Sheets 메뉴에서 **확장 프로그램 → Apps Script**를 엽니다.
2. 기본 `Code.gs` 내용을 모두 지웁니다.
3. 이 저장소의 `google-apps-script/Code.gs` 내용을 복사해 붙여넣습니다.
4. 저장합니다.

## 3. Web App으로 배포하기

1. Apps Script 우측 상단의 **배포 → 새 배포**를 클릭합니다.
2. 유형에서 **웹 앱**을 선택합니다.
3. 실행 권한은 **나**로 설정합니다.
4. 액세스 권한은 수업 환경에 맞게 설정합니다.
   - 일반적인 테스트: **모든 사용자** 또는 **링크가 있는 모든 사용자**
   - 학교 계정만 허용할 경우 조직 정책에 맞게 선택
5. 배포 후 표시되는 **웹 앱 URL**을 복사합니다.

## 4. 로컬 환경변수 설정

프로젝트 루트에 `.env.local` 파일을 만들고 다음처럼 입력합니다.

```bash
NEXT_PUBLIC_APPS_SCRIPT_API_URL=https://script.google.com/macros/s/배포_ID/exec
```

환경변수를 추가한 뒤에는 개발 서버를 다시 시작합니다.

```bash
npm run dev
```

## 5. Vercel 배포 시 환경변수 설정

1. Vercel 프로젝트 대시보드로 이동합니다.
2. **Settings → Environment Variables**를 엽니다.
3. 다음 변수를 추가합니다.
   - Name: `NEXT_PUBLIC_APPS_SCRIPT_API_URL`
   - Value: Apps Script Web App URL
4. Production, Preview, Development 중 필요한 환경을 선택합니다.
5. 다시 배포합니다.

## 6. 동작 확인

프론트엔드는 다음 action을 Apps Script에 JSON으로 요청합니다.

- `getStudents`
- `login`
- `getSubmissions`
- `upsertSubmission`
- `getReviews`
- `addReview`

응답 형식은 다음과 같습니다.

```json
{
  "success": true,
  "data": []
}
```

오류 응답은 다음과 같습니다.

```json
{
  "success": false,
  "message": "오류 메시지"
}
```

## 7. API 연결 전 테스트

`NEXT_PUBLIC_APPS_SCRIPT_API_URL`이 비어 있거나 API 호출에 실패하면 프론트엔드는 mock 데이터로 대시보드를 표시합니다. 이 상태에서도 로그인, 제출, 리뷰 작성 UI를 브라우저 localStorage 기반으로 테스트할 수 있습니다.
