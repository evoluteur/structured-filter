# evol.advancedSearch

evol.advancedSearch is a Web UI for building structured search queries. 
It is a full jQuery UI widget, supporting various configurations and themes.

## Demo

Check the [demo](http://evoluteur.github.com/advancedSearch/index.html) for a live example.

## Overview
-to do-

## Usage

First, load [jQuery](http://jquery.com/) (v1.7 or greater), [jQuery UI](http://jqueryui.com/) (v1.8 or greater), and the plugin:

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js" type="text/javascript" charset="utf-8"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.18/jquery-ui.min.js" type="text/javascript" charset="utf-8"></script>
    <script src="js/evol.advancedSearch.js" type="text/javascript" charset="utf-8"></script>

The widget requires a jQuery UI theme to be present, as well as its own included base CSS file ([evol.advancedSearch.css](http://github.com/evoluteur/advancedSearch/raw/master/css/evol.advancedSearch.css)). Here we use the "ui-lightness" theme as an example:

    <link rel="stylesheet" type="text/css" href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.18/themes/ui-lightness/jquery-ui.css">
    <link href="css/evol.advancedSearch.css" rel="stylesheet" type="text/css">

Now, let's attach it to an existing `<div>` tag:

    <script type="text/javascript">
        $(document).ready(function() {
			$("#search").advancedSearch({
			    fields: [
			        { type:"text", id:"lastname", label:"Lastname"},
			        { type:"text", id:"firstname", label:"Firstname"},
			        { type:"boolean", id:"active", label:"Is active"},
			        { type:"number", id:"age", label:"Age"},
			        { type:"date", id:"bday", label:"Birthday"}         
			    ]
			});
        });
    </script>

    <div style="width:100px;" id="search"></div>

This will change the `<div>` into the widget.


## Data Format
-to do-

## Theming

advancedSearch is as easily themeable as any jQuery UI widget, using one of the [jQuery UI themes](http://jqueryui.com/themeroller/#themeGallery) or your own custom theme made with [Themeroller](http://jqueryui.com/themeroller/).

## Options

advancedSearch provides several options to customize its behaviour:

### buttonLabels (Boolean)

The labels of buttons used to manipulate filters. This options applies to the 3 buttons "New filter", "Add filter"/"Update filter", and "Cancel" which use icons if the option is set to false.

    $("#advSearch").advancedSearch({
        buttonLabels: true
    });

Defaults to *false*.

### dateFormat (String)

The format for parsed and displayed dates. This attribute is one of the regionalisation attributes. 
Common formats are: Default - "mm/dd/yy", ISO 8601 - "yy-mm-dd", Short - "d M, y", Medium - "d MM, y", Full - "DD, d MM, yy". For a full list of the possible formats see the [jQuery formatDate function](http://docs.jquery.com/UI/Datepicker/formatDate).

    $("#advSearch").advancedSearch({
        dateFormat: "d M, y"
    });

Defaults to *"mm/dd/yy"*.

### fields (array)

The list of fields (as an array of objects with id, label and type) to participate in the advanced search. Possible types are: text, boolean, number, date, time, and lov (list of values).

    $("#advSearch").advancedSearch({
        fields: [
			{ type:"text", id:"lastname", label:"Lastname"},
			{ type:"text", id:"firstname", label:"Firstname"},
			{ type:"boolean", id:"active", label:"Is active"},
			{ type:"number", id:"age", label:"Age"},
			{ type:"date", id:"bday", label:"Birthday"},
			{ type:"lov", id:"CategoryID", label:"Category", 
                list:[
			        {id:'1',label:"Friends"},
			        {id:'2',label:"Family"},
			        {id:'3',label:"Co-workers"},
			        {id:'4',label:"Acquaintances"},
			        {id:'5',label:"Other"}
			    ]
			}			
		]
    });

Defaults to *[ ]*.

### highlight (Boolean)

A highlight animation performed on the last added or modified filter.

    $("#advSearch").advancedSearch({
        highlight: false
    });

Defaults to *true*.

### submitButton (Boolean)

Shows or hide the "Submit" button.

    $("#advSearch").advancedSearch({
        submitReady: true
    });

Defaults to *false*.

### submitReady (Boolean)

Provides hidden fields with the filters values to be submitted with the form (as an alternative to an AJAX call).

    $("#advSearch").advancedSearch({
        submitReady: true
    });

Defaults to *false*.

## Events

### change.search

This event is triggered when the list of search conditions is modified.

    $("#advSearch").on("change.search", function(event){
        // do something
    })

### submit.search

This event is triggered when the submit button is clicked.

    $("#advSearch").on("submit.search", function(event){
        // do something
    })

## Methods

### addFilter(data)
Add a new filter.

    $("#advSearch").advancedSearch("addFilter", {
        field:{
			label: 'Lastname',
			value: 'lastname'
        },
        operator:{
			label: 'starts with',
			value: 'sw'
        }, 
        value:{
			label: '"a"',
			value: 'a'
        }
    });

### empty()
Remove all search filters.

    $("#advSearch").advancedSearch("empty");

### length()
Get the number of filters.

    $("#advSearch").advancedSearch("length");

### removeFilter(index)
Remove the filter of the specified index.

    $("#advSearch").advancedSearch("removeFilter", 0);

### val([data])
Get or set the search definition (as an array of filters).

    $("#advSearch").advancedSearch("val");

    $("#advSearch").advancedSearch("val", data);

Sample value:

    [
        {
            "field":{"label":"Lastname","value":"Lastname"},
            "operator":{"label":"starts with","value":"sw"},
            "value":{"label":"\"jo\"","value":"jo"}
        }
    ]

### valText()
Get the search definition (as a readable text string).

    $("#advSearch").advancedSearch("valText");

Sample value:

    Lastname starts with "jo"

### valUrl()
Get the search definition (as a URL string).

    $("#advSearch").advancedSearch("valUrl");

Sample value:

    filters=1&field-0=Lastname&operator-0=sw&value-0=jo&label=Lastname%20starts%20with%20%22jo%22%0A

## License

Copyright (c) 2013 Olivier Giulieri.

evol.advancedSearch is released under the [MIT license](http://github.com/evoluteur/advancedSearch/raw/master/LICENSE.md).

