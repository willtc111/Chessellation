use crate::team_id::TeamId;

/// A bitmask of which teams can see a cell (up to 32 teams = u32)
#[derive(Clone, Copy, Default, Debug)]
pub struct Visibility(u32);

impl Visibility {
    /// Add this TeamId to the visibility bitmask
    pub fn add(&mut self, team_id: TeamId) {
        self.0 |= 1 << team_id.get();
    }
    /// Remove this TeamId from the visibility bitmask
    pub fn remove(&mut self, team_id: TeamId) {
        self.0 &= !(1 << team_id.get());
    }
    /// Check if this TeamId can see the cell
    pub fn can_see(self, team_id: TeamId) -> bool {
        self.0 & (1 << team_id.get()) != 0
    }
    /// Check if no teams can see the cell
    pub fn is_unseen(self) -> bool {
        self.0 == 0
    }
    /// Check if this cell is not seen by any other teams
    pub fn is_safe(self, team_id: TeamId) -> bool {
        self.0 & !(1 << team_id.get()) == 0
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn visibility_default_is_unseen() {
        let v = Visibility::default();
        assert!(v.is_unseen());
    }

    #[test]
    fn visibility_add() {
        let mut v = Visibility::default();
        let team_id = TeamId::new(0).unwrap();
        v.add(team_id);
        assert!(v.can_see(team_id));
        assert!(!v.is_unseen());
        assert!(v.is_safe(team_id));
        // Add is idempotent
        v.add(team_id);
        assert!(v.can_see(team_id));
    }

    #[test]
    fn visibility_add_does_not_affect_other_teams() {
        let mut v = Visibility::default();
        let t0 = TeamId::new(0).unwrap();
        let t1 = TeamId::new(1).unwrap();
        v.add(t0);
        assert!(v.can_see(t0));
        assert!(!v.can_see(t1));
        v.add(t1);
        assert!(v.can_see(t0));
        assert!(v.can_see(t1));
    }

    #[test]
    fn visibility_remove() {
        let mut v = Visibility::default();
        let team_id = TeamId::new(0).unwrap();
        v.add(team_id);
        v.remove(team_id);
        assert!(!v.can_see(team_id));
        assert!(v.is_unseen());
        // Remove is idempotent
        v.remove(team_id);
        assert!(v.is_unseen());
    }

    #[test]
    fn visibility_remove_does_not_affect_other_teams() {
        let mut v = Visibility::default();
        let t0 = TeamId::new(0).unwrap();
        let t1 = TeamId::new(1).unwrap();
        v.add(t0);
        v.add(t1);
        v.remove(t0);
        assert!(!v.can_see(t0));
        assert!(v.can_see(t1));
    }

    #[test]
    fn visibility_boundary_teams() {
        let mut v = Visibility::default();
        let first = TeamId::new(0).unwrap();
        let last = TeamId::new(31).unwrap();
        v.add(first);
        v.add(last);
        assert!(v.can_see(first));
        assert!(v.can_see(last));
        v.remove(first);
        assert!(!v.can_see(first));
        assert!(v.can_see(last));
        v.remove(last);
        assert!(v.is_unseen());
    }

    #[test]
    fn visibility_is_safe() {
        let mut v = Visibility::default();
        let t1 = TeamId::new(0).unwrap();
        let t2 = TeamId::new(1).unwrap();
        // Empty is safe for all teams
        assert!(v.is_safe(t1));
        assert!(v.is_safe(t2));
        // Cell is safe for TeamId that can see it and unsafe for others
        v.add(t1);
        assert!(v.is_safe(t1));
        assert!(!v.is_safe(t2));
    }
}
