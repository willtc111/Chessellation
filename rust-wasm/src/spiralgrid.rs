use std::collections::HashMap;

use crate::{kernel::Kernel, team_id::TeamId, visibility::Visibility};

/// Converts a spiral index to a 2D coordinate.
/// Index 0 is the origin. The spiral proceeds counter-clockwise,
/// starting by moving right then turning left at each corner.
pub fn index_to_xy(i: usize) -> (i32, i32) {
    if i == 0 {
        return (0, 0);
    }

    let n = index_to_ring(i);
    let shell_start = (2 * n - 1).pow(2) as usize;
    let offset = (i - shell_start) as i32;
    let side_len = 2 * n;
    let side = offset / side_len;
    let t = offset % side_len;

    match side {
        0 => (n, t - n + 1),   // right side, going up
        1 => (n - 1 - t, n),   // top side, going left
        2 => (-n, n - 1 - t),  // left side, going down
        3 => (-n + 1 + t, -n), // bottom side, going right
        _ => unreachable!(),
    }
}

/// Converts a 2D coordinate back to its spiral index.
pub fn xy_to_index(x: i32, y: i32) -> usize {
    if x == 0 && y == 0 {
        return 0;
    }

    let n = xy_to_ring(x, y);
    let shell_start = (2 * n - 1).pow(2) as usize;
    let side_len = 2 * n;

    let (side, t) = if x == n && y > -n {
        (0, y + n - 1) // right side, going up
    } else if y == n {
        (1, n - 1 - x) // top side, going left
    } else if x == -n {
        (2, n - 1 - y) // left side, going down
    } else {
        (3, x + n - 1) // bottom side, going right (y == -n)
    };

    shell_start + (side * side_len + t) as usize
}

/// Given a coordinate (x,y), returns the next coordinate in the spiral order.
pub fn next_xy(x: i32, y: i32) -> (i32, i32) {
    // Determine shell and whether we need to turn
    let n = xy_to_ring(x, y);

    // Turn conditions (CCW: right -> up -> left -> down)
    if x == n && y < n && (x != -y || x < 0) {
        (x, y + 1) // right side: going up
    } else if y == n && x > -n {
        (x - 1, y) // top side: going left
    } else if x == -n && y > -n {
        (x, y - 1) // left side: going down
    } else {
        (x + 1, y) // bottom side: going right (also handles shell transition)
    }
}

pub fn xy_to_ring(x: i32, y: i32) -> i32 {
    x.abs().max(y.abs())
}

pub fn index_to_ring(i: usize) -> i32 {
    if i == 0 {
        return 0;
    }

    // Find shell n such that (2n-1)^2 <= i < (2n+1)^2
    let n = ((i as f64).sqrt() / 2.0 + 0.5) as i32;
    let n = {
        let mut n = n;
        while (2 * n + 1).pow(2) as usize <= i {
            n += 1;
        }
        while n > 0 && (2 * n - 1).pow(2) as usize > i {
            n -= 1;
        }
        n
    };
    n
}

#[derive(Clone, Copy, Debug, Default)]
struct Cell {
    pub occupant: Option<TeamId>,
    pub visibility: Visibility,
}

pub struct SpiralGrid {
    /// Grid ring to (x,y) to cell data.
    rings: HashMap<i32, HashMap<(i32, i32), Cell>>,
    last_rings: HashMap<TeamId, i32>,
}
impl SpiralGrid {
    pub fn new() -> Self {
        Self {
            rings: HashMap::new(),
            last_rings: HashMap::new(),
        }
    }

    pub fn is_allowed(&self, x: i32, y: i32, team: TeamId) -> bool {
        let cell = self.get(x, y);
        cell.occupant.is_none() && cell.visibility.is_safe(team)
    }

    fn get(&self, x: i32, y: i32) -> Cell {
        let ring = xy_to_ring(x, y);
        self.rings
            .get(&ring)
            .and_then(|r| r.get(&(x, y)))
            .unwrap_or(&Cell::default())
            .clone()
    }

    fn get_mut(&mut self, x: i32, y: i32) -> &mut Cell {
        let ring = xy_to_ring(x, y);
        self.rings
            .entry(ring)
            .or_default()
            .entry((x, y))
            .or_default()
    }

    pub fn set(&mut self, x: i32, y: i32, team: TeamId, kernel: &Kernel) {
        // Place the piece
        let cell = self.get_mut(x, y);
        cell.occupant = Some(team);

        // Apply the kernel to mark visibility
        for &(dx, dy) in kernel.offsets() {
            let target = (x + dx, y + dy);
            self.get_mut(target.0, target.1).visibility.add(team);
        }

        // Update last ring for this team
        self.last_rings.insert(team, xy_to_ring(x, y) as i32);

        // Check if any rings in the center of the grid can be pruned
        let min_ring = self.last_rings.values().min().unwrap_or(&0) - 4;
        self.rings.retain(|&ring, _| ring >= min_ring);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // --- index_to_xy / xy_to_index ---

    #[test]
    fn origin_is_zero() {
        assert_eq!(index_to_xy(0), (0, 0));
        assert_eq!(xy_to_index(0, 0), 0);
    }

    #[test]
    fn index_to_xy_first_shell() {
        // First shell starts at index 1, moving right then CCW
        assert_eq!(index_to_xy(1), (1, 0));
        assert_eq!(index_to_xy(2), (1, 1));
        assert_eq!(index_to_xy(3), (0, 1));
        assert_eq!(index_to_xy(4), (-1, 1));
        assert_eq!(index_to_xy(5), (-1, 0));
        assert_eq!(index_to_xy(6), (-1, -1));
        assert_eq!(index_to_xy(7), (0, -1));
        assert_eq!(index_to_xy(8), (1, -1));
    }

    #[test]
    fn index_to_xy_shell_starts() {
        // Second shell starts at index 9
        assert_eq!(index_to_xy(9), (2, -1));
        // Third shell starts at index 25
        assert_eq!(index_to_xy(25), (3, -2));
        // Fourth shell starts at index 49
        assert_eq!(index_to_xy(49), (4, -3));
    }

    #[test]
    fn index_to_xy_to_index_roundtrip() {
        for i in 0..100 {
            let (x, y) = index_to_xy(i);
            assert_eq!(
                xy_to_index(x, y),
                i,
                "roundtrip failed at index {i} xy ({x},{y})"
            );
        }
    }

    // --- next_xy ---

    #[test]
    fn next_xy_traces_first_shell() {
        let steps = [
            (0, 0),
            (1, 0),
            (1, 1),
            (0, 1),
            (-1, 1),
            (-1, 0),
            (-1, -1),
            (0, -1),
            (1, -1),
            (2, -1),
        ];
        for w in steps.windows(2) {
            assert_eq!(
                next_xy(w[0].0, w[0].1),
                w[1],
                "next_xy({},{}) was wrong",
                w[0].0,
                w[0].1
            );
        }
    }

    #[test]
    fn next_xy_matches_index_to_xy() {
        for i in 0..200usize {
            let (x, y) = index_to_xy(i);
            let (nx, ny) = next_xy(x, y);
            assert_eq!(
                (nx, ny),
                index_to_xy(i + 1),
                "next_xy mismatch at index {i} ({x},{y})"
            );
        }
    }

    // --- SpiralGrid ---

    #[test]
    fn empty_grid_allows_all() {
        let grid = SpiralGrid::new();
        let team = TeamId::new(0).unwrap();
        assert!(grid.is_allowed(0, 0, team));
        assert!(grid.is_allowed(5, 5, team));
        assert!(grid.is_allowed(-3, 2, team));
    }

    #[test]
    fn occupied_cell_is_not_allowed() {
        let mut grid = SpiralGrid::new();
        let team = TeamId::new(0).unwrap();
        let kernel = Kernel::knight();
        grid.set(0, 0, team, &kernel);
        assert!(!grid.is_allowed(0, 0, team));
    }

    #[test]
    fn set_marks_kernel_cells_as_visible() {
        let mut grid = SpiralGrid::new();
        let team = TeamId::new(0).unwrap();
        let kernel = Kernel::knight();
        grid.set(0, 0, team, &kernel);
        // All knight-move targets should now be visible to team
        for &(dx, dy) in kernel.offsets() {
            let cell = grid.get(dx, dy);
            assert!(
                cell.visibility.can_see(team),
                "({dx},{dy}) should be visible to team after set"
            );
        }
    }

    #[test]
    fn kernel_cells_not_allowed_for_other_team() {
        let mut grid = SpiralGrid::new();
        let t1 = TeamId::new(0).unwrap();
        let t2 = TeamId::new(1).unwrap();
        let kernel = Kernel::knight();
        grid.set(0, 0, t1, &kernel);
        // Knight-move targets are seen by t1, so t2 cannot place there
        for &(dx, dy) in kernel.offsets() {
            assert!(
                !grid.is_allowed(dx, dy, t2),
                "({dx},{dy}) should not be allowed for t2"
            );
        }
    }

    #[test]
    fn kernel_cells_allowed_for_same_team() {
        let mut grid = SpiralGrid::new();
        let team = TeamId::new(0).unwrap();
        let kernel = Kernel::knight();
        grid.set(0, 0, team, &kernel);
        // Knight-move targets are seen only by team itself, so team can place there
        let other_cells = kernel
            .offsets()
            .into_iter()
            .filter(|&(dx, dy)| (*dx, *dy) != (0, 0));
        for &(dx, dy) in other_cells {
            assert!(
                grid.is_allowed(dx, dy, team),
                "({dx},{dy}) should be allowed for same team"
            );
        }
    }

    #[test]
    fn two_teams_contest_cell() {
        let mut grid = SpiralGrid::new();
        let t1 = TeamId::new(0).unwrap();
        let t2 = TeamId::new(1).unwrap();
        let kernel = Kernel::knight();
        // Place both teams such that their kernels overlap at (1, 2)
        grid.set(0, 0, t1, &kernel);
        grid.set(1, 2, t2, &kernel);
        assert!(!grid.is_allowed(1, 2, t1));
        assert!(!grid.is_allowed(1, 2, t2));
    }

    #[test]
    fn ring_pruning() {
        let mut grid = SpiralGrid::new();
        let team_a = TeamId::new(0).unwrap();
        let team_b = TeamId::new(1).unwrap();
        let kernel = Kernel::knight();

        // Place pieces in lines to populate the grid
        let line_length = 10;
        for i in 0..=line_length {
            grid.set(i, 0, team_a, &kernel);
            grid.set(0, i, team_b, &kernel);
        }
        grid.set(line_length + 1, 0, team_a, &kernel);

        // last_rings are correct for each team
        assert_eq!(grid.last_rings[&team_a], line_length + 1);
        assert_eq!(grid.last_rings[&team_b], line_length);

        // Inner irrelevant rings are pruned
        for x in 0..line_length - 4 {
            assert!(!grid.rings.contains_key(&x));
        }
        // Rings near the fronteir still exist
        for x in line_length - 4..=line_length + 1 {
            assert!(grid.rings.contains_key(&x));
        }
    }
}
