# @evo/graphql-tag-loader

More optimized loader for lib graphql-tag:

If you have configured [the webpack @evo/graphql-tag-loader](#webpack-loading-and-preprocessing), you can import modules containing graphQL queries. The imported value will be the pre-built AST.

```js
import MyQuery from 'query.graphql';
```

#### Importing queries by name

You can also import query and fragment documents by name.

```graphql
query MyQuery1 {
  ...
}

query MyQuery2 {
  ...
}
```

And in your JavaScript:

```javascript
import { MyQuery1, MyQuery2 } from 'query.graphql';
```

#### Webpack loading and preprocessing

Using the included `@evo/graphql-tag-loader` it is possible to maintain query logic that is separate from the rest of your application logic. With the loader configured, imported graphQL files will be converted to AST during the webpack build process.

_**Example webpack configuration**_

```js
{
  ...
  loaders: [
    {
      test: /\.(graphql|gql)$/,
      exclude: /node_modules/,
      loader: '@evo/graphql-tag-loader'
    }
  ],
  ...
}
```
