import { Column, CreateDateColumn, Entity, ManyToOne, ObjectIdColumn, OneToMany, UpdateDateColumn } from 'typeorm';
import { Post } from './post';
import { User } from 'entities/auth/user';
import { CommentStatus } from 'enum/blog/status';

@Entity()
export class Comment {
  @ObjectIdColumn()
  _id: string;

  @ManyToOne(() => Post, (post) => post.comments)
  post: Post;

  @ManyToOne(() => User, { nullable: true })
  user: User;

  @Column({ nullable: true })
  authorName: string;

  @Column({ nullable: true })
  authorEmail: string;

  @Column('text')
  content: string;

  @ManyToOne(() => Comment, (comment) => comment.children, { nullable: true })
  parent: Comment;

  @OneToMany(() => Comment, (comment) => comment.parent)
  children: Comment[];

  @Column({ type: 'enum', enum: CommentStatus, default: CommentStatus.PENDING })
  status: CommentStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
