import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UsuariosService {
  constructor(
       @InjectRepository(Usuario)
     private usuarioRepo: Repository<Usuario>){ }
   
   
     async createUsuario(
         CreateUsuarioDto: CreateUsuarioDto,
       ) {
         try {
           // 1. Verificar si el email ya existe
           const emailExiste = await this.usuarioRepo.findOne({
             where: { email: CreateUsuarioDto.email}
           });
     
           if (emailExiste) {
             throw new ConflictException('El email ya está registrado');
           }
     
           // 4. Hashear la contraseña ANTES de guardar
           const saltRounds = 10;
           const hashedPassword = await bcrypt.hash(
             CreateUsuarioDto.password,
             saltRounds
           );
     
           // 5. Crear el usuario con contraseña hasheada
           const newUsuario = this.usuarioRepo.create({
             ...CreateUsuarioDto,
             password: hashedPassword, //Contraseña encriptada
           });
     
           // 6. Guardar en la base de datos
           const savedUsuario = await this.usuarioRepo.save(newUsuario);
     
           // 7. Eliminar campos sensibles de la respuesta
           const { password, ...usuarioSinDatosSensibles } = savedUsuario;
     
           return {
             message: 'usuario registrado exitosamente.',
             usuario: usuarioSinDatosSensibles
           };
     
         } catch (error) {
           if (error instanceof ConflictException || error instanceof BadRequestException) {
             throw error;
           }
           console.error('Error al crear usuario:', error);
           throw new InternalServerErrorException('Error al crear el usuario');
         }
       }
   
       async findAll() {
       try {
         return await this.usuarioRepo.find();
       } catch (error) {
         throw new InternalServerErrorException('Error al obtener los usuarios');
       }
     }
   
     async findOne(id: number) {
       try {
         const usuario = await this.usuarioRepo.findOneBy({ id });
         if (!usuario) {
           throw new NotFoundException(`el usuario con el id: ${id} no encontrada`);
         }
         return usuario;
       } catch (error) {
         if (error instanceof NotFoundException) {
           throw error;
         }
         throw new InternalServerErrorException('Error al buscar el usuario');
       }
     }
   
     async updateUsuario(
         id: number,
         updateUsuarioDto: UpdateUsuarioDto,
         fotoBuffer?: Buffer
       ) {
         try {
           const usuario = await this.usuarioRepo.findOneBy({ id });
     
           if (!usuario) {
             throw new NotFoundException(`usuario con el id: ${id} no encontrado`);
           }
     
           // Si se está actualizando la contraseña, hashearla
           if (updateUsuarioDto.password) {
             const saltRounds = 10;
             updateUsuarioDto.password = await bcrypt.hash(
               updateUsuarioDto.password,
               saltRounds
             );
           }
     
           // Si se proporciona una nueva foto, actualizarla
           const datosActualizar = {
             ...updateUsuarioDto,
             ...(fotoBuffer && { foto_perfil: fotoBuffer })
           };
     
           // Actualizar los datos
           const updateUsuario = this.usuarioRepo.merge(
             usuario,
             datosActualizar
           );
     
           const savedUsuario = await this.usuarioRepo.save(updateUsuario);
     
           // Eliminar campos sensibles de la respuesta
           const { password, foto_perfil, ...usuarioSinDatosSensibles } = savedUsuario;
     
           return usuarioSinDatosSensibles;
     
         } catch (error) {
           if (error instanceof NotFoundException) {
             throw error;
           }
           console.error('Error al actualizar usuario:', error);
           throw new InternalServerErrorException('Error al actualizar el usuario');
         }
       }
   
      async removeUsuario(id: number) {
       try {
         const usuario = await this.usuarioRepo.findOneBy({id});
         if(!usuario){
           throw new NotFoundException(`usuario con el id: ${id} no encontrada`);
         }
         await this.usuarioRepo.remove(usuario);
         return {message:`usuario con el id: ${id} se ha eliminado`};
   
       } catch (error){
         if (error instanceof NotFoundException) {
           throw error;
         }
         throw new InternalServerErrorException('Error al eliminar el usuario');
       }
     }
}
