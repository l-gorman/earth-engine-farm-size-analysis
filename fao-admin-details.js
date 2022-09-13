// Getting Data -----------------------------------------------

var fao_level_1 = ee.FeatureCollection("FAO/GAUL/2015/level1"); 
var fao_level_2 = ee.FeatureCollection("FAO/GAUL/2015/level2");

var filter = ee.Filter.inList('ADM0_CODE', [42,79, 94, 133, 155, 182, 205, 257, 253]) // Admin codes


var fao_level_1 = fao_level_1.filter(filter);
var fao_level_2 = fao_level_2.filter(filter);




// // Styling Layers
var styleParams = {
  fillColor: 'b5ffb4',
  color: '00909F',
  width: 1.0,
};




fao_level_2 = fao_level_2.style(styleParams);
fao_level_1 = fao_level_1.style(styleParams);



// // Creating Map
Map.setCenter(25, 0, 4);
Map.addLayer(fao_level_2, {}, 'Second Level Administrative Units');
Map.addLayer(fao_level_1, {}, 'First Level Administrative Units');

//Example of Writing table to Google Drive
Export.table.toDrive({
  collection: ee.FeatureCollection(fao_level_1),
  description:'fao-level-1-details',
  fileFormat: 'csv',
  folder: 'earth-engine-outputs/farm-size-analysis',
  fileNamePrefix: 'fao-gaul-level-2'
  
});

Export.table.toDrive({
  collection: ee.FeatureCollection(fao_level_2),
  description:'fao-level-2-details',
  fileFormat: 'csv',
  folder: 'earth-engine-outputs/farm-size-analysis',
  fileNamePrefix: 'fao-gaul-level-1'

});



