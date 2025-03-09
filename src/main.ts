import * as msgpack from "@msgpack/msgpack";
import imageCompression from "browser-image-compression";
import dayjs from "dayjs";
import Sortable from "sortablejs";
import TierElement from "./tier-element.ts";
import TierRow from "./tier-row.ts";

// #region Document events

document.addEventListener("drop", (e) => {
	e.preventDefault();
	uploadImages(e.dataTransfer.files);
});

document.addEventListener("dragover", (e) => {
	e.preventDefault();
});

document.addEventListener("mousedown", (e) => {
	const target = e.target as Element;

	const ignoreSelectors = [".pcr-app"];
	const ignoreClick = ignoreSelectors.some((selector) =>
		target.closest(selector),
	);

	if (ignoreClick) {
		return;
	}

	const visibleMenus = document.querySelectorAll<HTMLElement>(
		'[data-visibility="visible"]',
	);

	for (const menu of visibleMenus) {
		menu.dataset.visibility = "hidden";
	}

	const menuClicked = target.closest(".tier-label");
	if (menuClicked) {
		const tooltip = menuClicked.querySelector<HTMLElement>(".tier-tooltip");

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

function uploadImages(files: FileList) {
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

function dynamicStyle(e: Event) {
	const checkbox = e.target as HTMLInputElement;
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
	const tiers = Array.from(document.querySelectorAll("tier-row"));

	const list: ExportData[] = tiers.map((tier) => {
		const tierElements = Array.from(tier.querySelectorAll("tier-element"));

		return {
			color: tier.color,
			name: tier.name,
			images: tierElements.map((el) => el.getImage()),
		};
	});

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
		const tiers = document.querySelectorAll("tier-row");
		for (const tier of tiers) {
			tier.deleteRow();
		}

		const file = new Uint8Array(await input.files[0].arrayBuffer());
		const data = msgpack.decode(file) as ExportData[];

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
	const imagesBar = document.querySelector<HTMLElement>("#images-bar");
	Sortable.create(imagesBar, { group: TierRow.sortableGroup });

	const eventMap: [string, EventListener][] = [
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
