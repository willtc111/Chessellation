import { convertToTeams, decodeInputs } from "$lib/input";
import type { PageLoad } from "./$types";

export const load: PageLoad = ({ url }) => {
	try {
		const encoded = url.searchParams.get("t") ?? "";
		// const encodingVersion = url.searchParams.get('v') ?? '';
		const teams = convertToTeams(decodeInputs(encoded));
		return { teams };
	} catch {
		return { teams: [], error: "No valid chessellation inputs" };
	}
};
