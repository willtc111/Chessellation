import {
	applyOffsetsToKernel,
	emptyKernel,
	getKernelOffsets,
	type Offset,
	type Team,
} from "./teams";

type InputPiece = {
	name: string;
	offsets: Offset[];
};

type InputTeam = {
	color: string;
	pieces: InputPiece[];
};

type Inputs = {
	teams: InputTeam[];
};

export function convertToInputs(teams: Team[]): Inputs {
	return {
		teams: teams.map((team) => ({
			color: team.color,
			pieces: team.pieces.map((piece) => ({
				name: piece.name,
				offsets: getKernelOffsets(piece.kernel),
			})),
		})),
	};
}

export function encodeInputs(inputs: Inputs): string {
	return btoa(JSON.stringify(inputs));
}

export function decodeInputs(encoded: string): Inputs {
	return JSON.parse(atob(encoded));
}

export function convertToTeams(inputs: Inputs): Team[] {
	return inputs.teams.map((inputTeam) => ({
		color: inputTeam.color,
		pieces: inputTeam.pieces.map((inpitPiece) => ({
			name: inpitPiece.name,
			kernel: applyOffsetsToKernel(inpitPiece.offsets, emptyKernel()),
		})),
	}));
}
