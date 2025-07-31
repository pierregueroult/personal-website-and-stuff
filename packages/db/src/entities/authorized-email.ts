import { Column, Entity, ObjectIdColumn } from "typeorm";

@Entity()
export class AuthorizedEmail {
    @ObjectIdColumn()
    _id: string;

    @Column({ unique: true })
    email: string;
}