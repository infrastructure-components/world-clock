


//https://github.com/zcreativelabs/react-simple-maps/issues/22
// get long,lat of click: https://github.com/zcreativelabs/react-simple-maps/issues/34


const printGeoData = (geo) => {
    console.log(geo);
    return geo;
};


import { geoPath } from "d3-geo";


/**
 *
 https://github.com/treyerl/timezones
 https://www.naturalearthdata.com/downloads/

 */

//import countries from "./countries.json";
//import timezones from "./timezones.json";
//import ne from "./countries.json";

//https://github.com/babel/babel/issues/5085
async function findTimezone (zones, offset, setText) {

    return new Promise((resolve, reject) => {

        const params = {
            method: "GET",

            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "application/json",
                "Accept-Charset": "utf-8"
            }
        };

        console.log("check zone: ", zones[0]);
        if (zones[0] !== undefined) {


            fetch("http://worldtimeapi.org/api/timezone/" + zones[0], params).then(result => {

                return result.json();

            }).then(result => {


                //console.log("result: ", result);

                if (parseInt(offset * 3600) - parseInt(result.raw_offset) == 0) {
                    console.log("found right zone: ", result);

                    setText(result.datetime.slice(0, 19).replace(/T/g, " "))

                    resolve(result);
                } else {
                    try{
                        resolve(findTimezone(zones.slice(1), offset, setText));
                    } catch (e) {
                        setText(result.datetime.slice(0, 19).replace(/T/g, " "))

                        resolve(result);
                    }


                }

                resolve(result);
            }).catch(error => {
                console.error("post-error: ", error);

                reject();
            });
        } else {
            reject();
        }
    });

}


function onGeographyClick (geo, projection, onCoordinatesClick) {
    const gp = geoPath().projection(projection);

    return function (evt) {
        const dim = evt.target.getBoundingClientRect();
        const cx = evt.clientX - dim.left;
        const cy = evt.clientY - dim.top;
        const [orgX, orgY] = gp.bounds(geo)[0];

        onCoordinatesClick(projection.invert([orgX + cx, orgY + cy]))
    }
}


const parseTimeZone = (tz) => (
    parseFloat(tz)*60
);


const toTime = geo => setDate(new Date(), parseTimeZone(geo.properties.name)).toISOString().slice(0,19).replace(/T/g," ");
