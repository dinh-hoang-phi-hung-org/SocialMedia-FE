export interface IRequestBuilder {
  setPrefix(prefix: string): this;
  setResourcePath(resourcePath: string): this;
  buildUrl(additionalPath?: string): string;
  buildUrlAI(additionalPath?: string): string;
}

export class RequestBuilder implements IRequestBuilder {
  private prefix: string = process.env.NEXT_PUBLIC_API_PREFIX || "api";
  private resourcePath: string = process.env.NEXT_PUBLIC_API_RESOURCE_PATH || "auth";

  setPrefix(prefix: string): this {
    this.prefix = prefix;
    return this;
  }

  setResourcePath(resourcePath: string): this {
    this.resourcePath = resourcePath;
    return this;
  }

  buildUrl(additionalPath?: string): string {
    const baseUrl = `${process.env.NEXT_PUBLIC_URL_API}/${this.prefix}/${this.resourcePath}`;
    return additionalPath ? `${baseUrl}/${additionalPath}` : baseUrl;
  }

  buildUrlAI(additionalPath?: string): string {
    const baseUrl = `${process.env.NEXT_PUBLIC_URL_API_AI}/${this.prefix}/${this.resourcePath}`;
    return additionalPath ? `${baseUrl}/${additionalPath}` : baseUrl;
  }
}
