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

// Check if localStorage is available
const isLocalStorageAvailable = (): boolean => {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};

export const loadProgress = (): UserProgress => {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage not available - progress will not be saved');
    return getDefaultProgress();
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      console.log('✅ Progress loaded successfully:', parsed);
      return parsed;
    }
  } catch (error) {
    console.error('❌ Failed to load progress:', error);
  }
  
  return getDefaultProgress();
};

const getDefaultProgress = (): UserProgress => {
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
  if (!isLocalStorageAvailable()) {
    console.warn('⚠️ localStorage not available - cannot save progress');
    return;
  }

  try {
    const dataToSave = {
      ...progress,
      lastVisit: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    console.log('✅ Progress saved successfully:', dataToSave);
  } catch (error) {
    console.error('❌ Failed to save progress:', error);
    // Check if it's a quota exceeded error
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error('Storage quota exceeded - clearing old data');
      try {
        localStorage.clear();
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          ...progress,
          lastVisit: new Date().toISOString(),
        }));
      } catch (e) {
        console.error('Still failed after clearing:', e);
      }
    }
  }
};

export const addAchievement = (currentAchievements: string[], newAchievement: string): string[] => {
  if (!currentAchievements.includes(newAchievement)) {
    return [...currentAchievements, newAchievement];
  }
  return currentAchievements;
};
