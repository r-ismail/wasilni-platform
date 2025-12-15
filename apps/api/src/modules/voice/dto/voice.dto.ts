import { IsString, IsOptional, IsEnum } from 'class-validator';

export enum VoiceLanguage {
  ARABIC = 'ar',
  ENGLISH = 'en',
}

export class ProcessVoiceCommandDto {
  @IsString()
  audioBase64: string;

  @IsEnum(VoiceLanguage)
  @IsOptional()
  language?: VoiceLanguage = VoiceLanguage.ARABIC;

  @IsString()
  @IsOptional()
  userId?: string;
}

export class TextToSpeechDto {
  @IsString()
  text: string;

  @IsEnum(VoiceLanguage)
  @IsOptional()
  language?: VoiceLanguage = VoiceLanguage.ARABIC;
}
