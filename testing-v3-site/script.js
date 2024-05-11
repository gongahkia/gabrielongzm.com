// fua
    // try migrating code from app.js to script.js here to interact with styles.css
    // need to examine element names on index.html and edit them accordingly
    // also work out how to add smoothing between the colors and text changing color
    // rework tolerance for light and dark?
    // the picture is inverting color now too; prevent that
    // invert the article header also
    // change color of my svg icon in css or html, its too bright right now

"use strict";

// // toggle light and dark mode
// addEventListener("DOMContentLoaded", (e) => {
//     const darkModeCheckbox = document.getElementById("dark-mode");
//     darkModeCheckbox.addEventListener('change', (e) => {
//         localStorage.setItem('darkMode', JSON.stringify(e.target.checked));
//     });
//     let darkMode = false;
//     if (localStorage.getItem('darkMode') !== null) {
//         try {
//             darkMode = !!JSON.parse(localStorage.getItem('darkMode'));
//         } catch (e) {
//             console.error(e);
//         }
//     } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
//         darkMode = true;
//     }
//     darkModeCheckbox.checked = darkMode;
// });

// --- EDIT THIS ENTIRE BOTTOM PORTION ---

const theButton = document.getElementById("infinityButton");
theButton === null || theButton === void 0 ? void 0 : theButton.addEventListener("click", pressTheButton);

// --- function definition ---

function pressTheButton() {

    const randomColor = rngHexColor();
    console.log(randomColor, checkHexDarkness(randomColor)); // test function is running
    document.body.style.backgroundColor = randomColor; // change background color

    // making use of dom selector
    const articleTag = document.getElementsByClassName("overallArticleTags");
    const imageTag = document.getElementById("gongImage")

    // color change
    if (checkHexDarkness(randomColor)){ // background darker
        theButton.setAttribute("style", "filter:invert(1);");
        articleTag[0].setAttribute("style", "filter:invert(1);");
        imageTag.setAttribute("style", "filter:invert(1)"); // wtf some boolean inversion magic
    } else { // background lighter
        theButton.style.filter = "none";
        articleTag[0].style.filter = "none";
        imageTag.style.filter = "none";
    }

}

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