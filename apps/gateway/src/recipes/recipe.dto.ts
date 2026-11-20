import {
    ArrayMaxSize,
    ArrayMinSize,
    IsArray,
    IsString,
    Length,
} from 'class-validator';

// The owner is not a field: the gateway sends the caller's id in the metadata

export class RecipeInputDto {
    @IsString()
    @Length(3, 120)
    title!: string;

    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(50)
    @IsString({ each: true })
    ingredients!: string[];

    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(50)
    @IsString({ each: true })
    steps!: string[];
}