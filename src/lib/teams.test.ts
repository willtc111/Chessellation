// Test that all presets have offsets in sorted order

// Test that KernelToOffsets produces offsets in sorted order

// Test that sorting works and is idempotent

// Test that get preset name works

import { describe, it, expect } from "vitest";
import {
	emptyKernel,
	getKernelOffsets,
	applyOffsetsToKernel,
	getPresetName,
	sortOffsets,
	PRESET_OFFSETS,
	EMPTY_KERNEL,
	KERNEL_SIZE,
	type Kernel,
	type Offset,
} from "$lib/teams";

describe("emptyKernel", () => {
	it("should return a correctly sized grid", () => {
		const kernel = emptyKernel();
		expect(kernel.length).toBe(KERNEL_SIZE);
		kernel.forEach((row) => expect(row.length).toBe(KERNEL_SIZE));
	});

	it("should have only the center cell set to true", () => {
		const kernel = emptyKernel();
		kernel.forEach((row, r) => row.forEach((val, c) => expect(val).toBe(r === 4 && c === 4)));
	});

	it("should return a new instance each time", () => {
		expect(emptyKernel()).not.toBe(emptyKernel());
	});
});

describe("getKernelOffsets", () => {
	it("should return only [0, 0] for the empty kernel", () => {
		expect(getKernelOffsets(EMPTY_KERNEL)).toEqual([[0, 0]]);
	});

	it("should return correct offsets for a manually constructed kernel", () => {
		const kernel = emptyKernel();
		kernel[3][4] = true; // col 0, row -1
		kernel[4][6] = true; // col 2, row 0
		const offsets = getKernelOffsets(kernel);
		expect(offsets).toContainEqual([0, -1]);
		expect(offsets).toContainEqual([2, 0]);
		expect(offsets).toContainEqual([0, 0]);
	});

	it("should return offsets in sorted order", () => {
		const kernel = emptyKernel();
		// Set a few scattered cells
		kernel[0][0] = true;
		kernel[8][8] = true;
		kernel[2][6] = true;
		kernel[5][1] = true;
		kernel[4][4] = true;
		const offsets = getKernelOffsets(kernel);
		expect(offsets).toEqual(sortOffsets(offsets));
	});

	it("should return 81 offsets for a full kernel", () => {
		const kernel: Kernel = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => true));
		expect(getKernelOffsets(kernel).length).toBe(81);
	});

	it("should be the inverse of applyOffsetsToKernel", () => {
		const offsets: Offset[] = [
			[-1, -2],
			[1, -2],
			[-2, -1],
			[2, -1],
			[0, 0],
			[-2, 1],
			[2, 1],
			[-1, 2],
			[1, 2],
		]; // Knight
		const kernel = emptyKernel();
		expect(getKernelOffsets(applyOffsetsToKernel(offsets, kernel))).toEqual(offsets);
	});
});

describe("applyOffsetsToKernel", () => {
	it("should set cells corresponding to given offsets", () => {
		const kernel = emptyKernel();
		applyOffsetsToKernel(
			[
				[1, 0],
				[0, 1],
			],
			kernel
		);
		expect(kernel[4][5]).toBe(true); // col+1
		expect(kernel[5][4]).toBe(true); // row+1
	});

	it("should ignore offsets outside the kernel bounds", () => {
		const kernel = emptyKernel();
		applyOffsetsToKernel(
			[
				[10, 10],
				[-10, -10],
			],
			kernel
		);
		const offsets = getKernelOffsets(kernel);
		expect(offsets).toEqual([[0, 0]]);
	});

	it("should be the inverse of getKernelOffsets", () => {
		const kernel = emptyKernel(); // Knight
		kernel[3][2] = true; // [-1, -2],
		kernel[5][2] = true; // [1, -2],
		kernel[2][3] = true; // [-2, -1],
		kernel[6][3] = true; // [2, -1],
		kernel[4][4] = true; // [0, 0],
		kernel[2][5] = true; // [-2, 1],
		kernel[6][5] = true; // [2, 1],
		kernel[3][6] = true; // [-1, 2],
		kernel[5][6] = true; // [1, 2],
		const offsets = getKernelOffsets(kernel);
		const result = applyOffsetsToKernel(offsets, kernel);
		expect(result).toEqual(kernel);
	});
});

describe("sortOffsets", () => {
	it("should sort top to bottom, then left to right", () => {
		const input: Offset[] = [
			[1, 2],
			[-1, -2],
			[0, 0],
			[1, -2],
			[-1, 2],
		];
		const sorted = sortOffsets(input);
		expect(sorted).toEqual([
			[-1, -2],
			[1, -2],
			[0, 0],
			[-1, 2],
			[1, 2],
		]);
	});

	it("should not mutate the original array", () => {
		const input: Offset[] = [
			[1, 0],
			[-1, 0],
		];
		const copy = [...input];
		sortOffsets(input);
		expect(input).toEqual(copy);
	});

	it("should be idempotent", () => {
		const input: Offset[] = [
			[2, -1],
			[0, 0],
			[-1, 3],
			[1, -1],
		];
		const once = sortOffsets(input);
		const twice = sortOffsets(once);
		expect(twice).toEqual(once);
	});

	it("should handle an empty array", () => {
		expect(sortOffsets([])).toEqual([]);
	});

	it("should handle a single offset", () => {
		const input: Offset[] = [[3, -2]];
		expect(sortOffsets(input)).toEqual([[3, -2]]);
	});

	it("should handle offsets all in the same row", () => {
		const input: Offset[] = [
			[3, 0],
			[-1, 0],
			[0, 0],
		];
		expect(sortOffsets(input)).toEqual([
			[-1, 0],
			[0, 0],
			[3, 0],
		]);
	});

	it("should handle offsets all in the same column", () => {
		const input: Offset[] = [
			[0, 3],
			[0, -1],
			[0, 0],
		];
		expect(sortOffsets(input)).toEqual([
			[0, -1],
			[0, 0],
			[0, 3],
		]);
	});
});

describe("PRESET_OFFSETS", () => {
	it("should have at least one preset", () => {
		expect(PRESET_OFFSETS.length).toBeGreaterThan(0);
	});

	it("every preset should have a non-empty name", () => {
		PRESET_OFFSETS.forEach((preset) => {
			expect(preset.name).toBeTruthy();
		});
	});

	it("every preset should have at least one offset", () => {
		PRESET_OFFSETS.forEach((preset) => {
			expect(preset.offsets.length).toBeGreaterThan(0);
		});
	});

	it("every preset should be stored in sorted order", () => {
		PRESET_OFFSETS.forEach((preset) => {
			expect(preset.offsets).toEqual(sortOffsets(preset.offsets));
		});
	});

	it("preset names should be unique", () => {
		const names = PRESET_OFFSETS.map((p) => p.name);
		expect(new Set(names).size).toBe(names.length);
	});
});

describe("getPresetName", () => {
	it('should return "Full" for 81 offsets', () => {
		const offsets: Offset[] = Array.from({ length: 81 }, (_, i) => [
			(i % 9) - 4,
			Math.floor(i / 9) - 4,
		]);
		expect(getPresetName(offsets)).toBe("Full");
	});

	it("should return the correct name for each stored preset", () => {
		PRESET_OFFSETS.forEach((preset) => {
			expect(getPresetName(preset.offsets)).toBe(preset.name);
		});
	});

	it("should return undefined for an unrecognized offset pattern", () => {
		const offsets: Offset[] = sortOffsets([
			[1, 1],
			[0, 0],
			[-1, -1],
		]);
		const result = getPresetName(offsets);
		expect(result).toBe(undefined);
	});

	it("should return undefined for an empty offset list", () => {
		expect(getPresetName([])).toBeUndefined();
	});
});
