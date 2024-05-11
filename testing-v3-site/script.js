// fua
    // try migrating code from app.js to script.js here to interact with styles.css
    // need to examine element names on index.html and edit them accordingly

"use strict";

// toggle light and dark mode
addEventListener("DOMContentLoaded", (e) => {
    const darkModeCheckbox = document.getElementById("dark-mode");
    darkModeCheckbox.addEventListener('change', (e) => {
        localStorage.setItem('darkMode', JSON.stringify(e.target.checked));
    });
    let darkMode = false;
    if (localStorage.getItem('darkMode') !== null) {
        try {
            darkMode = !!JSON.parse(localStorage.getItem('darkMode'));
        } catch (e) {
            console.error(e);
        }
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        darkMode = true;
    }
    darkModeCheckbox.checked = darkMode;
});

// --- EDIT THIS ENTIRE BOTTOM PORTION ---

const theButton = document.getElementById("infinityButton");
theButton === null || theButton === void 0 ? void 0 : theButton.addEventListener("click", pressTheButton);
function pressTheButton() {
    console.log("firm"); // the function is running
    const randomColor = rngHexColor();
    console.log(randomColor, checkHexDarkness(randomColor));
    document.body.style.backgroundColor = randomColor; 

}

    // get document id of each and every elment and assign it to a const in format of 
    // const myNamePara = document.getElementById("my-name");

//     const myNamePara = document.getElementById("my-name");
//     const myDescPara = document.getElementById("my-description");
//     const myCredNamePara = document.getElementById("my-credits-name");
//     const myCredGithubPara = document.getElementById("my-credits-github");
//     const myCredResumePara = document.getElementById("my-credits-resume");
//     const myCredJapOnePara = document.getElementById("my-japanese-is-bad");
//     const myCredJapTwoPara = document.getElementById("my-japanese-is-good");

//     // these HTML elements will change when the button is pressed if the color is detected
//     const mainFella = document.getElementById("mainBody");
//     const currentMode = mainFella === null || mainFella === void 0 ? void 0 : mainFella.getAttributeNode("class");
//     const githubPic = document.getElementById("githubImg");
//     const linkedinPic = document.getElementById("linkedinImg");
//     const wordpressPic = document.getElementById("wordpressImg");
//     const gmailPic = document.getElementById("gmailImg");
//     const infinityPic = document.getElementById("infinityButton");


//     // ! asserts that a variable is non-nullable and is defined
//     // the class "rotated" must be added to the element everytime it is to be played

//     infinityPic.classList.add('rotated');
//     if (checkHexDarkness(randomColor)) { // if relatively darker
//         mainFella.removeAttribute("class");
//         githubPic.setAttribute("style", "filter:invert(1);");
//         linkedinPic.setAttribute("style", "filter:invert(1);");
//         wordpressPic.setAttribute("style", "filter:invert(1);");
//         gmailPic.setAttribute("style", "filter:invert(1);");
//         infinityPic.setAttribute("style", "filter:invert(1);");
//     }
//     else { // if relatively light
//         mainFella.removeAttribute("class");
//         githubPic.removeAttribute("style");
//         linkedinPic.removeAttribute("style");
//         wordpressPic.removeAttribute("style");
//         gmailPic.removeAttribute("style");
//         infinityPic.removeAttribute("style");
//     }

//     // setTimeout() ensures the animation has cleared its entire cycle first before removing it
//     setTimeout(() => {
//         infinityPic.classList.remove('rotated');
//     }, 750);

// }

// // --- helper functions ---

function rngHexColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function checkHexDarkness(hexColor, threshold = 0.5) {
    const sanitizedHexColor = hexColor.replace(/^#/, '');
    const red = parseInt(sanitizedHexColor.substring(0, 2), 16);
    const green = parseInt(sanitizedHexColor.substring(2, 4), 16);
    const blue = parseInt(sanitizedHexColor.substring(4, 6), 16);
    // calculate luminance
    const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
    return luminance < threshold;
}