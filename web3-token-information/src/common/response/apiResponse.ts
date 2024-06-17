export class response<T> {
  constructor(
    public message: string,
    public data: T,
    public statusCode: number,
  ) {}
}
