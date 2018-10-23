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
// Plot will be inserted into this div,
// canvas creation handled automatically
var container = document.getElementById("container");

// Create the plot
var plot = new Plotfast(container);

// Generate 10k points of data
var data = plot.generateData(10000);

// Add the data to the plot
plot.addDataset(data);

// Start rendering the plot
plot.start();
```

## Development

1. Clone repo, run `yarn install`
2. Start the development server with `yarn start`
3. Create a production build with `yarn build`