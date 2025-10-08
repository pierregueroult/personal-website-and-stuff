import { ObjectId } from 'mongodb';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';

import { PostVisibility } from '../../enum/blog/status';
import { Tag } from './tag';

@Entity()
export class Post {
  @ObjectIdColumn()
  _id: ObjectId;

  @ManyToMany(() => Tag, (tag) => tag.posts)
  tags: Tag[];

  @Column()
  title: string;

  @Column()
  fileHash: string;

  @Column({ type: 'enum', enum: PostVisibility, default: PostVisibility.PRIVATE })
  visibility: PostVisibility;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  originalFilePath: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  embedding: number[];

  @Column({ type: 'text' })
  content: string;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: 0 })
  engagementScore: number;

  @Column({ default: 0 })
  averageReadingTime: number;

  @Column({ nullable: true })
  embeddingUpdatedAt: Date;
}
