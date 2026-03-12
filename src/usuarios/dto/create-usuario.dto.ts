import { Type } from "class-transformer";
import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, Matches, MaxLength, MinLength } from "class-validator"

export class CreateUsuarioDto {
    @IsString({ message: 'El nombre debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'El nombre es obligatorio' })
    @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
    @MaxLength(100, { message: 'El nombre no puede exceder los 100 caracteres' })
    nombre: string;

    @IsString({ message: 'Los apellidos deben ser una cadena de texto' })
    @IsNotEmpty({ message: 'Los apellidos son obligatorios' })
    @MinLength(4, { message: 'Los apellidos deben tener al menos 4 caracteres' })
    @MaxLength(100, { message: 'Los apellidos no pueden exceder los 100 caracteres' })
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
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
        {
            message: 'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
        }
    )
    password: string;

    @IsString({ message: 'El oficio debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'El oficio es obligatorio' })
    @MinLength(3, { message: 'El oficio debe tener al menos 3 caracteres' })
    @MaxLength(100, { message: 'El oficio no puede exceder los 100 caracteres' })
    oficio: string;

    @IsString({ message: 'El grado académico debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'El grado académico es obligatorio' })
    @MinLength(3, { message: 'El grado académico debe tener al menos 3 caracteres' })
    @MaxLength(100, { message: 'El grado académico no puede exceder los 100 caracteres' })
    grado_academico: string;

    @IsInt({ message: 'La edad debe ser un número entero' })
    @IsNotEmpty({ message: 'La edad es obligatoria' })
    @Type(() => Number)
    edad: number;
}
