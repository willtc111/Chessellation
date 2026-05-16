use wasm_bindgen::prelude::*;

#[wasm_bindgen(start)]
pub fn init() {
    wasm_logger::init(wasm_logger::Config::default());
}

mod chessellator;
mod inputs;
mod kernel;
mod piece;
mod spiralgrid;
mod team;
mod team_id;
mod visibility;
