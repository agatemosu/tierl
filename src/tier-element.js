export default class TierElement extends HTMLElement {
	/**
	 * @param {Blob} blob
	 */
	setBlob = async (blob) => {
		const image = new Image();
		image.src = URL.createObjectURL(blob);

		this.appendChild(image);
	};
}

customElements.define("tier-element", TierElement);
