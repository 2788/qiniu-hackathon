export class CreateSessionDto {
  title?: string;
  model: string;
  settings?: Record<string, unknown>;
}
