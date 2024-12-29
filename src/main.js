import imageCompression from "browser-image-compression";
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

function selectImages() {
	const input = document.createElement("input");

	input.type = "file";
	input.accept = "image/*";
	input.multiple = true;

	input.onchange = () => uploadImages(input.files);
	input.click();
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

		imageCompression(file, {
			maxWidthOrHeight: 480,
		}).then((compressedFile) => {
			const image = new Image();
			image.onload = () => {
				imageEl.style.aspectRatio = `${image.width} / ${image.height}`;
				imageEl.style.backgroundImage = `url("${image.src}")`;
				imageEl.style.minHeight = `${Math.min(image.height, 80)}px`;
			};
			image.src = URL.createObjectURL(compressedFile);
		});
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

function setUpSortable() {
	/** @type {HTMLElement} */
	const imagesBar = document.querySelector("#images-bar");
	Sortable.create(imagesBar, { group: TierRow.sortableGroup });
}

function setUpEvents() {
	const newTierButton = document.querySelector("#new-tier");
	const selectImagesButton = document.querySelector("#select-images");
	const checkboxes = document.querySelectorAll(".dynamic-style");

	newTierButton.addEventListener("click", addNewTier);
	selectImagesButton.addEventListener("click", selectImages);

	for (const checkbox of checkboxes) {
		checkbox.addEventListener("change", dynamicStyle);
	}
}

setUpSortable();
setUpEvents();

// #endregion
