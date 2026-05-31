const allowedTransitions: Record<string, string[]> = {
  TODO: ["IN_PROGRESS", "BLOCKED"],
  IN_PROGRESS: ["IN_REVIEW", "BLOCKED"],
  IN_REVIEW: ["DONE", "BLOCKED"],
  BLOCKED: ["TODO", "IN_PROGRESS"],
  DONE: []
};

export const canMoveTaskStatus = (currentStatus: string, nextStatus: string) => {
  return allowedTransitions[currentStatus]?.includes(nextStatus);
};