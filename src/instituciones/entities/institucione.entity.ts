import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Institucione {
    @PrimaryGeneratedColumn()
        id:number
    
        @Column({unique: true,length: 100,nullable: false})
        nombre:string
        @Column({length: 100,nullable: false})
        tipo_institucion:string
        @Column({length: 100,nullable: false})
        pais:string
        @Column({length: 100,nullable: false})
        estado:string
        @Column({length: 200,nullable: false})
        direccion:string
        @CreateDateColumn()
        created_at:Date
        @UpdateDateColumn({ 
        type: 'timestamp',
        name: 'updated_at'})
        updated_at: Date;
}
