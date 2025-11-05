import { AuthAPI, OptionsAPI, JwtUtils, Session, StorageConstants } from '@test/mf-utils-modules';

export class GlobalSession {
  static get idEmpresa(): number | null {
    return Session.get('IDEMPRESA');
  }

  static get idSede(): number | null {
    return Session.get('IDSEDE');
  }

  static get idUsuario(): number | null {
    return Session.get('IDUSUARIO');
  }

  static get usuario(): any {
    return Session.get('USUARIO');
  }

  

  static clear(): void {
    Session.remove('IDEMPRESA');
    Session.remove('IDSEDE');
    Session.remove('IDUSUARIO');
    Session.remove('USUARIO');
  }
}
