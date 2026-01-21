import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class CreateCategoriaDto {
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(50)
    @IsString()
    nombre:string

    @IsString()
    descripcion:string
}
