export type Kernel = boolean[][];

/**
 * [Column, Row] offset from the kernel center
 */
export type Offset = [number, number];

export type Piece = {
	name: string;
	kernel: Kernel;
};

export type Team = {
	color: string;
	pieces: Piece[];
};

export const KERNEL_SIZE = 9;

export function emptyKernel(): Kernel {
	const kernel = Array.from({ length: KERNEL_SIZE }, () =>
		Array.from({ length: KERNEL_SIZE }, () => false)
	);
	const center = Math.floor(KERNEL_SIZE / 2);
	kernel[center][center] = true;
	return kernel;
}

export const EMPTY_KERNEL = emptyKernel();

export const DEFAULT_MEMBER = {
	name: "",
	kernel: EMPTY_KERNEL,
};

/**
 * Get the offset coordinates of all active cells in the kernel.
 * Offsets are relative to the kernel center and are in sorted order.
 * @param kernel Kernel to read
 * @returns Sorted offsets of all true cells
 */
export function getKernelOffsets(kernel: Kernel): Offset[] {
	const center = Math.floor(kernel.length / 2);
	const offsets: Offset[] = kernel.reduce(
		(prev, row, r) =>
			prev.concat(
				row.reduce(
					(prev, val, c) => (val ? [...prev, [c - center, r - center]] : prev),
					[] as Offset[]
				)
			),
		[] as Offset[]
	);
	return offsets;
}

/**
 * Apply the given offsets to the kernel, setting the corresponding cells to true.
 * Mutates and returns the kernel for convenience.
 * @param offsets Offsets to apply
 * @param kernel Kernel to modify
 * @returns The same kernel instance, but modified
 */
export function applyOffsetsToKernel(offsets: Offset[], kernel: Kernel): Kernel {
	const halfSize = kernel.length / 2;
	const center = Math.floor(halfSize);
	offsets
		.filter((o) => Math.abs(o[0]) < halfSize && Math.abs(o[1]) < halfSize)
		.forEach((o) => (kernel[center + o[1]][center + o[0]] = true));
	return kernel;
}

export type Preset = {
	name: string;
	offsets: Offset[];
};
export const PRESET_OFFSETS: Preset[] = [
	{ name: "Zero", offsets: [[0, 0]] },
	{
		name: "Knight",
		offsets: [
			[-1, -2],
			[1, -2],
			[-2, -1],
			[2, -1],
			[0, 0],
			[-2, 1],
			[2, 1],
			[-1, 2],
			[1, 2],
		],
	},
	{
		name: "Short Bishop",
		offsets: [
			[-4, -4],
			[4, -4],
			[-3, -3],
			[3, -3],
			[-2, -2],
			[2, -2],
			[-1, -1],
			[1, -1],
			[0, 0],
			[-1, 1],
			[1, 1],
			[-2, 2],
			[2, 2],
			[-3, 3],
			[3, 3],
			[-4, 4],
			[4, 4],
		],
	},
	{
		name: "Short Rook",
		offsets: [
			[0, -4],
			[0, -3],
			[0, -2],
			[0, -1],
			[-4, 0],
			[-3, 0],
			[-2, 0],
			[-1, 0],
			[0, 0],
			[1, 0],
			[2, 0],
			[3, 0],
			[4, 0],
			[0, 1],
			[0, 2],
			[0, 3],
			[0, 4],
		],
	},
	{
		name: "Short Queen",
		offsets: [
			[-4, -4],
			[0, -4],
			[4, -4],
			[-3, -3],
			[0, -3],
			[3, -3],
			[-2, -2],
			[0, -2],
			[2, -2],
			[-1, -1],
			[0, -1],
			[1, -1],
			[-4, 0],
			[-3, 0],
			[-2, 0],
			[-1, 0],
			[0, 0],
			[1, 0],
			[2, 0],
			[3, 0],
			[4, 0],
			[-1, 1],
			[0, 1],
			[1, 1],
			[-2, 2],
			[0, 2],
			[2, 2],
			[-3, 3],
			[0, 3],
			[3, 3],
			[-4, 4],
			[0, 4],
			[4, 4],
		],
	},
	{
		name: "King",
		offsets: [
			[-1, -1],
			[0, -1],
			[1, -1],
			[-1, 0],
			[0, 0],
			[1, 0],
			[-1, 1],
			[0, 1],
			[1, 1],
		],
	},
	{
		name: "Wazir",
		offsets: [
			[0, -1],
			[-1, 0],
			[0, 0],
			[1, 0],
			[0, 1],
		],
	},
	{
		name: "Dabbaba",
		offsets: [
			[0, -2],
			[-2, 0],
			[0, 0],
			[2, 0],
			[0, 2],
		],
	},
	{
		name: "Threeleaper",
		offsets: [
			[0, -3],
			[-3, 0],
			[0, 0],
			[3, 0],
			[0, 3],
		],
	},
	{
		name: "Fourleaper",
		offsets: [
			[0, -4],
			[-4, 0],
			[0, 0],
			[4, 0],
			[0, 4],
		],
	},
	{
		name: "Ferz",
		offsets: [
			[-1, -1],
			[1, -1],
			[0, 0],
			[-1, 1],
			[1, 1],
		],
	},
	{
		name: "Alfil",
		offsets: [
			[-2, -2],
			[2, -2],
			[0, 0],
			[-2, 2],
			[2, 2],
		],
	},
	{
		name: "Tripper",
		offsets: [
			[-3, -3],
			[3, -3],
			[0, 0],
			[-3, 3],
			[3, 3],
		],
	},
	{
		name: "Commuter",
		offsets: [
			[-4, -4],
			[4, -4],
			[0, 0],
			[-4, 4],
			[4, 4],
		],
	},
	{
		name: "Camel",
		offsets: [
			[-1, -3],
			[1, -3],
			[-3, -1],
			[3, -1],
			[0, 0],
			[-3, 1],
			[3, 1],
			[-1, 3],
			[1, 3],
		],
	},
	{
		name: "Zebra",
		offsets: [
			[-2, -3],
			[2, -3],
			[-3, -2],
			[3, -2],
			[0, 0],
			[-3, 2],
			[3, 2],
			[-2, 3],
			[2, 3],
		],
	},
	{
		name: "Giraffe",
		offsets: [
			[-1, -4],
			[1, -4],
			[-4, -1],
			[4, -1],
			[0, 0],
			[-4, 1],
			[4, 1],
			[-1, 4],
			[1, 4],
		],
	},
	{
		name: "Stag",
		offsets: [
			[-2, -4],
			[2, -4],
			[-4, -2],
			[4, -2],
			[0, 0],
			[-4, 2],
			[4, 2],
			[-2, 4],
			[2, 4],
		],
	},
	{
		name: "Antelope",
		offsets: [
			[-3, -4],
			[3, -4],
			[-4, -3],
			[4, -3],
			[0, 0],
			[-4, 3],
			[4, 3],
			[-3, 4],
			[3, 4],
		],
	},
	{
		name: "Nightrider",
		offsets: [
			[-2, -4],
			[2, -4],
			[-4, -2],
			[-1, -2],
			[1, -2],
			[4, -2],
			[-2, -1],
			[2, -1],
			[0, 0],
			[-2, 1],
			[2, 1],
			[-4, 2],
			[-1, 2],
			[1, 2],
			[4, 2],
			[-2, 4],
			[2, 4],
		],
	},
	{
		name: "Full",
		offsets: Array.from({ length: KERNEL_SIZE }, (_, r) =>
			Array.from(
				{ length: KERNEL_SIZE },
				(_, c) => [c - Math.floor(KERNEL_SIZE / 2), r - Math.floor(KERNEL_SIZE / 2)] as Offset
			)
		).flat(),
	},
];

/**
 * Find the name of the preset kernel that has the given offsets
 * @param offsets Sorted offsets
 * @returns The name of the matching preset, otherwise undefined
 */
export function getPresetName(offsets: Offset[]): string | undefined {
	return PRESET_OFFSETS.find((preset) => {
		return (
			preset.offsets.length == offsets.length &&
			offsets.every(
				(offset, i) => offset[0] === preset.offsets[i][0] && offset[1] === preset.offsets[i][1]
			)
		);
	})?.name;
}

/**
 * Sort the offsets from top to bottom and then left to right
 * @param offsets Offsets to sort
 * @return Sorted offsets
 */
export function sortOffsets(offsets: Offset[]): Offset[] {
	return [...offsets].sort(([colA, rowA], [colB, rowB]) =>
		rowA !== rowB ? rowA - rowB : colA - colB
	);
}
