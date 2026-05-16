import { describe, it, expect } from "vitest";

describe("hello world test", () => {
	it("should assert hello world", () => {
		expect("hello world").toBe("hello world");
	});
});
