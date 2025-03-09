export default class TierElement extends HTMLElement {
	private objUrl: string;
	private arrayBuffer: ArrayBuffer;
	private mime: string;

	public readonly setBlob = async (blob: Blob) => {
		const image = new Image();
		image.src = URL.createObjectURL(blob);

		this.appendChild(image);

		this.objUrl = image.src;
		this.arrayBuffer = await blob.arrayBuffer();
		this.mime = blob.type;
	};

	public readonly setImage = (image: ExportedImage) =>
		this.setBlob(new Blob([image.bytes], { type: image.mime }));

	public readonly getImage = (): ExportedImage => ({
		bytes: new Uint8Array(this.arrayBuffer),
		mime: this.mime,
	});

	public readonly revokeImageUrl = () => {
		URL.revokeObjectURL(this.objUrl);
	};
}

customElements.define("tier-element", TierElement);

declare global {
	interface HTMLElementTagNameMap {
		"tier-element": TierElement;
	}
}
