import { Args, Field, Int, ObjectType, Query, Resolver } from '@nestjs/graphql';

@ObjectType()
export class ProductResponse {
  @Field()
  route!: string;

  @Field()
  message!: string;

  @Field(() => Int)
  page!: number;

  @Field(() => Int)
  limit!: number;
}

@Resolver()
export class ProductsResolver {
  @Query(() => ProductResponse)
  products(
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
  ): ProductResponse {
    return {
      route: 'list-products',
      message: 'Products retrieved through GraphQL API Gateway',
      page,
      limit,
    };
  }
}
