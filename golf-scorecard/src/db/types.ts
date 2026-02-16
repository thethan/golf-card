export type Round = {
  id: string;
  created_at: string;
  name?: string;
  players: string[];
  pars: number[];
  tee_box?: string;
};

export type HoleStats = {
  round_id: string;
  hole: number;       // 1..18
  strokes: number;    // total strokes on hole
  putts: number;
  within_100: boolean;
  fairway: boolean;
  gir: boolean;
  hazard: boolean;
  balls_lost: number;
  updated_at: string;
};