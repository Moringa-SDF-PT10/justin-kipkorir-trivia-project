const startBtn = document.getElementById('start-btn');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');
const questionContainer = document.getElementById('question-container');
const questionEl = document.getElementById('question');
const answersEl = document.getElementById('answers');
const scoreEl = document.getElementById('score');
const scoreContainer = document.getElementById('score-container');
const summaryContainer = document.getElementById('summary-container');
const summaryList = document.getElementById('summary-list');

let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let incorrectAnswers = [];

startBtn.addEventListener('click', startGame);
nextBtn.addEventListener('click', () => {
  currentQuestionIndex++;
  showQuestion();
});
restartBtn.addEventListener('click', startGame);

function startGame() {
  score = 0;
  scoreEl.textContent = score;
  currentQuestionIndex = 0;
  incorrectAnswers = [];

  startBtn.classList.add('hide');
  restartBtn.classList.add('hide');
  questionContainer.classList.remove('hide');
  scoreContainer.classList.remove('hide');
  summaryContainer.classList.add('hide');
  summaryList.innerHTML = '';

  fetchQuestions();
}

function fetchQuestions() {
  fetch('https://opentdb.com/api.php?amount=5&type=multiple')
    .then(res => res.json())
    .then(data => {
      questions = data.results;
      showQuestion();
    });
}

function showQuestion() {
  resetState();

  if (currentQuestionIndex >= questions.length) {
    questionEl.textContent = `Game Over! Final Score: ${score}`;
    nextBtn.classList.add('hide');
    restartBtn.classList.remove('hide');
    showSummary();
    return;
  }

  const currentQuestion = questions[currentQuestionIndex];
  questionEl.innerHTML = decodeHTML(currentQuestion.question);

  const answers = [...currentQuestion.incorrect_answers, currentQuestion.correct_answer];
  shuffleArray(answers);

  const labels = ['A', 'B', 'C', 'D'];

  answers.forEach((answer, index) => {
    const button = document.createElement('button');
    button.textContent = `${labels[index]}. ${decodeHTML(answer)}`;
    button.classList.add('btn');
    button.addEventListener('click', () => selectAnswer(answer, currentQuestion.correct_answer, currentQuestion));
    answersEl.appendChild(button);
  });
}

function selectAnswer(selected, correct, questionObj) {
  const isCorrect = selected === correct;
  if (isCorrect) {
    score++;
    scoreEl.textContent = score;
  } else {
    // Save incorrect answers for review at the end
    incorrectAnswers.push({
      question: decodeHTML(questionObj.question),
      yourAnswer: decodeHTML(selected),
      correctAnswer: decodeHTML(correct),
    });
  }

  Array.from(answersEl.children).forEach(button => {
    const buttonAnswer = button.textContent.slice(3); // remove "A. "
    if (buttonAnswer === decodeHTML(correct)) {
      button.style.backgroundColor = '#4CAF50'; // green
    } else {
      button.style.backgroundColor = '#f44336'; // red
    }
    button.disabled = true;
  });

  nextBtn.classList.remove('hide');
}

function showSummary() {
  summaryContainer.classList.remove('hide');
  summaryList.innerHTML = '';

  if (incorrectAnswers.length === 0) {
    summaryList.innerHTML = '<li>You answered all questions correctly, Bravo!</li>';
    return;
  }

  incorrectAnswers.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>Question:</strong> ${item.question}<br>
      <span style="color: red;"><strong>Your answer:</strong> ${item.yourAnswer}</span><br>
      <span style="color: green;"><strong>Correct answer:</strong> ${item.correctAnswer}</span>
    `;
    summaryList.appendChild(li);
  });
}

function resetState() {
  nextBtn.classList.add('hide');
  answersEl.innerHTML = '';
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function decodeHTML(html) {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}
