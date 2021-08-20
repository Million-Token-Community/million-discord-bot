export class ServiceResponse<DataType> {
  public data: DataType | null;
  public error: unknown | null;
  public hasError: boolean;

  constructor(
    data: DataType = null, 
    hasError = false, 
    error: unknown = null
    ) {
    this.data = data;
    this.hasError = hasError;
    this.error = error;
  }
}