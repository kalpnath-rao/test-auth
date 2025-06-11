export const KAFKA_CONFIG = 'DI:KAFKA_CONFIG';
export const KAFKA_CLIENT = 'DI:KAFKA_CLIENT';
export const KAFKA_CONSUMER = Symbol.for('DI:KAFKA_CONSUMER');
export const KAFKA_PRODUCER = Symbol.for('DI:KAFKA_PRODUCER');
export const KAFKA_ADMIN = Symbol.for('DI:KAFKA_ADMIN');
export const KAFKA_MAPPING = Symbol.for('DI:KAFKA_MAPPING');
export const KAFKA_TOPIC = Symbol.for('DI:KAFKA_TOPIC');

export const KafkaTopic = Object.freeze({
  Account: e('_ACCOUNT'),
  User: e('_USER'),
  Driver: e('_DRIVER'),
  Admin: e('_ADMIN'),
  Mail: e('_MAIL'),
  Sms: e('_SMS'),
});

export enum AccountKey {
  Create = 'CREATE',
  Update = 'UPDATE',
  Delete = 'DELETE',
  Status = 'STATUS',
  SyncPermission = 'SYNC_PERMISSION',
  Subadmin = 'SUBADMIN',
  Logout = 'LOGOUT',
}

export enum UserKey {
  Create = 'CREATE',
  Update = 'UPDATE',
  SignUp = 'SignUp',
  LastLoginAt = 'LAST_LOGIN_AT',
  InitiateDeleteAccount = 'INITIATE_DELETE_ACCOUNT',
  RevokeDeleteAccount = 'REVOKE_DELETE_ACCOUNT',
  StoreDeviceToken = 'STORE_DEVICE_TOKEN',
  RegisterSetting = 'REGISTER_SETTING',
  SyncPlatform = 'SYNC_PLATFORM',
  Logout = 'LOGOUT',
}

export enum AdminKey {
  UpdateLastLogin = 'UPDATE_LAST_LOGIN',
  ResetMFA = 'RESET_MFA',
  updateMfaVerified = 'UPDATE_MFA_VERIFIED',
}

export enum MailKey {
  VerifyAccount = 'VERIFY_ACCOUNT',
  ForgetPassword = 'FORGET_PASSWORD',
  ChangePassword = 'CHANGE_PASSWORD',
  SetPassword = 'SET_PASSWORD',
  WelcomeAdmin = 'WELCOME_ADMIN',
  validateUser = 'VALIDATE_USER',
  WelcomeUser = 'WELCOME_USER',
}

export enum SmsKey {
  VerifyAccount = 'VERIFY_ACCOUNT',
}
