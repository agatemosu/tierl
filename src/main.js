import * as msgpack from "@msgpack/msgpack";
import imageCompression from "browser-image-compression";
import dayjs from "dayjs";
import Sortable from "sortablejs";
import TierElement from "./tier-element.js";
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
	document.body.classList.add("loading");

	const imagesBar = document.querySelector("#images-bar");
	const imagePromises = [];

	for (const file of files) {
		if (file.type.split("/")[0] !== "image") {
			continue;
		}

		const tierElement = new TierElement();
		imagesBar.appendChild(tierElement);

		const imagePromise = imageCompression(file, {
			maxWidthOrHeight: 480,
		}).then(tierElement.setBlob);

		imagePromises.push(imagePromise);
	}

	Promise.all(imagePromises).then(() => {
		document.body.classList.remove("loading");
	});
}

/**
 * @param {Event} e
 */
function dynamicStyle(e) {
	const checkbox = /** @type {HTMLInputElement} */ (e.target);
	document.body.classList.toggle(checkbox.id, checkbox.checked);
}

function gatherAll() {
	const imagesBar = document.querySelector("#images-bar");
	const images = document.querySelectorAll(".tier-content tier-element");

	for (const image of images) {
		imagesBar.appendChild(image);
	}
}

async function exportList() {
	/** @type {NodeListOf<TierRow>} */
	const tiers = document.querySelectorAll("tier-row");

	/** @type {ExportData[]} */
	const list = [];

	for (const tier of tiers) {
		/** @type {NodeListOf<TierElement>} */
		const tierElements = tier.querySelectorAll("tier-element");

		/** @type {ExportData} */
		const tierData = {
			color: tier.color,
			name: tier.name,
			images: [],
		};

		for (const el of tierElements) {
			tierData.images.push(el.getImage());
		}

		list.push(tierData);
	}

	const data = msgpack.encode(list);
	const blob = new Blob([data], { type: "application/vnd.msgpack" });
	const url = URL.createObjectURL(blob);

	const date = dayjs().format("YYYY-MM-DD HH_mm_ss");
	const a = document.createElement("a");
	a.href = url;
	a.download = `Exported tier list ${date}.msgpack`;
	a.click();

	URL.revokeObjectURL(url);
}

function importList() {
	const mainContainer = document.querySelector("main");
	const input = document.createElement("input");

	input.type = "file";
	input.accept = ".msgpack";

	input.onchange = async () => {
		/** @type {NodeListOf<TierRow>} */
		const tiers = document.querySelectorAll("tier-row");
		for (const tier of tiers) {
			tier.deleteRow();
		}

		const file = new Uint8Array(await input.files[0].arrayBuffer());
		const data = /** @type {ExportData[]} */ (msgpack.decode(file));

		for (const tierData of data) {
			const tier = new TierRow();
			const sortContainer = tier.querySelector(".sort");
			mainContainer.appendChild(tier);

			tier.color = tierData.color;
			tier.name = tierData.name;

			for (const imageData of tierData.images) {
				const tierElement = new TierElement();
				tierElement.setImage(imageData);
				sortContainer.appendChild(tierElement);
			}
		}
	};
	input.click();
}

// #endregion

// #region Setup

function main() {
	/** @type {HTMLElement} */
	const imagesBar = document.querySelector("#images-bar");
	Sortable.create(imagesBar, { group: TierRow.sortableGroup });

	/** @type {[string, EventListener][]} */
	const eventMap = [
		["#new-tier", addNewTier],
		["#select-images", selectImages],
		["#gather-all", gatherAll],
		["#export-list", exportList],
		["#import-list", importList],
	];

	for (const [selector, handler] of eventMap) {
		const element = document.querySelector(selector);
		element.addEventListener("click", handler);
	}

	const checkboxes = document.querySelectorAll(".dynamic-style");
	for (const checkbox of checkboxes) {
		checkbox.addEventListener("change", dynamicStyle);
	}
}

main();

// #endregion
