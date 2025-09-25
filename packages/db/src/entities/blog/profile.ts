import { ObjectId } from 'mongodb';
import { Column, CreateDateColumn, Entity, Index, ObjectIdColumn, UpdateDateColumn } from 'typeorm';

@Entity('anonymous_profiles')
@Index(['sessionId'])
export class AnonymousProfile {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  sessionId: string;

  @Column({ type: 'json' })
  interests: {
    tags: Record<string, number>;
    categories: Record<string, number>;
    topics: number[];
  };

  @Column({ type: 'json' })
  behavior: {
    avgReadTime: number;
    preferredLength: 'short' | 'medium' | 'long';
    activeHours: number[];
    readingPattern: 'scanner' | 'deep_reader' | 'mixed';
  };

  @Column({ default: 0 })
  totalInteractions: number;

  @CreateDateColumn()
  firstSeen: Date;

  @UpdateDateColumn()
  lastSeen: Date;
}
