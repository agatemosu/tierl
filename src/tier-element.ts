export default class TierElement extends HTMLElement {
	#objUrl: string;
	#arrayBuffer: ArrayBuffer;
	#mime: string;

	setBlob = async (blob: Blob) => {
		const image = new Image();
		image.src = URL.createObjectURL(blob);

		this.appendChild(image);

		this.#objUrl = image.src;
		this.#arrayBuffer = await blob.arrayBuffer();
		this.#mime = blob.type;
	};

	setImage = (image: ExportedImage) =>
		this.setBlob(new Blob([image.bytes], { type: image.mime }));

	getImage = (): ExportedImage => ({
		bytes: new Uint8Array(this.#arrayBuffer),
		mime: this.#mime,
	});

	revokeImageUrl = () => {
		URL.revokeObjectURL(this.#objUrl);
	};
}

customElements.define("tier-element", TierElement);

declare global {
	interface HTMLElementTagNameMap {
		"tier-element": TierElement;
	}
}
