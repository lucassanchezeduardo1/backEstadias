import { IsEmail, IsNotEmpty, IsString,Matches, MaxLength, MinLength } from "class-validator"

export class CreateAdministradorDto {
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(50)
    @IsString()
    nombre:string

    @IsString()
    @IsNotEmpty()
    @IsEmail()
    @MaxLength(100)
    email:string

    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(100)
    @IsString()
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
    { message: 'La contraseña debe contener al menos una mayúscula, una minúscula y un número'}
  )
    password:string
}
