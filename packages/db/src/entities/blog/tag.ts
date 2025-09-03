import { Column, CreateDateColumn, Entity, ManyToMany, ObjectIdColumn, UpdateDateColumn } from "typeorm";
import { Post } from "./post";

@Entity()
export class Tag {
  @ObjectIdColumn()
  _id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => Post, (post) => post.tags)
  posts: Post[];
}