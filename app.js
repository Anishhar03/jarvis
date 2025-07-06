// Enhanced JARVIS Voice Assistant

// vars and elements
const turn_on = document.querySelector("#turn_on");
const jarvis_intro = document.querySelector("#j_intro");
const time = document.querySelector("#time");
const machine = document.querySelector(".machine");
// const msgs = document.querySelector(".messages");
// whether the recognition is stopiing on my command or automatically
let stopingR = false;
// friday's commands
let fridayComs = [];
fridayComs.push("hi friday");
fridayComs.push("what are your commands");
fridayComs.push("close this - to close opened popups");
fridayComs.push(
  "change my information - information regarding your accounts and you"
);
fridayComs.push("what's the weather or temperature");
fridayComs.push("show the full weather report");
fridayComs.push("are you there - to check fridays presence");
fridayComs.push("shut down - stop voice recognition");
fridayComs.push("open google");
fridayComs.push('search for "your keywords" - to search on google');
fridayComs.push("open whatsapp");
fridayComs.push("open youtube");
fridayComs.push('play "your keywords" - to search on youtube');
fridayComs.push("close this youtube tab - to close opened youtube tab");
fridayComs.push("open firebase");
fridayComs.push("open netlify");
fridayComs.push("open twitter");
fridayComs.push("open my twitter profile");
fridayComs.push("open instagram");
fridayComs.push("open my instagram profile");
fridayComs.push("open github");
fridayComs.push("open my github profile");
fridayComs.push("switch to hindi - change language to Hindi");
fridayComs.push("switch to english - change language to English");
fridayComs.push("top headlines - get today's top news");
fridayComs.push("news regarding [topic] - get news about specific topic");
fridayComs.push("tell me a joke - hear a random joke");
fridayComs.push("set a reminder - set a reminder with time and message");
fridayComs.push("what can you do - list all capabilities");

// youtube window
let ytbWindow;

// show a warn to check for all the commands
console.warn('*to check for the commands speak "what are your commands"');

// date and time
let date = new Date();
let hrs = date.getHours();
let mins = date.getMinutes();
let secs = date.getSeconds();

// this is what friday tells about weather
let weatherStatement = "";
let charge, chargeStatus, connectivity, currentTime;
chargeStatus = "unplugged";

// News API key - in a real project, this should be secured
const NEWS_API_KEY = "b0712dc2e5814a1bb531e6f096b3d7d3";

// Reminders array
let reminders = [];

window.onload = () => {
  turn_on.addEventListener("ended", () => {
    setTimeout(() => {
      readOut("Ready to go sir");
      if (localStorage.getItem("jarvis_setup") === null) {
        readOut(
          "Sir, kindly fill out the form on your screen so that you could access most of my features and if you want to see my commands see a warning in the console"
        );
      }
    }, 200);
  });

  fridayComs.forEach((e) => {
    document.querySelector(".commands").innerHTML += `<p>#${e}</p><br />`;
  });
  
  // Initialize battery status
  initBattery();
  
  // Initialize internet connectivity
  initConnectivity();
  
  // Initialize time display
  updateTime();
  setInterval(updateTime, 60000);
  
  // Load reminders from localStorage
  loadReminders();
  
  // Check for scheduled reminders
  setInterval(checkReminders, 60000);
};

// Initialize battery monitoring
function initBattery() {
  let batteryPromise = navigator.getBattery();
  batteryPromise.then(batteryCallback);
  
  function batteryCallback(batteryObject) {
    printBatteryStatus(batteryObject);
    batteryObject.addEventListener("chargingchange", () => {
      printBatteryStatus(batteryObject);
    });
    batteryObject.addEventListener("levelchange", () => {
      printBatteryStatus(batteryObject);
    });
  }
  
  function printBatteryStatus(batteryObject) {
    charge = (batteryObject.level * 100).toFixed(2);
    document.querySelector("#battery").textContent = `${charge}%`;
    
    if (batteryObject.charging === true) {
      document.querySelector(".battery").style.width = "200px";
      document.querySelector("#battery").textContent = `${charge}% Charging`;
      chargeStatus = "plugged in";
      
      // Notify when fully charged
      if (batteryObject.level >= 0.98) {
        readOut("Sir, your device is fully charged");
      }
    } else {
      chargeStatus = "unplugged";
      
      // Low battery warning
      if (batteryObject.level <= 0.2) {
        readOut("Sir, your battery is running low. Please connect the charger");
      }
    }
  }
}

// Initialize internet connectivity monitoring
function initConnectivity() {
  const updateConnectivity = () => {
    if (navigator.onLine) {
      document.querySelector("#internet").textContent = "online";
      connectivity = "online";
    } else {
      document.querySelector("#internet").textContent = "offline";
      connectivity = "offline";
      readOut("Sir, you are currently offline");
    }
  };
  
  updateConnectivity();
  window.addEventListener("online", updateConnectivity);
  window.addEventListener("offline", updateConnectivity);
}

// Update time display
function updateTime() {
  const date = new Date();
  const options = { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  };
  currentTime = date.toLocaleTimeString('en-US', options);
  time.textContent = currentTime;
}

// Enhanced weather functionality
function weather(location) {
  const weatherCont = document.querySelector(".temp").querySelectorAll("*");

  let url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=48ddfe8c9cf29f95b7d0e54d6e171008&units=metric`;
  
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error("Weather data not found");
      }
      return response.json();
    })
    .then(data => {
      weatherCont[0].textContent = `Location: ${data.name}`;
      weatherCont[1].textContent = `Country: ${data.sys.country}`;
      weatherCont[2].textContent = `Weather: ${data.weather[0].main}`;
      weatherCont[3].textContent = `Description: ${data.weather[0].description}`;
      weatherCont[4].src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
      weatherCont[5].textContent = `Temperature: ${data.main.temp}°C`;
      weatherCont[6].textContent = `Feels like: ${data.main.feels_like}°C`;
      weatherCont[7].textContent = `Min: ${data.main.temp_min}°C`;
      weatherCont[8].textContent = `Max: ${data.main.temp_max}°C`;
      
      weatherStatement = `Sir, the weather in ${data.name} is ${data.weather[0].description} with a temperature of ${data.main.temp} degrees Celsius. It feels like ${data.main.feels_like} degrees.`;
      
      // Add weather alerts
      if (data.weather[0].main === "Rain") {
        readOut("Sir, it's going to rain today. You might want to carry an umbrella.");
      } else if (data.main.temp > 30) {
        readOut("Sir, it's quite hot today. Stay hydrated.");
      } else if (data.main.temp < 10) {
        readOut("Sir, it's quite cold today. You might want to wear something warm.");
      }
    })
    .catch(error => {
      weatherCont[0].textContent = "Weather Info Not Found";
      console.error("Weather API error:", error);
      readOut("Sir, I couldn't fetch the weather information. Please check your internet connection or try again later.");
    });
}

// friday information setup
const setup = document.querySelector(".jarvis_setup");
setup.style.display = "none";
if (localStorage.getItem("jarvis_setup") === null) {
  setup.style.display = "flex";
  setup.querySelector("button").addEventListener("click", userInfo);
}

function userInfo() {
  let setupInfo = {
    name: setup.querySelectorAll("input")[0].value,
    bio: setup.querySelectorAll("input")[1].value,
    location: setup.querySelectorAll("input")[2].value,
    instagram: setup.querySelectorAll("input")[3].value,
    twitter: setup.querySelectorAll("input")[4].value,
    github: setup.querySelectorAll("input")[5].value,
  };

  let testArr = [];

  setup.querySelectorAll("input").forEach((e) => {
    testArr.push(e.value);
  });

  if (testArr.includes("")) {
    readOut("sir enter your complete information");
  } else {
    localStorage.clear();
    localStorage.setItem("jarvis_setup", JSON.stringify(setupInfo));
    setup.style.display = "none";
    weather(JSON.parse(localStorage.getItem("jarvis_setup")).location);
    readOut("Thank you sir. Your information has been saved successfully.");
  }
}

// speech recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.lang = localStorage.getItem("lang") || "en-US";

recognition.onstart = function () {
  console.log("voice recognition activated");
  document.querySelector("#stop_jarvis_btn").style.display = "flex";
};

// array of opened windows
let windowsB = [];

recognition.onresult = function (event) {
  let current = event.resultIndex;
  let transcript = event.results[current][0].transcript;
  transcript = transcript.toLowerCase();
  let userData = localStorage.getItem("jarvis_setup");
  console.log(transcript);
  
  // Process commands based on language
  if (localStorage.getItem("lang") === "en-US") {
    processEnglishCommands(transcript, userData);
  } else if (localStorage.getItem("lang") === "hi-IN") {
    processHindiCommands(transcript);
  }
};

function processEnglishCommands(transcript, userData) {
  // Greetings
  if (transcript.includes("hi jarvis") || transcript.includes("hello jarvis")) {
    readOut("Hello sir, how can I assist you today?");
  }
  
  // System status commands
  if (transcript.includes("what's the current charge") || transcript.includes("battery status")) {
    readOut(`The current charge is ${charge} percent and the device is ${chargeStatus}`);
  }
  
  if (transcript.includes("what's the charging status")) {
    readOut(`The device is currently ${chargeStatus}`);
  }
  
  if (transcript.includes("current time") || transcript.includes("what time is it")) {
    readOut(`The current time is ${currentTime}`);
  }
  
  if (transcript.includes("connection status") || transcript.includes("internet status")) {
    readOut(`You are currently ${connectivity}`);
  }
  
  // Command list
  if (transcript.includes("what are your commands") || transcript.includes("what can you do")) {
    readOut("Sir, here's the list of commands I can follow. You can also ask me 'what can you do' for a summary.");
    if (window.innerWidth <= 400) {
      window.resizeTo(screen.width, screen.height);
    }
    document.querySelector(".commands").style.display = "block";
  }
  
  // Self introduction
  if (transcript.includes("tell about yourself") || transcript.includes("who are you")) {
    readOut(
      "Sir, I am JARVIS, an advanced voice assistant designed for browsers using modern web technologies. " +
      "I can perform various tasks including web searches, opening applications, providing weather updates, " +
      "reading news headlines, setting reminders, and much more. How may I assist you today?"
    );
  }
  
  // Close popups
  if (transcript.includes("close this")) {
    readOut("Closing the tab sir");
    document.querySelector(".commands").style.display = "none";
    if (window.innerWidth >= 401) {
      window.resizeTo(250, 250);
    }
    setup.style.display = "none";
  }
  
  // User information management
  if (transcript.includes("change my information") || transcript.includes("update my profile")) {
    readOut("Opening the information tab sir");
    localStorage.clear();
    
    if (window.innerWidth <= 400) {
      window.resizeTo(screen.width, screen.height);
    }
    setup.style.display = "flex";
    setup.querySelector("button").addEventListener("click", userInfo);
  }
  
  // Weather queries
  if (transcript.includes("what's the temperature") || transcript.includes("how's the weather")) {
    if (weatherStatement) {
      readOut(weatherStatement);
    } else {
      readOut("Sir, I don't have weather information yet. Please set your location first.");
    }
  }
  
  if (transcript.includes("full weather report")) {
    if (localStorage.getItem("jarvis_setup")) {
      readOut("Opening the weather report sir");
      let a = window.open(
        `https://www.google.com/search?q=weather+in+${
          JSON.parse(localStorage.getItem("jarvis_setup")).location
        }`
      );
      windowsB.push(a);
    } else {
      readOut("Sir, I need your location information first to show weather details.");
    }
  }
  
  // Availability check
  if (transcript.includes("are you there") || transcript.includes("jarvis you there")) {
    readOut("Yes sir, I'm here and ready to assist you");
  }
  
  // Shutdown command
  if (transcript.includes("shut down") || transcript.includes("go to sleep")) {
    readOut("Okay sir, I'm going to sleep now. Just say 'hi jarvis' when you need me.");
    stopingR = true;
    recognition.stop();
  }
  
  // Language switching
  if (transcript.includes("switch to hindi")) {
    readOut("Switching to Hindi language");
    localStorage.setItem("lang", "hi-IN");
    stopingR = true;
    recognition.stop();
    location.reload();
  }
  
  // Application opening commands
  const appCommands = {
    "open whatsapp": "https://web.whatsapp.com/",
    "open netlify": "https://app.netlify.com/",
    "open spotify": "https://open.spotify.com/",
    "open google": "https://www.google.com/",
    "open youtube": "https://www.youtube.com/",
    "open instagram": "https://www.instagram.com",
    "open twitter": "https://twitter.com/",
    "open github": "https://github.com/",
    "open calendar": "https://calendar.google.com/",
    "open firebase": "https://console.firebase.google.com/"
  };
  
  for (const [command, url] of Object.entries(appCommands)) {
    if (transcript.includes(command)) {
      readOut(`Opening ${command.split(' ')[1]} sir`);
      let a = window.open(url);
      windowsB.push(a);
      break;
    }
  }
  
  // Special case for firebase with account number
  if (transcript.includes("open fire base") && transcript.includes("account")) {
    readOut("Opening firebase console");
    let accId = transcript.split("").pop();
    let a = window.open(`https://console.firebase.google.com/u/${accId}/`);
    windowsB.push(a);
  }
  
  // Search functionality
  if (transcript.includes("search for")) {
    let query = transcript.replace("search for", "").trim();
    if (query) {
      readOut(`Searching for ${query}`);
      let searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      let a = window.open(searchUrl);
      windowsB.push(a);
    } else {
      readOut("Sir, what would you like me to search for?");
    }
  }
  
  // YouTube search
  if (transcript.includes("play")) {
    let query = transcript.replace("play", "").trim();
    if (query) {
      readOut(`Searching YouTube for ${query}`);
      let searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
      let a = window.open(searchUrl);
      windowsB.push(a);
    } else {
      readOut("Sir, what would you like me to play on YouTube?");
    }
  }
  
  // Social media profiles
  if (transcript.includes("open my instagram profile")) {
    if (userData && JSON.parse(userData).instagram) {
      readOut("Opening your Instagram profile");
      let a = window.open(`https://www.instagram.com/${JSON.parse(userData).instagram}/`);
      windowsB.push(a);
    } else {
      readOut("Sir, I don't have your Instagram information. Please update your profile first.");
    }
  }
  
  if (transcript.includes("open my twitter profile")) {
    if (userData && JSON.parse(userData).twitter) {
      readOut("Opening your Twitter profile");
      let a = window.open(`https://twitter.com/${JSON.parse(userData).twitter}`);
      windowsB.push(a);
    } else {
      readOut("Sir, I don't have your Twitter information. Please update your profile first.");
    }
  }
  
  if (transcript.includes("open my github profile")) {
    if (userData && JSON.parse(userData).github) {
      readOut("Opening your GitHub profile");
      let a = window.open(`https://github.com/${JSON.parse(userData).github}`);
      windowsB.push(a);
    } else {
      readOut("Sir, I don't have your GitHub information. Please update your profile first.");
    }
  }
  
  // Close all tabs
  if (transcript.includes("close all tabs")) {
    if (windowsB.length > 0) {
      readOut(`Closing all ${windowsB.length} opened tabs sir`);
      windowsB.forEach((e) => {
        try {
          e.close();
        } catch (err) {
          console.error("Error closing window:", err);
        }
      });
      windowsB = [];
    } else {
      readOut("Sir, there are no tabs to close");
    }
  }
  
  // News commands - Enhanced with error handling
  if (transcript.includes("top headlines") || transcript.includes("today's news")) {
    readOut("Fetching today's top headlines sir");
    getNews("top-headlines");
  }
  
  if (transcript.includes("news regarding")) {
    let topic = transcript.split("regarding")[1].trim();
    if (topic) {
      readOut(`Fetching news about ${topic}`);
      getNews("everything", topic);
    } else {
      readOut("Sir, what topic would you like news about?");
    }
  }
  
  // Jokes
  if (transcript.includes("tell me a joke") || transcript.includes("say something funny")) {
    tellJoke();
  }
  
  // Reminders
  if (transcript.includes("set a reminder")) {
    setReminder(transcript);
  }
  
  // List reminders
  if (transcript.includes("list reminders") || transcript.includes("show reminders")) {
    listReminders();
  }
}

function processHindiCommands(transcript) {
  if (transcript.includes("हैलो जार्विस") || transcript.includes("नमस्ते जार्विस")) {
    readOutHindi("हैलो सर, मैं आपकी क्या मदद कर सकता हूँ?");
  }
  
  if (transcript.includes("इंग्लिश में बदलो") || transcript.includes("अंग्रेजी में बोलो")) {
    readOutHindi("मैं अंग्रेजी में बदल रहा हूँ");
    localStorage.setItem("lang", "en-US");
    stopingR = true;
    recognition.stop();
    location.reload();
  }
  
  if (transcript.includes("समय बताओ") || transcript.includes("क्या टाइम हुआ है")) {
    readOutHindi(`सर, अभी समय है ${currentTime}`);
  }
  
  if (transcript.includes("बैटरी स्टेटस") || transcript.includes("बैटरी कितनी है")) {
    readOutHindi(`सर, बैटरी ${charge} प्रतिशत है और डिवाइस ${chargeStatus === "plugged in" ? "चार्ज हो रहा है" : "चार्ज नहीं हो रहा है"}`);
  }
  
  if (transcript.includes("इंटरनेट स्टेटस") || transcript.includes("नेट चल रहा है")) {
    readOutHindi(`सर, आप अभी ${connectivity === "online" ? "ऑनलाइन" : "ऑफलाइन"} हैं`);
  }
  
  if (transcript.includes("मौसम बताओ") && localStorage.getItem("jarvis_setup")) {
    readOutHindi(weatherStatement.replace("Sir", "सर"));
  }
}

recognition.onend = function () {
  if (stopingR === false) {
    setTimeout(() => {
      recognition.start();
    }, 500);
  } else if (stopingR === true) {
    recognition.stop();
    document.querySelector("#stop_jarvis_btn").style.display = "none";
  }
};

// Enhanced speech synthesis
function readOut(message) {
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
  }
  
  const speech = new SpeechSynthesisUtterance();
  speech.text = message;
  speech.volume = 1;
  speech.rate = 1;
  speech.pitch = 1;
  speech.lang = "en-US";
  
  // Try to find a pleasant voice
  const voices = speechSynthesis.getVoices();
  const preferredVoices = voices.filter(voice => 
    voice.name.includes("Google") || voice.name.includes("Microsoft") || voice.lang.includes("en-US")
  );
  
  if (preferredVoices.length > 0) {
    speech.voice = preferredVoices[0];
  }
  
  window.speechSynthesis.speak(speech);
  console.log("Speaking:", message);
}

function readOutHindi(message) {
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
  }
  
  const speech = new SpeechSynthesisUtterance();
  speech.text = message;
  speech.volume = 1;
  speech.rate = 0.9;
  speech.pitch = 1;
  speech.lang = "hi-IN";
  
  const voices = speechSynthesis.getVoices();
  const hindiVoices = voices.filter(voice => voice.lang.includes("hi"));
  
  if (hindiVoices.length > 0) {
    speech.voice = hindiVoices[0];
  }
  
  window.speechSynthesis.speak(speech);
  console.log("Speaking (Hindi):", message);
}

// Load voices when they become available
speechSynthesis.onvoiceschanged = function() {
  console.log("Voices loaded");
};

// Enhanced news functionality
async function getNews(type = "top-headlines", query = "") {
  try {
    let url;
    
    if (type === "top-headlines") {
      url = `https://newsapi.org/v2/top-headlines?country=in&apiKey=${NEWS_API_KEY}`;
    } else {
      url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=popularity&apiKey=${NEWS_API_KEY}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`News API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.articles && data.articles.length > 0) {
      let newsItems = data.articles.slice(0, 5); // Limit to 5 news items
      let newsText = type === "top-headlines" ? 
        "Here are today's top headlines sir: " : 
        `Here are some news about ${query} sir: `;
      
      newsItems.forEach((item, index) => {
        newsText += ` ${index + 1}. ${item.title}. `;
      });
      
      readOut(newsText);
      
      // Show news in UI if needed
      displayNewsInUI(newsItems);
    } else {
      readOut("Sir, I couldn't find any news on that topic.");
    }
  } catch (error) {
    console.error("News fetch error:", error);
    readOut("Sir, I'm having trouble fetching the news right now. Please try again later.");
  }
}

function displayNewsInUI(newsItems) {
  const newsContainer = document.querySelector(".news-container");
  if (!newsContainer) return;
  
  newsContainer.innerHTML = "";
  newsItems.forEach(item => {
    const newsItem = document.createElement("div");
    newsItem.className = "news-item";
    newsItem.innerHTML = `
      <h3>${item.title}</h3>
      <p>${item.description || ""}</p>
      <a href="${item.url}" target="_blank">Read more</a>
    `;
    newsContainer.appendChild(newsItem);
  });
}

// Joke functionality
async function tellJoke() {
  try {
    const response = await fetch("https://v2.jokeapi.dev/joke/Any?safe-mode");
    const data = await response.json();
    
    if (data.setup && data.delivery) {
      // Two-part joke
      readOut(data.setup);
      setTimeout(() => {
        readOut(data.delivery);
      }, 3000);
    } else if (data.joke) {
      // Single joke
      readOut(data.joke);
    } else {
      readOut("Why don't scientists trust atoms? Because they make up everything!");
    }
  } catch (error) {
    console.error("Joke API error:", error);
    readOut("Why did the computer go to therapy? It had too many bytes of emotional baggage!");
  }
}

// Reminder functionality
function setReminder(transcript) {
  // Extract time and message from transcript
  // This is a simplified version - you'd want to implement proper NLP for this
  let timeMatch = transcript.match(/(\d+):(\d+)\s*(am|pm)?/i);
  let message = transcript.replace("set a reminder", "")
                         .replace(/(for|at)\s+\d+:\d+\s*(am|pm)?/i, "")
                         .trim();
  
  if (timeMatch) {
    let hours = parseInt(timeMatch[1]);
    let minutes = parseInt(timeMatch[2]);
    let period = timeMatch[3] ? timeMatch[3].toLowerCase() : "";
    
    // Convert to 24-hour format
    if (period === "pm" && hours < 12) hours += 12;
    if (period === "am" && hours === 12) hours = 0;
    
    // Create reminder object
    let reminder = {
      time: { hours, minutes },
      message: message || "Reminder",
      id: Date.now()
    };
    
    reminders.push(reminder);
    saveReminders();
    
    readOut(`Reminder set for ${hours % 12 || 12}:${minutes.toString().padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'}. I'll remind you: ${message}`);
  } else {
    readOut("Sir, please specify a time for the reminder. For example: 'set a reminder at 3:30 PM to take a break'");
  }
}

function checkReminders() {
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  
  reminders.forEach((reminder, index) => {
    if (reminder.time.hours === currentHours && 
        reminder.time.minutes === currentMinutes) {
      readOut(`Sir, reminder: ${reminder.message}`);
      
      // Remove the reminder after triggering
      reminders.splice(index, 1);
      saveReminders();
    }
  });
}

function listReminders() {
  if (reminders.length === 0) {
    readOut("Sir, you have no reminders set.");
    return;
  }
  
  let reminderText = "Sir, here are your reminders: ";
  reminders.forEach((reminder, index) => {
    const hours = reminder.time.hours;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    reminderText += `${index + 1}. At ${displayHours}:${reminder.time.minutes.toString().padStart(2, '0')} ${ampm}: ${reminder.message}. `;
  });
  
  readOut(reminderText);
}

function saveReminders() {
  localStorage.setItem("jarvis_reminders", JSON.stringify(reminders));
}

function loadReminders() {
  const savedReminders = localStorage.getItem("jarvis_reminders");
  if (savedReminders) {
    reminders = JSON.parse(savedReminders);
  }
}

// Small JARVIS window control
const smallJarvis = document.querySelector("#small_jarvis");
smallJarvis.addEventListener("click", () => {
  window.open(`${window.location.href}`, "newWindow", "menubar=true,location=true,resizable=false,scrollbars=false,width=200,height=200,top=0,left=0");
  window.close();
});

// Calendar display
const lang = navigator.language;
let datex = new Date();
let dayNumber = date.getDate();
let monthx = date.getMonth();
let dayName = date.toLocaleString(lang, { weekday: 'long' });
let monthName = date.toLocaleString(lang, { month: 'long' });
let year = date.getFullYear();

document.querySelector("#month").innerHTML = monthName;
document.querySelector("#day").innerHTML = dayName;
document.querySelector("#date").innerHTML = dayNumber;
document.querySelector("#year").innerHTML = year;

document.querySelector(".calendar").addEventListener("click", () => {
  window.open("https://calendar.google.com/");
});

// Start/stop buttons
document.querySelector("#start_jarvis_btn").addEventListener("click", () => {
  readOut("Activating voice recognition sir");
  recognition.start();
});

document.querySelector("#stop_jarvis_btn").addEventListener("click", () => {
  readOut("Deactivating voice recognition sir");
  stopingR = true;
  recognition.stop();
});

// Initialize with a greeting if no setup is needed
if (localStorage.getItem("jarvis_setup")) {
  setTimeout(() => {
    const now = new Date();
    const hours = now.getHours();
    
    let greeting;
    if (hours < 12) {
      greeting = "Good morning";
    } else if (hours < 18) {
      greeting = "Good afternoon";
    } else {
      greeting = "Good evening";
    }
    
    readOut(`${greeting} sir. How may I assist you today?`);
  }, 1000);
}
