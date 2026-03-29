import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';

export function createNotionClient(token: string): Client {
  return new Client({ auth: token, timeoutMs: 10000 });
}

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getPageMarkdown(notionClient: Client, pageId: string): Promise<string> {
  const n2m = new NotionToMarkdown({ notionClient });

  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const mdBlocks = await n2m.pageToMarkdown(pageId);
      const { parent } = n2m.toMarkdownString(mdBlocks);
      return parent ?? '';
    } catch (err) {
      lastError = err;
      if (attempt < MAX_RETRIES) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt);
        await sleep(delay);
      }
    }
  }

  throw lastError;
}
