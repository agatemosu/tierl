export default class TierElement extends HTMLElement {
	/**
	 * @param {Blob} blob
	 */
	setBlob = async (blob) => {
		const image = new Image();
		image.onload = () => {
			this.style.aspectRatio = `${image.width} / ${image.height}`;
			this.style.backgroundImage = `url("${image.src}")`;
			this.style.minHeight = `${Math.min(image.height, 80)}px`;
		};
		image.src = URL.createObjectURL(blob);
	};
}

customElements.define("tier-element", TierElement);
