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
    width: 640,
    height: 480,
    xLabel: 'X axis',
    yLabel: 'Y axis',
    lineColor: 'lightgrey',
    textColor: 'black',
    backgroundColor: 'none',
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