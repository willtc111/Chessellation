use crate::kernel::Kernel;

pub struct Piece {
    name: String,
    kernel: Kernel,
}

impl Piece {
    pub fn new(name: String, kernel: Kernel) -> Self {
        Self { name, kernel }
    }
    pub fn name(&self) -> &String {
        &self.name
    }
    pub fn kernel(&self) -> &Kernel {
        &self.kernel
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::kernel::Kernel;

    #[test]
    fn piece_name() {
        let piece = Piece::new("knight".to_string(), Kernel::knight());
        assert_eq!(piece.name(), "knight");
    }

    #[test]
    fn piece_kernel() {
        let kernel = Kernel::knight();
        let expected = kernel.offsets().to_vec();
        let piece = Piece::new("knight".to_string(), Kernel::knight());
        assert_eq!(piece.kernel().offsets(), expected);
    }
}
