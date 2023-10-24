import { RuleTester } from '@typescript-eslint/rule-tester';
import * as validationContext from './validation-context';
import { rule } from './match-asserts';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

const mockAsserts = new Set<string>();
mockAsserts.add('foo / test');
jest.spyOn(validationContext, 'getValidationContext').mockReturnValue(mockAsserts);

ruleTester.run('match-asserts', rule, {
  valid: [
    `describe('foo', () => {
    it('test', () => {});
   });`,
  ],
  invalid: [
    { code: 
      `describe('boo', () => {
      it('test', () => {});
     });`, 
     errors: [{ messageId: 'match-asserts' }] },
  ],
});
