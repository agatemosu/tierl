interface ExportedImage {
	bytes: Uint8Array;
	mime: string;
}

interface ExportData {
	color: string;
	name: string;
	images: ExportedImage[];
}
