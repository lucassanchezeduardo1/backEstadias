import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   await app.listen(process.env.PORT ?? 3000);
// }
// bootstrap();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // >>> AGREGA ESTA LÍNEA AQUÍ <<<
  app.enableCors(); 
  await app.listen(process.env.PORT ?? 3000);
  
  // Opcional: imprimir en consola para saber que ya arrancó
  console.log('Servidor corriendo en http://localhost:3000');
}
bootstrap();
