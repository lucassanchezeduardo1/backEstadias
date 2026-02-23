import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, IsUrl, MaxLength, MinLength } from "class-validator"
export class UpdatePublicacionDto {
    @IsString()
    @IsOptional()
    @MinLength(5)
    @MaxLength(255)
    titulo: string;

    @IsInt()
    @IsOptional()
    @Type(() => Number)
    categoria_id?: number;

    @IsString()
    @IsOptional()
    @MinLength(3)
    @MaxLength(100)
    sub_categoria: string;

    @IsString()
    @IsOptional()
    colaboradores: string;

    @IsString()
    @IsOptional()
    @MinLength(200)
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
}
