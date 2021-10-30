interface HolderCounts {
  solana:     number,
  ethereum:   number,
  bsc:        number,
  polygon:    number,
  kusama:     number,
  avalanche:  number
};

export class HoldersData {
  public ethereum:      string;
  public bsc:           string;
  public polygon:       string;
  public solana:        string;
  public kusama:        string;
  public avalanche:     string;
  public totalHodlers:  string; 

  constructor(holderCounts: HolderCounts) {
    const numFormatter  = new Intl.NumberFormat('en-US');  
    
    let totalHodlers = 0;

    for (const chain in holderCounts) {
      const count = holderCounts[chain];
      this[chain] = numFormatter.format(count);
      totalHodlers += count;
    }

    this.totalHodlers = numFormatter.format(totalHodlers);
  }
}