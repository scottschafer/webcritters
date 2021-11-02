export type GenealogyReport = {
  genome: string;
  ancestor: string;
  currentCount: number;
  color: number;
  firstAppeared: number;
  lastAppeared: number;
  descendants: Array<GenealogyReport>;
}
