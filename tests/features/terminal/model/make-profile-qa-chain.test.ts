// LangChain-related mocks
const mockRetriever = {
  invoke: vi.fn().mockResolvedValue([{ pageContent: 'embedding match content' }]),
};

const mockVectorStore = {
  asRetriever: () => mockRetriever,
};

vi.mock('@langchain/classic/vectorstores/memory', () => ({
  MemoryVectorStore: {
    fromDocuments: vi.fn().mockResolvedValue(mockVectorStore),
  },
}));

vi.mock('@/shared/lib/openapi/server', () => {
  const getChatModel = vi.fn().mockImplementation((key: string) => ({
    mockedChatModelKey: key,
  }));
  const getEmbeddings = vi.fn().mockImplementation((key: string) => ({
    mockedEmbeddingKey: key,
  }));

  return {
    getChatModel,
    getEmbeddings,
  };
});

vi.mock('@langchain/core/runnables', () => ({
  RunnableSequence: {
    from: vi.fn().mockReturnValue({
      invoke: vi.fn().mockResolvedValue({
        text: 'Mocked chain response.',
      }),
    }),
  },
}));

describe('getRelatedProfileChunks', () => {
  it('returns matching pageContent based on keywords in question', async () => {
    const { getRelatedProfileChunks } =
      await import('@/features/terminal/server/make-profile-qa-chain.server');

    const docs = [
      { pageContent: '{"where": "Tokyo"}' },
      { pageContent: '{"language": "Japanese"}' },
      { pageContent: '{"hobby": "fishing"}' },
    ];

    const result = getRelatedProfileChunks('Where did you live?', docs);
    expect(result).toEqual(['{"where": "Tokyo"}']);
  });

  it('returns an empty array if no keywords match', async () => {
    const { getRelatedProfileChunks } =
      await import('@/features/terminal/server/make-profile-qa-chain.server');

    const docs = [{ pageContent: '{"hobby": "fishing"}' }];
    const result = getRelatedProfileChunks('What is your name?', docs);
    expect(result).toEqual([]);
  });
});

describe('getProfileDocs', () => {
  it('returns a Document array from bundled profile data', async () => {
    const { getProfileDocs } =
      await import('@/features/terminal/server/make-profile-qa-chain.server');

    const result = getProfileDocs();

    expect(result).toHaveLength(1);
    expect(result[0].pageContent).toContain('"name":"Nyaomaru"');
    expect(result[0].metadata).toEqual({ source: 'profile' });
  });
});

describe('makeProfileQAChain', () => {
  it('constructs and runs the QA chain with embedding + keyword context', async () => {
    const { makeProfileQAChain } =
      await import('@/features/terminal/server/make-profile-qa-chain.server');

    const response = await makeProfileQAChain('mock-api-key', 'What languages do you speak?');

    expect(response).toEqual({ text: 'Mocked chain response.' });

    // Ensure all mocks were called as expected
    expect(mockRetriever.invoke).toHaveBeenCalledWith('What languages do you speak?');
  });
});
