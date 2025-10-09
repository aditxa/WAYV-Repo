import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Target, Zap, Calendar, Star, Award } from "lucide-react"

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  unlocked: boolean
  progress?: {
    current: number
    target: number
  }
  unlockedAt?: Date
}

interface AchievementBadgesProps {
  achievements?: Achievement[]
  className?: string
}

export default function AchievementBadges({ achievements = [], className }: AchievementBadgesProps) {
  
  // TODO: Remove mock functionality - replace with real achievements from storage
  const mockAchievements: Achievement[] = [
    {
      id: "first-letter",
      title: "First Steps",
      description: "Successfully learned your first braille letter",
      icon: Star,
      unlocked: true,
      unlockedAt: new Date(Date.now() - 86400000)
    },
    {
      id: "accuracy-master",
      title: "Accuracy Master",
      description: "Achieve 95% accuracy in a practice session",
      icon: Target,
      unlocked: true,
      unlockedAt: new Date(Date.now() - 43200000)
    },
    {
      id: "speed-demon",
      title: "Quick Fingers",
      description: "Complete a letter in under 1 second",
      icon: Zap,
      unlocked: false,
      progress: { current: 1.2, target: 1.0 }
    },
    {
      id: "consistent-learner",
      title: "Consistent Learner",
      description: "Practice for 7 days in a row",
      icon: Calendar,
      unlocked: false,
      progress: { current: 3, target: 7 }
    },
    {
      id: "alphabet-complete",
      title: "Alphabet Master",
      description: "Successfully complete all 26 letters",
      icon: Trophy,
      unlocked: false,
      progress: { current: 15, target: 26 }
    },
    {
      id: "word-warrior",
      title: "Word Warrior",
      description: "Complete 50 practice words",
      icon: Award,
      unlocked: false,
      progress: { current: 23, target: 50 }
    }
  ]

  const currentAchievements = achievements.length > 0 ? achievements : mockAchievements
  const unlockedCount = currentAchievements.filter(a => a.unlocked).length
  const totalCount = currentAchievements.length
  
  const formatProgress = (achievement: Achievement) => {
    if (!achievement.progress) return null
    const { current, target } = achievement.progress
    const percentage = Math.min(100, (current / target) * 100)
    return { current, target, percentage }
  }

  const getRecentAchievements = () => {
    return currentAchievements
      .filter(a => a.unlocked && a.unlockedAt)
      .sort((a, b) => (b.unlockedAt!.getTime() - a.unlockedAt!.getTime()))
      .slice(0, 2)
  }

  const recentAchievements = getRecentAchievements()

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Achievements</span>
          <Badge variant="secondary">
            {unlockedCount} / {totalCount}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Recent Achievements */}
        {recentAchievements.length > 0 && (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">Recently Unlocked</div>
            <div className="space-y-2">
              {recentAchievements.map(achievement => {
                const Icon = achievement.icon
                return (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/10 rounded-md"
                    data-testid={`recent-${achievement.id}`}
                  >
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{achievement.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {achievement.description}
                      </div>
                    </div>
                    <Trophy className="h-4 w-4 text-chart-3" />
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* All Achievements Grid */}
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">All Achievements</div>
          <div className="grid gap-3">
            {currentAchievements.map(achievement => {
              const Icon = achievement.icon
              const progress = formatProgress(achievement)
              
              return (
                <div
                  key={achievement.id}
                  className={`p-3 rounded-md border transition-all ${
                    achievement.unlocked 
                      ? "border-primary/20 bg-primary/5" 
                      : "border-border bg-muted/30"
                  }`}
                  data-testid={`achievement-${achievement.id}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${
                      achievement.unlocked 
                        ? "bg-primary/10" 
                        : "bg-muted"
                    }`}>
                      <Icon className={`h-4 w-4 ${
                        achievement.unlocked 
                          ? "text-primary" 
                          : "text-muted-foreground"
                      }`} />
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium text-sm ${
                          achievement.unlocked 
                            ? "text-foreground" 
                            : "text-muted-foreground"
                        }`}>
                          {achievement.title}
                        </span>
                        {achievement.unlocked && (
                          <Badge variant="default" className="text-xs">
                            ✓
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-xs text-muted-foreground">
                        {achievement.description}
                      </p>
                      
                      {progress && !achievement.unlocked && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">
                              {progress.current} / {progress.target}
                            </span>
                            <span className="text-muted-foreground">
                              {progress.percentage.toFixed(0)}%
                            </span>
                          </div>
                          <div className="h-1 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all duration-300"
                              style={{ width: `${progress.percentage}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}