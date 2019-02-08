# Plotfast

Canvas plotting library focused on performance.

[Check it out with a million points here!](https://focused-almeida-5122b7.netlify.com/)

## Usage

`npm install plotfast` or `yarn add plotfast`

Or include the `plotfast.min.js` script and it'll expose the `Plotfast` global.

Then, in your HTML:

```html
<div id="container"></div>
```

And initialize the plot in JS:

```javascript
// Plot will be inserted into this div,
// canvas creation handled automatically
var container = document.getElementById('container');

// Create the plot
var plot = new Plotfast(container);

// Generate 10k points of data
var data = plot.generateData(10000);

// Add the data to the plot
plot.addDataset(data);

// Start rendering the plot
plot.start();
```

Or use the React component (in beta):

```javascript
import { Plot } from 'plotfast/react';

const data = generateMyData();

const MyPlot = () => (
    <Plot
        options={{ logging: true }}
        datasets={{ data, options: { type: 'line' } }}
    />
);
```

## Features

### Data

Data is an array of objects in the form `{ x, y }`. Data will be sorted by `x` value on initialization.

```javascript
// Add new data, with options
plot.addDataset(myData, {
    name: 'My Dataset',
    color: 'red',
});

// Replace the data of an existing dataset
// (Useful for server-side decimation)
plot.updateDataset(0, updatedData);

// Remove a dataset, by index
plot.removeDataset(0);

// Or by name
plot.removeDataset('My Dataset');

// Or remove all datasets
plot.removeDataset();
```

### Plot Options

```javascript
var plot = new Plotfast(container, {
    logging: true,

    // Dimensions of the canvas
    width: 640,
    height: 480,

    // Labels to display on the axes
    xLabel: 'X axis',
    yLabel: 'Y axis',

    // Colors
    lineColor: 'lightgrey',
    textColor: 'black',
    backgroundColor: 'none',

    // Downsample data to improve performance
    downsample: true,
});
```

### Data Options

```javascript
var data = [{ x: 1, y: 0 }, { x: 2, y: 5 }];

plot.addDataset(data, {
    name: 'Dataset',
    color: 'black',

    // Will match the plot's downsample setting by default
    downsample: true,
});
```

### Events

```javascript
// Fires whenever the view changes and gives the new
// min/max for x and y.
plot.addEventListener('viewMoved', event => {
    console.log(event.x1, event.x2, event.y1, event.y2);
});
```

## Development

1. Clone repo, run `yarn install`
2. Start the development server with `yarn start`
3. Create a production build with `yarn build`

## Future Plans

-   Flesh out plot customization/types
-   In `Plot` React component, all normal Plotfast functionality should be exposed
-   Try using WebAssembly to speed up plot downsampling/rendering

## Credit

Default downsampling algorithm provided by Sveinn Steinarsson's [Largest Triangle Three Buckets Algorithm](https://github.com/sveinn-steinarsson/flot-downsample).

Icons are from Google's [Material Icons](https://material.io/tools/icons/?style=baseline).
