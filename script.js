const hash = location.hash.substring(1);
const defaultColors = [
	"#ff7f7e",
	"#ffbf7f",
	"#feff7f",
	"#7eff80",
	"#7fffff",
	"#807fff",
	"#ff7ffe",
];

let scrollable = true;
let drake;

const mainContainer = document.querySelector("main");
const imagesBar = document.querySelector("#images-bar");
const dynamicStyles = document.querySelector("#dynamic-styles");

document.querySelectorAll(".tooltip").forEach((tooltip, index) => {
	const defaultColor = defaultColors[index];
	const colorPicker = tooltip.querySelector(".color-picker");

	createColorPicker(
		colorPicker,
		(color) => {
			tooltip.parentNode.style.backgroundColor = color
				? color.toHEXA().toString()
				: "";
		},
		defaultColor,
	);
});

document.addEventListener(
	"touchmove",
	(event) => {
		if (!scrollable) {
			event.preventDefault();
		}
	},
	{
		passive: false,
	},
);

function createColorPicker(colorPicker, onChange, defaultColor) {
	const pickr = Pickr.create({
		el: colorPicker,
		theme: "monolith",
		default: defaultColor,
		swatches: defaultColors,
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

function addRow(tierName = "New tier", defaultColor = "#778899") {
	const newRow = document.createElement("div");
	newRow.className = "row";

	// Labels and colors (i.e. left)
	const tierLabelDiv = document.createElement("div");
	tierLabelDiv.className = "tier-label";
	tierLabelDiv.style.backgroundColor = defaultColor;
	tierLabelDiv.setAttribute("contenteditable", true);

	const paragraph = document.createElement("p");
	paragraph.textContent = tierName;
	paragraph.setAttribute("spellcheck", false);

	const tooltip = document.createElement("div");
	tooltip.className = "tooltip";
	tooltip.setAttribute("contenteditable", false);

	const colorPicker = document.createElement("div");
	colorPicker.className = "color-picker";

	// Tiers (i.e. center)
	const tierDiv = document.createElement("div");
	tierDiv.className = "tier sort";

	// Options (i.e. right)
	const optionsDiv = document.createElement("div");
	optionsDiv.className = "tier-options";

	const optionsContainer = document.createElement("div");
	optionsContainer.className = "options-container";

	const deleteButton = document.createElement("div");
	deleteButton.className = "option delete";

	const deleteImage = document.createElement("img");
	deleteImage.src = "assets/trash.svg";
	deleteImage.alt = "Delete";
	deleteImage.setAttribute("onclick", "deleteRow(this)");

	const upButton = document.createElement("div");
	upButton.className = "option";

	const upImage = document.createElement("img");
	upImage.src = "assets/chevron-up.svg";
	upImage.alt = "Up";
	upImage.setAttribute("onclick", "moveRow(this, -1)");

	const downButton = document.createElement("div");
	downButton.className = "option";

	const downImage = document.createElement("img");
	downImage.src = "assets/chevron-down.svg";
	downImage.alt = "Down";
	downImage.setAttribute("onclick", "moveRow(this, 1)");

	// Add divs to the row / main container
	tooltip.appendChild(colorPicker);

	createColorPicker(
		colorPicker,
		(color) => {
			tooltip.parentNode.style.backgroundColor = color
				? color.toHEXA().toString()
				: "";
		},
		defaultColor,
	);

	tierLabelDiv.appendChild(paragraph);
	tierLabelDiv.appendChild(tooltip);

	deleteButton.appendChild(deleteImage);
	upButton.appendChild(upImage);
	downButton.appendChild(downImage);

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
			row.parentNode.children[newIndex + (direction === 1 ? 1 : 0)],
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

	if (drake) {
		drake.containers.push(...containers);
	} else {
		drake = dragula(containers);
	}

	drake
		.on("drag", () => {
			scrollable = false;
		})
		.on("drop", () => {
			scrollable = true;
		})
		.on("cancel", () => {
			scrollable = true;
		});
}

function dynamicStyle(checkbox) {
	const importText = `@import "./styles/${checkbox.id}.css";`;

	if (checkbox.checked) {
		dynamicStyles.innerHTML += importText;
	} else {
		dynamicStyles.innerHTML = dynamicStyles.innerHTML.replace(importText, "");
	}
}
