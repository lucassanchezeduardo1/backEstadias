import { Type } from "class-transformer";
import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, Matches, MaxLength, MinLength } from "class-validator"

export class UpdateUsuarioDto {
    @IsString()
    @IsOptional()
    @MinLength(3)
    @MaxLength(100)
    nombre: string;

    @IsString()
    @IsOptional()
    @MinLength(4)
    @MaxLength(100)
    apellidos: string;

    @IsString()
    @IsOptional()
    @IsEmail()
    @MaxLength(150)
    email: string;

    @IsString()
    @IsOptional()
    @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
    @MaxLength(100)
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
        {
            message: 'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
        }
    )
    password: string;

    @IsString()
    @IsOptional()
    @MinLength(3)
    @MaxLength(100)
    oficio: string;

    @IsString()
    @IsOptional()
    @MinLength(3)
    @MaxLength(100)
    grado_academico: string;

    @IsInt()
    @IsOptional()
    @Type(() => Number)
    edad: number;
}
