import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptProvider {
  async hashData(data: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(10);
      return await bcrypt.hash(data, salt);
    } catch (error) {
      throw error;
    }
  }

  async compareData(data: string, dataHash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(data, dataHash);
    } catch (error) {
      throw error;
    }
  }
}
