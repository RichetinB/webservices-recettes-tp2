	import { NestFactory } from '@nestjs/core';
import { grpcOptions } from '@recipes/contracts/grpc';
 
import { AppModule } from './app.module.js';
import { config } from './config.js';
 
async function bootstrap() {
  // Same as the user service: a gRPC server, the contract comes from recipe.proto
  const app = await NestFactory.createMicroservice(
    AppModule,
    grpcOptions('recipe', config.grpcUrl),
  );
  app.enableShutdownHooks();
  await app.listen();
}
await bootstrap();