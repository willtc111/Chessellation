use wasm_bindgen::prelude::*;

use crate::{
    inputs::Inputs,
    spiralgrid::{SpiralGrid, index_to_xy, next_xy},
    team::Team,
};

#[wasm_bindgen]
pub struct Chessellator {
    grid: SpiralGrid,
    teams: Vec<Team>,
    changes: Vec<(i32, i32, u8)>,
}

#[wasm_bindgen]
impl Chessellator {
    pub fn new(inputs_json: &str) -> Result<Chessellator, JsValue> {
        let inputs: Inputs =
            serde_json::from_str(inputs_json).map_err(|e| JsValue::from_str(&e.to_string()))?;

        inputs.validate().map_err(|e| JsValue::from_str(&e))?;

        Ok(Self {
            grid: SpiralGrid::new(),
            teams: inputs.into_teams(),
            changes: Vec::new(),
        })
    }

    fn update_queue(&mut self, last_index: usize) {
        self.teams.first_mut().unwrap().update_queue(last_index);
        self.teams.rotate_left(1);
    }

    #[wasm_bindgen]
    pub fn step(&mut self) {
        if self.teams.is_empty() {
            return;
        }

        let (piece, team_id, mut index) = {
            let cur_team = self.teams.first_mut().unwrap();
            let team_id = cur_team.id();
            let (piece, index) = cur_team.get_next().unwrap();
            (piece, team_id, index)
        };

        // Find the next available spot
        let (mut x, mut y) = index_to_xy(index);
        while !self.grid.is_allowed(x, y, team_id) {
            index += 1;
            (x, y) = next_xy(x, y);
        }

        // Place the piece
        self.grid.set(x, y, team_id, &piece.kernel());
        self.changes.push((x, y, team_id.get()));

        // Update piece and team queues
        self.update_queue(index);
    }

    #[wasm_bindgen]
    pub fn flush_changes(&mut self) -> Vec<i32> {
        // Flat buffer: [x0, y0, team0, x1, y1, team1, ...]
        self.changes
            .drain(..)
            .flat_map(|(x, y, t)| [x, y, t as i32])
            .collect()
    }
}
