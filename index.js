'use strict';

const os = require('os');
const gql = require('graphql-tag');
// Takes `source` (the source GraphQL query string)
// and `doc` (the parsed GraphQL document) and tacks on
// the imported definitions.
function expandImports(source) {
    const lines = source.split(/\r\n|\r|\n/);
    let outputCode = `
    var unique = getUniqueFunc();
  `;

    lines.some((line) => {
        const result = line.match(/^#\s?import (.+)$/);
        if (result) {
            const importFile = result[1];
            const parseDocument = `require(${importFile})`;
            const appendDef = `doc.definitions = doc.definitions.concat(unique(${parseDocument}.definitions));`;
            outputCode += appendDef + os.EOL;
        }
        return line.length !== 0 && line[0] !== '#';
    });

    return outputCode;
}

module.exports = function (source) {
    const isProduction = process.env.NODE_ENV === 'production';
    this.cacheable();
    const doc = gql`
        ${source}
    `;
    // this getUniqueFunc need for expandImports function
    let headerCode = `
    var { oneQuery, extractReferences, getUniqueFunc } = require("@evo/graphql-tag-loader/utils.js");
    var doc = ${JSON.stringify(doc)};
  `;

    if (!isProduction) {
        headerCode += `doc.loc.source = ${JSON.stringify(doc.loc.source)};`;
    }

    let outputCode = '';

    // Allow multiple query/mutation definitions in a file. This parses out dependencies
    // at compile time, and then uses those at load time to create minimal query documents
    // We cannot do the latter at compile time due to how the #import code works.
    const operationCount = doc.definitions.reduce((accum, op) => {
        if (op.kind === 'OperationDefinition' || op.kind === 'FragmentDefinition') {
            return accum + 1;
        }

        return accum;
    }, 0);

    if (operationCount < 1) {
        outputCode += `
      module.exports = doc;
    `;
    } else {
        outputCode += `    
    module.exports = doc;
    `;

        for (const op of doc.definitions) {
            if (op.kind === 'OperationDefinition' || op.kind === 'FragmentDefinition') {
                if (!op.name) {
                    if (operationCount > 1) {
                        throw new Error('Query/mutation names are required for a document with multiple definitions');
                    } else {
                        continue;
                    }
                }

                const opName = op.name.value;
                outputCode += `
        module.exports["${opName}"] = oneQuery(doc, "${opName}", extractReferences(doc));
        `;
            }
        }
    }

    const importOutputCode = expandImports(source, doc);
    const allCode = headerCode + os.EOL + importOutputCode + os.EOL + outputCode + os.EOL;
    return allCode;
};
