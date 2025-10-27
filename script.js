const speffz = "ABCDEFGHIJKLMNOPQRSTUVWX".split("");

window.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("letterSelection");
  speffz.forEach(letter => {
    const label = document.createElement("label");
    label.style.display = "flex";
    label.style.alignItems = "center";
    label.innerHTML = `
      <input type="checkbox" class="letterBox" value="${letter}" checked>
      ${letter}
    `;
    container.appendChild(label);
  });
});

function getSelectedLetters() {
  const selected = [];
  document.querySelectorAll(".letterBox").forEach(cb => {
    if (cb.checked) selected.push(cb.value);
  });
  return selected;
}

function selectAllLetters(selectAll) {
  document.querySelectorAll(".letterBox").forEach(cb => cb.checked = selectAll);
}

let pairs = [];
let index = 0;
let timerInterval = null;
let startTime = null;
let finalMemoTime = 0;
let speedPairs = [];
let speedIndex = 0;
let speedTimer;

// DOM elements
const card = document.getElementById("card");
const nextBtn = document.getElementById("nextBtn");
const startBtn = document.getElementById("startBtn");
const recallArea = document.getElementById("recallArea");
const recallInput = document.getElementById("recallInput");
const result = document.getElementById("result");
const timer = document.getElementById("timer");
const checkBtn = document.querySelector("button[onclick='checkRecall()']");
const speedDisplay = document.getElementById("speedDisplay");

// Utilities
function getRandomPair(noDouble) {
  let a, b;
  do {
    a = speffz[Math.floor(Math.random() * speffz.length)];
    b = speffz[Math.floor(Math.random() * speffz.length)];
  } while (noDouble && a === b);
  return a + b;
}

function generatePairs(count, noDouble = false, parity = false) {
  const used = new Set();
  const result = [];

  while (result.length < count) {
    const pair = getRandomPair(noDouble);
    if (!used.has(pair)) {
      result.push(pair);
      used.add(pair);
    }
  }

  if (parity) {
    const last = speffz[Math.floor(Math.random() * speffz.length)];
    result.push(last);
  }

  return result;
}

function startTimer(show) {
  startTime = Date.now();
  if (!show) {
    timer.style.display = "none";
    return;
  }
  timer.style.display = "block";
  timer.textContent = "🕒 Time: 0s";
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    timer.textContent = `🕒 Time: ${elapsed}s`;
  }, 500);
}

function stopTimer() {
  clearInterval(timerInterval);
  finalMemoTime = Math.floor((Date.now() - startTime) / 1000);
}

// Main Trainer
startBtn.addEventListener("click", () => {
  const count = parseInt(document.getElementById("pairCount").value) || 10;
  const noDouble = document.getElementById("noDouble").checked;
  const parity = document.getElementById("parity").checked;
  const show = document.getElementById("showTimer").checked;

  pairs = generatePairs(count, noDouble, parity);

  index = 0;
  recallInput.value = "";
  result.innerHTML = "";
  recallArea.style.display = "none";
  nextBtn.style.display = "inline-block";
  startBtn.style.display = "none";
  card.textContent = pairs[index];
  startTimer(show);
});

nextBtn.addEventListener("click", () => {
  index++;
  if (index < pairs.length) {
    card.textContent = pairs[index];
  } else {
    card.textContent = "Recall!";
    nextBtn.style.display = "none";
    recallArea.style.display = "block";
    stopTimer();
  }
});

// Recall checking
function checkRecall() {
  const userInput = recallInput.value.trim().toUpperCase().split(/\s+/);
  const feedback = [];
  const correctPairs = [...pairs];

  let correctInPlace = 0;

  for (let i = 0; i < userInput.length; i++) {
    const userPair = userInput[i];
    const correctPair = pairs[i];

    if (userPair === correctPair) {
      feedback.push(`<span style="color:green;">${userPair}</span>`);
      correctInPlace++;
    } else if (correctPairs.includes(userPair)) {
      feedback.push(`<span style="color:orange;">${userPair}</span>`);
    } else {
      feedback.push(`<span style="color:red;">${userPair}</span>`);
    }
  }

  const accuracy = `✅ ${correctInPlace} / ${pairs.length} correct in place`;
  const time = `🕒 Memo Time: ${finalMemoTime}s`;
  const solution = `💡 Solution: ${pairs.join(" ")}`;
  const colorGuide = `<small><br><span style="color:green;">Green</span>: correct spot, <span style="color:orange;">Orange</span>: wrong spot, <span style="color:red;">Red</span>: not found</small>`;

  result.innerHTML = `${feedback.join(" ")}<br>${accuracy}<br>${time}<br>${solution}${colorGuide}`;
  startBtn.style.display = "inline-block";
}

// Speed Drill Mode
function startSpeedDrill() {
  const count = parseInt(document.getElementById("speedCount").value);
  const interval = parseInt(document.getElementById("speedInterval").value);
  const noDouble = document.getElementById("speedNoDouble").checked;
  const parity = document.getElementById("speedParity").checked;

  speedPairs = generatePairs(count, noDouble, parity);
  speedIndex = 0;
  recallInput.value = "";
  result.innerHTML = "";
  document.getElementById("speedCard").innerText = ""

  showNextSpeedCard(interval);
}

function checkSpeedRecall() {
  const input = document.getElementById("speedRecallInput").value.trim().toUpperCase().split(/\s+/);
  const resultBox = document.getElementById("speedResult");
  let correct = 0;
  const feedback = [];

  for (let i = 0; i < input.length; i++) {
    const guess = input[i];
    const correctPair = speedPairs[i];

    if (guess === correctPair) {
      feedback.push(`<span style="color:green;">${guess}</span>`);
      correct++;
    } else if (speedPairs.includes(guess)) {
      feedback.push(`<span style="color:orange;">${guess}</span>`);
    } else {
      feedback.push(`<span style="color:red;">${guess}</span>`);
    }
  }

  const final = `✅ ${correct} / ${speedPairs.length} correct<br>💡 Solution: ${speedPairs.join(" ")}`;
  resultBox.innerHTML = `${feedback.join(" ")}<br><br>${final}`;
}

function showNextSpeedCard(interval) {
  const box = document.getElementById("speedCard");

  if (speedIndex >= speedPairs.length) {
    box.innerText = "Recall!";
    document.getElementById("speedRecallArea").style.display = "block";
    document.getElementById("speedRecallInput").focus();
    pairs = speedPairs; // optional: reuse for common grading
    return;
  }

  box.innerText = speedPairs[speedIndex];
  speedIndex++;

  setTimeout(() => {
    box.innerText = " "; // keep box stable
    setTimeout(() => showNextSpeedCard(interval), 300);
  }, interval);
}
