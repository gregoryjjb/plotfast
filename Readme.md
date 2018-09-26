# Plotfast

Canvas plotting library focused on performance.

## Usage

Once it goes on npm:

`npm install plotfast` or `yarn install plotfast`

Or include the script and it'll expose the `Plotfast` global.

Then, in your HTML:

```html
<div id="container"></div>
```

And initialize the plot in JS:

```javascript
var container = document.getElementById("container");
var plot = new Plotfast(container);
```

## Development

1. Clone repo, run `yarn install`
2. Start the development server with `yarn start`
3. Create a production build with `yarn build`