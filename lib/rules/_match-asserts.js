'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

/**
 * @type {import('eslint').Rule.RuleModule}
 */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Warns for undeclared specs',
    },
    messages: {
      matchAssertsFailed: 'Some specs are not declared in yaml: {{str}}',
    },
  },

  create: (context) => {
    const yamlExtention =
      context.options[0].yamlExtention || 'unit.testpalm.yml';
    const absFileName = context.physicalFilename;
    const fileName = path.basename(absFileName);
    const yamlFileName = fileName.split('.')[0] + '.' + yamlExtention;
    const absYamlFileName = path.join(path.dirname(absFileName), yamlFileName);

    if (!fs.existsSync(absYamlFileName)) {
      console.warn(
        `eslint: ${absYamlFileName} was not found while linting ${absFileName}`
      );

      return {};
    }

    const yamlContent = fs.readFileSync(absYamlFileName, 'utf-8');
    const yamlSpecs = yaml.parse(yamlContent);
    const specUnits = Object.keys(yamlSpecs['specs-unit']);

    return {
      'program > ExpressionStatement[expression.callee.name="describe"]': (
        node
      ) => {
        const firstLevelDescribeName = node.expression.arguments[0].value;

        if (firstLevelDescribeName !== yamlSpecs.feature) {
          context.report({
            node,
            messageId: 'matchAssertsFailed',
            data: {
              str: `${firstLevelDescribeName} should match feature field in ${yamlFileName}`,
            },
          });
        }
      },
      'ExpressionStatement[expression.callee.name="describe"] ExpressionStatement[expression.callee.name="describe"]':
        (node) => {
          const secondLevelDescribeName = node.expression.arguments[0].value;

          if (
            !specUnits.some((describe) => describe === secondLevelDescribeName)
          ) {
            context.report({
              node,
              messageId: 'matchAssertsFailed',
              data: {
                str: `${secondLevelDescribeName} should match specs-unit in ${yamlFileName}`,
              },
            });
          }
        },
      'ExpressionStatement[expression.callee.name="describe"] ExpressionStatement[expression.callee.name="test"]':
        (node) => {
          const describeName =
            node.parent.parent.parent.parent.expression.arguments[0].value;
          const unit = node.expression.arguments[0].value;
          const units = yamlSpecs['specs-unit'][describeName];

          if (!units || !units.some((yamlUnit) => yamlUnit.assert === unit)) {
            context.report({
              node,
              messageId: 'matchAssertsFailed',
              data: { str: `${unit} should match assert in ${yamlFileName}` },
            });
          }
        },
    };
  },
};
