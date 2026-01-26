import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator"

export class CreateInstitucioneDto {
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(100)
    @IsString()
    nombre:string

    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(100)
    @IsString()
    tipo_institucion:string

    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(100)
    @IsString()
    pais:string

    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(100)
    @IsString()
    estado:string

    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(220)
    @IsString()
    direccion:string
    
}
