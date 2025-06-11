export enum AUTH_TYPE {
  GOOGLE_AUTH = '1',
}

export enum NextStep {
  None = '0',
  Verify = '1',
  Setup = '2',
  HomePage = 'HomePage',
  ResetPassword = 'ResetPassword',
}

export enum MFAPlatform {
  GoogleAuth = '1',
  MicrosoftAuth = '2',
}

export enum SocialType {
  Apple = '1',
  Google = '2',
  Facebook = '3',
  LinkedIn = '4',
  github = '5',
}

export enum EmailCheckStep {
  LOGIN = '1',
  REGISTER = '2',
}
