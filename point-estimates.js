/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var table = ee.FeatureCollection("projects/lgorman/assets/farm-size-all-points");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
// Getting point estimates


// Farm Size Points from LSMS
var farm_size_points = ee.FeatureCollection("projects/lgorman/assets/farm-size-all-points");

// Administrative Units in LSMS
var fao_level_1 = ee.FeatureCollection("FAO/GAUL/2015/level1"); 
var fao_level_2 = ee.FeatureCollection("FAO/GAUL/2015/level2");



var get_point_estimate = function(props){
  var pointData = props.image.reduceRegions({
  collection: props.feature_collection,
  reducer: ee.Reducer.first(),
});

 Export.table.toDrive({
    collection: pointData,
    description:props.description,
    fileFormat: 'csv',
    folder: 'earth-engine-outputs/farm-size-analysis/',
    fileNamePrefix: props.filename
    })
  
}


// Getting the various layers to add on

// start and end dates to look through
var start_date =  '2012-01-01'
var end_date = '2022-02-01'

// Population Density
var pop_density_ds = ee.ImageCollection("CIESIN/GPWv411/GPW_Population_Density")
                .filterDate('2014-01-01', '2022-02-01')
var pop_density_mean_ds = pop_density_ds.reduce(ee.Reducer.mean());

get_point_estimate(
  {
    feature_collection:farm_size_points,
    image:pop_density_mean_ds,
    description:"population density point estimates",
    file_name:"population-density-lsms"
    
  })

// Accessibility to Healthcare
var travel_time_to_health_ds = ee.Image("Oxford/MAP/accessibility_to_healthcare_2019")
var travel_time_to_health_ds_band = 'accessibility'

// Night Lights
var night_light_ds = ee.ImageCollection("BNU/FGS/CCNL/v1")
                .filterDate('2010-01-01', '2010-12-31')
var night_light_mean_ds = night_light_ds.reduce(ee.Reducer.mean());
var night_light_mean_band = "b1_mean"      

// Topographic Diversity
var topographic_diversity_ds = ee.Image("CSP/ERGo/1_0/Global/ALOS_topoDiversity")
var topographic_diversity_band = 'constant'

// Land Cover Class
var land_cover_class = ee.ImageCollection('MODIS/006/MCD12Q1')
var land_cover_band =  "LC_Type1"
var land_cover_mode_ds = night_light_ds.reduce(ee.Reducer.mode());






// Map.addLayer( farm_size_points,  
// {'color': 'black'},
             
//             'Geometry [black]: point')
             
             
