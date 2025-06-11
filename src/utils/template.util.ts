import { readFile } from 'fs';
import { resolve } from 'path';
import * as handlebars from 'handlebars';
import * as util from 'util';

/**
 * @description this is used to handle bars to resolve the html from ejs format.
 */

export class TemplateUtil {
  static #root: string = resolve(__dirname, '../../templates');
  static #cache: Map<string, string> = new Map();
  static async compile(path: string, data: unknown): Promise<string> {
    let content = this.#cache.get(path);
    if (!content) {
      content = await util.promisify(readFile)(
        resolve(this.#root, path),
        'utf8',
      );
      this.#cache.set(path, content);
    }
    return handlebars.compile(content, {
      noEscape: true,
    })(data);
  }
  #template: string;
  constructor(template: string) {
    this.#template = template;
  }
  async compileFile(data: object): Promise<string> {
    return TemplateUtil.compile(this.#template, data);
  }
}
