document.addEventListener("click", function (event) {
    const clickedElement = event.target;

    if (clickedElement.classList.contains("editable-square")) {
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
    newRow.className = "editable-square";
    newRow.innerHTML = "<p contenteditable>New tier</p>";
    mainContainer.appendChild(newRow);

    const newDarkRow = document.createElement("div");
    newDarkRow.className = "dark-row";
    mainContainer.appendChild(newDarkRow);
}
