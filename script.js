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
  return Array.from(document.querySelectorAll(".letterBox"))
    .filter(cb => cb.checked)
    .map(cb => cb.value);
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

const elements = {
  card: document.getElementById("card"),
  nextBtn: document.getElementById("nextBtn"),
  startBtn: document.getElementById("startBtn"),
  recallArea: document.getElementById("recallArea"),
  recallInput: document.getElementById("recallInput"),
  result: document.getElementById("result"),
  timer: document.getElementById("timer"),
  speedDisplay: document.getElementById("speedDisplay"),
  speedCard: document.getElementById("speedCard"),
  speedRecallArea: document.getElementById("speedRecallArea"),
  speedRecallInput: document.getElementById("speedRecallInput"),
  speedResult: document.getElementById("speedResult")
};

function getRandomPair(noDouble) {
  const available = getSelectedLetters();
  if (available.length === 0) {
    alert("Please select at least one letter to train with!");
    return "--";
  }

  let a, b;
  do {
    a = available[Math.floor(Math.random() * available.length)];
    b = available[Math.floor(Math.random() * available.length)];
  } while (noDouble && a === b);
  
  return a + b;
}

function generatePairs(count, noDouble = false, parity = false) {
  const available = getSelectedLetters();
  if (available.length === 0) {
    alert("Please select at least one letter to train with!");
    return [];
  }

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
    elements.timer.style.display = "none";
    return;
  }
  
  elements.timer.style.display = "block";
  elements.timer.textContent = "🕒 Time: 0s";
  
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    elements.timer.textContent = `🕒 Time: ${elapsed}s`;
  }, 500);
}

function stopTimer() {
  clearInterval(timerInterval);
  finalMemoTime = Math.floor((Date.now() - startTime) / 1000);
}

elements.startBtn.addEventListener("click", () => {
  const count = parseInt(document.getElementById("pairCount").value) || 10;
  const noDouble = document.getElementById("noDouble").checked;
  const parity = document.getElementById("parity").checked;
  const show = document.getElementById("showTimer").checked;

  pairs = generatePairs(count, noDouble, parity);
  index = 0;
  
  elements.recallInput.value = "";
  elements.result.innerHTML = "";
  elements.recallArea.style.display = "none";
  elements.nextBtn.style.display = "inline-block";
  elements.startBtn.style.display = "none";
  elements.card.textContent = pairs[index];
  
  startTimer(show);
});

elements.nextBtn.addEventListener("click", () => {
  index++;
  
  if (index < pairs.length) {
    elements.card.textContent = pairs[index];
  } else {
    elements.card.textContent = "Recall!";
    elements.nextBtn.style.display = "none";
    elements.recallArea.style.display = "block";
    stopTimer();
  }
});

function checkRecall() {
  const userInput = elements.recallInput.value.trim().toUpperCase().split(/\s+/);
  const feedback = [];
  let correctInPlace = 0;

  for (let i = 0; i < userInput.length; i++) {
    const userPair = userInput[i];
    const correctPair = pairs[i];

    if (userPair === correctPair) {
      feedback.push(`<span style="color:green;">${userPair}</span>`);
      correctInPlace++;
    } else if (pairs.includes(userPair)) {
      feedback.push(`<span style="color:orange;">${userPair}</span>`);
    } else {
      feedback.push(`<span style="color:red;">${userPair}</span>`);
    }
  }

  const accuracy = `✅ ${correctInPlace} / ${pairs.length} correct in place`;
  const time = `🕒 Memo Time: ${finalMemoTime}s`;
  const solution = `💡 Solution: ${pairs.join(" ")}`;
  const colorGuide = `<small><br><span style="color:green;">Green</span>: correct spot, <span style="color:orange;">Orange</span>: wrong spot, <span style="color:red;">Red</span>: not found</small>`;

  elements.result.innerHTML = `${feedback.join(" ")}<br>${accuracy}<br>${time}<br>${solution}${colorGuide}`;
  elements.startBtn.style.display = "inline-block";
}

function startSpeedDrill() {
  const count = parseInt(document.getElementById("speedCount").value);
  const interval = parseInt(document.getElementById("speedInterval").value);
  const noDouble = document.getElementById("speedNoDouble").checked;
  const parity = document.getElementById("speedParity").checked;

  speedPairs = generatePairs(count, noDouble, parity);
  speedIndex = 0;
  
  elements.recallInput.value = "";
  elements.result.innerHTML = "";
  elements.speedCard.innerText = "";

  showNextSpeedCard(interval);
}

function checkSpeedRecall() {
  const input = elements.speedRecallInput.value.trim().toUpperCase().split(/\s+/);
  const feedback = [];
  let correct = 0;

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
  elements.speedResult.innerHTML = `${feedback.join(" ")}<br><br>${final}`;
}

function showNextSpeedCard(interval) {
  if (speedIndex >= speedPairs.length) {
    elements.speedCard.innerText = "Recall!";
    elements.speedRecallArea.style.display = "block";
    elements.speedRecallInput.focus();
    pairs = speedPairs;
    return;
  }

  elements.speedCard.innerText = speedPairs[speedIndex];
  speedIndex++;

  setTimeout(() => {
    elements.speedCard.innerText = " ";
    setTimeout(() => showNextSpeedCard(interval), 300);
  }, interval);
}
