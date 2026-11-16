// 공용 퀴즈 & 인출 연습 컴포넌트
//
// 객관식 (정답 1개):
// <div class="quiz-q" data-answer="1">          (0부터 시작하는 정답 인덱스)
//   <p class="q-title">질문</p> ...본문...
//   <div class="options"><button class="opt">A</button>...</div>
//   <div class="feedback"><p>해설</p></div>
// </div>
//
// 복수 정답 (시험의 multiple response 형식):
// <div class="quiz-q" data-answer="0,3">        (쉼표로 구분한 정답 인덱스들)
//   ...같은 구조... 선택지를 눌러 고른 뒤 자동 생성되는 "제출" 버튼으로 채점
//
// 점수 표시(선택): <div class="quiz-score" data-quiz-score></div>
//
// 인출 연습:
// <div class="recall"><p>질문</p><textarea></textarea>
//   <button data-reveal>답 확인</button><div class="answer">모범 답</div></div>
(function () {
  function init() {
    var qs = Array.prototype.slice.call(document.querySelectorAll('.quiz-q'));
    var scoreEl = document.querySelector('[data-quiz-score]');
    var answered = 0, correct = 0;

    function renderScore() {
      if (!scoreEl) return;
      scoreEl.textContent = answered < qs.length
        ? '진행 ' + answered + ' / ' + qs.length + '  ·  정답 ' + correct
        : '완료! ' + qs.length + '문제 중 ' + correct + '문제 정답';
    }

    qs.forEach(function (q) {
      var answers = q.getAttribute('data-answer').split(',').map(function (s) { return parseInt(s, 10); });
      var multi = answers.length > 1;
      var opts = Array.prototype.slice.call(q.querySelectorAll('button.opt'));
      var fb = q.querySelector('.feedback');
      var verdict = document.createElement('p');
      verdict.className = 'verdict';
      if (fb) fb.insertBefore(verdict, fb.firstChild);

      function grade(chosen) {
        q.classList.add('answered');
        var ok = chosen.length === answers.length && chosen.every(function (i) { return answers.indexOf(i) !== -1; });
        answered++; if (ok) correct++;
        opts.forEach(function (b, j) {
          b.disabled = true;
          b.classList.remove('picked');
          if (answers.indexOf(j) !== -1) b.classList.add('correct');
          else if (chosen.indexOf(j) !== -1) b.classList.add('wrong');
        });
        verdict.textContent = ok ? '정답입니다.' : '아쉽습니다. 정답은 강조된 선택지입니다.';
        verdict.classList.add(ok ? 'ok' : 'bad');
        renderScore();
      }

      if (!multi) {
        opts.forEach(function (btn, i) {
          btn.addEventListener('click', function () {
            if (!q.classList.contains('answered')) grade([i]);
          });
        });
        return;
      }

      var hint = document.createElement('p');
      hint.className = 'multi-hint';
      hint.textContent = answers.length + '개를 고르세요.';
      var optsWrap = q.querySelector('.options');
      optsWrap.parentNode.insertBefore(hint, optsWrap);
      var submit = document.createElement('button');
      submit.className = 'submit';
      submit.textContent = '제출';
      submit.disabled = true;
      optsWrap.parentNode.insertBefore(submit, optsWrap.nextSibling);
      var picked = [];
      opts.forEach(function (btn, i) {
        btn.addEventListener('click', function () {
          if (q.classList.contains('answered')) return;
          var k = picked.indexOf(i);
          if (k === -1) picked.push(i); else picked.splice(k, 1);
          btn.classList.toggle('picked', k === -1);
          submit.disabled = picked.length === 0;
        });
      });
      submit.addEventListener('click', function () {
        if (q.classList.contains('answered')) return;
        submit.disabled = true;
        grade(picked.slice());
      });
    });
    renderScore();

    Array.prototype.forEach.call(document.querySelectorAll('.recall [data-reveal]'), function (btn) {
      btn.addEventListener('click', function () {
        btn.closest('.recall').classList.add('revealed');
        btn.textContent = '내 답과 비교해 보세요';
        btn.disabled = true;
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
