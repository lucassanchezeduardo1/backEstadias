import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Categoria {
    @PrimaryGeneratedColumn()
        id:number
    
        @Column({length: 50,nullable: false,unique: true})
        nombre:string
        @Column({type: 'text'})
        descripcion:string
        @CreateDateColumn()
        created_at:Date
        @UpdateDateColumn({ 
        type: 'timestamp',
        name: 'updated_at'})
        updated_at: Date;
}
