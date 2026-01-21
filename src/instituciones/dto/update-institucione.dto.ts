import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator"

export class UpdateInstitucioneDto{
        @IsOptional()
        @MinLength(3)
        @MaxLength(100)
        @IsString()
        nombre:string
    
        @IsOptional()
        @MinLength(3)
        @MaxLength(100)
        @IsString()
        tipo_institucion:string
    
        @IsOptional()
        @MinLength(3)
        @MaxLength(100)
        @IsString()
        pais:string
    
        @IsOptional()
        @MinLength(3)
        @MaxLength(100)
        @IsString()
        estado:string
    
        @IsOptional()
        @MinLength(3)
        @MaxLength(220)
        @IsString()
        direccion:string
}
