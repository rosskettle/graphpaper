#Graphpaper

A javascript module to create HTML elements that display graphpaper like grids. Graphpaper uses WebGL to render grids onto canvas elements.

##Getting started

Include the script

    <script src="graphpaper.min.js"></script>

Create a grid and attach it to the DOM
    
    document.body.appendChild(new Grid().element);

![Graphpaper](http://rosskettle.github.io/img/graphpaper1.png "Graphpaper")

##Usage

The constuctor returns a new Grid object. Using `new` is optional.

    var grid = new Grid();

The object has an `element` property that references a DOM canvas element on which the grid is rendered. 

The constructor accepts a properties object. Each property will override the default property value.

    var grid = new Grid({cellWidth: 5, cellHeight, 5});

To change properties after the grid has been created you can use the `setProps` function.

    grid.setProps({offsetX: 4, offsetY: 4});

Changing a property using the `setProps` function will cause the grid to re-render. The

The grid can be forced to re-render at any time using `draw`. However this isn't necessary with normal usage.

    grid.draw(); 

### Properties

`.width` : (default 601) The pixel width of the canvas element.

`.height` : (default 801) The pixel height of the canvas element.

`.cellWidth` : (default 10) The pixel width of each cell.

`.cellHeight` : (default 10) The pixel height of each cell.

`.majorRows` : (default 10) Number of cells in a major row.

`.majorCols` : (default 10) Number of cells in a major column.

`.minorColor` : (default [0, 1, 0.0, 0.2]) An array of normalized RGBA values. The line color for cells.

`.majorColor` : (default [0, 1, 0.0, 0.6]) An array of normalized RGBA values. The line color for major rows and columns.

`.offsetX` : (default 0) The left pixel offset of cells.

`.offsetY` : (default 0) The top pixel offset of cells.

`.alpha`   : (default 1) The global alpha value. Alpha components of `majorColor` and `minorColor` are multiplied by this value.








