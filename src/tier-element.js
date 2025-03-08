export default class TierElement extends HTMLElement {
	/** @type {string} */
	#objUrl;
	/** @type {ArrayBuffer} */
	#arrayBuffer;
	/** @type {string} */
	#mime;

	/**
	 * @param {Blob} blob
	 */
	setBlob = async (blob) => {
		const image = new Image();
		image.src = URL.createObjectURL(blob);

		this.appendChild(image);

		this.#objUrl = image.src;
		this.#arrayBuffer = await blob.arrayBuffer();
		this.#mime = blob.type;
	};

	/**
	 * @param {ExportedImage} image
	 */
	setImage = (image) =>
		this.setBlob(new Blob([image.bytes], { type: image.mime }));

	/**
	 * @returns {ExportedImage}
	 */
	getImage = () => ({
		bytes: new Uint8Array(this.#arrayBuffer),
		mime: this.#mime,
	});

	revokeImageUrl = () => {
		URL.revokeObjectURL(this.#objUrl);
	};
}

customElements.define("tier-element", TierElement);
