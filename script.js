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
const clearColor = "#778899";

const mainContainer = document.querySelector("main");
const imagesBar = document.querySelector("#images-bar");
const dynamicStyles = document.querySelector("#dynamic-styles");
const exportContainer = document.querySelector("#export-container");
const exportedImage = document.querySelector("#exported-image");
const blackout = document.querySelector("#blackout");

const draggables = [];
addContainerDrag(imagesBar);

document.querySelector("#new-tier").onclick = () => addRow();
document.querySelector("#select-images").onclick = () => selectImages();
document.querySelector("#export-image").onclick = () => exportImage();
document.querySelector("#save-image").onclick = () => saveImage();
blackout.onclick = () => hideBlackout();

document.querySelectorAll(".row").forEach((row, index) => {
	addRowListeners(row, defaultColors[index]);
});

for (const checkbox of document.querySelectorAll(".dynamic-style")) {
	checkbox.addEventListener("change", () => dynamicStyle(checkbox));
}

document.addEventListener("drop", (e) => {
	e.preventDefault();
	uploadImages(e.dataTransfer.files);
});

document.addEventListener("dragover", (e) => {
	e.preventDefault();
});

document.addEventListener("mousedown", (e) => {
	const ignoreSelectors = [".pcr-app", ".export-container", "#blackout"];
	const ignoreClick = ignoreSelectors.some((selector) =>
		e.target.closest(selector),
	);

	if (ignoreClick) {
		return;
	}

	const menuClicked = e.target.closest(".tier-label");
	const visibleMenus = document.querySelectorAll('[data-visibility="visible"]');

	if (menuClicked) {
		const tooltip = menuClicked.querySelector(".tooltip");

		for (const menu of visibleMenus) {
			if (menu !== tooltip) {
				menu.dataset.visibility = "hidden";
			}
		}

		tooltip.dataset.visibility = "visible";
		return;
	}

	for (const menu of visibleMenus) {
		menu.dataset.visibility = "hidden";
	}
});

function createColorPicker(colorPicker, tierLabel, defaultColor) {
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
		if (color === null) {
			pickr.setColor(clearColor);
			return;
		}

		const hsl = color.toHSLA();
		const lightness = hsl[2];

		tierLabel.style.backgroundColor = color.toHEXA().toString();
		tierLabel.style.color = lightness < 50 ? "white" : "black";

		pickr.hide();
	});

	return pickr;
}

function addRow(tierName = "New tier", defaultColor = clearColor) {
	const newRow = document.createElement("div");
	newRow.className = "row";
	newRow.innerHTML = `
		<div class="tier-label" style="background-color: ${defaultColor}">
			<div class="label-text" contenteditable="true">
				<span>${tierName}</span>
			</div>
			<div class="tooltip" data-visibility="hidden">
				<div class="color-picker"></div>
			</div>
		</div>
		<div class="tier sort"></div>
		<div class="tier-options" data-html2canvas-ignore>
			<div class="options-container">
				<div class="option delete">
					<img src="./assets/trash.svg" alt="Delete" />
				</div>
				<div class="option up">
					<img src="./assets/chevron-up.svg" alt="Up" />
				</div>
				<div class="option down">
					<img src="./assets/chevron-down.svg" alt="Down" />
				</div>
			</div>
		</div>
	`;

	mainContainer.appendChild(newRow);
	addRowListeners(newRow, defaultColor);
}

function addRowListeners(row, defaultColor) {
	const colorPicker = row.querySelector(".color-picker");
	const tierLabel = row.querySelector(".tier-label");

	const tierSort = row.querySelector(".sort");

	const deleteButton = row.querySelector(".option.delete img");
	const upButton = row.querySelector(".option.up img");
	const downButton = row.querySelector(".option.down img");

	const pickr = createColorPicker(colorPicker, tierLabel, defaultColor);
	const dragInstance = addContainerDrag(tierSort);

	deleteButton.onclick = () => {
		pickr.destroyAndRemove();
		row.remove();

		const dragIndex = draggables.indexOf(dragInstance);

		draggables[dragIndex].destroy();
		draggables.splice(dragIndex, 1);

		console.log(draggables);
	};
	upButton.onclick = () => {
		moveRow(row, -1);
	};
	downButton.onclick = () => {
		moveRow(row, 1);
	};
}

function moveRow(row, direction) {
	const rows = Array.from(mainContainer.children);
	const currentIndex = rows.indexOf(row);
	const newIndex = currentIndex + direction;

	if (newIndex < 0 || newIndex >= rows.length) {
		return;
	}

	const rowBefore = direction === -1 ? rows[newIndex] : rows[newIndex + 1];

	mainContainer.insertBefore(row, rowBefore);
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
		if (file.type.split("/")[0] !== "image") {
			continue;
		}

		const image = new Image();
		image.src = URL.createObjectURL(file);

		const imageEl = document.createElement("div");
		imageEl.classList.add("tier-element");
		imagesBar.appendChild(imageEl);

		image.onload = () => {
			imageEl.style.aspectRatio = `${image.width} / ${image.height}`;
			imageEl.style.backgroundImage = `url("${image.src}")`;
			imageEl.style.minHeight = `${Math.min(image.height, 80)}px`;
		};
	}
}

function addContainerDrag(container) {
	const dragInstance = new Sortable(container, { group: "tiers" });
	draggables.push(dragInstance);

	return dragInstance;
}

function dynamicStyle(checkbox) {
	const importText = `@import "./styles/${checkbox.id}.css";`;

	if (checkbox.checked) {
		dynamicStyles.innerHTML += importText;
	} else {
		dynamicStyles.innerHTML = dynamicStyles.innerHTML.replace(importText, "");
	}
}

async function exportImage() {
	const canvas = await html2canvas(mainContainer, {
		scale: 1.5,
		windowWidth: 1080,
	});
	exportedImage.src = canvas.toDataURL();

	exportContainer.dataset.visibility = "visible";
	blackout.dataset.visibility = "visible";
}

function saveImage() {
	const downloadLink = document.createElement("a");
	downloadLink.href = exportedImage.src;
	downloadLink.download = "image.png";

	downloadLink.click();
}

function hideBlackout() {
	blackout.dataset.visibility = "hidden";
	exportContainer.dataset.visibility = "hidden";
}
