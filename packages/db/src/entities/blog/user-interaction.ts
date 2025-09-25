import { ObjectId } from 'mongodb';
import { Column, CreateDateColumn, Entity, Index, ObjectIdColumn } from 'typeorm';

@Entity('user_interactions')
@Index(['sessionId', 'createdAt'])
@Index(['articleId', 'createdAt'])
export class UserInteraction {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  sessionId: string;

  @Column()
  articleId: string;

  @Column()
  action: 'view' | 'scroll' | 'time_spent' | 'click_related' | 'share';

  @Column({ nullable: true })
  value: number;

  @Column({ type: 'json', nullable: true })
  metadata: {
    userAgent?: string;
    referrer?: string;
    scrollPercentage?: number;
    timeOnPage?: number;
    clickedRecommendation?: string;
  };

  @CreateDateColumn()
  createdAt: Date;
}
