const Answer_Length = 5;
const Rounds = 6;
const letters = document.querySelectorAll(".scoreboard-letter");
const loadingDiv = document.querySelector(".info-bar");

async function init() {
  let currentRow = 0;
  let currentGuess = "";
  let done = false;
  let isLoading = true;

  const res = await fetch("https://words.dev-apis.com/word-of-the-day");
  const { word: wordRes } = await res.json();
  const word = wordRes.toUpperCase();
  const wordParts = word.split("");
  isLoading = false;
  setLoading(isLoading);

  function addLetter(letter) {
    if (currentGuess.length < Answer_Length) {
      currentGuess += letter;
    } else {
      current = currentGuess.substring(0, currentGuess - 1) + letter;
    }
    letters[currentRow * Answer_Length + currentGuess.length - 1].innerText =
      letter;
  }

  async function commit() {
    if (currentGuess.length !== Answer_Length) {
      //ничего не делать
      return;
    }
    // проверить апи, есть ли там чета
    isLoading = true;
    setLoading(isLoading);
    const res = await fetch("https://words.dev-apis.com/validate-word", {
      method: "POST",
      body: JSON.stringify({ word: currentGuess }),
    });
    const { validWord } = await res.json();
    isLoading = false;
    setLoading(isLoading);

    if (!validWord) {
      markInvalidWord();
      return;
    }

    const guessParts = currentGuess.split("");
    const map = makeMap(wordParts);
    let allRight = true;

    //correct first

    for (let i = 0; i < Answer_Length; i++) {
      if (guessParts[i] === wordParts[i]) {
        //if mark as correct
        letters[currentRow * Answer_Length + i].classList.add("correct");
        map[guessParts[i]]--;
      }
    }

    for (let i = 0; i < Answer_Length; i++) {
      if (guessParts[i] === wordParts[i]) {
        //no
      } else if (map[guessParts[i]] && map[guessParts[i]] > 0) {
        //mark close
        allRight = false;
        letters[currentRow * Answer_Length + i].classList.add("close");
        map[guessParts[i]]--;
      } else {
        allRight = false;
        letters[currentRow * Answer_Length + i].classList.add("wrong");
      }
    }

    currentRow++;
    currentGuess = "";
    if (allRight) {
      alert("You WIN");
      document.querySelector(".brand").classList.add("winner");
      done = true;
    } else if (currentRow === Rounds) {
      alert("You LOSE, correct word was ${word}");
      done = true;
    }
  }

  function backspace() {
    currentGuess = currentGuess.substring(0, currentGuess.length - 1);
    letters[currentRow * Answer_Length + currentGuess.length].innerHTML = "";
  }

  function markInvalidWord() {
    for (let i = 0; i < Answer_Length; i++) {
      letters[currentRow * Answer_Length + i].classList.remove("invalid");
      setTimeout(
        () => letters[currentRow * Answer_Length + i].classList.add("invalid"),
        10
      );
    }
  }

  document.addEventListener("keydown", (event) => {
    if (done || isLoading) {
      return;
    }

    const action = event.key;

    if (action === "Enter") {
      commit();
    } else if (action === "Backspace") {
      backspace();
    } else if (isLetter(action)) {
      addLetter(action.toLocaleUpperCase());
    } else {
      //no
    }
  });
}

function isLetter(letter) {
  return /^[a-zA-Z]$/.test(letter);
}

function setLoading(isLoading) {
  loadingDiv.classList.toggle("hidden", !isLoading);
}

function makeMap(array) {
  const obj = {};
  for (let i = 0; i < array.length; i++) {
    if (obj[array[i]]) {
      obj[array[i]]++;
    } else {
      obj[array[i]] = 1;
    }
  }
  return obj;
}

init();
