export {}

declare global {
  interface SpeechRecognitionEventResultItem {
    transcript: string
    confidence: number
  }
  interface SpeechRecognitionResult {
    readonly length: number
    isFinal: boolean
    [index: number]: SpeechRecognitionEventResultItem
  }
  interface SpeechRecognitionResultList {
    readonly length: number
    [index: number]: SpeechRecognitionResult
  }
  interface SpeechRecognitionEvent extends Event {
    resultIndex: number
    results: SpeechRecognitionResultList
  }
  interface SpeechRecognitionErrorEvent extends Event {
    error: string
    message: string
  }
  interface SpeechRecognition extends EventTarget {
    lang: string
    continuous: boolean
    interimResults: boolean
    maxAlternatives: number
    start(): void
    stop(): void
    abort(): void
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null
    onend: ((this: SpeechRecognition, ev: Event) => void) | null
    onstart: ((this: SpeechRecognition, ev: Event) => void) | null
  }
}
