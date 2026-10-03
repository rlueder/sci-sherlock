import{json,jobs,root,assert}from'./common.ts';
import{interior}from'./interior.ts';
import{passage}from'./passage.ts';
import{workshop}from'./workshop.ts';
const a=interior(),b=passage(),c=workshop();
json('art.json',{version:1,maxColours:64,palette:'palette.json',pictures:[a.picture,...b.pictures],views:[...b.views,...c.views]});
json('native-jobs.json',jobs);
json('guides/validation.json',{nativeSize:[320,200],paletteColours:64,pixelAspect:1.2,unchanged221bOutsidePropMasks:true,workshopWeatherRestrictedToGlass:true,workshopPendulumOutsideGlassUnchanged:true,mouseEndpointsFullyHidden:true,passageCameraAndFloorUnchanged:true,projects:jobs.length,exports:jobs.reduce((n,j)=>n+j.expected.length,0)});
console.log({root,projects:jobs.length,exports:jobs.reduce((n,j)=>n+j.expected.length,0)});
