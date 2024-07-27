// Load the Google Fonts link dynamically
const link = document.createElement('link');
link.href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap';
link.rel = 'stylesheet';
document.head.appendChild(link);

// Add the HTML structure and CSS at the beginning of the file
const divContainer = document.createElement('div');
divContainer.style.cssText = `
  position: fixed;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  bottom: 50px;
  right: 20px;
  width: 200px; /* Smaller width for initial display */
  height: 75px;  /* Smaller height for initial display */
  z-index: 10000;
  background-color: gray;
  backdrop-filter: blur(50px);
  opacity: 50%;
  color: black;
  padding: 10px;
  border: 1px solid black;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  cursor: move;
  transition: height 0.3s ease, width 0.3s ease; /* Smooth transition for resizing */
  overflow: hidden; /* Ensure no content overflows */
`;

divContainer.innerHTML = `
  <div id="timer-content" style="display: flex; flex-direction: column; align-items: center; width: 100%; height: 100%;">
    <div id="timer-display" style="font-size: 20px; opacity:100% ; font-weight: bolder; font-family: 'Orbitron', sans-serif;">00:00:00</div>
    <div id="controls" style="display: none; flex-direction: column; align-items: center; margin-top: 10px; width: 100%;">
      <button id="set-timer-btn" style="background-color: black; color: white; font-size: 14px; font-weight: 400; padding: 5px; margin: 5px; width: 100px; height: 30px; border: none; border-radius: 3px;">Set Timer</button>
      <button id="reset-timer-btn" style="background-color: black; color: white; font-size: 14px; font-weight: 400; padding: 5px; margin: 5px; width: 100px; height: 30px; border: none; border-radius: 3px;">Reset Timer</button>
    </div>
    <div id="toggle-arrow" style="position: absolute; bottom: 5px; cursor: pointer;">&#9660;</div> <!-- Arrow icon -->
  </div>
`;

// Append the div to the document body
document.body.appendChild(divContainer);

// Add the JavaScript to handle toggling
document.getElementById('toggle-arrow').addEventListener('click', () => {
  const controls = document.getElementById('controls');
  const toggleArrow = document.getElementById('toggle-arrow');

  if (controls.style.display === 'none') {
    controls.style.display = 'flex';
    divContainer.style.width = '250px';  // Expand width for the controls
    divContainer.style.height = '150px'; // Expand height for the controls
    toggleArrow.innerHTML = '&#9650;';  // Change arrow to point up
  } else {
    controls.style.display = 'none';
    divContainer.style.width = '200px';  // Collapse width back to initial
    divContainer.style.height = '75px';  // Collapse height back to initial
    toggleArrow.innerHTML = '&#9660;';  // Change arrow to point down
  }
});

// Existing code for timer functionality
let hours = 0;
let minutes = 0;
let seconds = 0;
let timer_str;
let userTimeInput = "10:00:00"; // Initialize userTimeInput to a default value
let currentUrl = window.location.hostname;

chrome.storage.local.get([currentUrl, `${currentUrl}_date`], (result) => {
  const today = new Date().toDateString();

  if (result[currentUrl] && result[`${currentUrl}_date`] === today) {
    hours = result[currentUrl].hours;
    minutes = result[currentUrl].minutes;
    seconds = result[currentUrl].seconds;
  } else {
    // Reset the timer if the date has changed or no previous data is found
    hours = 0;
    minutes = 0;
    seconds = 0;
    chrome.storage.local.set({ [currentUrl]: { hours, minutes, seconds } });
    chrome.storage.local.set({ [`${currentUrl}_date`]: today });
  }
  startTimer(); // Start the timer initially
});

function updateTimer() {
  seconds++;
  if (seconds >= 60) {
    minutes++;
    seconds = 0;
  }
  if (minutes >= 60) {
    hours++;
    minutes = 0;
  }

  const hoursStr = hours.toString().padStart(2, '0');
  const minutesStr = minutes.toString().padStart(2, '0');
  const secondsStr = seconds.toString().padStart(2, '0');

  timer_str = `${hoursStr}:${minutesStr}:${secondsStr}`;
  document.getElementById('timer-display').innerHTML = `${timer_str}`;

  const today = new Date().toDateString();

  // Store the timer value and the current date for the current URL
  chrome.storage.local.set({
    [currentUrl]: {
      hours,
      minutes,
      seconds
    },
    [`${currentUrl}_date`]: today
  });

  // Check if the timer has reached or exceeded the user's set time
  if (compareTimes(timer_str, userTimeInput) >= 0) {
    alert("You have reached your set time limit on this website.");
  }
}

function compareTimes(time1, time2) {
  const [h1, m1, s1] = time1.split(':').map(Number);
  const [h2, m2, s2] = time2.split(':').map(Number);

  // Calculate the total seconds for each time
  const totalSeconds1 = h1 * 3600 + m1 * 60 + s1;
  const totalSeconds2 = h2 * 3600 + m2 * 60 + s2;
  return totalSeconds1 - totalSeconds2;
}

let timerInterval;

function startTimer() {
  timerInterval = setInterval(updateTimer, 1000);
}

function pauseTimer() {
  clearInterval(timerInterval);
}

document.getElementById('set-timer-btn').addEventListener('click', () => {
  // Prompt the user to enter a time
  userTimeInput = prompt('Enter a time (HH:MM:SS):');
});

document.getElementById('reset-timer-btn').addEventListener('click', () => {
  // Reset the timer to 0:00:00
  hours = 0;
  minutes = 0;
  seconds = 0;
  userTimeInput = "10:00:00";
  chrome.storage.local.set({
    [currentUrl]: {
      hours,
      minutes,
      seconds
    }
  });
});

// Add drag-and-drop functionality
divContainer.onmousedown = function (event) {
  // Get the initial mouse position
  let shiftX = event.clientX - divContainer.getBoundingClientRect().left;
  let shiftY = event.clientY - divContainer.getBoundingClientRect().top;

  // Move the div at the mouse pointer
  function moveAt(pageX, pageY) {
    divContainer.style.left = pageX - shiftX + 'px';
    divContainer.style.top = pageY - shiftY + 'px';
  }

  // Move the div on mousemove
  function onMouseMove(event) {
    moveAt(event.pageX, event.pageY);
  }

  // Attach the mousemove listener to the document
  document.addEventListener('mousemove', onMouseMove);

  // Detach the mousemove listener on mouseup
  divContainer.onmouseup = function () {
    document.removeEventListener('mousemove', onMouseMove);
    divContainer.onmouseup = null;
  };
};

divContainer.ondragstart = function () {
  return false;
};

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url.includes(currentUrl)) {
    startTimer();
  }
});

// Listen for tab activation
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.url.includes(currentUrl)) {
      startTimer();
    } else {
      pauseTimer();
    }
  });
});

// Listen for tab deactivation
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading' && !tab.url.includes(currentUrl)) {
    pauseTimer();
  }
});
