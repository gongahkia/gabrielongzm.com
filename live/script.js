"use strict";

// --- actual running code ---

const theButton = document.getElementById("infinityButton");
let isDarkMode = false; 

theButton?.addEventListener("click", pressTheButton);

function pressTheButton() {
    isDarkMode = !isDarkMode; 
    const newColor = isDarkMode ? generateDarkColor() : generateLightColor();
    console.log(newColor, isDarkMode); 
    document.body.style.backgroundColor = newColor;
    const articleTag = document.getElementsByClassName("overallArticleTags")[0];
    const footerTag = document.getElementsByTagName("footer")[0];
    const imageTag = document.getElementById("gongImage");
    if (isDarkMode) {
        theButton.setAttribute("style", "filter:invert(1);");
        articleTag.setAttribute("style", "filter:invert(1);");
        footerTag.setAttribute("style", "filter:invert(1);");
        imageTag.style.filter = "invert(1)";
    } else {
        theButton.style.filter = "none";
        articleTag.style.filter = "none";
        footerTag.style.filter = "none";
        imageTag.style.filter = "none";
    }
}

function generateDarkColor() {
    const r = Math.floor(Math.random() * 128);
    const g = Math.floor(Math.random() * 128);
    const b = Math.floor(Math.random() * 128);
    return `rgb(${r}, ${g}, ${b})`;
}

function generateLightColor() {
    const r = Math.floor(Math.random() * 128) + 128;
    const g = Math.floor(Math.random() * 128) + 128;
    const b = Math.floor(Math.random() * 128) + 128;
    return `rgb(${r}, ${g}, ${b})`;
}

// ----- setup code -----

const config = {
    timeZone: 'Asia/Singapore',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
},
formatter = new Intl.DateTimeFormat([], config);

// ----- execution code for current time -----

const currentYear = new Date().getFullYear();

setInterval(
    () => {
        document.querySelector("#time").innerText = formatter.format(new Date());
    }
, 1000)

document.querySelector("#current-year").innerText = currentYear;

// ----- get number of stars -----q

async function fetchStarCount(repo) {
  const response = await fetch(`https://api.github.com/repos/${repo}`);
  const data = await response.json();
  return data.stargazers_count;
}

async function updateStarCounts() {
  const starCountElements = document.querySelectorAll('.star-count');
  for (const element of starCountElements) {
    const repo = element.getAttribute('data-repo');
    try {
      const starCount = await fetchStarCount(repo);
      element.textContent = `★ ${starCount}`;
    } catch (error) {
      console.error(`Error: Unable to fetch star count for ${repo}:`, error);
    }
  }
}

updateStarCounts();

// ----- get number of forks -----

async function fetchForkCount(repo) {
  const response = await fetch(`https://api.github.com/repos/${repo}`);
  const data = await response.json();
  return data.forks_count;
}

async function updateForkCounts() {
  const forkCountElements = document.querySelectorAll('.fork-count');
  for (const element of forkCountElements) {
    const repo = element.getAttribute('data-repo');
    try {
      const forkCount = await fetchForkCount(repo);
      element.textContent = `✌ ${forkCount}`;
    } catch (error) {
      console.error(`Error: Unable to fetch fork count for ${repo}:`, error);
    }
  }
}

updateForkCounts();