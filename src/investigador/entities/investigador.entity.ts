import { Exclude } from "class-transformer";
import { Evento } from "src/eventos/entities/evento.entity";
import { Institucione } from "src/instituciones/entities/institucione.entity";
import { Publicacion } from "src/publicacion/entities/publicacion.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Investigador {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ length: 100, nullable: false })
  nombre: string;
  @Column({ length: 100, nullable: false })
  apellidos: string;
  @Column({ type: 'varchar', length: 500, nullable: false })
  foto_perfil: string;
  @Column({ length: 100, nullable: false })
  grado_academico: string;
  @Column({ length: 150, nullable: false })
  cargo_actual: string;
  @Column({ length: 255, nullable: false })
  direccion_oficina: string;
  @Column({ length: 100, nullable: false })
  horario_atencion: string;
  @Column({ length: 150, unique: true, nullable: false })
  email: string;
  @Column({ length: 255, nullable: false })
  @Exclude()
  password: string;
  @Column({ length: 50, unique: true, nullable: false })
  matricula: string;
  @Column({ type: 'int', nullable: false })
  institucion_id: number;

  // Relación Many-to-One con Institución
  @ManyToOne(() => Institucione, { eager: true })
  @JoinColumn({ name: 'institucion_id' })
  institucion: Institucione;

  @Column({ length: 500, nullable: true })
  google_academico_url: string;
  @Column({ type: 'varchar', length: 500, nullable: true })
  researchgate_url: string;
  @Column({ type: 'text', nullable: false })
  descripcion_trayectoria: string;
  @Column({ length: 500, nullable: false })
  areas_investigacion: string;
  @Column({ type: 'enum', enum: ['pendiente', 'aprobado', 'rechazado'], default: 'pendiente' })
  estado: 'pendiente' | 'aprobado' | 'rechazado';

  // Relación One-to-Many con Publicaciones
  @OneToMany(() => Publicacion, (publicacion) => publicacion.investigador_principal)
  publicaciones: Publicacion[];

  // Relación One-to-Many con Eventos (como organizador)
  @OneToMany(() => Evento, (evento) => evento.investigador_organizador)
  eventos: Evento[];

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updated_at: Date;

  // Propiedades virtuales (no en DB, solo en runtime)
  num_publicaciones?: number;
  num_eventos?: number;
}
