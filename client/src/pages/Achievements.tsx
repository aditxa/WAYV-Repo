import AchievementBadges from "@/components/AchievementBadges"

export default function Achievements() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Achievements</h1>
        <p className="text-muted-foreground">
          Track your progress and celebrate your learning milestones
        </p>
      </div>

      {/* Achievement Component */}
      <AchievementBadges />
    </div>
  )
}