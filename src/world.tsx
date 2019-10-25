import React, {useState} from 'react';
import styled from 'styled-components';
import { ComposableMap, Geographies, Geography, Sphere } from "react-simple-maps";
import countryTimezone from 'country-timezone';


import { geoPath } from "d3-geo";


//import countries from "./countries.json";
//import timezones from "./timezones.json";
//import ne from "./countries.json";

const countriesUrl = "https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json";
const timezonesUrl = "https://raw.githubusercontent.com/frankzickert/world-clock/master/src/timezones.json";

const WorldWrapper = styled.div`
    max-height: 100%;
    max-width: 100%;
    margin: 0 auto;
`;

const Map = styled(ComposableMap)`
    width: 100%;
`;

const StyledGeo = styled(Geography)`
    fill: #FFF5;
    stroke: #000;
    strokeWidth: 0.75;
    //pointer-events: none;
    outline: none;
    &:active {
      fill: white;
       
    }
    
    &:hover{
        fill: #4141FF66;
        transition: all 250ms;
    }
    
`;

const StyledTimezone = styled(StyledGeo)`
    pointer-events: ${props => props.isActive ? "none" : "unset"};
    fill: ${props => props.isActive ? "#FF6F6166" : "#FFF5"};
                                   
    &:hover{
        //pointer-events: ${props => props.isActive ? "none" : "unset"};
        //fill: #FF6F6166;
        transition: all 250ms;
    }
`;

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

const printGeoData = (geo) => {
    console.log(geo);
    return geo;
};


const parseTimeZone = (tz) => (
    parseFloat(tz)*60
);


const toTime = geo => setDate(new Date(), parseTimeZone(geo.properties.name)).toISOString().slice(0,19).replace(/T/g," ");



const calcTime = (offset, geo, setText, countryZones) => evt => {

    findTimezone(countryZones, offset, setText);


}


//https://github.com/zcreativelabs/react-simple-maps/issues/22
// get long,lat of click: https://github.com/zcreativelabs/react-simple-maps/issues/34

const ToolTip = styled.div`
    position: fixed;
    background-color: #FFF;
    left: ${(props) => props.x}px;
    transform: translate(-50%, -150%);
    top: ${(props) => props.y}px;
    pointer-events: none;
`;

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

const dateToString = d => d.toISOString().slice(0,19).replace(/T/g," ");


const getLocalTime = timezone => {
    const d = new Date();
    return new Date(Date.UTC(
        d.getUTCFullYear(),
        d.getUTCMonth(),
        d.getUTCDate(),
        d.getUTCHours(),
        d.getUTCMinutes()+parseFloat(timezone.properties.name)*60
    ));
};

/**
 *
 https://github.com/treyerl/timezones
 https://www.naturalearthdata.com/downloads/

 */
const World = () => {



    //geoTz.preCache()

    const [{country, countryData, countryZones}, setCountry] = useState({country: undefined, countryData: undefined, countryZones: undefined});
    const [{timezone, offset}, setTimezone] = useState({timezone: undefined, offset: undefined});

    console.log("SET ", offset, countryData, countryZones);

    const [{x,y, toolTip}, setToolTip] = useState({x: undefined, y: undefined, text: undefined});
    //const [text, setText] = useState(undefined);


    const selectCountry = (geo, i) => evt => {



        //console.log(i, country, geo.properties);
        if (i == country) return;
        setPos({
            x: evt.clientX, y: evt.clientY
        });
        setText(undefined);

        setCountry({
            country: i,
            countryData: geo.properties,
            countryZones: countryTimezone.getTimezonesWithCountryCode(
                geo.properties.ISO_A2.length == 2 ? geo.properties.ISO_A2 : geo.properties.FIPS_10_
            )
        });


    }



    const selectTimezone = (geo, i) => evt => {


        if (i == timezone) return;
        //setCountry({country: undefined, countryData: undefined});
        setTimezone({timezone: i, offset: geo.properties.name});
    }


    return <div>

        <Map
            width={980}
            height={470}

        >
            {/*<Sphere stroke="#000" strokeWidth={2} fill="#00F3" />*/}
            <Geographies geography={countriesUrl}>
                {( {geographies}) =>
                    geographies.map(
                        (country, i) => (
                            <StyledGeo
                                key={country.rsmKey}
                                geography={country}
                                onMouseMove={selectCountry(country, i)}
                                onClick={calcTime(offset, country, setText, countryZones)}/>
                        )
                    )
                }
            </Geographies>

            <Geographies geography={timezonesUrl}>
                {( {geographies}) => geographies
                    .map((timezone, i) => (
                        <StyledTimezone
                            key={timezone.rsmKey}
                            geography={timezone}
                            onClick={event => setToolTip(event.clientX, event.clientY, getLocalTime(timezone))}
                            isActive={timezone == i}
                            onMouseMove={selectTimezone(timezone, i)}
                        />
                    ))
                }
            </Geographies>




        </Map>
        {
            text && <ToolTip x={x} y={y}>{text}</ToolTip>
        }
    </div>
};

/*
*{/*
 console.log(geo,evt,
 setDate(new Date(), parseTimeZone(geo.properties.name)).toUTCString())

 onClick={onGeographyClick (geo, projection, (c)=> console.log(geoTz(c[1], c[0])))}


 selectTimezone(geo, i)
*
 style={{
 default: {
 fill: "#FFF",
 stroke: "#000",
 strokeWidth: 0.75,
 },
 hover: {
 fill: "#A42",
 stroke: "#9E1030",
 strokeWidth: 0.75,
 outline: "none",
 transition: "all 250ms"
 },
 }}


 style={{

 default: {
 pointerEvents: timezone == i ? "none" : "unset",

 fill: timezone == i ? "#FF6F6166" : "#FFF5",

stroke: "#000",

    strokeWidth: 0.75,

    transition: "all 250ms"
},
hover: {
    pointerEvents: timezone == i ? "none" : "unset",
        fill: "#FF6F6166",
        stroke: "#9E1030",
        strokeWidth: 0.75,
        outline: "none",
        transition: "all 250ms"
}
}}
* */
export default World;