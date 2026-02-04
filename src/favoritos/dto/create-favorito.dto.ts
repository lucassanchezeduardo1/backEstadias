import { Type } from "class-transformer";
import { IsInt, IsNotEmpty } from "class-validator";

export class CreateFavoritoDto {
    @IsInt({ message: 'El ID de la publicación debe ser un número entero' })
    @IsNotEmpty({ message: 'El ID de la publicación es obligatorio' })
    @Type(() => Number)
    publicacion_id: number;

    //usuario_id NO va aquí, se obtiene del token JWT
}
