import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChromaClient } from 'chromadb';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Chroma } from '@langchain/community/vectorstores/chroma';
import { Document } from '@langchain/core/documents';

interface KnowledgeDocument {
  id: number;
  title: string;
  description: string;
  category: string;
  replies: Array<{
    content: string;
    owner: string;
  }>;
}

@Injectable()
export class RagService implements OnModuleInit {
  private vectorStore: Chroma;
  private embeddings: OpenAIEmbeddings;
  private chromaClient: ChromaClient;
  private collectionName = 'qiniu_customer_service';

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('ai.openaiApiKey');
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: apiKey,
      configuration: {
        baseURL: 'https://openai.qiniu.com/v1',
      },
    });

    this.chromaClient = new ChromaClient({
      path: process.env.CHROMA_URL || 'http://localhost:8000',
    });
  }

  async onModuleInit() {
    await this.initializeVectorStore();
  }

  private async initializeVectorStore() {
    try {
      this.vectorStore = await Chroma.fromExistingCollection(this.embeddings, {
        collectionName: this.collectionName,
        url: process.env.CHROMA_URL || 'http://localhost:8000',
      });
    } catch {
      this.vectorStore = await Chroma.fromDocuments([], this.embeddings, {
        collectionName: this.collectionName,
        url: process.env.CHROMA_URL || 'http://localhost:8000',
      });
    }
  }

  async addDocuments(knowledgeData: KnowledgeDocument[]): Promise<void> {
    const documents: Document[] = [];

    for (const item of knowledgeData) {
      const conversationText = item.replies
        .map((reply) => {
          const speaker = reply.owner === 'customer' ? '用户' : '客服';
          const cleanContent = this.stripHtml(reply.content);
          return `${speaker}: ${cleanContent}`;
        })
        .join('\n');

      const fullText = `分类: ${item.category}\n问题: ${item.title}\n${item.description ? `描述: ${item.description}\n` : ''}对话记录:\n${conversationText}`;

      documents.push(
        new Document({
          pageContent: fullText,
          metadata: {
            ticketId: item.id,
            title: item.title,
            category: item.category,
          },
        }),
      );
    }

    if (documents.length > 0) {
      await this.vectorStore.addDocuments(documents);
    }
  }

  async searchRelevant(query: string, limit: number = 3): Promise<Document[]> {
    if (!this.vectorStore) {
      await this.initializeVectorStore();
    }

    const results = await this.vectorStore.similaritySearchWithScore(
      query,
      limit,
    );
    return results.map((result) => result[0]);
  }

  formatAsContext(documents: Document[]): string {
    if (documents.length === 0) return '';

    let context = '以下是相关的历史客服案例供参考:\n\n';

    documents.forEach((doc, idx) => {
      context += `【案例${idx + 1}】\n`;
      context += doc.pageContent + '\n\n';
    });

    return context;
  }

  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
