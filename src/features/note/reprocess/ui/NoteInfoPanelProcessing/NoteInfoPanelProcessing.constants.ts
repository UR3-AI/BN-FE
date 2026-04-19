export const PROCESSING_STEPS = ["분석", "요약", "액션", "엔티티"] as const;

export const PROCESSING_STEP_MAP: Record<string, number> = {
  idle: 0,
  pending: 0,
  processing: 1,
  analyzing: 1,
  actions_ready: 2,
  summary_ready: 3,
  entities_ready: 4,
  saving: 4,
  completed: 4,
  failed: -1,
};

export const PROCESSING_LABEL: Record<string, string> = {
  idle: "대기 중",
  pending: "대기 중",
  processing: "분석 중",
  analyzing: "분석 중",
  actions_ready: "액션 추출 중",
  summary_ready: "요약 생성 중",
  entities_ready: "엔티티 추출 중",
  saving: "저장 중",
  completed: "완료",
  failed: "실패",
};
