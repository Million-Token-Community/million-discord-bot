export class HoldersData {
  public uniswap: string;
  public bsc: string;
  public polygon: string;
  public solana: string
  public totalHodlers: string;

  constructor(
    solana: number,
    uniswap: number,
    bsc: number,
    polygon: number
  ) {
    const numFormatter = new Intl.NumberFormat('en-US');  
    const totalHodlers = solana + uniswap + bsc + polygon;

    this.solana = numFormatter.format(solana);
    this.uniswap = numFormatter.format(uniswap);
    this.bsc = numFormatter.format(bsc);
    this.polygon = numFormatter.format(polygon);
    this.totalHodlers = numFormatter.format(totalHodlers);
  }
}