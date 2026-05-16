use crate::{piece::Piece, team_id::TeamId};

pub struct Team {
    id: TeamId,
    pieces: Vec<Piece>,
    last_index: usize,
}

impl Team {
    pub fn new(id: TeamId, pieces: Vec<Piece>) -> Self {
        Self {
            id,
            pieces,
            last_index: 0,
        }
    }

    pub fn id(&self) -> TeamId {
        self.id
    }

    pub fn get_next(&mut self) -> Option<(&Piece, usize)> {
        if self.pieces.is_empty() {
            return None;
        }
        let next_index = if self.last_index == 0 {
            0
        } else {
            self.last_index + 1
        };
        Some((self.pieces.first().unwrap(), next_index))
    }

    pub fn update_queue(&mut self, last_index: usize) {
        self.pieces.rotate_left(1);
        self.last_index = last_index;
    }
}
