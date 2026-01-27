import { Type } from "class-transformer";
import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString,IsUrl,Matches, MaxLength, MinLength } from "class-validator"

export class CreateInvestigadorDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  apellidos: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  grado_academico: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  cargo_actual: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  direccion_oficina: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  horario_atencion: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(150)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(50)
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
  @MaxLength(50)
  matricula: string;

  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  institucion_id: number;

  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  google_academico_url?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(50)
  descripcion_trayectoria: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  areas_investigacion: string;
}

