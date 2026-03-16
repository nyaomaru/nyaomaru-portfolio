import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('@langchain/openai', () => {
  return {
    ChatOpenAI: vi.fn().mockImplementation((opts) => ({
      modelName: 'mock-chat-model',
      options: opts,
    })),
    OpenAIEmbeddings: vi.fn().mockImplementation((opts) => ({
      modelName: 'mock-embedding-model',
      options: opts,
    })),
  };
});

describe('getChatModel', () => {
  const dummyApiKey = 'test-api-key';
  let getChatModel: (apiKey: string) => unknown;

  beforeEach(async () => {
    vi.resetModules();
    const module = await import('@/shared/lib/openapi/server');
    getChatModel = module.getChatModel;
  });

  it('should create a new ChatOpenAI instance with the given API key and temperature', () => {
    const model = getChatModel(dummyApiKey);

    expect(model).toEqual({
      modelName: 'mock-chat-model',
      options: {
        openAIApiKey: dummyApiKey,
        temperature: 0.3,
      },
    });
  });

  it('should return the same instance on second call', () => {
    const first = getChatModel(dummyApiKey);
    const second = getChatModel(dummyApiKey);

    expect(second).toBe(first);
  });
});

describe('getEmbeddings', () => {
  const dummyApiKey = 'test-api-key';
  let getEmbeddings: (apiKey: string) => unknown;

  beforeEach(async () => {
    vi.resetModules();
    const module = await import('@/shared/lib/openapi/server');
    getEmbeddings = module.getEmbeddings;
  });

  it('should create a new OpenAIEmbeddings instance with the given API key', () => {
    const embeddings = getEmbeddings(dummyApiKey);

    expect(embeddings).toEqual({
      modelName: 'mock-embedding-model',
      options: { openAIApiKey: dummyApiKey },
    });
  });

  it('should return the same instance on second call', () => {
    const first = getEmbeddings(dummyApiKey);
    const second = getEmbeddings(dummyApiKey);

    expect(second).toBe(first);
  });
});
