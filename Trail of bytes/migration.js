/**
 * Database Migration Script
 * 
 * This script updates existing teams to include the new cumulative scoring fields.
 * Run this script ONCE after deploying the new code.
 * 
 * Usage:
 * 1. Connect to your MongoDB instance
 * 2. Switch to your database: use <database_name>
 * 3. Copy and paste the commands below
 */

// ============================================
// MIGRATION: Add Cumulative Scoring Fields
// ============================================

print("Starting database migration for cumulative scoring...");

// Update all teams to calculate totalScore
db.teams.updateMany(
    {},
    [
        {
            $set: {
                totalScore: {
                    $add: [
                        { $ifNull: ["$points", 0] },
                        { $ifNull: ["$level2Points", 0] }
                    ]
                }
            }
        }
    ]
);

print("✅ Updated totalScore for all teams");

// Verify the migration
const sampleTeams = db.teams.find({}).limit(5).toArray();
print("\nSample teams after migration:");
sampleTeams.forEach(team => {
    print(`Team: ${team.name}`);
    print(`  - Level 1 Points: ${team.points || 0}`);
    print(`  - Level 2 Points: ${team.level2Points || 0}`);
    print(`  - Total Score: ${team.totalScore || 0}`);
    print("");
});

// ============================================
// MIGRATION: Reset Level 1 Lockout (Optional)
// ============================================

print("Resetting Level 1 lockout status for all sessions...");

db.gamesessions.updateMany(
    {},
    {
        $set: {
            level1CompletedBy: null,
            level1CompletedAt: null,
            level1Locked: false
        }
    }
);

print("✅ Reset Level 1 lockout for all sessions");

// ============================================
// VERIFICATION
// ============================================

print("\n=== Migration Verification ===");

const totalTeams = db.teams.countDocuments({});
print(`Total teams in database: ${totalTeams}`);

const teamsWithTotalScore = db.teams.countDocuments({ totalScore: { $exists: true } });
print(`Teams with totalScore field: ${teamsWithTotalScore}`);

const sessions = db.gamesessions.find({}).toArray();
print(`\nTotal sessions: ${sessions.length}`);
sessions.forEach(session => {
    print(`Session ${session._id}:`);
    print(`  - Status: ${session.status}`);
    print(`  - Level 1 Locked: ${session.level1Locked || false}`);
    print(`  - Completed By: ${session.level1CompletedBy || "None"}`);
    print("");
});

print("\n✅ Migration completed successfully!");
print("\nNext steps:");
print("1. Restart your backend server");
print("2. Clear browser cache and reload frontend");
print("3. Test with multiple teams to verify functionality");
