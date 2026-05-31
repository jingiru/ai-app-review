const SHEET_NAMES = {
  students: 'students',
  submissions: 'submissions',
  reviews: 'reviews',
};

const HEADERS = {
  students: ['studentId', 'name', 'classNo'],
  submissions: ['submissionId', 'studentId', 'name', 'classNo', 'title', 'description', 'appUrl', 'createdAt', 'updatedAt'],
  reviews: ['reviewId', 'submissionId', 'reviewerId', 'reviewerName', 'content', 'createdAt'],
};

function doGet(e) {
  return routeRequest(e);
}

function doPost(e) {
  return routeRequest(e);
}

function routeRequest(e) {
  try {
    const params = parseRequest(e);
    const action = params.action;

    if (!action) return jsonResponse({ success: false, message: 'action이 필요합니다.' });

    switch (action) {
      case 'getStudents':
        return jsonResponse({ success: true, data: getRows(SHEET_NAMES.students) });
      case 'login':
        return jsonResponse({ success: true, data: login(params) });
      case 'getSubmissions':
        return jsonResponse({ success: true, data: getRows(SHEET_NAMES.submissions) });
      case 'upsertSubmission':
        return jsonResponse({ success: true, data: upsertSubmission(params) });
      case 'getReviews':
        return jsonResponse({ success: true, data: getRows(SHEET_NAMES.reviews) });
      case 'addReview':
        return jsonResponse({ success: true, data: addReview(params) });
      default:
        return jsonResponse({ success: false, message: '지원하지 않는 action입니다: ' + action });
    }
  } catch (error) {
    return jsonResponse({ success: false, message: error.message || String(error) });
  }
}

function parseRequest(e) {
  const queryParams = e && e.parameter ? e.parameter : {};
  const postData = e && e.postData && e.postData.contents ? e.postData.contents : '';

  if (!postData) return queryParams;

  try {
    return Object.assign({}, queryParams, JSON.parse(postData));
  } catch (error) {
    return queryParams;
  }
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getOrCreateSheet(name) {
  const spreadsheet = getSpreadsheet();
  let sheet = spreadsheet.getSheetByName(name);
  if (!sheet) sheet = spreadsheet.insertSheet(name);

  const headers = HEADERS[name];
  if (headers && sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  }
  return sheet;
}

function getRows(sheetName) {
  const sheet = getOrCreateSheet(sheetName);
  const values = sheet.getDataRange().getDisplayValues();
  if (values.length <= 1) return [];

  const headers = values[0];
  return values.slice(1).filter(function(row) {
    return row.some(function(cell) { return String(cell).trim() !== ''; });
  }).map(function(row) {
    const item = {};
    headers.forEach(function(header, index) {
      item[header] = row[index] || '';
    });
    return item;
  });
}

function getSheetData(sheetName) {
  const sheet = getOrCreateSheet(sheetName);
  const values = sheet.getDataRange().getDisplayValues();
  const headers = values[0] || HEADERS[sheetName];
  return { sheet: sheet, values: values, headers: headers };
}

function login(params) {
  const studentId = validateStudentId(params.studentId);
  const name = String(params.name || '').trim();
  if (!name) throw new Error('이름을 입력해 주세요.');

  const students = getRows(SHEET_NAMES.students);
  const student = students.find(function(item) {
    return String(item.studentId) === studentId && String(item.name).trim() === name;
  });

  if (!student) throw new Error('students 시트에 등록된 학번과 이름이 일치하지 않습니다.');
  return {
    studentId: String(student.studentId),
    name: String(student.name),
    classNo: String(student.classNo || getClassNoFromStudentId(studentId)),
  };
}

function upsertSubmission(params) {
  const studentId = validateStudentId(params.studentId);
  const name = String(params.name || '').trim();
  const classNo = String(params.classNo || getClassNoFromStudentId(studentId));
  const title = String(params.title || '').trim();
  const description = String(params.description || '').trim();
  const appUrl = validateUrl(params.appUrl);
  if (!name) throw new Error('이름이 필요합니다.');

  const data = getSheetData(SHEET_NAMES.submissions);
  const rows = data.values;
  const headers = data.headers;
  const studentIdIndex = headers.indexOf('studentId');
  const now = nowKorea();
  let targetRow = -1;

  for (let i = 1; i < rows.length; i += 1) {
    if (String(rows[i][studentIdIndex]) === studentId) {
      targetRow = i + 1;
      break;
    }
  }

  const existing = targetRow > -1 ? rowToObject(headers, rows[targetRow - 1]) : null;
  const submission = {
    submissionId: existing && existing.submissionId ? existing.submissionId : createId('sub'),
    studentId: studentId,
    name: name,
    classNo: classNo,
    title: title,
    description: description,
    appUrl: appUrl,
    createdAt: existing && existing.createdAt ? existing.createdAt : now,
    updatedAt: now,
  };

  const row = HEADERS.submissions.map(function(header) { return submission[header] || ''; });
  if (targetRow > -1) {
    data.sheet.getRange(targetRow, 1, 1, row.length).setValues([row]);
  } else {
    data.sheet.appendRow(row);
  }

  return submission;
}

function addReview(params) {
  const submissionId = String(params.submissionId || '').trim();
  const reviewerId = validateStudentId(params.reviewerId);
  const reviewerName = String(params.reviewerName || '').trim();
  const content = String(params.content || '').trim();

  if (!submissionId) throw new Error('submissionId가 필요합니다.');
  if (!reviewerName) throw new Error('작성자 이름이 필요합니다.');
  if (!content) throw new Error('댓글 내용을 입력해 주세요.');
  if (content.length > 500) throw new Error('댓글은 500자 이내로 작성해 주세요.');

  const submissions = getRows(SHEET_NAMES.submissions);
  const exists = submissions.some(function(item) { return String(item.submissionId) === submissionId; });
  if (!exists) throw new Error('존재하지 않는 제출물입니다.');

  const review = {
    reviewId: createId('review'),
    submissionId: submissionId,
    reviewerId: reviewerId,
    reviewerName: reviewerName,
    content: content,
    createdAt: nowKorea(),
  };

  const sheet = getOrCreateSheet(SHEET_NAMES.reviews);
  sheet.appendRow(HEADERS.reviews.map(function(header) { return review[header] || ''; }));
  return review;
}

function rowToObject(headers, row) {
  const item = {};
  headers.forEach(function(header, index) {
    item[header] = row[index] || '';
  });
  return item;
}

function validateStudentId(studentId) {
  const value = String(studentId || '').trim();
  if (!/^\d{4}$/.test(value)) throw new Error('학번은 4자리 숫자로 입력해 주세요.');
  return value;
}

function validateUrl(url) {
  const value = String(url || '').trim();
  if (!value) throw new Error('웹앱 링크를 입력해 주세요.');
  if (!/^https?:\/\//i.test(value)) throw new Error('http:// 또는 https://로 시작하는 URL을 입력해 주세요.');
  return value;
}

function getClassNoFromStudentId(studentId) {
  return String(studentId).charAt(1);
}

function createId(prefix) {
  return prefix + '_' + Utilities.getUuid();
}

function nowKorea() {
  return Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm');
}
