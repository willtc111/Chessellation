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

const KERNEL_SIZE = 9;

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
			[-2, -1],
			[-2, 1],
			[-1, -2],
			[-1, 2],
			[0, 0],
			[1, -2],
			[1, 2],
			[2, -1],
			[2, 1],
		],
	},
	{
		name: "Short Bishop",
		offsets: [
			[-4, -4],
			[-4, 4],
			[-3, -3],
			[-3, 3],
			[-2, -2],
			[-2, 2],
			[-1, -1],
			[-1, 1],
			[0, 0],
			[1, -1],
			[1, 1],
			[2, -2],
			[2, 2],
			[3, -3],
			[3, 3],
			[4, -4],
			[4, 4],
		],
	},
	{
		name: "Short Rook",
		offsets: [
			[0, -4],
			[0, 4],
			[0, -3],
			[0, 3],
			[0, -2],
			[0, 2],
			[0, -1],
			[0, 1],
			[0, 0],
			[-1, 0],
			[1, 0],
			[-2, 0],
			[2, 0],
			[-3, 0],
			[3, 0],
			[-4, 0],
			[4, 0],
		],
	},
	{
		name: "Short Queen",
		offsets: [
			[-4, -4],
			[-4, 0],
			[-4, 4],
			[-3, -3],
			[-3, 0],
			[-3, 3],
			[-2, -2],
			[-2, 0],
			[-2, 2],
			[-1, -1],
			[-1, 0],
			[-1, 1],
			[0, -4],
			[0, -3],
			[0, -2],
			[0, -1],
			[0, 0],
			[0, 1],
			[0, 2],
			[0, 3],
			[0, 4],
			[1, -1],
			[1, 0],
			[1, 1],
			[2, -2],
			[2, 0],
			[2, 2],
			[3, -3],
			[3, 0],
			[3, 3],
			[4, -4],
			[4, 0],
			[4, 4],
		],
	},
	{
		name: "King",
		offsets: [
			[-1, 0],
			[0, -1],
			[0, 0],
			[0, 1],
			[1, 0],
			[-1, -1],
			[-1, 1],
			[1, -1],
			[1, 1],
		],
	},
	{
		name: "Wazir",
		offsets: [
			[-1, 0],
			[0, -1],
			[0, 0],
			[0, 1],
			[1, 0],
		],
	},
	{
		name: "Dabbaba",
		offsets: [
			[-2, 0],
			[0, -2],
			[0, 0],
			[0, 2],
			[2, 0],
		],
	},
	{
		name: "Threeleaper",
		offsets: [
			[-3, 0],
			[0, -3],
			[0, 0],
			[0, 3],
			[3, 0],
		],
	},
	{
		name: "Fourleaper",
		offsets: [
			[-4, 0],
			[0, -4],
			[0, 0],
			[0, 4],
			[4, 0],
		],
	},
	{
		name: "Ferz",
		offsets: [
			[-1, -1],
			[-1, 1],
			[0, 0],
			[1, -1],
			[1, 1],
		],
	},
	{
		name: "Alfil",
		offsets: [
			[-2, -2],
			[-2, 2],
			[0, 0],
			[2, -2],
			[2, 2],
		],
	},
	{
		name: "Tripper",
		offsets: [
			[-3, -3],
			[-3, 3],
			[0, 0],
			[3, -3],
			[3, 3],
		],
	},
	{
		name: "Commuter",
		offsets: [
			[-4, -4],
			[-4, 4],
			[0, 0],
			[4, -4],
			[4, 4],
		],
	},
	{
		name: "Camel",
		offsets: [
			[-3, -1],
			[-3, 1],
			[-1, -3],
			[-1, 3],
			[0, 0],
			[1, -3],
			[1, 3],
			[3, -1],
			[3, 1],
		],
	},
	{
		name: "Zebra",
		offsets: [
			[-3, -2],
			[-3, 2],
			[-2, -3],
			[-2, 3],
			[0, 0],
			[2, -3],
			[2, 3],
			[3, -2],
			[3, 2],
		],
	},
	{
		name: "Giraffe",
		offsets: [
			[-4, -1],
			[-4, 1],
			[-1, -4],
			[-1, 4],
			[0, 0],
			[1, -4],
			[1, 4],
			[4, -1],
			[4, 1],
		],
	},
	{
		name: "Stag",
		offsets: [
			[-4, -2],
			[-4, 2],
			[-2, -4],
			[-2, 4],
			[0, 0],
			[2, -4],
			[2, 4],
			[4, -2],
			[4, 2],
		],
	},
	{
		name: "Antelope",
		offsets: [
			[-4, -3],
			[-4, 3],
			[-3, -4],
			[-3, 4],
			[0, 0],
			[3, -4],
			[3, 4],
			[4, -3],
			[4, 3],
		],
	},
	{
		name: "Nightrider",
		offsets: [
			[-2, -1],
			[-2, 1],
			[-1, -2],
			[-1, 2],
			[0, 0],
			[1, -2],
			[1, 2],
			[2, -1],
			[2, 1],
			[-4, -2],
			[-4, 2],
			[-2, -4],
			[-2, 4],
			[2, -4],
			[2, 4],
			[4, -2],
			[4, 2],
		],
	},
];
