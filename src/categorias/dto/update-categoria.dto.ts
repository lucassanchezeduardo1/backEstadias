import {IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class UpdateCategoriaDto{
        @IsOptional()
        @MinLength(3)
        @MaxLength(50)
        @IsString()
        nombre:string
    
        @IsOptional()
        @IsString()
        descripcion:string
}
