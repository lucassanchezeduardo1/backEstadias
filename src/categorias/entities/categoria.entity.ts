import { Evento } from "src/eventos/entities/evento.entity";
import { Publicacion } from "src/publicacion/entities/publicacion.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Categoria {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ length: 50, nullable: false, unique: true })
    nombre: string
    @Column({ type: 'text' })
    descripcion: string
    @CreateDateColumn()
    created_at: Date
    @UpdateDateColumn({
        type: 'timestamp',
        name: 'updated_at'
    })
    updated_at: Date;

    // Relación One-to-Many con Publicacion
    @OneToMany(() => Publicacion, (publicacion) => publicacion.categoria)
    publicaciones: Publicacion[];

    //relacion con evento
    @OneToMany(() => Evento, (evento) => evento.categoria)
    eventos: Evento[];
}
