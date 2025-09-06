import { validateUIMessages } from 'ai';
import { ValidationArguments, ValidationOptions, registerDecorator } from 'class-validator';

export function IsValidUiMessageArray(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidUiMessageArray',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        async validate(value: unknown) {
          try {
            await validateUIMessages({ messages: value });
            return true;
          } catch {
            return false;
          }
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid array of UIMessage objects`;
        },
      },
    });
  };
}
