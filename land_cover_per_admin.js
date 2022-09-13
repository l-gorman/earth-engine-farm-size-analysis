/*

Calculate the land-cover classification
proportions for each FAO subnational
unit.

Outline of procedure:

Prep boundaries
1. Access FAO level 1 and FAO level 2 global administrative boundaries
2. Filter boundaries by country of interest (see README.md)

Get counts
1. Get the modal count for each pixel, over the desired time-frame 
(the most common classification over the whole timespan)
2. Count the number of pixels for each classification
3. Count the total number of pixels.

Export data


These are the landcover coversion class for
LC Type 1 (see here: https://developers.google.com/earth-engine/datasets/catalog/MODIS_006_MCD12Q1#bands)

1	05450a	Evergreen Needleleaf Forests: dominated by evergreen conifer trees (canopy >2m). Tree cover >60%.
2	086a10	Evergreen Broadleaf Forests: dominated by evergreen broadleaf and palmate trees (canopy >2m). Tree cover >60%.
3	54a708	Deciduous Needleleaf Forests: dominated by deciduous needleleaf (larch) trees (canopy >2m). Tree cover >60%.
4	78d203	Deciduous Broadleaf Forests: dominated by deciduous broadleaf trees (canopy >2m). Tree cover >60%.
5	009900	Mixed Forests: dominated by neither deciduous nor evergreen (40-60% of each) tree type (canopy >2m). Tree cover >60%.
6	c6b044	Closed Shrublands: dominated by woody perennials (1-2m height) >60% cover.
7	dcd159	Open Shrublands: dominated by woody perennials (1-2m height) 10-60% cover.
8	dade48	Woody Savannas: tree cover 30-60% (canopy >2m).
9	fbff13	Savannas: tree cover 10-30% (canopy >2m).
10	b6ff05	Grasslands: dominated by herbaceous annuals (<2m).
11	27ff87	Permanent Wetlands: permanently inundated lands with 30-60% water cover and >10% vegetated cover.
12	c24f44	Croplands: at least 60% of area is cultivated cropland.
13	a5a5a5	Urban and Built-up Lands: at least 30% impervious surface area including building materials, asphalt and vehicles.
14	ff6d4c	Cropland/Natural Vegetation Mosaics: mosaics of small-scale cultivation 40-60% with natural tree, shrub, or herbaceous vegetation.
15	69fff8	Permanent Snow and Ice: at least 60% of area is covered by snow and ice for at least 10 months of the year.
16	f9ffa4	Barren: at least 60% of area is non-vegetated barren (sand, rock, soil) areas with less than 10% vegetation.
17	1c0dff	Water Bodies: at least 60% of area is covered by permanent water bodies.



*/


// Getting Data -----------------------------------------------
var fao_level_1 = ee.FeatureCollection("FAO/GAUL/2015/level1"); 
var fao_level_2 = ee.FeatureCollection("FAO/GAUL/2015/level2");

// var filter = ee.Filter.eq('ADM1_CODE', 1927); //2579
// var filter = ee.Filter.inList('ADM0_CODE', [ 257]) // Admin codes
var filter = ee.Filter.inList('ADM0_CODE', [42,79, 94, 133, 155, 182, 205, 257, 253]) // Admin codes


var fao_level_1 = fao_level_1.filter(filter);
var fao_level_2 = fao_level_2.filter(filter);


// Function

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


// Implementation and Save


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
  fileNamePrefix: 'land-cover-categories-level-1',

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
  fileNamePrefix: 'land-cover-categories-level-2',

});
