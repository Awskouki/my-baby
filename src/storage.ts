// localStorage utility for persisting user progress

interface UserProgress {
  achievements: string[];
  plantGrowth: number;
  petCount: number;
  bubblesPoppedTotal: number;
  focusSessionsCompleted: number;
  lastVisit: string;
}

const STORAGE_KEY = 'molka_study_progress';

export const loadProgress = (): UserProgress => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load progress:', error);
  }
  
  // Default values
  return {
    achievements: [],
    plantGrowth: 0,
    petCount: 0,
    bubblesPoppedTotal: 0,
    focusSessionsCompleted: 0,
    lastVisit: new Date().toISOString(),
  };
};

export const saveProgress = (progress: UserProgress) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...progress,
      lastVisit: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Failed to save progress:', error);
  }
};

export const addAchievement = (currentAchievements: string[], newAchievement: string): string[] => {
  if (!currentAchievements.includes(newAchievement)) {
    return [...currentAchievements, newAchievement];
  }
  return currentAchievements;
};
