import { Publicacion } from "src/publicacion/entities/publicacion.entity";
import { Usuario } from "src/usuarios/entities/usuario.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Favorito {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', nullable: false })
    usuario_id: number;

    // Relación Many-to-One con UsuarioRegular
    @ManyToOne(() => Usuario, (usuario) => usuario.favoritos, {
        eager: false,
        onDelete: 'CASCADE'
    })
    @JoinColumn({ name: 'usuario_id' })
    usuario: Usuario;

    @Column({ type: 'int', nullable: false })
    publicacion_id: number;

    // Relación Many-to-One con Publicacion
    @ManyToOne(() => Publicacion, (publicacion) => publicacion.favoritos, {
        eager: false,
        onDelete: 'CASCADE'
    })
    @JoinColumn({ name: 'publicacion_id' })
    publicacion: Publicacion;

    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    created_at: Date;
}
