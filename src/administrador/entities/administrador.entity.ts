import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Administrador {
    @PrimaryGeneratedColumn()
    id:number

    @Column({length: 50,nullable: false})
    nombre:string
    @Column({unique: true,length: 100,nullable: false})
    email:string
    @Column({length: 100,nullable: false})
    password:string
    @CreateDateColumn()
    createdAt:Date
    @UpdateDateColumn({ 
    type: 'timestamp',
    name: 'updated_at'})
    updated_at: Date;
}
