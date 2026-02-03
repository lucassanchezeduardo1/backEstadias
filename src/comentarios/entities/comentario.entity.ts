import { Publicacion } from "src/publicacion/entities/publicacion.entity";
import { Usuario } from "src/usuarios/entities/usuario.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Comentario {
    @PrimaryGeneratedColumn()
    id: number;
    
     @Column({ type: 'int', nullable: false })
  publicacion_id: number;

  // Relación Many-to-One con Publicacion
  @ManyToOne(() => Publicacion, (publicacion) => publicacion.comentarios, {
    eager: false, // No cargar automáticamente
    onDelete: 'CASCADE' // Si se elimina la publicación, eliminar comentarios
  })
  @JoinColumn({ name: 'publicacion_id' })
  publicacion: Publicacion;

  @Column({ type: 'int', nullable: false })
  usuario_id: number;

  // Relación Many-to-One con UsuarioRegular
  @ManyToOne(() => Usuario, (usuario) => usuario.comentarios, {
    eager: false,
    onDelete: 'CASCADE' // Si se elimina el usuario, eliminar comentarios
  })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

   @Column({ type: 'text', nullable: false })
  contenido: string;

  @Column({ type: 'boolean', default: false })
  leido: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
    updated_at: Date;

}
