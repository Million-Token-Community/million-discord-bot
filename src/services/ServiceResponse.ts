export class ServiceResponse<DataType> {
  public data: DataType | null;
  public error: unknown | null;
  public hasError = false;

  constructor(
    data: DataType = null, 
    error: unknown = null
    ) {
    this.data = data;
    this.error = error;

    if (this.error !== null) {
      this.hasError = true;
    }
  }
}