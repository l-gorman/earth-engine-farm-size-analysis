// Getting Data -----------------------------------------------
var fao_level_1 = ee.FeatureCollection("FAO/GAUL/2015/level1"); 
var fao_level_2 = ee.FeatureCollection("FAO/GAUL/2015/level2");

var filter = ee.Filter.inList('ADM0_CODE', [ 257]) // Admin codes
//var filter = ee.Filter.inList('ADM0_CODE', [42,79, 94, 133, 155, 182, 205, 257, 253]) // Admin codes

// var filter = ee.Filter.eq('ADM1_CODE', 1927); //2579

var fao_level_1 = fao_level_1.filter(filter);
print(fao_level_1.columns)

print(fao_level_1);

var geometry = fao_level_1.geometry()


/* 
To map overfeatures, and past arguments, 
we need to make a nested function.
 */
 
//Outer function with arguments
var point_count_per_feature = function(
  imageCollection,
  band,
  dateStart,
  dateEnd,
  scale,
  maxPixels
  ){
  // Inner function which takes the feature
    var feature_collection_mapping = function (feature){
      
    // Select band and date
    var image_collection = imageCollection.
                        // Select the band
                        select(band).
                        // Filter Date
                        filterDate(dateStart, dateEnd)
  
  // Find the mode over the whole timescale (reducer)                    
    var image = image_collection.mode()
    // var geometry = feature.geometry()
    
    // Create a combined reducer to obtain count and
    // relative frequency of different categories
    var reducer =  ee.Reducer.frequencyHistogram().combine({
      reducer2: ee.Reducer.count(),
      sharedInputs: true
    })

  // Get the modal band counts for that region
    var pixel_frequency = image.reduceRegion({
              reducer:reducer,
              geometry:feature.geometry(),
              scale:500
          })
          

    // Getting info on bands and values
    // var keys = ee.Dictionary(pixel_frequency.get(subset_hist)).keys()
    // var values = ee.Dictionary(pixel_frequency.get(subset_hist)).values()
    // var indexes = ee.List.sequence(0, ee.Number(keys.length().subtract(1), 1))
    
    // Getting info on count
    var subset_count = band + '_count'
      var subset_hist = band + '_histogram'

    var count = pixel_frequency.get(subset_count)
    
 
    
    // var adm0_code = feature.get('ADM0_CODE')
    var feature_information = feature.toDictionary()

    // // Add new information to the dictionary
    feature_information = feature_information.set('dateStart', dateStart);
    feature_information = feature_information.set('dateEnd', dateEnd);
    feature_information = feature_information.set('scale', scale);
    feature_information = feature_information.set('maxPixels', maxPixels);
    feature_information = feature_information.set('pixelCount', count);
    feature_information = feature_information.set('pixelFrequency', pixel_frequency.get(subset_hist));
    
    return(ee.Feature(
      feature.geometry(),
      feature_information
      ))
   }
   return(feature_collection_mapping)
 }

var land_cover_level_1 = fao_level_1.map(point_count_per_feature(
  ee.ImageCollection('MODIS/006/MCD12Q1'),//imageCollection
  "LC_Type1",//band
  '2018-12-31',//dateStart
  '2020-01-02',//dateEnd
  30,//scale
  40e9//maxPixels
  ))
  


Export.table.toDrive({
  collection: land_cover_level_1,
  description:'land-cover-level-1',
  fileFormat: 'csv',
  folder: 'earth-engine-outputs/farm-size-analysis',
  fileNamePrefix: 'land-cover-categories',

});

var land_cover_level_2 = fao_level_2.map(point_count_per_feature(
  ee.ImageCollection('MODIS/006/MCD12Q1'),//imageCollection
  "LC_Type1",//band
  '2018-12-31',//dateStart
  '2020-01-02',//dateEnd
  30,//scale
  40e9//maxPixels
  ))
  
Export.table.toDrive({
  collection: land_cover_level_2,
  description:'land-cover-level-2',
  fileFormat: 'csv',
  folder: 'earth-engine-outputs/farm-size-analysis',
  fileNamePrefix: 'land-cover-categories',

});


// // print(pixel_frequency[band])
// // print(pixel_count)






// // Functions

// // var polygon_categories_hist = function(
// //   polygon,
// //   imageCollection,
// //   band,
// //   dateStart,
// //   dateEnd,
// //   scale,
// //   maxPixels
// //   ){
    
// //   }




// // Styling Layers
// var styleParams = {
//   fillColor: 'b5ffb4',
//   color: '00909F',
//   width: 1.0,
// };




// fao_level_2 = fao_level_2.style(styleParams);
// fao_level_1 = fao_level_1.style(styleParams);



// // Creating Map
// // Map.setCenter(25, 0, 4);
// // Map.addLayer(fao_level_2, {}, 'Second Level Administrative Units');
// // Map.addLayer(fao_level_1, {}, 'First Level Administrative Units');




// // Example of Writing table to Google Drive
// // Export.table.toDrive({
// //   collection: fao_level_1,
// //   description:'fao_level_1_details',
// //   fileFormat: 'csv'
// // });



