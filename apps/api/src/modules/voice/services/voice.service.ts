import { Injectable, BadRequestException } from '@nestjs/common';
import { ProcessVoiceCommandDto, TextToSpeechDto, VoiceLanguage } from '../dto/voice.dto';

interface VoiceCommandResult {
  intent: string;
  entities: Record<string, any>;
  confidence: number;
  transcription: string;
  response: string;
}

@Injectable()
export class VoiceService {
  /**
   * Process voice command - Speech-to-Text + NLU
   * In production, integrate with Google Cloud Speech API or OpenAI Whisper
   */
  async processVoiceCommand(dto: ProcessVoiceCommandDto): Promise<VoiceCommandResult> {
    // Step 1: Convert speech to text
    const transcription = await this.speechToText(dto.audioBase64, dto.language);

    // Step 2: Understand intent and extract entities
    const nluResult = await this.understandIntent(transcription, dto.language);

    // Step 3: Generate response
    const response = await this.generateResponse(nluResult, dto.language);

    return {
      ...nluResult,
      transcription,
      response,
    };
  }

  /**
   * Convert speech to text
   * Production: Use Google Cloud Speech API, OpenAI Whisper, or local Vosk
   */
  private async speechToText(audioBase64: string, language?: VoiceLanguage): Promise<string> {
    // TODO: Integrate with speech-to-text API
    // For now, return mock transcription
    
    console.log(`[VOICE] Processing audio (${audioBase64.length} bytes) in ${language}`);
    
    // Mock transcription for testing
    return "أريد سيارة من صنعاء إلى عدن"; // "I want a car from Sana'a to Aden"
  }

  /**
   * Understand intent and extract entities using NLU
   * Production: Use Dialogflow, Rasa, or custom NLU model
   */
  private async understandIntent(
    text: string,
    language?: VoiceLanguage,
  ): Promise<{ intent: string; entities: Record<string, any>; confidence: number }> {
    // Simple keyword-based NLU (replace with AI in production)
    const lowerText = text.toLowerCase();

    // Book ride intent
    if (
      lowerText.includes('سيارة') ||
      lowerText.includes('توصيل') ||
      lowerText.includes('ride') ||
      lowerText.includes('taxi')
    ) {
      return {
        intent: 'book_ride',
        entities: this.extractRideEntities(text),
        confidence: 0.85,
      };
    }

    // Book parcel intent
    if (
      lowerText.includes('طرد') ||
      lowerText.includes('شحنة') ||
      lowerText.includes('parcel') ||
      lowerText.includes('package')
    ) {
      return {
        intent: 'book_parcel',
        entities: this.extractParcelEntities(text),
        confidence: 0.80,
      };
    }

    // Check trip status
    if (
      lowerText.includes('وين') ||
      lowerText.includes('موقع') ||
      lowerText.includes('where') ||
      lowerText.includes('status')
    ) {
      return {
        intent: 'check_status',
        entities: {},
        confidence: 0.75,
      };
    }

    // Cancel trip
    if (
      lowerText.includes('إلغاء') ||
      lowerText.includes('cancel')
    ) {
      return {
        intent: 'cancel_trip',
        entities: {},
        confidence: 0.90,
      };
    }

    // Unknown intent
    return {
      intent: 'unknown',
      entities: {},
      confidence: 0.0,
    };
  }

  /**
   * Extract ride booking entities from text
   */
  private extractRideEntities(text: string): Record<string, any> {
    const entities: Record<string, any> = {};

    // Extract cities (simple pattern matching - use NER in production)
    const cities = ['صنعاء', 'عدن', 'تعز', 'الحديدة', 'إب', 'sana\'a', 'aden', 'taiz'];
    
    for (const city of cities) {
      if (text.toLowerCase().includes(city)) {
        if (!entities.pickup) {
          entities.pickup = city;
        } else if (!entities.dropoff) {
          entities.dropoff = city;
        }
      }
    }

    // Extract time indicators
    if (text.includes('الآن') || text.includes('now')) {
      entities.when = 'now';
    } else if (text.includes('غدا') || text.includes('tomorrow')) {
      entities.when = 'tomorrow';
    }

    // Women-only ride indicator
    if (text.includes('سائقة') || text.includes('female driver') || text.includes('women')) {
      entities.womenOnly = true;
    }

    return entities;
  }

  /**
   * Extract parcel entities from text
   */
  private extractParcelEntities(text: string): Record<string, any> {
    const entities: Record<string, any> = {};

    // Extract size
    if (text.includes('صغير') || text.includes('small')) {
      entities.size = 'small';
    } else if (text.includes('كبير') || text.includes('large')) {
      entities.size = 'large';
    } else {
      entities.size = 'medium';
    }

    // Extract COD indicator
    if (text.includes('دفع عند الاستلام') || text.includes('cod') || text.includes('cash on delivery')) {
      entities.cod = true;
    }

    return entities;
  }

  /**
   * Generate natural language response
   */
  private async generateResponse(
    nluResult: { intent: string; entities: Record<string, any>; confidence: number },
    language?: VoiceLanguage,
  ): Promise<string> {
    const isArabic = language === VoiceLanguage.ARABIC;

    switch (nluResult.intent) {
      case 'book_ride':
        if (nluResult.entities.pickup && nluResult.entities.dropoff) {
          return isArabic
            ? `حسناً، سأحجز لك رحلة من ${nluResult.entities.pickup} إلى ${nluResult.entities.dropoff}`
            : `Okay, I'll book a ride from ${nluResult.entities.pickup} to ${nluResult.entities.dropoff}`;
        }
        return isArabic
          ? 'من فضلك حدد موقع الانطلاق والوجهة'
          : 'Please specify pickup and dropoff locations';

      case 'book_parcel':
        return isArabic
          ? `سأساعدك في إرسال طرد ${nluResult.entities.size || 'متوسط'} الحجم`
          : `I'll help you send a ${nluResult.entities.size || 'medium'} parcel`;

      case 'check_status':
        return isArabic
          ? 'دعني أتحقق من حالة رحلتك'
          : 'Let me check your trip status';

      case 'cancel_trip':
        return isArabic
          ? 'هل أنت متأكد من إلغاء الرحلة؟'
          : 'Are you sure you want to cancel the trip?';

      default:
        return isArabic
          ? 'عذراً، لم أفهم طلبك. هل يمكنك إعادة الصياغة؟'
          : 'Sorry, I didn\'t understand. Can you rephrase?';
    }
  }

  /**
   * Convert text to speech
   * Production: Use Google Cloud Text-to-Speech or Amazon Polly
   */
  async textToSpeech(dto: TextToSpeechDto): Promise<{ audioBase64: string }> {
    // TODO: Integrate with TTS API
    console.log(`[VOICE] Generating speech for: ${dto.text} in ${dto.language}`);
    
    // Return mock audio (in production, return actual audio base64)
    return {
      audioBase64: 'MOCK_AUDIO_BASE64_DATA',
    };
  }

  /**
   * Get supported voice commands help
   */
  getSupportedCommands(language: VoiceLanguage): string[] {
    if (language === VoiceLanguage.ARABIC) {
      return [
        'أريد سيارة من صنعاء إلى عدن',
        'احجز لي رحلة الآن',
        'أريد سائقة (للرحلات النسائية)',
        'أريد إرسال طرد صغير',
        'وين السائق؟',
        'إلغاء الرحلة',
      ];
    }

    return [
      'I want a ride from Sana\'a to Aden',
      'Book me a ride now',
      'I want a female driver',
      'I want to send a small parcel',
      'Where is the driver?',
      'Cancel the trip',
    ];
  }
}
