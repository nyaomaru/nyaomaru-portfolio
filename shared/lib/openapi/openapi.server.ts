import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';

let chatModel: ChatOpenAI | null = null;
let embeddings: OpenAIEmbeddings | null = null;

/**
 * Creates a new ChatOpenAI model instance with the specified API key.
 *
 * @param apiKey - The OpenAI API key used for authentication
 * @returns A configured ChatOpenAI instance with temperature set to 0.3
 */
const makeChatModel = (apiKey: string) =>
  new ChatOpenAI({ openAIApiKey: apiKey, temperature: 0.3 });

/**
 * Creates a new OpenAI embeddings instance with the provided API key.
 *
 * @param apiKey - The OpenAI API key used for authentication
 * @returns A new OpenAIEmbeddings instance configured with the provided API key
 */
const makeEmbeddings = (apiKey: string) => new OpenAIEmbeddings({ openAIApiKey: apiKey });

/**
 * Gets or creates a singleton chat model instance.
 *
 * @param apiKey - The API key required to initialize the chat model
 * @returns The chat model instance
 */
export const getChatModel = (apiKey: string) => {
  if (!chatModel) {
    chatModel = makeChatModel(apiKey);
  }
  return chatModel;
};

/**
 * Gets or creates an embeddings instance using the provided API key.
 * Uses lazy initialization to ensure the embeddings object is only created once.
 *
 * @param apiKey - The API key required to initialize the embeddings service
 * @returns The embeddings instance, either existing or newly created
 */
export const getEmbeddings = (apiKey: string) => {
  if (!embeddings) {
    embeddings = makeEmbeddings(apiKey);
  }
  return embeddings;
};
