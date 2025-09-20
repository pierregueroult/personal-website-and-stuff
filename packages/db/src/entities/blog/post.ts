import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  ObjectIdColumn,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';

import { PostVisibility } from '../../enum/blog/status';
import { User } from '../auth/user';
import { Category } from './category';
import { Tag } from './tag';

@Entity()
export class Post {
  @ObjectIdColumn()
  _id: string;

  @ManyToOne(() => User, (user) => user.posts)
  user: User;

  @ManyToMany(() => Category, (category) => category.posts)
  categories: Category[];

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
