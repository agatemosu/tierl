document.addEventListener("click", function (event) {
    const clickedElement = event.target;

    if (clickedElement.classList.contains("tier-name")) {
        changeColor(clickedElement);
    }
});

function changeColor(element) {
    const color = prompt("Choose a color:", "#ff7ffe");

    if (color !== null) {
        element.style.backgroundColor = color;
    }
}

function addRow() {
    const mainContainer = document.querySelector("main");

    const newRow = document.createElement("div");
    newRow.className = "row";

    const tierNameDiv = document.createElement("div");
    tierNameDiv.className = "tier-name";
    const paragraph = document.createElement("p");
    paragraph.setAttribute("contenteditable", "");
    paragraph.textContent = "New tier";
    tierNameDiv.appendChild(paragraph);

    const darkRowDiv = document.createElement("div");
    darkRowDiv.className = "dark-row";

    const settingsDiv = document.createElement("div");
    settingsDiv.className = "tier-settings";

    newRow.appendChild(tierNameDiv);
    newRow.appendChild(darkRowDiv);
    newRow.appendChild(settingsDiv);

    mainContainer.appendChild(newRow);
}
