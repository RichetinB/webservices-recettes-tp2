import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Inject,
    type OnModuleInit,
    Param,
    Post,
    Req,
} from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { type Recipe, type RecipeServiceClient } from '@recipes/contracts';
import { userMetadata } from '@recipes/contracts/grpc';
import { lastValueFrom } from 'rxjs';

import { type AuthenticatedRequest } from '../auth/auth.guard.js';
import { RECIPE_CLIENT } from '../common/grpc.js';
import { RecipeInputDto } from './recipe.dto.js';

@Controller('recipes')
export class RecipesController implements OnModuleInit {
    // Set in onModuleInit, once the gRPC client is ready
    private recipes!: RecipeServiceClient;

    constructor(@Inject(RECIPE_CLIENT) private readonly client: ClientGrpc) { }

    @Post()
    create(
        @Req() { user }: AuthenticatedRequest,
        @Body() body: RecipeInputDto,
    ): Promise<Recipe> {
        return lastValueFrom(
            this.recipes.createRecipe(body, userMetadata(user.id)),
        );
    }

    @Delete(':id')
    @HttpCode(204)
    async delete(
        @Req() { user }: AuthenticatedRequest,
        @Param('id') id: string,
    ): Promise<void> {
        await lastValueFrom(
            this.recipes.deleteRecipe({ id }, userMetadata(user.id)),
        );
    }

    @Get(':id')
    get(
        @Req() { user }: AuthenticatedRequest,
        @Param('id') id: string,
    ): Promise<Recipe> {
        return lastValueFrom(this.recipes.getRecipe({ id }, userMetadata(user.id)));
    }

    /** The 50 latest recipes */
    @Get()
    async list(@Req() { user }: AuthenticatedRequest): Promise<Recipe[]> {
        const { recipes } = await lastValueFrom(
            this.recipes.listRecipes({ limit: 50 }, userMetadata(user.id)),
        );

        return recipes;
    }

    onModuleInit() {
        this.recipes = this.client.getService<RecipeServiceClient>('RecipeService');
    }
}