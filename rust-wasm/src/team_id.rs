use std::num::NonZeroU8;

/// A TeamId number in the range 0..32, represented as a NonZero u8 internally
/// so that Option<TeamId> is still only 1 byte (None = 0, Some(t) = 1..=32)
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub struct TeamId(NonZeroU8);

impl TeamId {
    pub fn new(n: u8) -> Option<Self> {
        if n < 32 {
            NonZeroU8::new(n + 1).map(TeamId)
        } else {
            None
        }
    }
    pub fn get(self) -> u8 {
        self.0.get() - 1
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn team_new_valid() {
        assert!(TeamId::new(0).is_some());
        assert!(TeamId::new(15).is_some());
        assert!(TeamId::new(31).is_some());
    }

    #[test]
    fn team_new_invalid() {
        assert!(TeamId::new(32).is_none());
        assert!(TeamId::new(255).is_none());
    }

    #[test]
    fn team_get_roundtrips() {
        for n in 0..32 {
            assert_eq!(TeamId::new(n).unwrap().get(), n);
        }
    }

    #[test]
    fn team_option_is_one_byte() {
        assert_eq!(std::mem::size_of::<Option<TeamId>>(), 1);
    }
}
