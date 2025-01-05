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
		image.src = this.objUrl = URL.createObjectURL(blob);

		this.arrayBuffer = await blob.arrayBuffer();
		this.mime = blob.type;
	};

	/**
	 * @param {ExportedImage} image
	 */
	setImage = (image) =>
		this.setBlob(new Blob([image.bytes], { type: image.mime }));
}

customElements.define("tier-element", TierElement);
