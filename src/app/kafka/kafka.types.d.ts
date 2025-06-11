import { ModuleMetadata } from '@nestjs/common';
import { UserType } from '@app/app.constants';
import {
  AccountKey,
  AdminKey,
  UserKey,
  MailKey,
  SmsKey,
} from './kafka.constants';

export interface IRegisterOptions {
  brokers: string[];
  clientId: string;
  groupId: string;
  sasl?: {
    username: string;
    password: string;
  };
}

export interface IAsyncRegisterOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (
    ...args: Array<unknown>
  ) => Promise<IRegisterOptions> | IRegisterOptions;
  inject?: Array[];
}

export interface IPayload<M> {
  message: M;
}

export interface IPhone {
  code: string;
  number: string;
}

export interface IName {
  first: string;
  last: string;
}

export namespace IAccount {
  export interface SubAdmin {
    _id: string;
    name: {
      first: string;
      last: string;
    };
    email: string;
    isRoot: boolean;
    type: UserType;
    password: string | undefined;
    permissions: Record<string, string[]>;
    createdAt: string;
    updatedAt: string;
  }
  export interface Create {
    _id: string;
    name: {
      first: string;
      last: string;
    };
    email: string;
    type: UserType;
    isRoot: boolean;
    password: string;
    permissions: Record<string, string[]>;
    createdAt: string;
    updatedAt: string;
  }
  export interface Update {
    _id: string;
    id?: string;
    name?: IName;
    phone?: IPhone;
    avatar?: string;
    blockedAt?: string;
    permissions?: Record<string, string[]>;
    isSetupDone?: boolean;
  }
  export interface Delete {
    _id: string;
  }
  export interface Status {
    _id: string;
    blockedAt?: string;
  }
  export interface UpdatePermission {
    ids: string[];
    permissions: Record<string, string[]>;
  }
  export interface Verify {
    to: string;
    otp: string;
  }
  export interface ResetMFA {
    id: string;
    isMFASetup?: boolean;
  }
  export type Logout = Record<string, unknown>;
}

export interface IAccountMap {
  [AccountKey.Create]: IAccount.Create;
  [AccountKey.Update]: IAccount.Update;
  [AccountKey.Delete]: IAccount.Delete;
  [AccountKey.Status]: IAccount.ChangeStatus;
  [AccountKey.SyncPermission]: IAccount.UpdatePermission;
  [AccountKey.Subadmin]: IAccount.SubAdmin;
  [AccountKey.Logout]: IAccount.Logout;
}

export namespace IUser {
  export type Create = Record<string, unknown>;
  export type Update = Record<string, unknown>;
  export type UpdateLastLogin = Record<string, unknown>;
  export type StoreDeviceToken = Record<string, unknown>;
  export type RegisterSetting = Record<string, unknown>;
  export type SyncPlatform = Record<string, unknown>;

  export interface InitiateDeleteAccount {
    id: string;
    deleteRequestedAt: Date;
    reason: string;
  }

  export interface RevokeDeleteAccount {
    id: string;
  }

  export interface SignUp {
    name: IName;
    email: string;
    _id: string;
    isRoot: boolean;
  }
}

export interface IUserMap {
  [UserKey.Create]: IUser.Create;
  [UserKey.Update]: IUser.Update;
  [UserKey.SignUp]: IUser.SignUp;
  [UserKey.LastLoginAt]: IUser.UpdateLastLogin;
  [UserKey.InitiateDeleteAccount]: IUser.InitiateDeleteAccount;
  [UserKey.RevokeDeleteAccount]: IUser.RevokeDeleteAccount;
  [UserKey.StoreDeviceToken]: IUser.StoreDeviceToken;
  [UserKey.RegisterSetting]: IUser.RegisterSetting;
  [UserKey.SyncPlatform]: IUser.SyncPlatform;
}

export namespace IAdmin {
  // export type UpdateLastLogin = Record<string, unknown>;
  export interface UpdateLastLogin {
    _id: string;
    lastLogin: Date;
    isMFASetup: boolean;
  }
  export interface ResetMFA {
    id: string;
    isMFASetup: boolean;
  }

  export interface updateMfaVerified {
    _id: string;
    isMfaVerified: boolean;
  }
}
export interface IAdminMap {
  [AdminKey.UpdateLastLogin]: IAdmin.UpdateLastLogin;
  [AdminKey.ResetMFA]: IAdmin.ResetMFA;
  [AdminKey.updateMfaVerified]: IAdmin.updateMfaVerified;
}

export namespace IMail {
  export interface WelcomeCustomer {
    name: string;
    to: string;
  }

  export interface WelcomeDriver {
    name: string;
    to: string;
  }

  // To be updated by Umair later
  export interface WelcomeAdmin {
    name: IName;
    email?: string;
    password?: string;
  }

  export interface validateUserEmail {
    email: string;
    name: IName;
    password: string;
    emailVerificationLink: string;
  }

  export interface ForgetPassword {
    token: string;
    type: string;
    email: string;
    name: string;
  }

  export interface ChangePassword {
    type: string;
    name: string;
    email: string;
  }
  export interface SetPassword {
    type: string;
    name: string;
    email: string;
  }

  export interface WelcomeUser {
    email: string;
  }
}

export interface IMailMap {
  // [MailKey.WelcomeDriver]: IMail.WelcomeDriver;
  // [MailKey.WelcomeCustomer]: IMail.WelcomeCustomer;
  [MailKey.WelcomeAdmin]: IMail.WelcomeAdmin;
  [MailKey.validateUser]: IMail.validateUser;
  [MailKey.ForgetPassword]: IMail.ForgetPassword;
  [MailKey.ChangePassword]: IMail.ChangePassword;
  [MailKey.SetPassword]: IMail.SetPassword;
  [MailKey.VerifyAccount]: IMail.VerifyAccount;
  [MailKey.WelcomeUser]: IMail.WelcomeUser;
}

export interface ISms {
  VerifyAccount: Record<string, string>;
}
export interface ISmsMap {
  [SmsKey.VerifyAccount]: ISms.VerifyAccount;
}
