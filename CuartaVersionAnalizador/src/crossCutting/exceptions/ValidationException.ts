/**
 * @license
 * DSP-LAB Telecom Core - Arquitectura en Capas
 * Capa CrossCutting: Excepción por datos de entrada inválidos.
 */

import { AppException } from "./AppException";
import { ErrorCode, ErrorCodes } from "../resources/ErrorCodes";

export class ValidationException extends AppException {
  constructor(code: ErrorCode = ErrorCodes.VALIDATION_ERROR, message?: string) {
    super(code, message);
    this.name = "ValidationException";
  }
}
