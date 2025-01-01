export default class TierElement extends HTMLElement {
	/**
	 * @param {Blob} blob
	 */
	setBlob = (blob) => {
		const image = new Image();
		image.onload = () => {
			this.style.aspectRatio = `${image.width} / ${image.height}`;
			this.style.backgroundImage = `url("${image.src}")`;
			this.style.minHeight = `${Math.min(image.height, 80)}px`;
		};
		image.src = URL.createObjectURL(blob);

		this.blob = blob;
	};

	/**
	 * @param {string} dataUrl
	 */
	setDataUrl = (dataUrl) => {
		fetch(dataUrl)
			.then((response) => response.blob())
			.then((blob) => this.setBlob(blob));
	};

	getDataUrl = () => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result);
			reader.onerror = () => reject(reader.error);
			reader.readAsDataURL(this.blob);
		});
	};
}

customElements.define("tier-element", TierElement);
