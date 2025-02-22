import { AuthDemuxBase } from 'utils/auth/types';

export class AuthDemux implements AuthDemuxBase {
  constructor() {
    // Web version doesn't need electron-specific code
  }

  async login(email: string, password: string): Promise<void> {
    // Implement web authentication
    return Promise.resolve();
  }

  async logout(): Promise<void> {
    // Implement web logout
    return Promise.resolve();
  }

  async signup(email: string, password: string): Promise<void> {
    // Implement web signup
    return Promise.resolve();
  }
}
