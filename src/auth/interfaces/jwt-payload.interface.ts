export interface JwtPayload {
  id: string;
  tokenVersion: number;
  type?: 'access' | 'refresh';

  // TODO: añadir todo lo que quieran grabar.
}