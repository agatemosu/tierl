import Sortable from "sortablejs";
import TierRow from "./tier-row.js";

// #region Document events

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
			menuClicked.querySelector(".tier-tooltip")
		);

		tooltip.dataset.visibility = "visible";
	}
});

// #endregion

// #region Specific handlers

function addNewTier() {
	const mainContainer = document.querySelector("main");
	const newTier = new TierRow();

	mainContainer.appendChild(newTier);
}

/**
 * @param {Event} e
 */
function selectImages(e) {
	const input = /** @type {HTMLInputElement} */ (e.target);
	uploadImages(input.files);
}

/**
 * @param {FileList} files
 */
function uploadImages(files) {
	const imagesBar = document.querySelector("#images-bar");

	for (const file of files) {
		if (file.type.split("/")[0] !== "image") {
			continue;
		}

		const imageEl = document.createElement("div");
		imageEl.classList.add("tier-element");
		imagesBar.appendChild(imageEl);

		const image = new Image();
		image.onload = () => {
			imageEl.style.aspectRatio = `${image.width} / ${image.height}`;
			imageEl.style.backgroundImage = `url("${image.src}")`;
			imageEl.style.minHeight = `${Math.min(image.height, 80)}px`;
		};
		image.src = URL.createObjectURL(file);
	}
}

/**
 * @param {Event} e
 */
function dynamicStyle(e) {
	const checkbox = /** @type {HTMLInputElement} */ (e.target);
	document.body.classList.toggle(checkbox.id, checkbox.checked);
}

// #endregion

// #region Setup

function main() {
	const newTierButton = document.querySelector("#new-tier");
	const selectImagesButton = document.querySelector("#select-images");
	const imagesBar = document.querySelector("#images-bar");
	const checkboxes = document.querySelectorAll(".dynamic-style");

	newTierButton.addEventListener("click", addNewTier);
	selectImagesButton.addEventListener("change", selectImages);

	Sortable.create(imagesBar, { group: TierRow.sortableGroup });

	for (const checkbox of checkboxes) {
		checkbox.addEventListener("change", dynamicStyle);
	}
}

main();

// #endregion
