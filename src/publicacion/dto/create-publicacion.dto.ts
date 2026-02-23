import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength, MinLength } from "class-validator"
import { Column } from "typeorm";
export class CreatePublicacionDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(5)
    @MaxLength(255)
    titulo: string;

    @IsInt()
    @IsNotEmpty()
    @Type(() => Number)
    categoria_id: number;

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(100)
    sub_categoria: string;

    @IsString()
    @IsOptional()
    colaboradores: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(200, { message: 'La descripción de la investigación debe tener al menos 30 palabras (aprox. 200 caracteres)' })
    descripcion_investigacion: string;

    @IsString()
    @IsOptional()
    sintesis_ia: string;

    @IsString()
    @IsOptional()
    links_referencia: string;

    @IsString()
    @IsOptional()
    videos_url: string;

    @IsInt()
    @IsNotEmpty()
    @Type(() => Number)
    investigador_principal_id: number;


}
