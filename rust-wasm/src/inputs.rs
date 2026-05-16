use serde::Deserialize;

use crate::{kernel::Kernel, piece::Piece, team::Team, team_id::TeamId};

/// Deserialization shape for a piece from JSON
#[derive(Deserialize)]
struct PieceInput {
    name: String,
    offsets: Vec<(i32, i32)>,
}

/// Deserialization shape for a team from JSON
#[derive(Deserialize)]
struct TeamInput {
    #[allow(dead_code)]
    color: String,
    pieces: Vec<PieceInput>,
}

/// Top-level deserialization shape
#[derive(Deserialize)]
pub struct Inputs {
    teams: Vec<TeamInput>,
}

impl Inputs {
    pub fn validate(&self) -> Result<(), String> {
        if self.teams.is_empty() {
            return Err("At least one team is required".to_string());
        }
        for (i, team) in self.teams.iter().enumerate() {
            if team.pieces.is_empty() {
                return Err(format!("Team {} has no pieces", i));
            }
        }
        Ok(())
    }

    pub fn into_teams(self) -> Vec<Team> {
        self.teams
            .into_iter()
            .enumerate()
            .map(|(i, t)| {
                let id = TeamId::new(i as u8).unwrap();
                let pieces = t
                    .pieces
                    .into_iter()
                    .map(|p| Piece::new(p.name, Kernel::new(p.offsets)))
                    .collect();
                Team::new(id, pieces)
            })
            .collect()
    }
}
