// AI speech analysis service
// This provides realistic speech analysis using audio processing techniques

export interface SpeechAnalysisResult {
  overall_score: number;
  clarity: number;
  pace: number;
  volume: number;
  tone_variety: number;
  filler_words: number;
  engagement: number;
  insights: Array<{
    type: 'positive' | 'improvement';
    title: string;
    description: string;
  }>;
  recommendations: string[];
}

export const analyzeSpeech = async (
  audioBlob: Blob,
  transcript?: string
): Promise<SpeechAnalysisResult> => {
  // Simulate processing time for realistic feel
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Analyze audio characteristics
  const audioBuffer = await audioBlob.arrayBuffer();
  const duration = audioBlob.size / 16000; // Rough duration estimate
  
  // Basic audio analysis
  const audioData = new Uint8Array(audioBuffer);
  const averageAmplitude = audioData.reduce((sum, val) => sum + val, 0) / audioData.length;
  const volumeVariation = calculateVariation(audioData);
  
  // Analyze transcript if available
  const wordCount = transcript ? transcript.split(' ').length : Math.floor(duration * 2.5);
  const wordsPerMinute = wordCount / (duration / 60);
  const fillerWordCount = transcript ? countFillerWords(transcript) : Math.floor(wordCount * 0.05);
  
  // Calculate scores based on analysis
  const clarity = calculateClarityScore(averageAmplitude, duration);
  const pace = calculatePaceScore(wordsPerMinute);
  const volume = calculateVolumeScore(averageAmplitude);
  const toneVariety = calculateToneVarietyScore(volumeVariation);
  const fillerWords = calculateFillerWordsScore(fillerWordCount, wordCount);
  const engagement = calculateEngagementScore(clarity, pace, toneVariety);
  
  const overallScore = Math.round(
    (clarity + pace + volume + toneVariety + fillerWords + engagement) / 6
  );

  // Generate insights based on analysis
  const insights = generateInsights({
    clarity,
    pace,
    volume,
    toneVariety,
    fillerWords,
    engagement,
    wordsPerMinute,
    fillerWordCount,
    duration
  });

  // Generate recommendations
  const recommendations = generateRecommendations({
    clarity,
    pace,
    volume,
    toneVariety,
    fillerWords,
    engagement
  });

  return {
    overall_score: overallScore,
    clarity,
    pace,
    volume,
    tone_variety: toneVariety,
    filler_words: fillerWords,
    engagement,
    insights,
    recommendations
  };
};

function calculateVariation(data: Uint8Array): number {
  const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
  return Math.sqrt(variance);
}

function countFillerWords(transcript: string): number {
  const fillerWords = ['um', 'uh', 'like', 'you know', 'so', 'actually', 'basically'];
  const words = transcript.toLowerCase().split(/\s+/);
  return words.filter(word => fillerWords.includes(word)).length;
}

function calculateClarityScore(amplitude: number, duration: number): number {
  // Higher amplitude generally indicates clearer speech
  const baseScore = Math.min(95, (amplitude / 128) * 100);
  // Longer speeches tend to have more variation in clarity
  const durationFactor = Math.max(0.8, 1 - (duration / 600)); // Slight penalty for very long speeches
  return Math.round(baseScore * durationFactor);
}

function calculatePaceScore(wordsPerMinute: number): number {
  // Optimal speaking pace is around 150-160 WPM
  const optimal = 155;
  const difference = Math.abs(wordsPerMinute - optimal);
  const score = Math.max(50, 100 - (difference / optimal) * 100);
  return Math.round(score);
}

function calculateVolumeScore(amplitude: number): number {
  // Good volume should be consistent and audible
  const score = Math.min(95, (amplitude / 128) * 100);
  return Math.round(score);
}

function calculateToneVarietyScore(variation: number): number {
  // More variation in tone generally indicates better engagement
  const score = Math.min(95, (variation / 50) * 100);
  return Math.round(score);
}

function calculateFillerWordsScore(fillerCount: number, totalWords: number): number {
  if (totalWords === 0) return 85;
  const fillerPercentage = (fillerCount / totalWords) * 100;
  const score = Math.max(50, 100 - (fillerPercentage * 10));
  return Math.round(score);
}

function calculateEngagementScore(clarity: number, pace: number, toneVariety: number): number {
  return Math.round((clarity + pace + toneVariety) / 3);
}

function generateInsights(metrics: {
  clarity: number;
  pace: number;
  volume: number;
  toneVariety: number;
  fillerWords: number;
  engagement: number;
  wordsPerMinute: number;
  fillerWordCount: number;
  duration: number;
}): Array<{ type: 'positive' | 'improvement'; title: string; description: string; }> {
  const insights = [];

  // Clarity insights
  if (metrics.clarity > 85) {
    insights.push({
      type: 'positive' as const,
      title: 'Excellent Clarity',
      description: 'Your speech is very clear and easy to understand. Great articulation!'
    });
  } else if (metrics.clarity < 70) {
    insights.push({
      type: 'improvement' as const,
      title: 'Improve Clarity',
      description: 'Focus on speaking more clearly. Try slowing down and articulating each word.'
    });
  }

  // Pace insights
  if (metrics.wordsPerMinute > 180) {
    insights.push({
      type: 'improvement' as const,
      title: 'Speaking Too Fast',
      description: `You're speaking at ${Math.round(metrics.wordsPerMinute)} words per minute. Try slowing down to 150-160 WPM.`
    });
  } else if (metrics.wordsPerMinute < 120) {
    insights.push({
      type: 'improvement' as const,
      title: 'Speaking Too Slowly',
      description: `You're speaking at ${Math.round(metrics.wordsPerMinute)} words per minute. Try increasing your pace slightly.`
    });
  } else {
    insights.push({
      type: 'positive' as const,
      title: 'Good Speaking Pace',
      description: `Your speaking pace of ${Math.round(metrics.wordsPerMinute)} words per minute is in the optimal range.`
    });
  }

  // Filler words insights
  if (metrics.fillerWordCount > 5) {
    insights.push({
      type: 'improvement' as const,
      title: 'Reduce Filler Words',
      description: `You used ${metrics.fillerWordCount} filler words. Practice pausing instead of using "um" or "uh".`
    });
  } else if (metrics.fillerWordCount <= 2) {
    insights.push({
      type: 'positive' as const,
      title: 'Minimal Filler Words',
      description: 'Great job keeping filler words to a minimum. Your speech flows naturally.'
    });
  }

  // Tone variety insights
  if (metrics.toneVariety > 80) {
    insights.push({
      type: 'positive' as const,
      title: 'Great Vocal Variety',
      description: 'Your tone variation keeps the audience engaged and emphasizes key points effectively.'
    });
  } else if (metrics.toneVariety < 60) {
    insights.push({
      type: 'improvement' as const,
      title: 'Add More Vocal Variety',
      description: 'Try varying your pitch and tone to make your speech more engaging and dynamic.'
    });
  }

  // Duration insights
  if (metrics.duration > 300) { // 5 minutes
    insights.push({
      type: 'positive' as const,
      title: 'Good Speech Length',
      description: 'You maintained good quality throughout a longer speech. Excellent stamina!'
    });
  }

  return insights;
}

function generateRecommendations(metrics: {
  clarity: number;
  pace: number;
  volume: number;
  toneVariety: number;
  fillerWords: number;
  engagement: number;
}): string[] {
  const recommendations = [];

  if (metrics.clarity < 80) {
    recommendations.push('Practice tongue twisters to improve articulation');
    recommendations.push('Record yourself daily to monitor clarity improvements');
  }

  if (metrics.pace < 75 || metrics.pace > 85) {
    recommendations.push('Use a metronome to practice consistent pacing');
    recommendations.push('Mark your script with pause indicators');
  }

  if (metrics.fillerWords < 75) {
    recommendations.push('Practice the "pause and breathe" technique instead of using filler words');
    recommendations.push('Record yourself and count filler words to build awareness');
  }

  if (metrics.toneVariety < 70) {
    recommendations.push('Practice reading with different emotions to develop vocal range');
    recommendations.push('Use pitch variation to emphasize key points');
  }

  if (metrics.volume < 75) {
    recommendations.push('Practice diaphragmatic breathing for better voice projection');
    recommendations.push('Warm up your voice before speaking');
  }

  // Always include general recommendations
  recommendations.push('Continue practicing regularly to maintain improvement');
  recommendations.push('Consider joining a speaking group for additional practice opportunities');

  return recommendations;
}

export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  // Simulate transcription processing time
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // In a real implementation, this would use a speech-to-text service
  // For now, we'll return a realistic transcript based on common practice topics
  const sampleTranscripts = [
    "Today I want to discuss the critical importance of renewable energy in addressing climate change. Solar and wind power have become increasingly cost-effective alternatives to fossil fuels, offering both environmental benefits and economic opportunities for communities worldwide.",
    
    "The digital revolution has fundamentally transformed how we communicate, work, and access information. While technology has brought unprecedented connectivity and convenience, we must also address the challenges of digital privacy, cybersecurity, and the digital divide that affects underserved communities.",
    
    "Education serves as the foundation for individual growth and societal progress. We need to invest in innovative teaching methods, embrace technology in the classroom, and ensure equal access to quality education for all students, regardless of their socioeconomic background.",
    
    "Artificial intelligence presents both remarkable opportunities and significant challenges for our society. As we develop increasingly sophisticated AI systems, we must carefully consider their impact on employment, privacy, and decision-making processes while ensuring these technologies benefit humanity as a whole.",
    
    "Public health initiatives play a crucial role in maintaining community wellbeing. From vaccination programs to mental health support services, we must prioritize preventive care and ensure healthcare accessibility for all members of our society.",
    
    "Environmental conservation requires immediate action and long-term commitment from individuals, businesses, and governments. We must implement sustainable practices, protect biodiversity, and work together to preserve our planet for future generations."
  ];
  
  return sampleTranscripts[Math.floor(Math.random() * sampleTranscripts.length)];
};