/*

Visualise and save basic information
from the FAO GAUL administrative
boundaries, looking at 9
countries in SSA of interest

*/


// Getting Data -----------------------------------------------

var fao_level_1_fc = ee.FeatureCollection("FAO/GAUL/2015/level1"); 
var fao_level_2_fc = ee.FeatureCollection("FAO/GAUL/2015/level2");

var filter = ee.Filter.inList('ADM0_CODE', [42,79, 94, 133, 155, 182, 205, 257, 253]) // Admin codes


var fao_level_1_fc = fao_level_1_fc.filter(filter);
var fao_level_2_fc = fao_level_2_fc.filter(filter);




// // Styling Layers
var styleParams = {
  fillColor: 'b5ffb4',
  color: '00909F',
  width: 1.0,
};




var fao_level_2_styled = fao_level_2_fc.style(styleParams);
var fao_level_1_styled = fao_level_1_fc.style(styleParams);



// // Creating Map
Map.setCenter(25, 0, 4);
Map.addLayer(fao_level_2_styled, {}, 'Second Level Administrative Units');
Map.addLayer(fao_level_1_styled, {}, 'First Level Administrative Units');

//Example of Writing table to Google Drive

print(fao_level_1_fc)

Export.table.toDrive({
  collection: fao_level_1_fc,
  description:'fao-level-1-details',
  fileFormat: 'GeoJSON',
  folder: 'earth-engine-outputs/farm-size-analysis',
  fileNamePrefix: 'fao-gaul-level-1'
  
});

Export.table.toDrive({
  collection: fao_level_2_fc,
  description:'fao-level-2-details',
  fileFormat: 'GeoJSON',
  folder: 'earth-engine-outputs/farm-size-analysis',
  fileNamePrefix: 'fao-gaul-level-2'
});



