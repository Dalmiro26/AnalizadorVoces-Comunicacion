/**
 * @license
 * DSP-LAB Telecom Core - Arquitectura en Capas
 * Capa CrossCutting: Excepción base de la aplicación.
 */

import { ErrorCode, ErrorMessages } from "../resources/ErrorCodes";

/**
 * Excepción base: todas las excepciones propias llevan un código de error
 * que la capa de presentación traduce a un mensaje para el usuario.
 */
export class AppException extends Error {
  public readonly code: ErrorCode;

  constructor(code: ErrorCode, message?: string) {
    super(message ?? ErrorMessages[code]);
    this.name = "AppException";
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
