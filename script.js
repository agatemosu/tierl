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

let scrollable = true;
let drake;

const mainContainer = document.querySelector("main");
const imagesBar = document.querySelector("#images-bar");
const dynamicStyles = document.querySelector("#dynamic-styles");
const exportContainer = document.querySelector("#export-container");
const exportedImage = document.querySelector("#exported-image");
const blackout = document.querySelector("#blackout");

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

document.addEventListener(
	"touchmove",
	(e) => {
		if (!scrollable) {
			e.preventDefault();
		}
	},
	{
		passive: false,
	},
);

document.addEventListener("drop", (e) => {
	e.preventDefault();
	uploadImages(e.dataTransfer.files);
});

document.addEventListener("dragover", (e) => {
	e.preventDefault();
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
		<div
			class="tier-label"
			contenteditable="true"
			style="background-color: ${defaultColor}"
		>
			<p spellcheck="false">${tierName}</p>
			<div class="tooltip" contenteditable="false">
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
	initializeDragula();
}

function addRowListeners(row, defaultColor) {
	const colorPicker = row.querySelector(".color-picker");
	const tierLabel = row.querySelector(".tier-label");

	const deleteButton = row.querySelector(".option.delete img");
	const upButton = row.querySelector(".option.up img");
	const downButton = row.querySelector(".option.down img");

	const pickr = createColorPicker(colorPicker, tierLabel, defaultColor);

	deleteButton.onclick = () => {
		pickr.destroyAndRemove();
		row.remove();
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
