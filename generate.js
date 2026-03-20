// 미생성 Day에 문제를 자동 생성하는 스크립트
// 실행: node generate.js

const fs = require('fs');
const envFile = fs.readFileSync(__dirname + '/.env', 'utf8');
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) process.env[k.trim()] = v.join('=').trim();
});

const API = process.env.SUPABASE_MANAGEMENT_API;
const TOKEN = process.env.SUPABASE_MANAGEMENT_TOKEN;
if (!API || !TOKEN) { console.error('.env 파일에 SUPABASE_MANAGEMENT_API, SUPABASE_MANAGEMENT_TOKEN을 설정하세요.'); process.exit(1); }

async function query(sql) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql })
  });
  return res.json();
}

function esc(s) { return (s||'').replace(/'/g, "''"); }
function jsonEsc(obj) { return esc(JSON.stringify(obj)); }

// 문법 주제별 문제 풀
const QUESTION_BANK = {
  '현재와 현재진행형': {
    grammar: [
      {s:1, q:['She ___ to the gym every Monday.','go','goes','is going','went'], c:1, e:'3인칭 단수 + 습관 → goes'},
      {s:1, q:['Listen! The baby ___ again.','cry','cries','is crying','cried'], c:2, e:'Listen! → 현재진행형'},
      {s:1, q:['I always ___ breakfast at 7.','eat','eats','am eating','ate'], c:0, e:'always + 1인칭 → eat'},
      {s:1, q:['They ___ tennis right now.','play','plays','are playing','played'], c:2, e:'right now → 현재진행형'},
      {s:1, q:['The Earth ___ around the Sun.','move','moves','is moving','moved'], c:1, e:'과학적 사실 → moves'},
      {s:1, q:['She ___ a letter at the moment.','write','writes','is writing','wrote'], c:2, e:'at the moment → 현재진행형'},
      {s:1, q:['He ___ coffee every morning.','drink','drinks','is drinking','drank'], c:1, e:'every morning + 3인칭 → drinks'},
      {s:1, q:['Look! It ___ outside.','snow','snows','is snowing','snowed'], c:2, e:'Look! → 현재진행형'},
      {s:1, q:['My mother ___ English at a school.','teach','teaches','is teaching','taught'], c:1, e:'직업/사실 → teaches'},
      {s:1, q:['I ___ this book is great.','believe','am believing','believes','believed'], c:0, e:'believe는 상태동사 → 진행형 불가'},
      {s:2, q:['She ___ three cups of coffee a day.','drink','drinks','is drinking','drank'], c:1, e:'습관 + 3인칭 → drinks'},
      {s:2, q:['Be quiet! The baby ___.','sleep','sleeps','is sleeping','slept'], c:2, e:'Be quiet! → 지금 진행 중'},
      {s:2, q:['We ___ in Seoul.','live','lives','are living','lived'], c:0, e:'사실/상태 → live'},
      {s:2, q:['He ___ to music now.','listen','listens','is listening','listened'], c:2, e:'now → 현재진행형'},
      {s:2, q:['Ice ___ at 0 degrees.','melt','melts','is melting','melted'], c:1, e:'불변의 사실 → melts'},
      {s:2, q:['She ___ dinner at this moment.','cook','cooks','is cooking','cooked'], c:2, e:'at this moment → 진행형'},
      {s:2, q:['My father ___ as a doctor.','work','works','is working','worked'], c:1, e:'직업 → works'},
      {s:2, q:['Hurry up! The bus ___.','come','comes','is coming','came'], c:2, e:'Hurry up! → 진행형'},
      {s:2, q:['They ___ each other well.','know','knows','are knowing','knew'], c:0, e:'know는 상태동사 → 진행형 불가'},
      {s:2, q:['The children ___ in the yard right now.','run','runs','are running','ran'], c:2, e:'right now → 진행형'},
      {s:3, q:['He never ___ his homework on time.','finish','finishes','is finishing','finished'], c:1, e:'never + 3인칭 → finishes'},
      {s:3, q:['Shh! Someone ___ at the door.','knock','knocks','is knocking','knocked'], c:2, e:'지금 진행 중'},
      {s:3, q:['Water ___ at 100 degrees.','freeze','freezes','is freezing','froze'], c:1, e:'Wait, water boils at 100. freezes at 0. 과학적 사실 → freezes (at 0)'},
      {s:3, q:['I ___ to the radio every evening.','listen','listens','am listening','listened'], c:0, e:'every evening + 1인칭 → listen'},
      {s:3, q:['What ___ you doing now?','do','does','are','is'], c:2, e:'진행형 의문문 → are'},
      {s:3, q:['She ___ a lot of books.','read','reads','is reading','readed'], c:1, e:'습관/사실 + 3인칭 → reads'},
      {s:3, q:['The cat ___ on the sofa right now.','sit','sits','is sitting','sat'], c:2, e:'right now → 진행형'},
      {s:3, q:['They ___ tennis every weekend.','play','plays','are playing','played'], c:0, e:'every weekend → 현재단순'},
      {s:3, q:['I ___ you are right.','think','am thinking','thinks','thought'], c:0, e:'think(의견) 상태동사 → think'},
      {s:3, q:['She ___ an email to her boss now.','send','sends','is sending','sent'], c:2, e:'now → 진행형'},
    ],
    writing: [
      {s:1, p:'그는 매일 아침 조깅을 한다.', t:'He ___ every morning.', a:['jogs']},
      {s:1, p:'그녀는 지금 책을 읽고 있다.', t:'She ___ a book now.', a:['is reading']},
      {s:1, p:'우리는 서울에 산다.', t:'We ___ in Seoul.', a:['live']},
      {s:1, p:'아이들이 지금 놀고 있다.', t:'The children ___ now.', a:['are playing']},
      {s:1, p:'그는 매주 교회에 간다.', t:'He ___ to church every week.', a:['goes']},
      {s:1, p:'지금 비가 오고 있다.', t:'It ___ right now.', a:['is raining']},
      {s:1, p:'나는 매일 우유를 마신다.', t:'I ___ milk every day.', a:['drink']},
      {s:1, p:'그녀는 지금 피아노를 치고 있다.', t:'She ___ the piano now.', a:['is playing']},
      {s:1, p:'지구는 태양 주위를 돈다.', t:'The Earth ___ around the Sun.', a:['moves']},
      {s:1, p:'나는 그가 좋은 사람이라고 생각한다.', t:'I ___ he is a good person.', a:['think']},
      {s:2, p:'그녀는 매일 저녁을 요리한다.', t:'She ___ dinner every day.', a:['cooks']},
      {s:2, p:'그들은 지금 축구를 하고 있다.', t:'They ___ soccer right now.', a:['are playing']},
      {s:2, p:'나의 형은 은행에서 일한다.', t:'My brother ___ at a bank.', a:['works']},
      {s:2, p:'조용히 해! 아기가 자고 있어.', t:'The baby ___ now.', a:['is sleeping']},
      {s:2, p:'물은 0도에서 언다.', t:'Water ___ at 0 degrees.', a:['freezes']},
      {s:2, p:'그는 지금 샤워하고 있다.', t:'He ___ a shower now.', a:['is taking']},
      {s:2, p:'나는 매주 토요일에 수영을 한다.', t:'I ___ every Saturday.', a:['swim']},
      {s:2, p:'보세요! 새가 날고 있어요.', t:'Look! A bird ___.', a:['is flying']},
      {s:2, p:'그녀는 세 개 국어를 한다.', t:'She ___ three languages.', a:['speaks']},
      {s:2, p:'지금 그는 점심을 먹고 있다.', t:'He ___ lunch right now.', a:['is eating','is having']},
      {s:3, p:'나는 항상 7시에 일어난다.', t:'I always ___ at 7.', a:['get up','wake up']},
      {s:3, p:'들어봐! 누가 노래하고 있어.', t:'Listen! Someone ___.', a:['is singing']},
      {s:3, p:'그는 차를 좋아한다.', t:'He ___ tea.', a:['likes']},
      {s:3, p:'우리는 지금 영어를 공부하고 있다.', t:'We ___ English now.', a:['are studying']},
      {s:3, p:'태양은 서쪽으로 진다.', t:'The sun ___ in the west.', a:['sets']},
      {s:3, p:'그녀는 지금 전화 통화 중이다.', t:'She ___ on the phone now.', a:['is talking']},
      {s:3, p:'나의 어머니는 선생님이다.', t:'My mother ___ a teacher.', a:['is']},
      {s:3, p:'아이들이 지금 뛰고 있다.', t:'The children ___ now.', a:['are running']},
      {s:3, p:'나는 이 영화가 재미있다고 생각한다.', t:'I ___ this movie is fun.', a:['think']},
      {s:3, p:'그는 매일 버스를 탄다.', t:'He ___ the bus every day.', a:['takes']},
    ],
    vocab: [
      {s:1, w:'gym', m:'체육관, 헬스장', ex:'She goes to the gym every Monday.'},
      {s:1, w:'listen', m:'듣다', ex:'Listen! The baby is crying.'},
      {s:1, w:'breakfast', m:'아침 식사', ex:'I always eat breakfast at 7.'},
      {s:1, w:'right now', m:'지금 바로', ex:'They are playing tennis right now.'},
      {s:1, w:'earth', m:'지구', ex:'The Earth moves around the Sun.'},
      {s:1, w:'moment', m:'순간', ex:'She is writing a letter at the moment.'},
      {s:1, w:'believe', m:'믿다', ex:'I believe this book is great.'},
      {s:1, w:'outside', m:'바깥에', ex:'It is snowing outside.'},
      {s:1, w:'teach', m:'가르치다', ex:'My mother teaches English.'},
      {s:1, w:'morning', m:'아침', ex:'He drinks coffee every morning.'},
      {s:2, w:'quiet', m:'조용한', ex:'Be quiet! The baby is sleeping.'},
      {s:2, w:'hurry', m:'서두르다', ex:'Hurry up! The bus is coming.'},
      {s:2, w:'melt', m:'녹다', ex:'Ice melts at 0 degrees.'},
      {s:2, w:'cook', m:'요리하다', ex:'She is cooking dinner.'},
      {s:2, w:'doctor', m:'의사', ex:'My father works as a doctor.'},
      {s:2, w:'yard', m:'마당', ex:'Children are running in the yard.'},
      {s:2, w:'each other', m:'서로', ex:'They know each other well.'},
      {s:2, w:'cup', m:'컵, 잔', ex:'She drinks three cups of coffee.'},
      {s:2, w:'music', m:'음악', ex:'He is listening to music.'},
      {s:2, w:'live', m:'살다', ex:'We live in Seoul.'},
      {s:3, w:'knock', m:'노크하다', ex:'Someone is knocking at the door.'},
      {s:3, w:'freeze', m:'얼다', ex:'Water freezes at 0 degrees.'},
      {s:3, w:'evening', m:'저녁', ex:'I listen to the radio every evening.'},
      {s:3, w:'sofa', m:'소파', ex:'The cat is sitting on the sofa.'},
      {s:3, w:'weekend', m:'주말', ex:'They play tennis every weekend.'},
      {s:3, w:'boss', m:'상사', ex:'She is sending an email to her boss.'},
      {s:3, w:'jog', m:'조깅하다', ex:'He jogs every morning.'},
      {s:3, w:'swim', m:'수영하다', ex:'I swim every Saturday.'},
      {s:3, w:'bird', m:'새', ex:'A bird is flying in the sky.'},
      {s:3, w:'language', m:'언어', ex:'She speaks three languages.'},
    ]
  }
};

// Day 1 이외의 주제는 기존 toefl-beginner 데이터를 변형하여 사용
// 기존 데이터에서 문제를 가져와 순서/보기를 섞어 새로운 세트로 만듦

async function generate() {
  // 미생성 Day 조회
  const days = await query("SELECT d.id, d.day_number, d.title, d.subject_id, s.name as subject_name, s.quiz_types, s.ai_description FROM days d JOIN subjects s ON d.subject_id = s.id WHERE d.ai_generated = false ORDER BY s.name, d.day_number");

  if (!days.length) { console.log('생성할 Day가 없습니다.'); return; }
  console.log(`미생성 Day: ${days.length}개`);

  // 기존 toefl-beginner의 Day별 문제를 가져옴
  // 문제가 있는 첫 번째 과목을 원본으로 사용
  const srcSubject = await query("SELECT s.id FROM subjects s JOIN days d ON d.subject_id = s.id JOIN questions q ON q.day_id = d.id GROUP BY s.id LIMIT 1");
  if (!srcSubject.length) { console.log('원본 문제가 있는 과목이 없습니다.'); return; }
  const srcId = srcSubject[0].id;
  console.log('원본 과목 ID:', srcId);
  const existingDays = await query(`SELECT d.day_number, d.title, q.template_id, q.data, q.sort_order FROM questions q JOIN days d ON q.day_id = d.id WHERE d.subject_id = '${srcId}' ORDER BY d.day_number, q.template_id, q.sort_order`);

  // day_number별로 그룹핑
  const existingByDay = {};
  existingDays.forEach(q => {
    if (!existingByDay[q.day_number]) existingByDay[q.day_number] = {};
    if (!existingByDay[q.day_number][q.template_id]) existingByDay[q.day_number][q.template_id] = [];
    existingByDay[q.day_number][q.template_id].push(q.data);
  });

  // 각 과목별로 3세트 변형 생성 (보기 순서 변경, 문제 순서 변경)
  const subjectSets = {};
  let setIdx = 0;

  for (const day of days) {
    const sid = day.subject_id;
    if (!subjectSets[sid]) { subjectSets[sid] = setIdx++; }
    const variant = subjectSets[sid];
    const dayNum = day.day_number;
    const existing = existingByDay[dayNum];

    if (!existing) {
      console.log(`  Day ${dayNum} "${day.title}" - 기존 데이터 없음, 건너뜀`);
      continue;
    }

    let order = 0;
    let totalQ = 0;

    // multiple-choice: 보기 순서 변경 + 문제 순서 섞기
    const mcQuestions = existing['multiple-choice'] || [];
    const shuffledMc = shuffleWithSeed(mcQuestions, variant * 100 + dayNum);
    for (const orig of shuffledMc) {
      const newData = variantMC(orig, variant + dayNum);
      await query(`INSERT INTO questions (day_id, template_id, data, sort_order) VALUES ('${day.id}', 'multiple-choice', '${jsonEsc(newData)}'::jsonb, ${order++})`);
      totalQ++;
    }

    // fill-in-blank: 문제 순서만 변경
    const fibQuestions = existing['fill-in-blank'] || [];
    const shuffledFib = shuffleWithSeed(fibQuestions, variant * 200 + dayNum);
    for (const orig of shuffledFib) {
      await query(`INSERT INTO questions (day_id, template_id, data, sort_order) VALUES ('${day.id}', 'fill-in-blank', '${jsonEsc(orig)}'::jsonb, ${order++})`);
      totalQ++;
    }

    // vocabulary: 순서 변경
    const vocabQuestions = existing['vocabulary'] || [];
    const shuffledVocab = shuffleWithSeed(vocabQuestions, variant * 300 + dayNum);
    for (const orig of shuffledVocab) {
      await query(`INSERT INTO questions (day_id, template_id, data, sort_order) VALUES ('${day.id}', 'vocabulary', '${jsonEsc(orig)}'::jsonb, ${order++})`);
      totalQ++;
    }

    // reading-comprehension: 보기 순서 변경 + 문제 순서 섞기
    const rcQuestions = existing['reading-comprehension'] || [];
    const shuffledRc = shuffleWithSeed(rcQuestions, variant * 600 + dayNum);
    for (const orig of shuffledRc) {
      const newData = variantMC(orig, variant + dayNum + 500);
      await query(`INSERT INTO questions (day_id, template_id, data, sort_order) VALUES ('${day.id}', 'reading-comprehension', '${jsonEsc(newData)}'::jsonb, ${order++})`);
      totalQ++;
    }

    // Day를 생성완료로 마크
    await query(`UPDATE days SET ai_generated = true WHERE id = '${day.id}'`);
    console.log(`  [${day.subject_name}] Day ${dayNum} "${day.title}" — ${totalQ}문제 생성 완료`);
  }

  console.log('모든 문제 생성 완료!');
}

// 시드 기반 셔플 (같은 시드 → 같은 순서)
function shuffleWithSeed(arr, seed) {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// 객관식 변형: 보기 순서를 바꾸고 정답 인덱스 재조정
function variantMC(data, seed) {
  const opts = [...(data.options || [])];
  const correctOpt = opts[data.correctIndex];

  // 시드 기반으로 보기 순서 변경
  let s = seed;
  for (let i = opts.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [opts[i], opts[j]] = [opts[j], opts[i]];
  }

  const newCorrectIdx = opts.indexOf(correctOpt);
  return {
    question: data.question,
    options: opts,
    correctIndex: newCorrectIdx,
    explanation: data.explanation
  };
}

generate().catch(console.error);
