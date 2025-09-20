declare module '@google/generative-ai' {
  export class GoogleGenerativeAI {
    constructor(apiKey: string);
    getGenerativeModel(params: {
      model: string;
      generationConfig?: {
        responseMimeType?: string;
        temperature?: number;
      };
    }): {
      generateContent(input: any[]): Promise<{
        response: {
          text(): string;
        };
      }>;
    };
  }
}
