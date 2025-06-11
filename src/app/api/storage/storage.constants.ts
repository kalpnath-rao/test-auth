export enum GCPAction {
  ADMIN_PROFILE = 'ADMIN_PROFILE',
  USER_PROFILE = 'USER_PROFILE',
  ADMIN_BLOG = 'ADMIN_BLOG',
}

export enum AccessEntity {
  User = 'USERS',
  SubAdmin = 'SUB_ADMINS',
}

export enum UploadDir {
  ADMIN_PROFILE = 'private/admin/profile/images',
  ADMIN_BLOG = 'public/blog/images',
  USER_PROFILE = 'private/user/profile/images',
}

export const FileNamePrefix = {
  ADMIN_PROFILE: 'profile_image_',
  ADMIN_BLOG: 'blog_',
  USER_PROFILE: 'profile_image_',
};

export enum FileExtension {
  JPEG = 'jpeg',
  PNG = 'png',
  JPG = 'jpg',
}

export enum SignedUrlAction {
  WRITE = 'write',
  READ = 'read',
  DELETE = 'delete',
}
