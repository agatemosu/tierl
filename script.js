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
    paragraph.setAttribute("contenteditable", true);
    paragraph.textContent = "New tier";
    tierNameDiv.appendChild(paragraph);


    const darkRowDiv = document.createElement("div");
    darkRowDiv.className = "dark-row";


    const settingsDiv = document.createElement("div");
    settingsDiv.className = "tier-settings";

    const deleteButton = document.createElement("button");
    deleteButton.className = "action-button";
    deleteButton.textContent = "Delete";
    deleteButton.onclick = function () {
        deleteRow(this);
    };
    settingsDiv.appendChild(deleteButton);

    const upButton = document.createElement("button");
    upButton.className = "action-button";
    upButton.textContent = "Up";
    upButton.onclick = function () {
        moveRow(this, -1);
    };
    settingsDiv.appendChild(upButton);

    const downButton = document.createElement("button");
    downButton.className = "action-button";
    downButton.textContent = "Down";
    downButton.onclick = function () {
        moveRow(this, 1);
    };
    settingsDiv.appendChild(downButton);


    newRow.appendChild(tierNameDiv);
    newRow.appendChild(darkRowDiv);
    newRow.appendChild(settingsDiv);
    mainContainer.appendChild(newRow);
}

function deleteRow(element) {
    element.parentNode.parentNode.remove();
}

function moveRow(button, direction) {
    const row = button.parentNode.parentNode;

    const currentIndex = Array.from(row.parentNode.children).indexOf(row);
    const newIndex = currentIndex + direction;

    if (newIndex >= 0) {
        row.parentNode.insertBefore(row, row.parentNode.children[newIndex + (direction === 1 ? 1 : 0)]);
    }
}
