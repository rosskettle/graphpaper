#Graphpaper

A javascript module to create HTML elements that display graphpaper like grids. Graphpaper uses WebGL to render grids onto canvas elements.

##Getting started

Include the script

    <script src="graphpaper.min.js"></script>

Create a graphpaper and attach it to the DOM
    
    document.body.appendChild(new Graphpaper().element);

![Graphpaper](http://rosskettle.github.io/img/graphpaper1.png "Graphpaper")

##Examples

[Basic](http://rosskettle.github.io/graphpaper/examples/index.html)  
[Animate](http://rosskettle.github.io/graphpaper/examples/animate.html)  
[Scroll and Zoom](http://rosskettle.github.io/graphpaper/examples/scroll_zoom.html) (Click and drag to scroll. Use `+` and `-` to zoom.)

##Usage

The constuctor returns a new Graphpaper object. Using `new` is optional.

    var graphpaper = new Graphpaper();

The object has an `element` property that references a DOM canvas element on which the graphpaper is rendered. 

The constructor accepts a properties object. Each property will override the default property value.

    var graphpaper = new Graphpaper({cellWidth: 5, cellHeight, 5});

To change properties after the graphpaper has been created you can use the `setProps` function.

    graphpaper.setProps({offsetX: 4, offsetY: 4});

Changing a property using the `setProps` function will cause the graphpaper to re-render. The

The graphpaper can be forced to re-render at any time using `draw`. However this isn't necessary with normal usage.

    graphpaper.draw(); 

### Properties

| name | default | description
| ---- | ------- | -----------
|`.width` | 601 | The pixel width of the canvas element.
|`.height` | 801| The pixel height of the canvas element.
|`.cellWidth` | 10| The pixel width of each cell.
|`.cellHeight` | 10| The pixel height of each cell.
|`.majorRows` | 10| Number of cells in a major row.
|`.majorCols` | 10| Number of cells in a major column.
|`.minorColor` | [0.0, 1.0, 0.0, 0.2]| An array of normalized RGBA values. The line color for cells.
|`.majorColor` | [0.0, 1.0, 0.0, 0.6]| An array of normalized RGBA values. The line color for major rows and columns.
|`.offsetX` | 0| The left pixel offset of cells.
|`.offsetY` | 0| The top pixel offset of cells.
|`.alpha`   | 1| The global alpha value. Alpha components of `majorColor` and `minorColor` are multiplied by this value.









