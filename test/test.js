const compiler = require('./compiler');

describe('Loader test', () => {
    it('Should return file with some strings', async () => {
        const stats = await compiler('./graphql/ProductQuery.graphql');

        const output = stats.toJson({ source: true }).modules[0].source;
        expect(
            output.includes(
                'var { oneQuery, extractReferences, getUniqueFunc } = require("@evo/graphql-tag-loader/utils.js");',
            ),
        ).toBeTruthy();

        expect(output.includes('var unique = getUniqueFunc();')).toBeTruthy();
        expect(
            output.includes('module.exports["ProductQuery"] = oneQuery(doc, "ProductQuery", extractReferences(doc));'),
        ).toBeTruthy();
    });

    it('Should be valid query', async () => {
        const stats = await compiler('./graphql/CategoryQuery.graphql');

        const output = stats.toJson({ source: true }).modules[0].source;
        const result = eval(output);
        expect(result.kind).toBe('Document');
        expect(result.definitions).toHaveLength(2);
        expect(result.definitions[0].kind).toBe('OperationDefinition');
        expect(result.definitions[1].kind).toBe('FragmentDefinition');
    });
});
