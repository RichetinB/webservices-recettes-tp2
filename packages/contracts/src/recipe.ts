import type { Metadata } from '@grpc/grpc-js';
import type { Observable } from 'rxjs';
 
// TypeScript mirror of proto/recipe.proto (fields in camelCase, see the loader options)
 
export interface Recipe {
  createdAt: string;
  id: string;
  ingredients: string[];
  ownerId: string;
  steps: string[];
  title: string;
}
 
/** gRPC `Empty` message */
export type Empty = Record<string, never>;
 
export interface ListRecipesRequest {
  limit: number;
}
 
export interface ListRecipesResponse {
  recipes: Recipe[];
}
 
export interface RecipeIdRequest {
  id: string;
}
 
export interface CreateRecipeRequest {
  ingredients: string[];
  steps: string[];
  title: string;
}
 
/** Every call carries the caller's identity in its metadata (see grpc.ts) */
export interface RecipeServiceClient {
  createRecipe(
    request: CreateRecipeRequest,
    metadata: Metadata,
  ): Observable<Recipe>;
  deleteRecipe(request: RecipeIdRequest, metadata: Metadata): Observable<Empty>;
  getRecipe(request: RecipeIdRequest, metadata: Metadata): Observable<Recipe>;
  listRecipes(
    request: ListRecipesRequest,
    metadata: Metadata,
  ): Observable<ListRecipesResponse>;
}