import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField } from '@repo/ui/components/form';
import { ArrowUpIcon } from '@repo/ui/components/icons/lucide';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from '@repo/ui/components/input-group';

import { useForm, useWatch } from 'react-hook-form';
import z from 'zod';

const chatFormSchema = z.object({
  message: z.string().min(5).max(120),
});

type ChatInputProps = {
  onSubmit: (message: string) => void;
  disabled: boolean;
};

export function ChatInput({ onSubmit, disabled }: ChatInputProps) {
  const form = useForm({
    resolver: zodResolver(chatFormSchema),
    defaultValues: {
      message: '',
    },
  });

  const message = useWatch({ control: form.control, name: 'message' });

  const handleSubmit = (values: z.infer<typeof chatFormSchema>) => {
    onSubmit(values.message);
    form.reset();
  };

  return (
    <div className="px-2 pb-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} id="chat-form">
          <InputGroup>
            <FormField
              control={form.control}
              render={({ field }) => (
                <InputGroupTextarea
                  placeholder="Ask any questions about this website !"
                  {...field}
                />
              )}
              name="message"
            />
            <InputGroupAddon align="block-end">
              <p className="text-xs leading-7 [&:not(:first-child)]:mt-6">
                {message.length > 0
                  ? `${120 - message.length} characters left`
                  : 'Powered by Mistral AI'}
              </p>
              <InputGroupButton
                variant="default"
                className="ml-auto cursor-pointer disabled:cursor-not-allowed"
                disabled={disabled}
                form="chat-form"
                type="submit"
                size="sm"
              >
                Send
                <ArrowUpIcon />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </form>
      </Form>
    </div>
  );
}
