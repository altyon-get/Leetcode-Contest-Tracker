// Global cache objects
const contestDataCache = {};
let userSolvedCache = null;

//icon1
const svgElement1 = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svgElement1.setAttribute("xmlns", "http://www.w3.org/2000/svg");
svgElement1.setAttribute("viewBox", "0 0 24 24");
svgElement1.setAttribute("width", " 1.3em");
svgElement1.setAttribute("height", "1.3em");
svgElement1.setAttribute("fill", "green");
const pathElement1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
pathElement1.setAttribute("fill-rule", "evenodd");
pathElement1.setAttribute("d", "M20 12.005v-.828a1 1 0 112 0v.829a10 10 0 11-5.93-9.14 1 1 0 01-.814 1.826A8 8 0 1020 12.005zM8.593 10.852a1 1 0 011.414 0L12 12.844l8.293-8.3a1 1 0 011.415 1.413l-9 9.009a1 1 0 01-1.415 0l-2.7-2.7a1 1 0 010-1.414z");
pathElement1.setAttribute("clip-rule", "evenodd");
svgElement1.appendChild(pathElement1);
//icon2
const svgElement2 = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svgElement2.setAttribute("xmlns", "http://www.w3.org/2000/svg");
svgElement2.setAttribute("viewBox", "0 0 24 24");
svgElement2.setAttribute("width", "1.3em");
svgElement2.setAttribute("height", "1.3em");
svgElement2.setAttribute("fill", "green");
const circleElement = document.createElementNS("http://www.w3.org/2000/svg", "circle");
const viewBoxWidth = 24;
const circleRadius = viewBoxWidth / 2.5;
circleElement.setAttribute("cx", viewBoxWidth / 2);
circleElement.setAttribute("cy", viewBoxWidth / 2);
circleElement.setAttribute("r", circleRadius);
circleElement.setAttribute("fill", "transparent");
circleElement.setAttribute("stroke", "white");
circleElement.setAttribute("stroke-width", "2");
svgElement2.appendChild(circleElement);
const pathElement2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
pathElement2.setAttribute("fill-rule", "evenodd");
pathElement2.setAttribute("d", "M7.05,7.05 L16.95,16.95 M7.05,16.95 L16.95,7.05");
pathElement2.setAttribute("stroke", "white");
pathElement2.setAttribute("stroke-width", "2");
svgElement2.appendChild(pathElement2);

function createDifficultyBadge(difficultyLevel) {
    const badge = document.createElement("div");

    let text, colorClass1,colorClass2 ;
    switch(difficultyLevel) {
        case 1:
            text = "E";
            colorClass1 = "text-difficulty-easy";
            colorClass2 = "dark:text-difficulty-easy";
            break;
        case 2:
            text = "M";
            colorClass1 = "text-difficulty-medium"; 
            colorClass2 = "dark:text-difficulty-medium";
            break;
        case 3:
            text = "H";
            colorClass1 = "text-difficulty-hard"; 
            colorClass2 = "dark:text-difficulty-hard";
            break;
        default:
            text = "";
            colorClass1 = "text-gray-500";
    }
    
    badge.classList.add(colorClass1);
    badge.classList.add(colorClass2);
    badge.textContent = text;
    badge.style.fontSize = "0.50rem";
    badge.style.marginTop = "1px";
    
    return badge;
}



async function displayData(userSolved, userContestData) {
    try {
        const allElements = document.querySelectorAll(`a[data-contest-title-slug]`);
        Array.from(allElements).map((e, index) => {
            const secondDiv = e.querySelector('div:nth-child(3)');
            if (secondDiv) {
                secondDiv.innerHTML = '';
                secondDiv.classList.remove('existing-class');
                secondDiv.style.display = "flex";
                secondDiv.style.flexDirection = "row";
                secondDiv.style.justifyContent = "space-evenly";
                allElements[index].appendChild(secondDiv);

                if (userContestData) {


                    const contestName = userContestData[index].name;
                    const contestSolved = new Set(userContestData[index].userSolved);

                    const fragment = document.createDocumentFragment();


                    userContestData[index].questions.map((question) => {
                        const id = question.question_id;
                        const title = question.title_slug;
                        const link = `https://leetcode.com/contest/${contestName}/problems/${title}/`;
                        const difficultyLevel = question.difficulty || 1;
                        let newSvg;
                        if (contestSolved.has(id)) {
                            newSvg = svgElement1.cloneNode(true);
                        }
                        else if (userSolved.includes(title)) {
                            newSvg = svgElement1.cloneNode(true);
                            newSvg.setAttribute('fill', 'orange');
                        }
                        else {
                            newSvg = svgElement2.cloneNode(true);
                        }
                        
                        // Create container for icon and badge
                        const container = document.createElement("div");
                        container.style.display = "flex";
                        container.style.flexDirection = "column";
                        container.style.alignItems = "center";
                        container.style.gap = "2px";
                        const difficultyBadge = createDifficultyBadge(difficultyLevel);
                        
                        const linkElement = document.createElement("a");
                        linkElement.appendChild(newSvg);
                        linkElement.setAttribute("href", link);
                        linkElement.setAttribute("target", '_blank');
                        
                        container.appendChild(linkElement);
                        container.appendChild(difficultyBadge);
                        fragment.appendChild(container);
                    });

                    secondDiv.appendChild(fragment);
                }
            }
        });

    } catch (err) {
        console.error(err);
    }
}
async function fetchContestData(tag) {
    if (contestDataCache[tag]) {
        return contestDataCache[tag];
    }
    const url1 = `https://leetcode.com/contest/api/info/${tag}/`;
    const response1 = await fetch(url1);
    const data1 = await response1.json();
    const contestId = data1.contest.id;
    const questions = data1.questions;

    const url2 = `https://leetcode.com/contest/api/myranking/${tag}/`;
    const response2 = await fetch(url2);
    const data2 = await response2.json();
    const userSolved = data2.my_solved;

    const contestData = {
        contestId: contestId,
        questions: questions,
        userSolved: userSolved
    };
    contestDataCache[tag] = contestData;
    return contestData;
}
async function getUserContestData() {
    try {
        const x = document.querySelectorAll(`a[data-contest-title-slug]`);
        const tags = Array.from(x).map(i => i.getAttribute('data-contest-title-slug'));
        const contestDataPromises = tags.map(async (tag) => {
            const contestData = await fetchContestData(tag);
            contestData.name = tag;
            return contestData;
        });
        const contestDataArray = await Promise.all(contestDataPromises);
        return contestDataArray;
    } catch (err) {
        console.error(err);
    }
}
async function getUserSolved() {
    if (userSolvedCache) {
        return userSolvedCache;
    }
    let url = "https://leetcode.com/api/problems/all/";
    const response = await fetch(url);
    const data = await response.json();

    const userSolved = [];
    for (let questions of data['stat_status_pairs']) {
        if (questions['status'] == "ac") {
            userSolved.push(questions['stat']['question__title_slug']);
        }
    }
    userSolvedCache = userSolved;
    return userSolved;
};

async function preStart() {
    try {
        const userSolved = await getUserSolved();
        localStorage.setItem('userSolved', JSON.stringify(userSolved));
        start();
    } catch (error) {
        console.error(error);
    }
}

async function start() {
    const storedUserSolved = JSON.parse(localStorage.getItem('userSolved'));

    if (storedUserSolved) {
        const userContestData = await getUserContestData();
        displayData(storedUserSolved, userContestData);
    } else {
        preStart();
    }
}


let observer;
async function observeDOMChanges() {
    if (observer) { observer.disconnect(); }

    observer = new MutationObserver((mutationsList) => {
        let added = false;
        for (const mutation of mutationsList) {
            if (mutation.addedNodes.length > 0) {
                const addedAnchors = mutation.addedNodes[0].querySelectorAll('a[data-contest-title-slug]');
                if (addedAnchors.length > 0) {
                    start();
                    added = true;
                    break;
                }
            }
        }
        if (!added) {
            setTimeout(() => { start() }, 2000);
        }
        observer.disconnect();
    });

    observer.observe(document.documentElement, { attributes: true, childList: true, subtree: true });
}

if (window.location.href === 'https://leetcode.com/contest/') {
    start();
    preStart();
    observeDOMChanges();
    document.onclick = function (event) {
        start();
        observeDOMChanges();
    }
} 