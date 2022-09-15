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
var filter = ee.Filter.inList('ADM0_CODE', [42,79, 94, 133, 155, 182, 205, 257, 253]) // Admin codes


// Filtering
var fao_level_1 = fao_level_1.filter(filter);
var fao_level_2 = fao_level_2.filter(filter);

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
  fao_level_2,
  land_surface_temp_mean_ds,
  land_surface_temp_mean_band,
  'land-surface-temp-zone-2'
  )
  


// Elevation ----------------------------------------------------------------

var digital_elevation_ds = ee.Image("CGIAR/SRTM90_V4")
var digital_elevation_band = 'elevation'

compute_summary_stats_and_save_data(
  fao_level_2,
  digital_elevation_ds,
  digital_elevation_band,
  'digital-elevation-zone-2'
)

// Population Density ----------------------------------------------------------------
var pop_density_ds = ee.ImageCollection("CIESIN/GPWv411/GPW_Population_Density")
                .filterDate('2014-01-01', '2022-02-01')
var pop_density_mean_ds = pop_density_ds.reduce(ee.Reducer.mean());
var pop_density_mean_band = "population_density_mean"           

compute_summary_stats_and_save_data(
  fao_level_2,
  pop_density_mean_ds,
  pop_density_mean_band,
  'population-density-zone-2'
)


// Topographic Diversity ----------------------------------------------------------------
var topographic_diversity_ds = ee.Image("CSP/ERGo/1_0/Global/ALOS_topoDiversity")
var topographic_diversity_band = 'constant'

compute_summary_stats_and_save_data(
  fao_level_2,
  topographic_diversity_ds,
  topographic_diversity_band,
  'topographic-diversity-zone-2'
)

// NDVI ----------------------------------------------------------------

var ndvi_ds = ee.ImageCollection("MODIS/061/MOD13A1")
                .filterDate('2014-01-01', '2022-02-01')
var ndvi_mean_ds = ndvi_ds.reduce(ee.Reducer.mean());
var ndvi_mean_band = "NDVI_mean"           


compute_summary_stats_and_save_data(
  fao_level_2,
  ndvi_mean_ds,
  ndvi_mean_band,
  'ndvi-zone-2'
  )


// Night Lights ----------------------------------------------------------------

var night_light_ds = ee.ImageCollection("BNU/FGS/CCNL/v1")
                .filterDate('2010-01-01', '2010-12-31')
var night_light_mean_ds = night_light_ds.reduce(ee.Reducer.mean());
var night_light_mean_band = "b1_mean"      

compute_summary_stats_and_save_data(
  fao_level_2,
  night_light_mean_ds,
  night_light_mean_band,
  'night-time-light-mean-zone-2'
)

// Travel time to healthcare ----------------------------------------------------------------

var travel_time_to_health_ds = ee.Image("Oxford/MAP/accessibility_to_healthcare_2019")
var travel_time_to_health_ds_band = 'accessibility'

compute_summary_stats_and_save_data(
  fao_level_2,
  travel_time_to_health_ds,
  travel_time_to_health_ds_band,
  'travel-time-to-health-zone-2'
)

// Plotting-------------------------------------


// var regional_stats = fao_level_1.map(stats_per_region(
//   travel_time_to_health_ds,
//   travel_time_to_health_ds_band
//   ))
  
// print(regional_stats)
  
// // print(regional_land_surface_temp)

// var landAreaImg = regional_stats
//   .filter(ee.Filter.notNull([travel_time_to_health_ds_band + '_mean']))
//   .reduceToImage({
//     properties: [travel_time_to_health_ds_band + '_mean'],
//     reducer: ee.Reducer.first()
// });



// // // Create a schema for different temperatures
// var visualization = {
//   min: 0.0,
//   max: 100,
//   palette: [
//     "040274","040281","0502a3","0502b8","0502ce","0502e6",
//     "0602ff","235cb1","307ef3","269db1","30c8e2","32d3ef",
//     "3be285","3ff38f","86e26f","3ae237","b5e22e","d6e21f",
//     "fff705","ffd611","ffb613","ff8b13","ff6e08","ff500d",
//     "ff0000","de0101","c21301","a71001","911003",
//   ]
// };

// Map.setCenter(25, 0, 3);

// Map.addLayer(landAreaImg, visualization, "Summary Stats per region");






