import { Type } from "class-transformer";
import { IsInt, IsNotEmpty,IsString, MaxLength, MinLength } from "class-validator"

export class CreateComentarioDto {
    @IsInt({ message: 'El ID de la publicación debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID de la publicación es obligatorio' })
  @Type(() => Number)
  publicacion_id: number;

  //  usuario_id NO va aquí, se obtiene del token JWT

  @IsString({ message: 'El contenido debe ser un texto válido' })
  @IsNotEmpty({ message: 'El contenido es obligatorio' })
  @MinLength(5, { message: 'El comentario debe tener al menos 5 caracteres' })
  @MaxLength(1000, { message: 'El comentario no puede exceder 1000 caracteres' })
  contenido: string;
}
