import fs from 'fs/promises';
import path from 'path';
import { Document } from 'langchain/document';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { RunnableSequence } from '@langchain/core/runnables';
import { getEmbeddings, getChatModel } from '@/shared/lib/openapi/server';
import { profileQAPrompt } from './profile-qa';
import { AIMessageChunk } from '@langchain/core/messages';

/**
 * Filters and retrieves profile document chunks that are related to a given question
 * based on keyword matching.
 *
 * @param question - The input question string to analyze for relevant keywords
 * @param docs - Array of document objects containing pageContent strings to search through
 * @returns Array of page content strings from documents that match the question's keywords
 */
export const getRelatedProfileChunks = (question: string, docs: { pageContent: string }[]) => {
  const lowerQ = question.toLowerCase();
  const keywordToFields: Record<string, string[]> = {
    where: ['where', 'location'],
    who: ['who', 'name'],
    'how long': ['how-long', 'experience'],
    language: ['language'],
    travel: ['traveled'],
    pet: ['pet'],
    favorite: ['favorite', 'fun'],
  };

  const matchedKeys = Object.entries(keywordToFields).flatMap(([keyword, fields]) =>
    lowerQ.includes(keyword) ? fields : [],
  );

  return docs
    .filter((doc) => matchedKeys.some((key) => doc.pageContent.includes(`"${key}"`)))
    .map((doc) => doc.pageContent);
};

/**
 * Asynchronously reads and parses a profile JSON file from the public directory
 * and converts it into a Document array for use in QA chains.
 *
 * @returns A Promise that resolves to an array containing a single Document
 *          with the profile data as stringified JSON content and metadata
 *          indicating the source as 'profile'
 * @throws Will throw an error if the file cannot be read or if the JSON is invalid
 */
export const getProfileDocs = async (): Promise<Document[]> => {
  const filePath = path.join(process.cwd(), 'public/profile.json');
  const file = await fs.readFile(filePath, 'utf-8');
  const json = JSON.parse(file);

  return [
    new Document({
      pageContent: JSON.stringify(json),
      metadata: { source: 'profile' },
    }),
  ];
};

/**
 * Constructs and executes a LangChain pipeline that answers a question
 * based on user profile data stored in a local JSON file.
 *
 * The process includes:
 * 1. Loading and parsing `profile.json` into documents.
 * 2. Creating an in-memory vector store using OpenAI embeddings.
 * 3. Retrieving relevant context from the profile based on the input question.
 * 4. Composing a chat prompt and invoking the OpenAI chat model with that context.
 *
 * @param apiKey - Your OpenAI API key.
 * @param question - The natural language question to ask about the profile.
 * @returns A Promise that resolves to a `ChatMessage` containing the model's answer.
 */
export async function makeProfileQAChain(
  apiKey: string,
  question: string,
): Promise<AIMessageChunk> {
  // Step 1: Load profile.json
  const docs = await getProfileDocs();

  // Step 2: Use both keyword-matching and embedding-based retrieval
  const vectorStore = await MemoryVectorStore.fromDocuments(docs, getEmbeddings(apiKey));

  const retriever = vectorStore.asRetriever();
  const embeddingMatches = await retriever.invoke(question);

  const keywordMatches = getRelatedProfileChunks(question, docs);
  const combinedContext = [
    ...embeddingMatches.map((document) => document.pageContent),
    ...keywordMatches,
  ];

  const context = Array.from(new Set(combinedContext)).join('\n');

  // Step 3: Prompt
  const prompt = profileQAPrompt;

  const model = getChatModel(apiKey);
  const chain = RunnableSequence.from([prompt, model]);

  return chain.invoke({ question, context });
}
