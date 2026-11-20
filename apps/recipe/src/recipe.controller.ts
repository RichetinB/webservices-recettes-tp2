	import { type Metadata, status } from '@grpc/grpc-js';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import {
  type CreateRecipeRequest,
  type Empty,
  type ListRecipesRequest,
  type ListRecipesResponse,
  type Recipe as RecipeDto,
  type RecipeIdRequest,
} from '@recipes/contracts';
import { requireUserId, rpcError } from '@recipes/contracts/grpc';
import { type HydratedDocument, isValidObjectId, type Model } from 'mongoose';
 
import { Recipe } from './recipe.schema.js';
 
@Controller()
export class RecipeController {
  constructor(
    @InjectModel(Recipe.name) private readonly recipes: Model<Recipe>,
  ) {}
 
  @GrpcMethod('RecipeService', 'CreateRecipe')
  async create(
    request: CreateRecipeRequest,
    metadata: Metadata,
  ): Promise<RecipeDto> {
    // The owner is the caller, as told by the gateway: never a field of the request
    const recipe = await this.recipes.create({
      ...request,
      ownerId: requireUserId(metadata),
    });
 
    return toDto(recipe);
  }
 
  @GrpcMethod('RecipeService', 'DeleteRecipe')
  async delete({ id }: RecipeIdRequest, metadata: Metadata): Promise<Empty> {
    const recipe = await this.find(id);
    if (recipe.ownerId !== requireUserId(metadata)) {
      throw rpcError(status.PERMISSION_DENIED, 'Not your recipe');
    }
    await recipe.deleteOne();
 
    return {};
  }
 
  @GrpcMethod('RecipeService', 'GetRecipe')
  async get({ id }: RecipeIdRequest): Promise<RecipeDto> {
    return toDto(await this.find(id));
  }
 
  @GrpcMethod('RecipeService', 'ListRecipes')
  async list({ limit }: ListRecipesRequest): Promise<ListRecipesResponse> {
    // Latest first; 0 (the proto default) means "no preference", and 100 at most
    const recipes = await this.recipes
      .find()
      .sort({ createdAt: -1 })
      .limit(Math.min(limit || 50, 100));
 
    return { recipes: recipes.map((recipe) => toDto(recipe)) };
  }
 
  /** A malformed id is not found either: no CastError, no 500 */
  private async find(id: string) {
    const recipe = isValidObjectId(id) ? await this.recipes.findById(id) : null;
    if (!recipe) throw rpcError(status.NOT_FOUND, 'Recipe not found');
 
    return recipe;
  }
}
 
function toDto(recipe: HydratedDocument<Recipe>): RecipeDto {
  return {
    createdAt: recipe.createdAt.toISOString(),
    id: recipe.id,
    ingredients: recipe.ingredients,
    ownerId: recipe.ownerId,
    steps: recipe.steps,
    title: recipe.title,
  };
}