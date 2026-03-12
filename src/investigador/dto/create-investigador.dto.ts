import { Type } from "class-transformer";
import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, Matches, MaxLength, MinLength, ValidateIf } from "class-validator"

export class CreateInvestigadorDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder los 100 caracteres' })
  nombre: string;

  @IsString({ message: 'Los apellidos deben ser una cadena de texto' })
  @IsNotEmpty({ message: 'Los apellidos son obligatorios' })
  @MinLength(2, { message: 'Los apellidos deben tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'Los apellidos no pueden exceder los 100 caracteres' })
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
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
    {
      message: 'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
    }
  )
  password: string;

  @IsString({ message: 'La matrícula debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La matrícula es obligatoria' })
  @MinLength(3, { message: 'La matrícula debe tener al menos 3 caracteres' })
  @MaxLength(50, { message: 'La matrícula no puede exceder los 50 caracteres' })
  matricula: string;

  @IsInt({ message: 'La institución debe ser un ID válido' })
  @IsNotEmpty({ message: 'La institución es obligatoria' })
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

  @IsString({ message: 'La trayectoria debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La trayectoria es obligatoria' })
  @MinLength(50, { message: 'La descripción de la trayectoria debe tener al menos 50 caracteres' })
  descripcion_trayectoria: string;

  @IsString({ message: 'Las áreas de investigación deben ser una cadena de texto' })
  @IsNotEmpty({ message: 'Las áreas de investigación son obligatorias' })
  @MaxLength(500, { message: 'Las áreas de investigación no pueden exceder los 500 caracteres' })
  areas_investigacion: string;
}

