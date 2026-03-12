import { Type } from "class-transformer";
import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, Matches, MaxLength, MinLength, ValidateIf } from "class-validator"

export class UpdateInvestigadorDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  nombre: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  apellidos: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  grado_academico: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  cargo_actual: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  direccion_oficina: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  horario_atencion: string;

  @IsString()
  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  email: string;

  @IsString()
  @IsOptional()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(50)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
    {
      message: 'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
    }
  )
  password: string;

  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(50)
  matricula: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  institucion_id: number;

  @IsOptional()
  @ValidateIf(o => o.google_academico_url !== '' && o.google_academico_url !== null)
  @IsUrl({}, { message: 'El link de Google Académico debe ser una URL válida' })
  @MaxLength(500, { message: 'El link de Google Académico no puede exceder los 500 caracteres' })
  google_academico_url?: string;

  @IsOptional()
  @ValidateIf(o => o.researchgate_url !== '' && o.researchgate_url !== null)
  @IsUrl({}, { message: 'El link de ResearchGate debe ser una URL válida' })
  @Matches(/^https?:\/\/(www\.)?researchgate\.net\/profile\/.+$/, {
    message: 'El link de ResearchGate debe tener el formato: https://www.researchgate.net/profile/nombre-usuario'
  })
  researchgate_url?: string;

  @IsString()
  @IsOptional()
  @MinLength(50)
  descripcion_trayectoria: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  areas_investigacion: string;
}
