/**
 * @license
 * DSP-LAB Telecom Core - Arquitectura en Capas
 * Capa CrossCutting: Excepción por fallas del hardware o de la Web Audio API.
 */

import { AppException } from "./AppException";
import { ErrorCode } from "../resources/ErrorCodes";

export class AudioDeviceException extends AppException {
  constructor(code: ErrorCode, message?: string) {
    super(code, message);
    this.name = "AudioDeviceException";
  }
}
