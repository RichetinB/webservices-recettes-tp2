import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
 
import { config } from './config.js';
import { RecipeController } from './recipe.controller.js';
import { Recipe, RecipeSchema } from './recipe.schema.js';
 
@Module({
  controllers: [RecipeController],
  imports: [
    MongooseModule.forRoot(config.mongoUrl, { dbName: 'recipes' }),
    MongooseModule.forFeature([{ name: Recipe.name, schema: RecipeSchema }]),
  ],
})
export class AppModule {}