import Pickr from "https://esm.run/@simonwep/pickr@1.9.1";
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

addContainerDrag(imagesBar);

document.querySelector("#new-tier").addEventListener("click", addRow);

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

	const ignoreSelectors = [".pcr-app"];
	const ignoreClick = ignoreSelectors.some((selector) =>
		target.closest(selector),
	);

	if (ignoreClick) {
		return;
	}

	/** @type {NodeListOf<HTMLElement>} */
	const visibleMenus = document.querySelectorAll('[data-visibility="visible"]');
	
	for (const menu of visibleMenus) {
		menu.dataset.visibility = "hidden";
	}
	
	const menuClicked = target.closest(".tier-label");
	if (menuClicked) {
		const tooltip = /** @type {HTMLElement} */ (
			menuClicked.querySelector(".tooltip")
		);

		tooltip.dataset.visibility = "visible";
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
		<div class="tier-options">
			<div class="options-container">
				<div class="option delete"><i></i></div>
				<div class="option up"><i></i></div>
				<div class="option down"><i></i></div>
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

	const deleteButton = row.querySelector(".option.delete i");
	const upButton = row.querySelector(".option.up i");
	const downButton = row.querySelector(".option.down i");

	const pickr = createColorPicker(colorPicker, tierLabel, defaultColor);
	const dragInstance = addContainerDrag(tierSort);

	deleteButton.onclick = () => {
		pickr.destroyAndRemove();
		dragInstance.destroy();
		row.remove();
	};
	upButton.onclick = () => {
		if (row.previousElementSibling) {
			row.parentElement.insertBefore(row, row.previousElementSibling);
		}
	};
	downButton.onclick = () => {
		if (row.nextElementSibling) {
			row.parentElement.insertBefore(row.nextElementSibling, row);
		}
	};
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
