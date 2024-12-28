import Pickr from "@simonwep/pickr";
import Sortable from "sortablejs";

const clearColor = "#778899";
const defaultColors = [
	"#ff7f7e",
	"#ffbf7f",
	"#feff7f",
	"#7eff80",
	"#7fffff",
	"#807fff",
	"#ff7ffe",
];

export default class TierRow extends HTMLElement {
	static sortableGroup = "tiers";

	// #region Properties

	get color() {
		return this.getAttribute("color") ?? clearColor;
	}

	get name() {
		return this.getAttribute("name") ?? "New tier";
	}

	// #endregion

	constructor() {
		super();

		this.innerHTML = /* HTML */ `
			<div class="tier-label" style="background-color: ${this.color};">
				<div class="label-text" contenteditable="true">
					<span class="tier-name">${this.name}</span>
				</div>
				<div class="tooltip" data-visibility="hidden"></div>
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
	}

	// #region Lifecycle

	connectedCallback() {
		// Color picker
		this.createColorPicker();

		// Sortable
		const tierSort = this.querySelector(".sort");
		this.sort = new Sortable(tierSort, { group: TierRow.sortableGroup });

		// Options
		const deleteButton = this.querySelector(".option.delete i");
		const upButton = this.querySelector(".option.up i");
		const downButton = this.querySelector(".option.down i");

		deleteButton.addEventListener("click", this.deleteRow);
		upButton.addEventListener("click", this.moveUp);
		downButton.addEventListener("click", this.moveDown);

		// Update tier name
		const tierName = this.querySelector(".label-text");
		tierName.addEventListener("blur", this.nameChanged);
	}

	disconnectedCallback() {
		this.pickr.destroyAndRemove();
		this.sort.destroy();
	}

	// #endregion

	// #region Methods

	createColorPicker = () => {
		// It needs to be created as it's deleted when the row is disconnected
		const colorPicker = document.createElement("div");
		colorPicker.classList.add("color-picker");

		const tooltip = this.querySelector(".tooltip");
		tooltip.appendChild(colorPicker);

		this.pickr = new Pickr({
			el: colorPicker,
			theme: "monolith",
			default: this.color,
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

		this.pickr.on("save", this.colorChanged);
	};

	colorChanged = (color) => {
		if (color === null) {
			this.pickr.setColor(clearColor);
			return;
		}

		const hsl = color.toHSLA();
		const lightness = hsl[2];

		const tierLabel = /** @type {HTMLElement} */ (
			this.querySelector(".tier-label")
		);
		this.setAttribute("color", color.toHEXA().toString());

		tierLabel.style.backgroundColor = color.toHEXA().toString();
		tierLabel.style.color = lightness < 50 ? "white" : "black";

		this.pickr.hide();
	};

	nameChanged = () => {
		const tierName = this.querySelector(".label-text");
		this.setAttribute("name", tierName.firstElementChild.textContent);
	};

	deleteRow = () => {
		this.remove();
	};

	moveUp = () => {
		if (this.previousElementSibling) {
			this.parentElement.insertBefore(this, this.previousElementSibling);
		}
	};

	moveDown = () => {
		if (this.nextElementSibling) {
			this.parentElement.insertBefore(this.nextElementSibling, this);
		}
	};

	// #endregion
}

customElements.define("tier-row", TierRow);