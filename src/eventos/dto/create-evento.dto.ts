import { Type } from "class-transformer";
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, Matches, MaxLength, MinLength } from "class-validator";

export class CreateEventoDto {
    @IsString({ message: 'El título debe ser un texto válido' })
    @IsNotEmpty({ message: 'El título es obligatorio' })
    @MinLength(10, { message: 'El título debe tener al menos 10 caracteres' })
    @MaxLength(255, { message: 'El título no puede exceder 255 caracteres' })
    titulo: string;

    @IsString({ message: 'La descripción debe ser un texto válido' })
    @IsNotEmpty({ message: 'La descripción es obligatoria' })
    @MinLength(50, { message: 'La descripción debe tener al menos 50 caracteres' })
    descripcion: string;

    @IsString({ message: 'El tipo de evento debe ser un texto válido' })
    @IsNotEmpty({ message: 'El tipo de evento es obligatorio' })
    @MaxLength(100, { message: 'El tipo de evento no puede exceder 100 caracteres' })
    tipo_evento: string; // Ej: "Conferencia", "Seminario", "Charla científica"

    @IsInt({ message: 'El ID del investigador debe ser un número entero' })
    @IsOptional()
    @Type(() => Number)
    investigador_organizador_id?: number;

    @IsDateString({}, { message: 'La fecha debe ser una fecha válida (YYYY-MM-DD)' })
    @IsNotEmpty({ message: 'La fecha es obligatoria' })
    fecha: string; // Formato: "2026-03-15"

    @IsString({ message: 'La hora debe ser un texto válido' })
    @IsNotEmpty({ message: 'La hora es obligatoria' })
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'La hora debe tener el formato HH:MM (ej: 14:30)'
    })
    hora: string; // Formato: "14:30"

    @IsEnum(['presencial', 'virtual', 'hibrida'], {
        message: 'La modalidad debe ser: presencial, virtual o hibrida'
    })
    @IsNotEmpty({ message: 'La modalidad es obligatoria' })
    modalidad: 'presencial' | 'virtual' | 'hibrida';

    @IsString({ message: 'El lugar o enlace debe ser un texto válido' })
    @IsNotEmpty({ message: 'El lugar o enlace es obligatorio' })
    @MaxLength(500, { message: 'El lugar o enlace no puede exceder 500 caracteres' })
    lugar_enlace: string; // Si es presencial: dirección, si es virtual: URL

    @IsInt({ message: 'El ID de la categoría debe ser un número entero' })
    @IsNotEmpty({ message: 'La categoría es obligatoria' })
    @Type(() => Number)
    categoria_id: number;

    @IsString({ message: 'Los ponentes deben ser un texto válido' })
    @IsNotEmpty({ message: 'Los ponentes son obligatorios' })
    @MinLength(5, { message: 'Debe especificar al menos un ponente' })
    ponentes: string; // Texto libre: "Dr. Juan Pérez, Dra. María López"

    @IsString({ message: 'El público objetivo debe ser un texto válido' })
    @IsNotEmpty({ message: 'El público objetivo es obligatorio' })
    @MaxLength(255, { message: 'El público objetivo no puede exceder 255 caracteres' })
    publico_objetivo: string; // Ej: "Estudiantes de licenciatura", "Profesionales en biología"

}
