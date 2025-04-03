export const progressState = {   
    total: 0,   
    completed: 0,   
    percentage: 0, 
  };  

export function updateProgress(completed: number, total: number) {   
  progressState.completed = completed;   
  progressState.total = total;   
  progressState.percentage = total > 0 ? (completed / total) * 100 : 0; 
}