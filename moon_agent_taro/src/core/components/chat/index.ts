/**
 * Chat components index
 * Aligned with moon-agent/components/chat structure
 */

// Types (only export non-duplicate types)
// Note: Message, ChatStatePayload, Product, MeasurementData, AuxiliaryData
// are already exported from @core/stores and @core/schemas
export type { StateComponentProps } from './types';

// Utilities
export { hasVisibleContent, filterVisibleSegments } from './contentUtils';
export { MarkdownText, parseMarkdown } from './MarkdownText';
export type { TextSegment, TextStyle } from './MarkdownText';

// Basic chat components
export { BotAvatar } from './BotAvatar';
export { MessageBubble } from './MessageBubble';
export { TypingIndicator } from './TypingIndicator';
export { ChatInput } from './ChatInput';
export { ErrorState } from './ErrorState';
export { DegradedHint } from './DegradedHint';
export { StreamingIndicator } from './StreamingIndicator';
export { NewMessageHint } from './NewMessageHint';

// State panel components (will be added as they are implemented)
export { WelcomeOptions } from './WelcomeOptions';
export { MeasureGuide } from './MeasureGuide';
export { AuxiliaryInput } from './AuxiliaryInput';
export { SelectCard } from './SelectCard';
export { ShapeSelection } from './ShapeSelection';
export { PainPointCard } from './PainPointCard';
export { PainPointGrid } from './PainPointGrid';
export { LoadingAnalysis } from './LoadingAnalysis';
export { ProductRecommendation } from './ProductRecommendation';
export { StateComponentMap, getStateComponent } from './StateComponents';
