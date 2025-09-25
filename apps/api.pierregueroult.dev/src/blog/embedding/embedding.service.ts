import { Injectable } from '@nestjs/common';

import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

import { EmbeddingResponse } from './embedding.interface';

@Injectable()
export class EmbeddingService {
  private readonly embeddingScript: string = path.join(__dirname, 'embedding.script.py');
  private readonly cacheDirectory: string = path.join(__dirname, 'cache');

  constructor() {
    void this.ensureCacheDirectoryExists();
  }

  private getPythonPath(): string {
    const workspaceRoot = path.resolve(__dirname, '../../../../../');
    const venvPython = path.join(workspaceRoot, '.venv', 'bin', 'python');

    return venvPython;
  }

  private async ensureCacheDirectoryExists() {
    try {
      await fs.mkdir(this.cacheDirectory, { recursive: true });
    } catch (error) {
      console.error('Error creating cache directory:', error);
    }
  }

  private getTextHash(text: string): string {
    return createHash('sha256').update(text).digest('hex');
  }

  private async getCachedEmbedding(hash: string): Promise<number[] | null> {
    try {
      const cacheFilePath = path.join(this.cacheDirectory, `${hash}.json`);
      const cached = await fs.readFile(cacheFilePath, 'utf-8');
      const data = JSON.parse(cached);
      return data.embedding;
    } catch {
      return null;
    }
  }

  private async setCachedEmbedding(hash: string, embedding: number[]): Promise<void> {
    try {
      const cacheFilePath = path.join(this.cacheDirectory, `${hash}.json`);
      const data = { embedding };
      await fs.writeFile(cacheFilePath, JSON.stringify(data), 'utf-8');
    } catch {
      // Ignore cache write errors
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const hash = this.getTextHash(text);
    const cached = await this.getCachedEmbedding(hash);

    if (cached) return cached;

    return new Promise((resolve, reject) => {
      const pythonPath = this.getPythonPath();
      const python = spawn(pythonPath, [this.embeddingScript], {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let output = '';
      let error = '';

      python.stdout.on('data', (data) => {
        output += data.toString();
      });

      python.stderr.on('data', (data) => {
        error += data.toString();
      });

      python.on('close', async (code) => {
        if (code === 0) {
          try {
            const result: EmbeddingResponse = JSON.parse(output);
            await this.setCachedEmbedding(hash, result.embedding);
            resolve(result.embedding);
          } catch (parseError) {
            reject(new Error(`Failed to parse embedding output: ${parseError}`));
          }
        } else {
          reject(new Error(`Embedding script exited with code ${code}: ${error}`));
        }
      });

      python.stdin.write(JSON.stringify({ text }));
      python.stdin.end();
    });
  }

  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];

    for (const text of texts) {
      try {
        const embedding = await this.generateEmbedding(text);
        embeddings.push(embedding);
      } catch {
        embeddings.push(new Array(384).fill(0) as number[]);
      }
    }

    return embeddings;
  }

  calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) throw new Error('Vectors must be of the same length');

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  findSimilarArticles(
    targetEmbedding: number[],
    candidates: { id: string; embedding: number[]; title: string; tags: string[] }[],
    topK: number = 5,
  ): Array<{ id: string; similarity: number; title: string; tags: string[] }> {
    const similarities = candidates.map((candidate) => ({
      ...candidate,
      similarity: this.calculateCosineSimilarity(targetEmbedding, candidate.embedding),
    }));

    return similarities.sort((a, b) => b.similarity - a.similarity).slice(0, topK);
  }

  processMarkdownContentForEmbedding(markdown: string): {
    cleanContent: string;
    wordCount: number;
  } {
    // Supprimer les métadonnées YAML front matter
    let cleanContent = markdown.replace(/^---\s*\n.*?\n---\s*\n/s, '');

    // Supprimer les blocs de code
    cleanContent = cleanContent.replace(/```[\s\S]*?```/g, ' [CODE_BLOCK] ');
    cleanContent = cleanContent.replace(/`[^`]*`/g, ' [INLINE_CODE] ');

    // Supprimer les liens markdown mais garder le texte
    cleanContent = cleanContent.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    // Supprimer les images
    cleanContent = cleanContent.replace(/!\[([^\]]*)\]\([^)]+\)/g, '');

    // Supprimer les headers markdown mais garder le texte
    cleanContent = cleanContent.replace(/^#{1,6}\s+(.+)$/gm, '$1');

    // Supprimer les caractères markdown
    cleanContent = cleanContent.replace(/[*_~`]/g, '');

    // Nettoyer les espaces multiples
    cleanContent = cleanContent.replace(/\s+/g, ' ').trim();

    const wordCount = cleanContent.split(/\s+/).length;

    return { cleanContent, wordCount };
  }

  createCombinedEmbedding(
    titleEmbedding: number[],
    contentEmbedding: number[],
    tags: string[],
    weights: { title: number; content: number; tags: number } = {
      title: 0.3,
      content: 0.5,
      tags: 0.2,
    },
  ): number[] {
    const combined = new Array(titleEmbedding.length).fill(0);

    for (let i = 0; i < titleEmbedding.length; i++) {
      combined[i] += titleEmbedding[i] * weights.title;
    }

    for (let i = 0; i < contentEmbedding.length; i++) {
      combined[i] += contentEmbedding[i] * weights.content;
    }

    const tagBoost = tags.length > 0 ? weights.tags / tags.length : 0;

    for (let i = 0; i < combined.length; i++) {
      combined[i] += tagBoost;
    }

    return combined;
  }
}
