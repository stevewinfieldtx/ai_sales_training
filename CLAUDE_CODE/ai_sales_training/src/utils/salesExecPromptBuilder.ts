import createSalesInfluenceMetaPrompt, {
  SalesInfluenceMetaPromptInput
} from './createSalesInfluenceMetaPrompt';

export interface SalesOfferingContext extends SalesInfluenceMetaPromptInput {}

export interface SalesExecChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface BuildSalesExecMessagesArgs {
  systemPrompt: string;
  messages: Array<Omit<SalesExecChatMessage, 'role'> & { role: 'user' | 'assistant' }>;
  offering: SalesOfferingContext;
}

export interface BuildSalesExecMessagesResult {
  metaPrompt: string;
  messages: SalesExecChatMessage[];
}

export const buildSalesExecMessages = (
  args: BuildSalesExecMessagesArgs
): BuildSalesExecMessagesResult => {
  const { systemPrompt, messages, offering } = args;
  const metaPrompt = createSalesInfluenceMetaPrompt(offering);

  const formattedMessages: SalesExecChatMessage[] = [
    { role: 'system', content: metaPrompt },
    { role: 'system', content: systemPrompt },
    ...messages.map((message) => ({
      role: message.role,
      content: message.content
    }))
  ];

  return { metaPrompt, messages: formattedMessages };
};

export default buildSalesExecMessages;
