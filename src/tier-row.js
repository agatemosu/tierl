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
				<div class="tier-label-text" contenteditable="true">
					<span class="tier-label-content">${this.name}</span>
				</div>
				<div class="tier-tooltip" data-visibility="hidden"></div>
			</div>
			<div class="tier-content sort"></div>
			<div class="tier-options">
				<div class="tier-options-container">
					<div class="tier-option-container tier-option-container-span">
						<button class="tier-option tier-option-delete"></button>
					</div>
					<div class="tier-option-container">
						<button class="tier-option tier-option-up"></button>
					</div>
					<div class="tier-option-container">
						<button class="tier-option tier-option-down"></button>
					</div>
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
		const deleteButton = this.querySelector(".tier-option-delete");
		const upButton = this.querySelector(".tier-option-up");
		const downButton = this.querySelector(".tier-option-down");

		deleteButton.addEventListener("click", this.deleteRow);
		upButton.addEventListener("click", this.moveUp);
		downButton.addEventListener("click", this.moveDown);

		// Update tier name
		const tierName = this.querySelector(".tier-label-text");
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

		const tooltip = this.querySelector(".tier-tooltip");
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

	/**
	 * @param {Pickr.HSVaColor} color
	 */
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
		const tierName = this.querySelector(".tier-label-content");
		this.setAttribute("name", tierName.textContent);
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
