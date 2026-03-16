import { ChatPromptTemplate } from '@langchain/core/prompts';

/**
 * A chat prompt template for answering questions based on user profile information.
 *
 * This template creates a two-message conversation:
 * 1. System message: Instructs the assistant to answer questions strictly based on provided user profile
 * 2. Human message: Provides the user profile context and the question to be answered
 */
export const profileQAPrompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    'You are a helpful assistant that answers questions strictly based on the user profile provided.',
  ],
  [
    'human',
    `The following is the user's profile. Answer the question based only on this context. Answer clearly and concisely.\n\n{context}\n\nQuestion: {question}`,
  ],
]);
