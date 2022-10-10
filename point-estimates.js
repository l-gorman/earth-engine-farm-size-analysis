/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var table = ee.FeatureCollection("projects/lgorman/assets/farm-size-all-points");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
// Getting point estimates


// Farm Size Points from LSMS
var farm_size_points = ee.FeatureCollection("projects/lgorman/assets/farm-size-all-points");

// Administrative Units in LSMS
var fao_level_1 = ee.FeatureCollection("FAO/GAUL/2015/level1"); 
var fao_level_2 = ee.FeatureCollection("FAO/GAUL/2015/level2");



print(farm_size_points[1])

// Map.addLayer( farm_size_points,  
// {'color': 'black'},
             
//             'Geometry [black]: point')
             
             
