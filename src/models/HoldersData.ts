export class HoldersData {
  public ethereum: string;
  public bsc: string;
  public polygon: string;
  public solana: string
  public totalHodlers: string;

  constructor(
    solana: number,
    ethereum: number,
    bsc: number,
    polygon: number
  ) {
    const numFormatter = new Intl.NumberFormat('en-US');  
    const totalHodlers = solana + ethereum + bsc + polygon;

    this.solana = numFormatter.format(solana);
    this.ethereum = numFormatter.format(ethereum);
    this.bsc = numFormatter.format(bsc);
    this.polygon = numFormatter.format(polygon);
    this.totalHodlers = numFormatter.format(totalHodlers);
  }
}