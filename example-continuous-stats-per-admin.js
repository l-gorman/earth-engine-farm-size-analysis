/*

Example script showing how to calculate the 
average subnational temperature for Burkina Faso,
Kenya, UAE, the Netherlands and France.






*/


// Getting Administrative Data -----------------------------------------------
var fao_level_1 = ee.FeatureCollection("FAO/GAUL/2015/level1"); 


var filter = ee.Filter.inList('ADM0_CODE', [ 85, 177, 255,42, 133]) // Admin codes
var fao_level_1 = fao_level_1.filter(filter);

var dataset = ee.ImageCollection("JAXA/GCOM-C/L3/LAND/LST/V2")
                .filterDate('2020-01-01', '2020-02-01')
                // filter to daytime data only
                .filter(ee.Filter.eq("SATELLITE_DIRECTION", "D"));
                
// Multiply with slope coefficient
var dataset = dataset.mean().multiply(0.02);

var stats_per_region =function(
  dataset,
  band,
  reducer
  ){
    var stats_per_feature = function(feature){
      
      // Apply the image reduction
      var reduced_region = dataset.reduceRegion({
              reducer:reducer,
              geometry:feature.geometry(),
              scale:20000,
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
  'LST_AVE',
  ee.Reducer.mean()
  ))
  
print(regional_land_surface_temp)

// Convert the final dataset to a raster
// so that it can be plotted
// see here: https://developers.google.com/earth-engine/guides/reducers_reduce_to_image
var landAreaImg = regional_land_surface_temp
  .filter(ee.Filter.notNull(['LST_AVE']))
  .reduceToImage({
    properties: ['LST_AVE'],
    reducer: ee.Reducer.first()
});




// Create a schema for different temperatures
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