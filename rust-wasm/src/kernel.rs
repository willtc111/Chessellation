/// A finite visibility pattern centered at (0,0).
/// Stores only the offsets that ARE visible — absent = not visible.
/// Immutable once constructed.
pub struct Kernel {
    offsets: Vec<(i32, i32)>,
}

impl Kernel {
    pub fn new(offsets: Vec<(i32, i32)>) -> Self {
        // Strip out the origin if it is present in the input offsets
        let offsets: Vec<(i32, i32)> = offsets.into_iter().filter(|&o| o != (0, 0)).collect();
        // Include the origin at the beginning
        let offsets = std::iter::once((0, 0))
            .chain(offsets.iter().copied())
            .collect();
        Self { offsets }
    }

    pub fn offsets(&self) -> &[(i32, i32)] {
        &self.offsets
    }

    pub fn exterior_offsets(&self) -> &[(i32, i32)] {
        &self.offsets[1..]
    }

    /// The standard chess knight
    pub fn knight() -> Self {
        Self::new(vec![
            (-2, -1),
            (-2, 1),
            (-1, -2),
            (-1, 2),
            (1, -2),
            (1, 2),
            (2, -1),
            (2, 1),
        ])
    }

    /// A limited-distance bishop (diagonals up to `range` steps)
    pub fn bishop(range: i32) -> Self {
        let offsets = (1..=range)
            .flat_map(|d| [(-d, -d), (-d, d), (d, -d), (d, d)])
            .collect();
        Self::new(offsets)
    }

    /// Build from a 2D bool grid
    pub fn from_grid(grid: &[Vec<bool>]) -> Self {
        // Find the center of the grid
        let cy = (grid.len() / 2) as i32;
        let cx = (grid[0].len() / 2) as i32;
        // Collect offsets where the grid is true
        let offsets = grid
            .iter()
            .enumerate()
            .flat_map(|(y, row)| {
                row.iter()
                    .enumerate()
                    .filter(|(_, v)| **v)
                    .map(move |(x, _)| (x as i32 - cx, y as i32 - cy))
            })
            .collect();
        Self::new(offsets)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const F: bool = false;
    const T: bool = true;

    fn sorted(mut offsets: Vec<(i32, i32)>) -> Vec<(i32, i32)> {
        offsets.sort();
        offsets
    }

    #[test]
    fn from_empty_grid() {
        let grid = vec![vec![F, F, F], vec![F, F, F], vec![F, F, F]];
        let kernel = Kernel::from_grid(&grid);
        assert_eq!(kernel.offsets(), &[(0, 0)]);
        assert!(kernel.exterior_offsets().is_empty());
    }

    #[test]
    fn from_grid_single_cell() {
        let grid = vec![vec![T]];
        let kernel = Kernel::from_grid(&grid);
        assert_eq!(kernel.offsets(), &[(0, 0)]);
        assert!(kernel.exterior_offsets().is_empty());
    }

    #[test]
    fn from_grid_center_only() {
        let grid = vec![vec![F, F, F], vec![F, T, F], vec![F, F, F]];
        let kernel = Kernel::from_grid(&grid);
        assert_eq!(kernel.offsets(), &[(0, 0)]);
        assert!(kernel.exterior_offsets().is_empty());
    }

    #[test]
    fn from_grid_asymmetric() {
        let grid = vec![vec![T, F, F], vec![F, F, F], vec![F, F, F]];
        let kernel = Kernel::from_grid(&grid);
        assert_eq!(kernel.exterior_offsets(), &[(-1, -1)]);
        assert_eq!(kernel.offsets(), &[(0, 0), (-1, -1)]);
    }

    #[test]
    fn from_grid_knight() {
        let grid = vec![
            vec![F, T, F, T, F],
            vec![T, F, F, F, T],
            vec![F, F, T, F, F],
            vec![T, F, F, F, T],
            vec![F, T, F, T, F],
        ];
        let kernel = Kernel::from_grid(&grid);
        assert_eq!(
            sorted(kernel.offsets().to_vec()),
            sorted(Kernel::knight().offsets().to_vec())
        );
    }

    #[test]
    fn from_grid_bishop() {
        let grid = vec![
            vec![T, F, F, F, T],
            vec![F, T, F, T, F],
            vec![F, F, T, F, F],
            vec![F, T, F, T, F],
            vec![T, F, F, F, T],
        ];
        let kernel = Kernel::from_grid(&grid);
        assert_eq!(
            sorted(kernel.offsets().to_vec()),
            sorted(Kernel::bishop(2).offsets().to_vec())
        );
    }
}
