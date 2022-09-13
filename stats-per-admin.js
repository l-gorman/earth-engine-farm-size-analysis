// Getting Data -----------------------------------------------

var fao_level_1 = ee.FeatureCollection("FAO/GAUL/2015/level1"); 
var fao_level_2 = ee.FeatureCollection("FAO/GAUL/2015/level2");

var filter = ee.Filter.inList('ADM0_CODE', [ 257]) // Admin codes
//var filter = ee.Filter.inList('ADM0_CODE', [42,79, 94, 133, 155, 182, 205, 257, 253]) // Admin codes

//var filter = ee.Filter.eq('ADM1_CODE', 1927); //2579

var fao_level_1 = fao_level_1.filter(filter);

print(fao_level_1);

var geometry = fao_level_1.geometry()


// Categorical Image Collections

var band="LC_Type1"
var date_start='2018-12-31'
var date_end='2020-01-02'
var landCoverCollection = ee.ImageCollection('MODIS/006/MCD12Q1');

var image_collection = landCoverCollection.
                        // Select the band
                        select(band).
                        // Filter Date
                        filterDate(date_start, date_end)

// Import the Landsat 8 TOA image collection.
var image = image_collection.mode()



var pixel_frequency = image.reduceRegion({
        reducer:ee.Reducer.frequencyHistogram(),
        geometry:geometry,
        scale:30,
        maxPixels:1e9
    }).getInfo()

var pixel_count = image.reduceRegion({
        reducer:ee.Reducer.count(),
        geometry:geometry,
        scale:30,
        maxPixels:1e9
    }).getInfo()
    
var keys = ee.Dictionary(pixel_frequency[band]).keys()
var values =  ee.Dictionary(pixel_frequency[band]).toArray()

print(keys)
print(values.get(1))

print(pixel_count[band])


var pixel_ratio = keys.map(function(key) {
  return values[key]/pixel_count[band];
});
print(pixel_ratio)


var result = {
  "class":keys,
  "pixel_coverage":pixel_ratio
}


Export.table.toDrive({
  collection: result,
  description:'Land Cover Sample',
  fileFormat: 'csv'
});


// print(pixel_frequency[band])
// print(pixel_count)






// Functions

// var polygon_categories_hist = function(
//   polygon,
//   imageCollection,
//   band,
//   dateStart,
//   dateEnd,
//   scale,
//   maxPixels
//   ){
    
//   }




// Styling Layers
var styleParams = {
  fillColor: 'b5ffb4',
  color: '00909F',
  width: 1.0,
};




fao_level_2 = fao_level_2.style(styleParams);
fao_level_1 = fao_level_1.style(styleParams);



// Creating Map
// Map.setCenter(25, 0, 4);
// Map.addLayer(fao_level_2, {}, 'Second Level Administrative Units');
// Map.addLayer(fao_level_1, {}, 'First Level Administrative Units');




// Example of Writing table to Google Drive
// Export.table.toDrive({
//   collection: fao_level_1,
//   description:'fao_level_1_details',
//   fileFormat: 'csv'
// });



