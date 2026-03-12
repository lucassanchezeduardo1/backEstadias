import { Exclude } from "class-transformer";
import { Comentario } from "src/comentarios/entities/comentario.entity";
import { Favorito } from "src/favoritos/entities/favorito.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Usuario {
    @PrimaryGeneratedColumn()
    id: number;
    @Column({ length: 100, nullable: false })
    nombre: string;
    @Column({ length: 100, nullable: false })
    apellidos: string;
    @Column({ type: 'varchar', length: 500, nullable: true })
    foto_perfil: string | null;
    @Column({ length: 150, unique: true, nullable: false })
    email: string;
    @Column({ length: 100, nullable: false })
    @Exclude()
    password: string;
    @Column({ length: 100, nullable: false })
    oficio: string;
    @Column({ length: 100, nullable: false })
    grado_academico: string;
    @Column({ type: 'int', nullable: false })
    edad: number;
    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
    updated_at: Date;

      // Relación One-to-Many con ComentarioPrivado
  @OneToMany(() => Comentario, (comentario) => comentario.usuario)
  comentarios: Comentario[];

  // RELACIÓN CON FAVORITOS
    @OneToMany(() => Favorito, (favorito) => favorito.usuario)
    favoritos: Favorito[];
}
