document.addEventListener("click", function (event) {
    const clickedElement = event.target;

    if (clickedElement.classList.contains("tier-label")) {
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

    // Labels and colors
    const tierLabelDiv = document.createElement("div");
    tierLabelDiv.className = "tier-label";

    const paragraph = document.createElement("p");
    paragraph.setAttribute("contenteditable", "");
    paragraph.textContent = "New tier";
    tierLabelDiv.appendChild(paragraph);

    // Tiers
    const tierDiv = document.createElement("div");
    tierDiv.className = "tier sort";

    // Options
    const optionsDiv = document.createElement("div");
    optionsDiv.className = "tier-options";

    const deleteButton = document.createElement("div");
    deleteButton.className = "option delete";
    deleteButton.innerHTML = "<img src='assets/trash.svg' alt='Delete' onclick='deleteRow(this)'>";
    optionsDiv.appendChild(deleteButton);

    const upButton = document.createElement("div");
    upButton.className = "option";
    upButton.innerHTML = "<img src='assets/chevron-up.svg' alt='Up' onclick='moveRow(this, -1)'>";
    optionsDiv.appendChild(upButton);

    const downButton = document.createElement("div");
    downButton.className = "option";
    downButton.innerHTML = "<img src='assets/chevron-down.svg' alt='Down' onclick='moveRow(this, 1)'>";
    optionsDiv.appendChild(downButton);

    // Add divs to the row / main container
    newRow.appendChild(tierLabelDiv);
    newRow.appendChild(tierDiv);
    newRow.appendChild(optionsDiv);
    mainContainer.appendChild(newRow);

    initializeDragula();
}

function deleteRow(element) {
    element.parentNode.parentNode.parentNode.remove();
}

function moveRow(button, direction) {
    const row = button.parentNode.parentNode.parentNode;

    const currentIndex = Array.from(row.parentNode.children).indexOf(row);
    const newIndex = currentIndex + direction;

    if (newIndex >= 0) {
        row.parentNode.insertBefore(
            row,
            row.parentNode.children[newIndex + (direction === 1 ? 1 : 0)]
        );
    }
}

function selectImages() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;

    input.click();

    input.addEventListener("change", () => uploadImages(input.files));
}

function uploadImages(files) {
    const imagesBar = document.querySelector(".images-bar");

    for (const file of files) {
        const image = document.createElement("img");
        image.src = URL.createObjectURL(file);

        imagesBar.appendChild(image);
    }

    initializeDragula();
}

function initializeDragula() {
    const containers = Array.from(document.querySelectorAll(".sort"));

    if (window.dragulaInstance) {
        window.dragulaInstance.containers.push(...containers);
    } else {
        window.dragulaInstance = dragula(containers);
    }
}
