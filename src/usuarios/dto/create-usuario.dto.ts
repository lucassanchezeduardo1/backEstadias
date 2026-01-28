import { Type } from "class-transformer";
import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, Matches, MaxLength, MinLength } from "class-validator"

export class CreateUsuarioDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(100)
    nombre: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(4)
    @MaxLength(100)
    apellidos: string;

    @IsString()
    @IsNotEmpty()
    @IsEmail()
    @MaxLength(150)
    email: string;

    @IsString()
    @IsNotEmpty()
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
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(100)
    oficio: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(100)
    grado_academico: string;

    @IsInt()
    @IsNotEmpty()
    @Type(() => Number)
    edad: number;
}
