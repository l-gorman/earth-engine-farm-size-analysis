/*

Calculate various key statistics for earth
engine datasets of interest.




*/


// Getting Administrative Data -----------------------------------------------
var fao_level_1 = ee.FeatureCollection("FAO/GAUL/2015/level1"); 
var fao_level_2 = ee.FeatureCollection("FAO/GAUL/2015/level2");

// var filter = ee.Filter.eq('ADM1_CODE', 1927); //2579
// var filter = ee.Filter.inList('ADM0_CODE', [ 257]) // Admin codes
// var filter = ee.Filter.inList('ADM0_CODE', [42,79, 94, 133, 155, 182, 205, 257, 253]) // Admin codes


// var fao_level_1 = fao_level_1.filter(filter);
// var fao_level_2 = fao_level_2.filter(filter);

var dataset = ee.ImageCollection("JAXA/GCOM-C/L3/LAND/LST/V2")
                .filterDate('2020-01-01', '2020-02-01')
                // filter to daytime data only
                .filter(ee.Filter.eq("SATELLITE_DIRECTION", "D"));
                
// Multiply with slope coefficient
var dataset = dataset.mean().multiply(0.02);

var stats_per_region =function(
  dataset,
  band
  ){
    var stats_per_feature = function(feature){
      
      var reduced_region = dataset.reduceRegion({
              reducer:ee.Reducer.mean(),
              geometry:feature.geometry(),
              scale:500,
              maxPixels:40e9
          })
      
      
      var result =ee.Feature(
          feature.geometry(),
          reduced_region
          )
        
      return(result)
        
      
    }
    return(stats_per_feature)
  }
  
  
var regional_land_surface_temp = fao_level_1.map(stats_per_region(
  dataset,
  'LST_AVE'
  ))
  
print(regional_land_surface_temp)
                
print(dataset)


var landAreaImg = regional_land_surface_temp
  .filter(ee.Filter.notNull(['LST_AVE']))
  .reduceToImage({
    properties: ['LST_AVE'],
    reducer: ee.Reducer.first()
});




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

Map.setCenter(128.45, 33.33, 5);

Map.addLayer(landAreaImg, visualization, "Land Surface Temperature");