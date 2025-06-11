import { Resolver, Mutation, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard, RefreshGuard } from '@app/guards';
import { User } from '@app/decorators';
import { SessionService } from './session.service';
import { GraphQLResultDto } from '@app/app.dto';

@Resolver(() => Boolean)
export class SessionResolver {
  constructor(private readonly sessionService: SessionService) {}

  @Mutation(() => GraphQLResultDto)
  @UseGuards(RefreshGuard)
  async logout(@User() user: IUser): Promise<void> {
    return this.sessionService.logout(user.token, user.id);
  }

  @Mutation(() => GraphQLResultDto)
  @UseGuards(RefreshGuard)
  async verifySessionMFA(@User() user: IUser): Promise<string> {
    return this.sessionService.refresh(user);
  }

  @Query(() => GraphQLResultDto)
  @UseGuards(AuthGuard)
  async currentSession(@User() user: IUser): Promise<string> {
    const result = await this.sessionService.generate(user);
    return result;
  }
}
