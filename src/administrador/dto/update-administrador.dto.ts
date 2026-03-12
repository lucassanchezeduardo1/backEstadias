import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator"

export class UpdateAdministradorDto{
        @IsOptional()
        @MinLength(3)
        @MaxLength(50)
        @IsString()
        nombre:string
    
        @IsString()
        @IsOptional()
        @IsEmail()
        @MaxLength(100)
        email:string
    
        @IsOptional()
        @MinLength(8)
        @MaxLength(100)
        @IsString()
        @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
        { message: 'La contraseña debe contener al menos una mayúscula, una minúscula y un número'}
      )
        password:string
}
