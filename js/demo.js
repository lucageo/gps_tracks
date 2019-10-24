var a=0;
var speed_arr = [];
var speed_obj=[];

(function ($) {
    'use strict';



    function Demo(mapId, multiOptionsKey, speedId) {
        this.mapId = mapId;
        this.selected = multiOptionsKey || 'speed';
        this.speedId = speedId;
    }

    Demo.prototype = {
        constructor: Demo,

        trackPointFactory: function (data) {

            return data.features.map(function (item) {

                //console.log(item);
                var proj = L.CRS.EPSG3857;
                var trkpt = proj.unproject(new L.Point(item.geometry.coordinates[0], item.geometry.coordinates[1]));

                //console.log(trkpt);
                trkpt.meta = item.properties;
                return trkpt;

            });
        },

        loadData: function (name) {
            var me = this;

            $.getJSON('https://services.arcgis.com/Sf0q24s0oDKgX14j/arcgis/rest/services/gpsData/FeatureServer/0/query?where=Source='+name+'&outFields=*&f=geojson', function (data) {
              speed_obj.push({id:name,id_num:parseInt(name),'data':[]})
              // console.info(data)
                me.trackPoints = me.trackPointFactory(data);
                me.showMapAndTrack()


            });
        },

        _multiOptions: {

            speed: {
                optionIdxFn: function (latLng, prevLatLng) {

                    var i, speed, speedThresholds = [1, 3, 5, 7, 9, 11, 13, 20];

                    speed = latLng.distanceTo(prevLatLng); // meters
                    speed /= (latLng.meta.time - prevLatLng.meta.time) / 1000; // m/s
                    speed *= 3.6; // km/h

                    if ( !isNaN(speed) && isFinite(speed) ){
                    speed_obj[a]['data'].push(speed);
                  }

                    for (i = 0; i < speedThresholds.length; ++i) {
                        if (speed <= speedThresholds[i]) {
                            return i;
                        }
                    }
                    return speedThresholds.length;
                },
                options: [
                    {color: '#0000FF'}, {color: '#0040FF'}, {color: '#0080FF'},
                    {color: '#00FFB0'}, {color: '#00E000'}, {color: '#80FF00'},
                    {color: '#FFFF00'}, {color: '#FFC000'}, {color: '#FF0000'}
                ]
            },

        },

        showMapAndTrack: function () {
            var me = this,
                points = me.trackPoints;

            if (!me.map) {
                me.map = L.map(me.mapId, {
                    layers: MQ.mapLayer()
                });
            }

            if (me.visibleTrack) {
                me.map.removeLayer(me.visibleTrack);
            }

            me.visibleTrack = L.featureGroup();

            // create a polyline from an arrays of LatLng points
            var polyline = L.multiOptionsPolyline(points, {
                multiOptions: me._multiOptions[me.selected],
                weight: 3,
                lineCap: 'round',
                opacity: 0.7,
                smoothFactor: 10}).addTo(me.visibleTrack);
            // zoom the map to the polyline
            me.map.fitBounds(polyline.getBounds());
            me.visibleTrack.addTo(me.map);
            var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {zIndex: 22, attribution: ''}).addTo(me.map);
            // define average speed value
            a++;
            if (a==12){
                      speed_obj.forEach(function(d){
                        var data=d.data;
                        var sum=0;
                        data.forEach(function(x){
                        sum+=x;
                        });
                        var avg= sum/data.length
                        var id_num=d.id_num;
                        $('#speed'+id_num).html("Average speed (km/h): <b>"+Math.round(avg* 100)/100+"</b>");

                        // define activity type
                        if (avg <= 5) {
                          $('#activity'+id_num).html("Activity: <b>Walk</b>").css("background-color", "#605e50");
                        }else if (avg > 5 && avg < 10) {
                          $('#activity'+id_num).html("Activity: <b>Run</b>").css("background-color", "#675d4e");
                        }else if (avg > 10 && avg < 30) {
                          $('#activity'+id_num).html("Activity: <b>Bike</b>").css("background-color", "#7b664b");
                        }else {
                          $('#activity'+id_num).html("Activity: <b>Car</b>").css("background-color", "#7b4b4b");
                        }
                      })
              }
        }
    };

    new Demo('map12', 'speed').loadData('00012');
    new Demo('map11', 'speed').loadData('00011');
    new Demo('map10', 'speed').loadData('00010');
    new Demo('map9',  'speed').loadData('00009');
    new Demo('map8',  'speed').loadData('00008');
    new Demo('map7',  'speed').loadData('00007');
    new Demo('map6',  'speed').loadData('00006');
    new Demo('map5',  'speed').loadData('00005');
    new Demo('map4',  'speed').loadData('00004');
    new Demo('map3',  'speed').loadData('00003');
    new Demo('map2',  'speed').loadData('00002');
    new Demo('map1',  'speed').loadData('00001');
})(jQuery);
