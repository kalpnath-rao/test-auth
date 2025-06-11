import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@app/guards';
import { StorageService } from './storage.service';
import { GCPSignedUrlInput } from './dto/upload.input';
import { GCPSignedUrlOutput } from './dto/upload.output';

@Resolver(() => Boolean)
export class StorageResolver {
  constructor(private readonly storageService: StorageService) {}

  @Mutation(() => GCPSignedUrlOutput)
  @UseGuards(AuthGuard)
  async generateUploadSignedUrl(
    @Args('input') input: GCPSignedUrlInput,
  ): Promise<GCPSignedUrlOutput> {
    return this.storageService.generateUploadSignedUrl(input);
  }
}
