//get a clean user agent string from the request headers
import { Injectable } from '@nestjs/common';
import { UAParser } from 'ua-parser-js';

@Injectable()
export class UAParserProvider {
  parseUserAgent(userAgent: string): string {
    const parser = new UAParser(userAgent);
    const result = parser.getResult();
    return `${result.browser.name} on ${result.os.name} ${result.os.version}`;
  }
}
