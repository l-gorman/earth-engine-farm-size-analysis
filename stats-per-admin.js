// Getting Data -----------------------------------------------

var fao_level_1 = ee.FeatureCollection("FAO/GAUL/2015/level1"); 
var fao_level_2 = ee.FeatureCollection("FAO/GAUL/2015/level2");

// var filter = ee.Filter.inList('ADM0_CODE', [ 257]) // Admin codes
//var filter = ee.Filter.inList('ADM0_CODE', [42,79, 94, 133, 155, 182, 205, 257, 253]) // Admin codes

var filter = ee.Filter.eq('ADM1_CODE', 1927); //2579

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
    

  // var imageCollection =ee.ImageCollection('MODIS/006/MCD12Q1')//imageCollection
  // var band = "LC_Type1"//band
  // var dateStart = '2018-12-31'//dateStart
  // var dateEnd = '2020-01-02'//dateEnd
  // var scale = 30//scale
  // var maxPixels = 40e9//maxPixels    

  var image_collection = imageCollection.
                      // Select the band
                      select(band).
                      // Filter Date
                      filterDate(dateStart, dateEnd)
                      
  var image = image_collection.mode()
  // var geometry = feature.geometry()
  
  var reducer =  ee.Reducer.frequencyHistogram().combine({
    reducer2: ee.Reducer.count(),
    sharedInputs: true
  })

  // Get the modal band counts for that region
  var pixel_frequency = image.reduceRegion({
            reducer:reducer,
            geometry:feature.geometry(),
            scale:500
        })//.getInfo()
        
  // var pixel_counts = ee.Feature(
  //     feature.geometry(),
  //     pixel_frequency
  //     )

    var subset_hist = band + '_histogram'

    return(ee.Feature(
      feature.geometry(),
    {result:pixel_frequency.get(subset_hist)}))
    
    // var adm0_code = feature.get('ADM0_CODE')
    var feature_information = feature.toDictionary()
    var pixel_information = pixel_counts.toDictionary()
    
    var subset_count = band + '_count'
    var count = pixel_frequency.get(subset_count)
    // // var geometry = feature.geometry();
    
    // // Add new information to the dictionary
    feature_information = feature_information.set('dateStart', dateStart);
    feature_information = feature_information.set('dateEnd', dateEnd);
    feature_information = feature_information.set('scale', scale);
    feature_information = feature_information.set('maxPixels', maxPixels);
    feature_information = feature_information.set('pixel_info', pixel_information);
    
    // var featureCollection = indexes.map(function(index){
    //   var new_dictionary = feature_information
    //   new_dictionary = new_dictionary.set('variable', 'land_cover_class')
    //   // new_dictionary = new_dictionary.set('band', keys.get(index))
    //   // new_dictionary = new_dictionary.set('value', pixel_ratios.get(index))
      
    //   var subfeature = ee.Feature(
    //   feature.geometry(),
    //   new_dictionary
    //   )
      
    //   return(subfeature)

      
    // })

    // var feature_collection = ee.FeatureCollection(
    //   featureCollection
    //   )
    
    var subfeature = ee.Feature(
       feature.geometry(),
       feature_information
       )
    
     return(subfeature)
    
    
   }
   return(feature_collection_mapping)
 }

var mapped_feature = fao_level_1.map(point_count_per_feature(
  ee.ImageCollection('MODIS/006/MCD12Q1'),//imageCollection
  "LC_Type1",//band
  '2018-12-31',//dateStart
  '2020-01-02',//dateEnd
  30,//scale
  40e9//maxPixels
  ))
  
print(mapped_feature)




// var image_collection = imageCollection.
//                         // Select the band
//                         select(band).
//                         // Filter Date
//                         filterDate(dateStart, dateEnd)
                        
//     var image = image_collection.mode()
//     // var geometry = feature.geometry()

//     // Get the modal band counts for that region
//     var pixel_frequency = image.reduceRegion({
//             reducer:ee.Reducer.frequencyHistogram(),
//             geometry:geometry,
//             scale:30,
//             maxPixels:40e9
//         }).getInfo()
        
//     // Get the total pixel counts for that region
//     var pixel_count = image.reduceRegion({
//             reducer:ee.Reducer.count(),
//             geometry:geometry,
//             scale:30,
//             maxPixels:40e9
//         }).getInfo()
        
//     var keys = ee.Dictionary(pixel_frequency[band]).keys()
//     var values =  ee.Dictionary(pixel_frequency[band]).values()
//     var indexes = ee.List.sequence(0, ee.Number(keys.length()).subtract(1), 1)
    
    
//     var pixel_ratios = indexes.map(function(index){
//       var value = ee.Number(values.get(index))
//       var count = ee.Number(pixel_count[band])
//       var ratio = ee.Number(value).divide(count)
//       return(ratio)
//     })
    
//   print(pixel_ratios)












    
  
// // var keys = ee.Dictionary(pixel_frequency[band]).keys()
// // var values =  ee.Dictionary(pixel_frequency[band]).values()
// // var indexes = ee.List.sequence(0, ee.Number(keys.length()).subtract(1), 1)

// // print(keys)
// // print(values.get(1))
// // print(indexes)

// // print(pixel_count[band])


// // var pixel_ratio = keys.map(function(key) {
// //   return values[key]/pixel_count[band];
// // });
// // print(pixel_ratio)


// // var result = {
// //   "class":keys,
// //   "pixel_coverage":pixel_ratio
// // }



// // Export.table.toDrive({
// //   collection: result,
// //   description:'Land Cover Sample',
// //   fileFormat: 'csv'
// // });


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



