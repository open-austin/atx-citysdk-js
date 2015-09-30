# CitySDK Austin Parks

### This is a demonstration app forked from [Austin Park Equity](http://austinparkequity.com) to give a mapping example using the CitySDK from Census.gov. We'd love for you to try to plug in data from your city.

See what the [live Austin demo](http://open-austin.github.io/atx-citysdk-js/) lookes like.

## 1. Getting Started

**Find park data**: The first thing you should do is look for park data from your city. Many cities and counties have a data portal. In Austin, we found raw park GIS data through [the City's Socrata Open Data Portal](https://data.austintexas.gov/dataset/City-Of-Austin-Parks/99qw-4ixs).

Often times, this data will be in a format best for analysis with desktop GIS software. For this web map, the ideal data type is `geojson`. But if it is in Shapefile format, that is ok too. But we'll worry about converting the file type later. _Check out [this blog post](http://ben.balter.com/2013/06/26/how-to-convert-shapefiles-to-geojson-for-use-on-github/) to learn why `.geojson` is nice and to learn how to convert data into geojson._

**Fork the repo**: Did you find a `.geojson`, `.json`, `.shp` (Shapefile), or `.kml` file with park polygons? Awesome. We'll make sure to convert that data into the best format in a later step. Now, you should go ahead and fork this repo to your own Github account. Once you've forked the repo and cloned it down from your own Github repo to your local machine, go ahead and follow the steps below...

If you couldn't find some park data, but you still want to play along. Try using [this data](https://data.oaklandnet.com/Environmental/East-Bay-Regional-Parks/f4af-gmsw) from Oakland.

## 2. Running Code Locally

**1. [npm](https://www.npmjs.com/) is required**

_npm is Node's package manager. You can install Node at [their site](https://nodejs.org/download/) or with a command like `brew install node` if you use Homebrew._

**2. [webpack](https://webpack.github.io/docs/tutorials/getting-started/) is required**
_webpack is used to bundle assets_

	$ npm install -g webpack

**3. install npm dependencies**

Install the npm dependencies:

	$ npm install

**4. run the build system && development server**

To bundle assets, run the local server and see the app in your browser:

	$ npm start

NPM will serve the app at `http://localhost:8080`.

## 3. Import you own park data
Back in Step 1, we wanted to make sure you could find park data from your city. Now's the time to import it into the app. We save our GIS file into a directory called `/data`. See that directory [here on Github](https://github.com/open-austin/atx-citysdk-js/tree/master/data). Now that your raw data is imported, its time to convert your data to `.geojson` (if its not already). I suggest you follow the instructions in [this blog](http://ben.balter.com/2013/06/26/how-to-convert-shapefiles-to-geojson-for-use-on-github/) if you haven't used `ogr2ogr` or coverted Shapefiles to geojson before. **Last step here**, rename your file to `parks.geojson`. This is what the code is expecting that park layer to be called. You'll need to either delete or rename the Austin park layer that came down with the repo. 

## 4. Config and customize the app to your city
**Update the config file**. Go into the [config file](https://github.com/open-austin/atx-citysdk-js/blob/master/config.json) and update things like the coordinates of your city and your own CitySDK token (which you should [request here](http://api.census.gov/data/citysdk.html)). 

**Build new features**. Add new features. The main javascript code live in the `js/app.js` [file](https://github.com/open-austin/atx-citysdk-js/blob/master/js/app.js)


## Austin Data Sources:
- City of Austin, Parks and Rec Dept (PARD) Data
	- [Basic Park Feature Layer via ArcGIS Server](http://services.arcgis.com/0L95CJ0VTaxqcmED/ArcGIS/rest/services/city_of_austin_parks/FeatureServer/0/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryPolygon&inSR=&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Meter&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&quantizationParameters=&f=pgeojson&token=)
		- _Also available on [data.austintexas.gov](https://data.austintexas.gov/dataset/City-Of-Austin-Parks/99qw-4ixs)_
		- This data is used across the app to produce park shapes.

## Global Data Sources:
- [Open Street Map](https://www.openstreetmap.org/) Park Data:
	- We use the [Overpass API](http://wiki.openstreetmap.org/wiki/Overpass_API) via the ["query-overpass" plugin](https://github.com/perliedman/query-overpass) to extract data. Here's [the commit that added OSM data](https://github.com/open-austin/austin-park-equity/commit/a89bd02fce6170beac8dcf11c7a3f3479a71d047) if you're curious how.
- Census.gov Data
	-  [CitySDK API](http://uscensusbureau.github.io/citysdk/)

## Unlicense:
Released to the public domain under the [Unlicense](http://unlicense.org/) by [Open Austin](http://open-austin.org), 2015.
