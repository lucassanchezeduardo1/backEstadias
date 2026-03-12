import { Categoria } from "src/categorias/entities/categoria.entity";
import { Investigador } from "src/investigador/entities/investigador.entity";
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum ModalidadEvento {
    PRESENCIAL = 'presencial',
    VIRTUAL = 'virtual',
    HIBRIDA = 'hibrida',
}
@Entity()
export class Evento {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255 })
    titulo: string;

    @Column({ type: 'varchar', length: 500, nullable: false })
    imagen_principal: string;

    @Column({ type: 'text' })
    descripcion: string;

    @Column({ type: 'varchar', length: 100 })
    tipo_evento: string; // Conferencia, Seminario, Charla, etc.

    // FK investigador organizador
    @Column({ type: 'int' })
    investigador_organizador_id: number;

    @ManyToOne(() => Investigador, (investigador) => investigador.eventos, {
        onDelete: 'CASCADE',
        eager: false,
    })
    @JoinColumn({ name: 'investigador_organizador_id' })
    investigador_organizador: Investigador;

    @Column({ type: 'date' })
    fecha: Date;

    @Column({ type: 'time' })
    hora: string;

    @Column({
        type: 'enum',
        enum: ModalidadEvento,
    })
    modalidad: ModalidadEvento;

    @Column({ type: 'varchar', length: 500 })
    lugar_enlace: string; // Lugar físico o URL

    // FK categoría
    @Column({ type: 'int', nullable: true })
    categoria_id: number;

    @ManyToOne(() => Categoria, (categoria) => categoria.eventos, {
        nullable: true,
        eager: false,
    })
    @JoinColumn({ name: 'categoria_id' })
    categoria: Categoria;

    @Column({ type: 'text' })
    ponentes: string;

    @Column({ type: 'varchar', length: 255 })
    publico_objetivo: string;

    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
    updated_at: Date;
}
