import {
  AST_NODE_TYPES,
  ESLintUtils,
  TSESTree,
} from '@typescript-eslint/utils';
import { isIdentifier } from '@typescript-eslint/utils/ast-utils';
import { getFullName, getValidationContext } from './validation-context';

const TEST_FUNCS = ['test', 'it'];
const DESCRIBE_AND_TEST_FUNCS = ['describe', ...TEST_FUNCS];

const getCalleeName = (node: TSESTree.CallExpression) =>
  isIdentifier(node.callee) && node.callee.name;

const isTestFunc = (node: TSESTree.CallExpression) => {
  const callee = getCalleeName(node);
  if (!callee) {
    return false;
  }
  return TEST_FUNCS.indexOf(callee) >= 0;
};

const isDescribeOrTestFunc = (node: TSESTree.CallExpression) => {
  const callee = getCalleeName(node);
  if (!callee) {
    return false;
  }
  return DESCRIBE_AND_TEST_FUNCS.indexOf(callee) >= 0;
};

const getTestName = (node: TSESTree.CallExpression) => {
  const argument = node.arguments[0];
  if (argument.type === AST_NODE_TYPES.Literal) {
    return (node.arguments[0] as TSESTree.StringLiteral).value;
  }
  throw Error('Only literal test names supported');
};

const pathToRoot = (node: TSESTree.CallExpression): string[] => {
  let current: TSESTree.Node | undefined = node;
  const result = new Array<string>();
  while (current) {
    if (
      current.type === AST_NODE_TYPES.CallExpression &&
      isDescribeOrTestFunc(current)
    ) {
      const name = getTestName(current);
      if (name) {
        result.unshift(name);
      }
    }
    current = current.parent;
  }
  return result;
};

const createRule = ESLintUtils.RuleCreator((name) => `test-match`);

export const rule = createRule({
  create(context) {
    return {
      CallExpression(node) {
        if (isTestFunc(node)) {
          const specBoxAssertions = getValidationContext();
          const testFullName = getFullName(...pathToRoot(node));
          if (!specBoxAssertions.has(testFullName)) {
            context.report({
              messageId: 'match-asserts',
              node,
              data: {
                'match-asserts': `${testFullName} не найден в описании spec-box`,
              },
            });
          }
        }
      },
    };
  },
  name: 'match-asserts',
  meta: {
    docs: {
      description: 'Test name does not match spec-box assert definitions.',
    },
    messages: {
      'match-asserts': 'Test match not found for spec-box',
    },
    type: 'suggestion',
    schema: [],
  },
  defaultOptions: [],
});
