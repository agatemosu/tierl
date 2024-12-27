import Pickr from "https://esm.run/@simonwep/pickr@1.9.1";
import html2canvas from "https://esm.run/html2canvas@1.4.1";
import Sortable from "https://esm.run/sortablejs@1.15.2";

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

/** @type {HTMLElement} */
const blackout = document.querySelector("#blackout");

/** @type {HTMLElement} */
const exportContainer = document.querySelector("#export-container");

/** @type {HTMLImageElement} */
const exportedImage = document.querySelector("#exported-image");

addContainerDrag(imagesBar);

document.querySelector("#new-tier").addEventListener("click", addRow);
document.querySelector("#export-image").addEventListener("click", exportImage);
document.querySelector("#save-image").addEventListener("click", saveImage);
blackout.addEventListener("click", hideBlackout);

document.querySelector("#select-images").addEventListener("change", (e) => {
	const input = /** @type {HTMLInputElement} */ (e.target);
	uploadImages(input.files);
});

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
	const target = /** @type {Element} */ (e.target);

	const ignoreSelectors = [".pcr-app", ".export-container"];
	const ignoreClick = ignoreSelectors.some((selector) =>
		target.closest(selector),
	);

	if (ignoreClick) {
		return;
	}

	/** @type {NodeListOf<HTMLElement>} */
	const visibleMenus = document.querySelectorAll('[data-visibility="visible"]');
	const menuClicked = target.closest(".tier-label");

	if (menuClicked) {
		const tooltip = /** @type {HTMLElement} */ (
			menuClicked.querySelector(".tooltip")
		);

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
	const pickr = new Pickr({
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

function addRow() {
	const newRow = document.createElement("div");
	newRow.className = "row";
	newRow.innerHTML = /* HTML */ `
		<div class="tier-label" style="background-color: ${clearColor}">
			<div class="label-text" contenteditable="true">
				<span>New tier</span>
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
	addRowListeners(newRow, clearColor);
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
		dragInstance.destroy();
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

function uploadImages(files) {
	if (!files) {
		return;
	}

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
	return new Sortable(container, { group: "tiers" });
}

function dynamicStyle(checkbox) {
	document.body.classList.toggle(checkbox.id, checkbox.checked);
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
