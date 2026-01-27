import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
@Index(['categoria_id']) // Índice para búsquedas por categoría
@Index(['created_at']) // Índice para ordenar por fecha
@Index(['investigador_principal_id']) // Índice para búsquedas por investigador
export class Publicacion {
    @PrimaryGeneratedColumn()
    id: number;
    @Column({ length: 255, nullable: false })
    titulo: string;
    @Column({ type: 'int', nullable: false })
    investigador_principal_id: number;

    // Relación Many-to-One con Investigador (descomenta cuando tengas la entidad)
  // @ManyToOne(() => Investigador, { eager: true })
  // @JoinColumn({ name: 'investigador_principal_id' })
  // investigador_principal: Investigador;

    @Column({ type: 'int', nullable: false })
    categoria_id: number;

    // Relación Many-to-One con Categoria (descomenta cuando tengas la entidad)
  // @ManyToOne(() => Categoria, { eager: true })
  // @JoinColumn({ name: 'categoria_id' })
  // categoria: Categoria;

    @Column({ length: 100, nullable: false })
    sub_categoria: string;
    @Column({ length: 500, nullable: false })
    img_portada_url: string;
    @Column({ length: 500, nullable: true })
    colaboradores: string;
    @Column({ type: 'text', nullable: false })
    sintesis_investigador: string;
    @Column({ type: 'text', nullable: true })
    sintesis_ia: string;
    @Column({ length: 500, nullable: false })
    pdf_url: string;
    @Column({ type: 'text' })
    links_referencia: string;
    @Column({ type: 'text' })
    videos_url: string;
    @Column({ type: 'int', default: 0, unsigned: true })
    descargas: number;
    @Column({ type: 'int', default: 0, unsigned: true })
    vistas: number;

    // Relación One-to-Many con ComentarioPrivado (descomenta cuando tengas la entidad)
  // @OneToMany(() => ComentarioPrivado, (comentario) => comentario.publicacion)
  // comentarios: ComentarioPrivado[];

  // Relación One-to-Many con Favorito (descomenta cuando tengas la entidad)
  // @OneToMany(() => Favorito, (favorito) => favorito.publicacion)
  // favoritos: Favorito[];

    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
    updated_at: Date;


}
