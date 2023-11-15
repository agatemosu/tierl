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

    const deleteButton = document.createElement("div");
    deleteButton.className = "action-button delete";
    deleteButton.innerHTML = "<img src='assets/trash.svg' alt='Delete' onclick='deleteRow(this)'>";
    settingsDiv.appendChild(deleteButton);

    const upButton = document.createElement("div");
    upButton.className = "action-button";
    upButton.innerHTML = "<img src='assets/chevron-up.svg' alt='Up' onclick='moveRow(this, -1)'>";
    settingsDiv.appendChild(upButton);

    const downButton = document.createElement("div");
    downButton.className = "action-button";
    downButton.innerHTML = "<img src='assets/chevron-down.svg' alt='Down' onclick='moveRow(this, 1)'>";
    settingsDiv.appendChild(downButton);


    newRow.appendChild(tierNameDiv);
    newRow.appendChild(darkRowDiv);
    newRow.appendChild(settingsDiv);
    mainContainer.appendChild(newRow);
}

function deleteRow(element) {
    element.parentNode.parentNode.parentNode.remove();
}

function moveRow(button, direction) {
    const row = button.parentNode.parentNode.parentNode;

    const currentIndex = Array.from(row.parentNode.children).indexOf(row);
    const newIndex = currentIndex + direction;

    if (newIndex >= 0) {
        row.parentNode.insertBefore(row, row.parentNode.children[newIndex + (direction === 1 ? 1 : 0)]);
    }
}
