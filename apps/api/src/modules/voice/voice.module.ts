import { Module } from '@nestjs/common';
import { VoiceController } from './voice.controller';
import { VoiceService } from './services/voice.service';

@Module({
  controllers: [VoiceController],
  providers: [VoiceService],
  exports: [VoiceService],
})
export class VoiceModule {}
