import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column("text", { nullable: true })
  description?: string;

  @Column("int")
  price: number; // in cents

  @Column()
  category: string;

  @Column({ nullable: true })
  image?: string; // store image filename or URL
}
