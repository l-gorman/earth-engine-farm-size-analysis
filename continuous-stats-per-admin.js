/*

Calculate various key statistics for earth
engine datasets of interest.


*/

// ----------------------------------------------------------------
// Getting Administrative Data -----------------------------------------------
// ----------------------------------------------------------------


var fao_level_1 = ee.FeatureCollection("FAO/GAUL/2015/level1"); 
var fao_level_2 = ee.FeatureCollection("FAO/GAUL/2015/level2");
// var fao_level_0 = ee.FeatureCollection("FAO/GAUL/2015/level0");

// Building Filter
// var filter = ee.Filter.eq('ADM1_CODE', 1927); //2579
// var filter = ee.Filter.inList('ADM0_CODE', [ 257]) // Admin codes
// var filter = ee.Filter.inList('ADM0_CODE', [42,79, 94, 133, 155, 182, 205, 257, 253]) // Admin codes
var filter = ee.Filter.inList('ADM0_CODE', [ 85, 177, 255,42, 133]) // Admin codes


// Filtering
var fao_level_1 = fao_level_1.filter(filter);
// var fao_level_2 = fao_level_2.filter(filter);

// ----------------------------------------------------------------
// Functions ----------------------------------------------------------------
// ----------------------------------------------------------------
var stats_per_region =function(
  dataset,
  band
  ){
    var stats_per_feature = function(feature){
      
      var reducer = ee.Reducer.mean().combine({
      reducer2: ee.Reducer.stdDev(),
      sharedInputs: true
    }).combine({
      reducer2: ee.Reducer.median(),
      sharedInputs: true
    }).combine({
      reducer2: ee.Reducer.min(),
      sharedInputs: true
    }).combine({
      reducer2: ee.Reducer.max(),
      sharedInputs: true
    }).combine({
      reducer2: ee.Reducer.percentile([25]),
      sharedInputs: true
    }).combine({
      reducer2: ee.Reducer.percentile([75]),
      sharedInputs: true
    }).combine({
      reducer2: ee.Reducer.skew(),
      sharedInputs: true
    })
      var image = dataset.select(band)
      var reduced_region = image.reduceRegion({
              reducer:reducer,
              geometry:feature.geometry(),
              scale:1000,
              maxPixels:1e9
          })
          
       
          
      var feature_information = feature.toDictionary()
      var reduced_region_info  = ee.Dictionary(reduced_region)
      
       var results_data = feature_information.combine(reduced_region_info, false)

      
      
      var result =ee.Feature(
          feature.geometry(),
          results_data
          )
        
      return(result)
        
      
    }
    return(stats_per_feature)
  }

var compute_summary_stats_and_save_data = function(
    region_data, // Feature Collection of geometries
    dataset, // The dataset (image collection) to summarise
    band, // The band of interest
    name // The name of the dataset to be saved
  ){
    
    var result = region_data.map(stats_per_region(
    dataset,
    band
  ))
  
    print(result)
  
    Export.table.toDrive({
    collection: result,
    description:name,
    fileFormat: 'csv',
    folder: 'earth-engine-outputs/farm-size-analysis',
    fileNamePrefix: name
    })
    return('');
  }


// ----------------------------------------------------------------
// Preparing datasets ----------------------------------------------------------------
// ----------------------------------------------------------------


// Land Surface Temp ----------------------------------------------------------------
var land_surface_temp_ds = ee.ImageCollection("JAXA/GCOM-C/L3/LAND/LST/V2")
                .filterDate('2014-01-01', '2022-02-01')
                // filter to daytime data only
                .filter(ee.Filter.eq("SATELLITE_DIRECTION", "D"));
// Multiply with slope coefficient
var land_surface_temp_mean_ds = land_surface_temp_ds.reduce(ee.Reducer.mean()).multiply(0.02);
var land_surface_temp_mean_band = "LST_AVE_mean"

// What you would do for stddev
// var land_surface_temp_stdev_ds = land_surface_temp_ds.reduce(ee.Reducer.stdDev()).multiply(0.02);
// var land_surface_temp_stdev_band = "LST_AVE_stdDev"

compute_summary_stats_and_save_data(
  fao_level_1,
  land_surface_temp_ds,
  land_surface_temp_band,
  'land-surface-temp-zone-1-test'
  )
  


// Elevation ----------------------------------------------------------------

// var digital_elevation_ds = ee.Image("CGIAR/SRTM90_V4")
// var digital_elevation_band = 'elevation'

// compute_summary_stats_and_save_data(
//   fao_level_1,
//   digital_elevation_ds,
//   digital_elevation_band,
//   'digital-elevation-data-test'
// )

// Elevation ----------------------------------------------------------------



// Plotting-------------------------------------


var regional_land_surface_temp = fao_level_1.map(stats_per_region(
  land_surface_temp_stdev_ds,
  land_surface_temp_stdev_band
  ))
  
print(regional_land_surface_temp)
  
// print(regional_land_surface_temp)

var landAreaImg = regional_land_surface_temp
  .filter(ee.Filter.notNull([land_surface_temp_stdev_band + '_mean']))
  .reduceToImage({
    properties: [land_surface_temp_stdev_band + '_mean'],
    reducer: ee.Reducer.first()
});




// // Create a schema for different temperatures
var visualization = {
  min: 250,
  max: 316,
  palette: [
    "040274","040281","0502a3","0502b8","0502ce","0502e6",
    "0602ff","235cb1","307ef3","269db1","30c8e2","32d3ef",
    "3be285","3ff38f","86e26f","3ae237","b5e22e","d6e21f",
    "fff705","ffd611","ffb613","ff8b13","ff6e08","ff500d",
    "ff0000","de0101","c21301","a71001","911003",
  ]
};

Map.setCenter(25, 0, 3);

Map.addLayer(landAreaImg, visualization, "Land Surface Temperature");






