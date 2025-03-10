import Pickr from "@simonwep/pickr";
import Sortable from "sortablejs";

export default class TierRow extends HTMLElement {
	public static sortableGroup = "tiers";
	private static clearColor = "#778899";
	private static defaultColors = [
		"#ff7f7e",
		"#ffbf7f",
		"#feff7f",
		"#7eff80",
		"#7fffff",
		"#807fff",
		"#ff7ffe",
	];

	private sort: Sortable;
	private pickr: Pickr;

	// #region Properties

	public get color() {
		return this.getAttribute("color") ?? TierRow.clearColor;
	}

	public get name() {
		return this.getAttribute("name") ?? "New tier";
	}

	public set color(value) {
		this.pickr.setColor(value);

		// If pickr is not initialized, set the color when it is
		this.pickr.on("init", () => {
			this.pickr.setColor(value);
		});
	}

	public set name(value) {
		this.querySelector(".tier-label-content").textContent = value;
		this.nameChanged();
	}

	// #endregion

	public constructor() {
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

	public connectedCallback() {
		// Color picker
		this.createColorPicker();

		// Sortable
		const tierSort = this.querySelector<HTMLElement>(".sort");
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

	public disconnectedCallback() {
		this.pickr.destroyAndRemove();
		this.sort.destroy();
	}

	// #endregion

	// #region Methods

	private readonly createColorPicker = () => {
		// It needs to be created as it's deleted when the row is disconnected
		const colorPicker = document.createElement("div");

		const tooltip = this.querySelector(".tier-tooltip");
		tooltip.appendChild(colorPicker);

		this.pickr = new Pickr({
			el: colorPicker,
			theme: "monolith",
			default: this.color,
			swatches: TierRow.defaultColors,
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

	private readonly colorChanged = (color: Pickr.HSVaColor | null) => {
		if (color === null) {
			this.pickr.setColor(TierRow.clearColor);
			return;
		}

		const hsl = color.toHSLA();
		const lightness = hsl[2];

		const tierLabel = this.querySelector<HTMLElement>(".tier-label");
		this.setAttribute("color", color.toHEXA().toString());

		tierLabel.style.backgroundColor = color.toHEXA().toString();
		tierLabel.style.color = lightness < 50 ? "white" : "black";

		this.pickr.hide();
	};

	private readonly nameChanged = () => {
		const tierName = this.querySelector(".tier-label-content");
		this.setAttribute("name", tierName.textContent);
	};

	private readonly moveUp = () => {
		if (this.previousElementSibling) {
			this.parentElement.insertBefore(this, this.previousElementSibling);
		}
	};

	private readonly moveDown = () => {
		if (this.nextElementSibling) {
			this.parentElement.insertBefore(this.nextElementSibling, this);
		}
	};

	public readonly deleteRow = () => {
		const elements = this.querySelectorAll("tier-element");
		for (const element of elements) {
			element.revokeImageUrl();
		}

		this.remove();
	};

	// #endregion
}

customElements.define("tier-row", TierRow);

declare global {
	interface HTMLElementTagNameMap {
		"tier-row": TierRow;
	}
}
