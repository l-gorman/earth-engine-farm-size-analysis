/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var table = ee.FeatureCollection("projects/lgorman/assets/farm-size-all-points");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
// Getting point estimates

var farm_size_points = ee.FeatureCollection("projects/lgorman/assets/farm-size-all-points");

Map.adLayer( farm_size_points,  {'color': 'black'},
             'Geometry [black]: point'))