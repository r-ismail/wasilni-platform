import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { VoiceService } from './services/voice.service';
import { ProcessVoiceCommandDto, TextToSpeechDto, VoiceLanguage } from './dto/voice.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('voice')
@UseGuards(JwtAuthGuard)
export class VoiceController {
  constructor(private readonly voiceService: VoiceService) {}

  @Post('process')
  async processVoiceCommand(
    @CurrentUser() user: any,
    @Body() dto: ProcessVoiceCommandDto,
  ) {
    dto.userId = user.sub;
    return this.voiceService.processVoiceCommand(dto);
  }

  @Post('text-to-speech')
  async textToSpeech(@Body() dto: TextToSpeechDto) {
    return this.voiceService.textToSpeech(dto);
  }

  @Get('commands')
  getSupportedCommands(@Query('language') language: VoiceLanguage = VoiceLanguage.ARABIC) {
    return {
      language,
      commands: this.voiceService.getSupportedCommands(language),
    };
  }
}
