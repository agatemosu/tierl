document.addEventListener("DOMContentLoaded", function () {
    const tooltips = document.querySelectorAll(".tooltip");
    const defaultColors = ["#ff7f7e", "#ffbf7f", "#feff7f", "#7eff80", "#7fffff", "#807fff"];

    tooltips.forEach((tooltip, index) => {
        const defaultColor = defaultColors[index];
        const colorPicker = tooltip.querySelector(".color-picker");

        createColorPicker(colorPicker, (color) => { 
            tooltip.parentNode.style.backgroundColor = color ? color.toHEXA().toString() : "";
        }, defaultColor);
    });
});

document.addEventListener("touchmove", function (event) {
    if (!scrollable) {
        event.preventDefault();
    }
}, {
    passive: false,
});

function createColorPicker(colorPicker, onChange, defaultColor = "lightslategray") {
    const pickr = Pickr.create({
        el: colorPicker,
        theme: "monolith",
        default: defaultColor,
        swatches: ["#ff7f7e", "#ffbf7f", "#feff7f", "#7eff80", "#7fffff", "#807fff", "#ff7ffe"],
        components: {
            preview: true,
            hue: true,
            interaction: {
                input: true,
                clear: true,
                save: true,
            },
        },
    });

    pickr.on("save", (color) => {
        onChange(color);
        pickr.hide();
    });
}

function addRow() {
    const mainContainer = document.querySelector("main");
    const newRow = document.createElement("div");
    newRow.className = "row";

    // Labels and colors
    const tierLabelDiv = document.createElement("div");
    tierLabelDiv.className = "tier-label";
    tierLabelDiv.setAttribute("contenteditable", true);

    const paragraph = document.createElement("p");
    paragraph.textContent = "New tier";
    paragraph.setAttribute("spellcheck", false);

    const tooltip = document.createElement("div");
    tooltip.className = "tooltip";
    tooltip.setAttribute("contenteditable", false);

    const colorPicker = document.createElement("div");
    colorPicker.className = "color-picker";

    // Tiers
    const tierDiv = document.createElement("div");
    tierDiv.className = "tier sort";

    // Options
    const optionsDiv = document.createElement("div");
    optionsDiv.className = "tier-options";

    const optionsContainer = document.createElement("div");
    optionsContainer.className = "options-container";

    const deleteButton = document.createElement("div");
    deleteButton.className = "option delete";
    deleteButton.innerHTML = "<img src='assets/trash.svg' alt='Delete' onclick='deleteRow(this)'>";

    const upButton = document.createElement("div");
    upButton.className = "option";
    upButton.innerHTML = "<img src='assets/chevron-up.svg' alt='Up' onclick='moveRow(this, -1)'>";

    const downButton = document.createElement("div");
    downButton.className = "option";
    downButton.innerHTML = "<img src='assets/chevron-down.svg' alt='Down' onclick='moveRow(this, 1)'>";

    // Add divs to the row / main container
    tooltip.appendChild(colorPicker);

    createColorPicker(colorPicker, (color) => {
        tooltip.parentNode.style.backgroundColor = color ? color.toHEXA().toString() : "";
    });

    tierLabelDiv.appendChild(paragraph);
    tierLabelDiv.appendChild(tooltip);

    optionsContainer.appendChild(deleteButton);
    optionsContainer.appendChild(upButton);
    optionsContainer.appendChild(downButton);

    optionsDiv.appendChild(optionsContainer);

    newRow.appendChild(tierLabelDiv);
    newRow.appendChild(tierDiv);
    newRow.appendChild(optionsDiv);

    mainContainer.appendChild(newRow);

    initializeDragula();
}

function deleteRow(element) {
    element.closest(".row").remove();
}

function moveRow(button, direction) {
    const row = button.closest(".row");

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
        image.className = "image";

        imagesBar.appendChild(image);
    }

    initializeDragula();
}

function initializeDragula() {
    const containers = Array.from(document.querySelectorAll(".sort"));

    if (window.drake) {
        window.drake.containers.push(...containers);
    } else {
        window.drake = dragula(containers);
    }

    window.drake.on("drag", () => { scrollable = false; })
                .on("drop", () => { scrollable = true; })
                .on("cancel", () => { scrollable = true; });
}

function dynamicStyle(id) {
    const style = document.getElementById("dynamic-styles");
    const checkbox = document.getElementById(id);

    let content = style.innerHTML;

    if (id === "img") {
        if (checkbox.checked) {
            content += ".image { height: 80px; width: 80px; }";
        } else {
            content = content.replace(".image { height: 80px; width: 80px; }", "");
        }
    }
    style.innerHTML = content;
}
