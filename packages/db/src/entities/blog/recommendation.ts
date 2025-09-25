import { ObjectId } from 'mongodb';
import { Column, Entity, Index, ObjectIdColumn, UpdateDateColumn } from 'typeorm';

@Entity('recommendations')
@Index(['articleId', 'updatedAt'])
export class Recommendation {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  articleId: string;

  @Column({ type: 'json' })
  contentBasedRecs: {
    articleId: string;
    similarity: number;
    reasons: string[];
  }[];

  @Column({ type: 'json' })
  collaborativeRecs: {
    articleId: string;
    score: number;
    confidence: number;
  }[];

  @Column({ type: 'json' })
  hybridRecs: {
    articleId: string;
    finalScore: number;
    contentScore: number;
    behavioralScore: number;
    reasons: string[];
  }[];

  @UpdateDateColumn()
  updatedAt: Date;
}
