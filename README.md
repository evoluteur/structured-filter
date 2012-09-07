# advancedSearch

This project is a (prototype of) UI widget for building structured search queries. 
It is a full jQuery UI widget, supporting various configurations and themes.

THIS PROJECT STILL UNDER CONSTRUCTION

## Demo

Check the [demo](http://evoluteur.github.com/advancedSearch/index.html) a live example.

## Overview
-to do-

## Data Format
-to do-

## Methods

### addFilter(data)
Add a new filter.

    $("#advSearch").advancedSearch(data);

### removeFilter(index)
Remove the filter of the specified index.

    $("#advSearch").advancedSearch(0);

### empty()
Remove all search filters.

### val([data])
Get or set the search definition (as an array of filters).

    $("#advSearch").advancedSearch("val");

    $("#advSearch").advancedSearch("val", data);

### valText()
Get the search definition (as a readable text string).

### valUrl()
Get the search definition (as a URL string).


