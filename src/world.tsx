import React, {useState} from 'react';
import styled from 'styled-components';
import { ComposableMap, Geographies, Geography, Sphere } from "react-simple-maps";
import countryTimezone from 'country-timezone';

import countries from "./countries.json";
import timezones from "./timezones.json";
//import ne from "./countries.json";

//const geoUrl = "https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json";


const WorldWrapper = styled.div`
    width: 100%;
    max-width: 980;
    max-height: 100%;
    margin: 0 auto;
`;

const Map = styled(ComposableMap)`
    width: 100%;
    height: auto;
    
`;

//https://github.com/babel/babel/issues/5085
async function findTimezone (zones, offset) {

    return new Promise((resolve, reject) => {

        const params = {
            method: "GET",

            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "application/json",
                "Accept-Charset": "utf-8"
            }
        };

        fetch("http://worldtimeapi.org/api/timezone/"+zones[0], params).then(result => {

            return result.json();

        }).then(result => {


            //console.log("result: ", result);

            if (parseInt(offset*3600) - parseInt(result.raw_offset) == 0) {
                console.log("found right zone: ", result)
                resolve(result);
            } else {

                resolve(findTimezone (zones.slice(1), offset));

            }

            resolve(result);
        }).catch(error => {
            console.error("post-error: ", error);

            reject();
        });

    });

}

const World = () => {

    const [{country, countryData, countryZones}, setCountry] = useState({country: undefined, countryData: undefined, countryZones: undefined});
    const [{timezone, offset}, setTimezone] = useState({timezone: undefined, offset: undefined});

    console.log("SET ", offset, countryData, countryZones);


    const selectCountry = (geo, i) => {
        //console.log(i, country, geo.properties);
        if (i == country) return;

        console.log(i, country, geo.properties);




        setCountry({
            country: i,
            countryData: geo.properties,
            countryZones: countryTimezone.getTimezonesWithCountryCode(
                geo.properties.ISO_A2.length == 2 ? geo.properties.ISO_A2 : geo.properties.FIPS_10_
            )
        });

        findTimezone(countryTimezone.getTimezonesWithCountryCode(
            geo.properties.ISO_A2.length == 2 ? geo.properties.ISO_A2 : geo.properties.FIPS_10_
        ), offset)


        /*
        */

    }


    const selectTimezone = (geo, i) => {
        if (i == timezone) return;
        //setCountry({country: undefined, countryData: undefined});
        setTimezone({timezone: i, offset: geo.properties.name});
    }


    const handleMove = (geo, evt, i) => {






        /*
        // apparently, the fetch does not require the hostname...why?

         onMouseLeave={handleLeave}

        setHighlight({
            hovered: true,
            highlighted: geo.properties.CONTINENT
        });*/
    };

    return <WorldWrapper >
        <Map
            width={980}
            height={551}

        >
            <Sphere stroke="#000" strokeWidth={2} fill="#00F3" />
            <Geographies geography={countries}>
                {( {geographies}) =>
                    geographies.map((geo, i) => <Geography key={geo.rsmKey} geography={geo}
                                                      onMouseMove={(evt) => selectCountry(geo, i)}
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
                    />)
                }
            </Geographies>
            <Geographies geography={timezones}>
                {( {geographies}) =>
                    geographies.map((geo, i) => <Geography key={geo.rsmKey} geography={geo}
                                                      onMouseMove={(evt) => selectTimezone(geo, i)}

                                                      style={{

                                                          default: {
                                                              pointerEvents: timezone == i ? "none" : "unset",

                                                              fill: timezone == i ? "#FF6F6166" : "#FFF5",
                                                              /* geo.properties.CONTINENT ===
                                                               highlighted
                                                               ? "#DD4132"
                                                               : "#F0EAD6"*/
                                                              stroke: "#000",
                                                              /*geo.properties.CONTINENT ===
                                                               highlighted
                                                               ? "#9E1030"
                                                               : "#B2A27D",*/
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
                                                          },
                                                          /*pressed: {
                                                              fill: "#DD413266",
                                                              stroke: "#9E1030",
                                                              strokeWidth: 0.75,
                                                              outline: "none",
                                                              transition: "all 250ms"
                                                          }*/
                                                      }}
                    />)
                }
            </Geographies>




        </Map>
    </WorldWrapper>
};

export default World;