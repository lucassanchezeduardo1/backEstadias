import { Type } from "class-transformer";
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, Matches, MaxLength, MinLength } from "class-validator";

export class UpdateEventoDto {
    @IsString({ message: 'El título debe ser un texto válido' })
    @IsOptional()
    @MinLength(10, { message: 'El título debe tener al menos 10 caracteres' })
    @MaxLength(255, { message: 'El título no puede exceder 255 caracteres' })
    titulo: string;

    @IsString({ message: 'La descripción debe ser un texto válido' })
    @IsOptional()
    @MinLength(50, { message: 'La descripción debe tener al menos 50 caracteres' })
    descripcion: string;

    @IsString({ message: 'El tipo de evento debe ser un texto válido' })
    @IsOptional()
    @MaxLength(100, { message: 'El tipo de evento no puede exceder 100 caracteres' })
    tipo_evento: string; // Ej: "Conferencia", "Seminario", "Charla científica"

    //investigador_organizador_id NO va aquí, se obtiene del token JWT

    @IsDateString({}, { message: 'La fecha debe ser una fecha válida (YYYY-MM-DD)' })
    @IsOptional()
    fecha: string; // Formato: "2026-03-15"

    @IsString({ message: 'La hora debe ser un texto válido' })
    @IsOptional()
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'La hora debe tener el formato HH:MM (ej: 14:30)'
    })
    hora: string; // Formato: "14:30"

    @IsEnum(['presencial', 'virtual', 'hibrida'], {
        message: 'La modalidad debe ser: presencial, virtual o hibrida'
    })
    @IsOptional()
    modalidad: 'presencial' | 'virtual' | 'hibrida';

    @IsString({ message: 'El lugar o enlace debe ser un texto válido' })
    @IsOptional()
    @MaxLength(500, { message: 'El lugar o enlace no puede exceder 500 caracteres' })
    lugar_enlace: string; // Si es presencial: dirección, si es virtual: URL

    @IsInt({ message: 'El ID de la categoría debe ser un número entero' })
    @IsOptional()
    @Type(() => Number)
    categoria_id: number;

    @IsString({ message: 'Los ponentes deben ser un texto válido' })
    @IsOptional()
    @MinLength(5, { message: 'Debe especificar al menos un ponente' })
    ponentes: string; // Texto libre: "Dr. Juan Pérez, Dra. María López"

    @IsString({ message: 'El público objetivo debe ser un texto válido' })
    @IsOptional()
    @MaxLength(255, { message: 'El público objetivo no puede exceder 255 caracteres' })
    publico_objetivo: string; // Ej: "Estudiantes de licenciatura", "Profesionales en biología"

}
