export type WorldSummary = {
  totalCritters: number;
  totalFood: number;
  topGenomes: Array<{
    genome: string;
    count: number;
    color: number;
  }>;
};
